import type { TFunction } from '@sisense/sdk-common';
import {
  DateLevels,
  DimensionalLevelAttribute,
  filterFactory,
  isCustomFilter,
  isDateRangeFilter,
  isRelativeDateFilter,
} from '@sisense/sdk-data';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  type DateConditionDraft,
  dateConditionToFilter,
  defaultDateConditionDraft,
  filterToDateConditionDraft,
  forgetAllIncompleteDateDrafts,
  forgetIncompleteDateDraft,
  isDateConditionComplete,
  isEditableDateConditionFilter,
  parseDateConditionCount,
  readIncompleteDateDraft,
  rememberIncompleteDateDraft,
  resolveDateConditionRange,
  summariseDateCondition,
} from './condition-date.js';
import { DEFAULT_DATE_MASK } from './date-text.js';

const years = new DimensionalLevelAttribute(
  'Years',
  '[Commerce.Date (Calendar)]',
  DateLevels.Years,
  'yyyy',
);

/** Same shape List/Calendar tests use with createLevelAttribute(..., t). */
const t = ((key: string, options?: { columnName?: string }) =>
  `${key}(${options?.columnName ?? ''})`) as TFunction;

const TODAY = new Date(2026, 8, 11);
const labelOf = (op: string) =>
  ({
    last: 'Last',
    this: 'This',
    next: 'Next',
    before: 'Before',
    'on-before': 'On or before',
    after: 'After',
    'on-after': 'On or after',
  }[op] ?? op);
const grainLabelOf = (_grain: string, count: number) => {
  const names: Record<string, [string, string]> = {
    Years: ['Year', 'Years'],
    Quarters: ['Quarter', 'Quarters'],
    Months: ['Month', 'Months'],
    Weeks: ['Week', 'Weeks'],
    Days: ['Day', 'Days'],
  };
  const pair = names[_grain] ?? [_grain, _grain];
  return count === 1 ? pair[0] : pair[1];
};

function draft(part: Partial<DateConditionDraft>): DateConditionDraft {
  return { ...defaultDateConditionDraft(), ...part };
}

describe('condition-date', () => {
  afterEach(() => {
    forgetAllIncompleteDateDrafts();
  });

  it('defaults to Last 1 Year with including current off', () => {
    expect(defaultDateConditionDraft()).toEqual({
      op: 'last',
      count: '1',
      grain: DateLevels.Years,
      includingCurrent: false,
      anchor: '',
      connector: 'AND',
      extra: [],
    });
    expect(isDateConditionComplete(defaultDateConditionDraft())).toBe(true);
  });

  it('skips excluded grains when building the default Last draft', () => {
    expect(defaultDateConditionDraft([DateLevels.Years, DateLevels.Quarters]).grain).toBe(
      DateLevels.Months,
    );
  });

  it('does not invent Years when every catalogue grain is excluded (AC-11)', () => {
    const draftWithNoFreeGrain = defaultDateConditionDraft([
      DateLevels.Years,
      DateLevels.Quarters,
      DateLevels.Months,
      DateLevels.Weeks,
      DateLevels.Days,
    ]);
    expect(draftWithNoFreeGrain.grain).toBeUndefined();
    expect(isDateConditionComplete(draftWithNoFreeGrain)).toBe(false);
  });

  it('parses whole integers ≥ 1 and rejects empty, 0, negative, and fractional counts', () => {
    expect(parseDateConditionCount('')).toBeNull();
    expect(parseDateConditionCount('0')).toBeNull();
    expect(parseDateConditionCount('-1')).toBeNull();
    expect(parseDateConditionCount('1.5')).toBeNull();
    expect(parseDateConditionCount('3')).toBe(3);
    expect(isDateConditionComplete(draft({ count: '' }))).toBe(false);
  });

  it('treats Before without an anchor as incomplete and This as complete', () => {
    expect(isDateConditionComplete(draft({ op: 'before' }))).toBe(false);
    expect(isDateConditionComplete(draft({ op: 'this' }))).toBe(true);
  });

  it('scopes unfinished drafts by attribute expression', () => {
    const before = draft({ op: 'before' });
    rememberIncompleteDateDraft(years.expression, before);
    expect(readIncompleteDateDraft('[Other.Date]')).toBeUndefined();
    expect(readIncompleteDateDraft(years.expression)?.op).toBe('before');
    forgetIncompleteDateDraft(years.expression);
    expect(readIncompleteDateDraft(years.expression)).toBeUndefined();
  });

  it('restores an unfinished draft from sessionStorage after memory is cleared', () => {
    const before = draft({ op: 'before' });
    rememberIncompleteDateDraft(years.expression, before);
    const storageKey = `csdk.filterWidget.dateCondition.incomplete:${years.expression}`;
    const raw = sessionStorage.getItem(storageKey);
    expect(raw).toBeTruthy();
    forgetAllIncompleteDateDrafts();
    sessionStorage.setItem(storageKey, raw!);
    expect(readIncompleteDateDraft(years.expression)?.op).toBe('before');
  });

  /* The dashboard and the widget editor can each run their own copy of this module, and so
     their own in-memory Map; sessionStorage is the only thing they share. A write straight
     to sessionStorage below stands in for the other copy. */
  describe('another copy of the module sharing the session', () => {
    const storageKey = `csdk.filterWidget.dateCondition.incomplete:${years.expression}`;

    it('reads the draft the other copy stored last, not this copy’s stale one', () => {
      rememberIncompleteDateDraft(years.expression, draft({ op: 'before' }));

      sessionStorage.setItem(storageKey, JSON.stringify(draft({ op: 'after' })));

      expect(readIncompleteDateDraft(years.expression)?.op).toBe('after');
    });

    it('drops a draft the other copy removed', () => {
      rememberIncompleteDateDraft(years.expression, draft({ op: 'before' }));

      sessionStorage.removeItem(storageKey);

      expect(readIncompleteDateDraft(years.expression)).toBeUndefined();
    });

    it('keeps the latest draft when only the write to sessionStorage fails', () => {
      rememberIncompleteDateDraft(years.expression, draft({ op: 'before' }));
      const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });
      try {
        rememberIncompleteDateDraft(years.expression, draft({ op: 'after' }));
      } finally {
        setItem.mockRestore();
      }

      // The store still holds Before; the newer After lives only in memory.
      expect(readIncompleteDateDraft(years.expression)?.op).toBe('after');

      // Once a write lands again, the store is the truth again.
      rememberIncompleteDateDraft(years.expression, draft({ op: 'on-before' }));
      sessionStorage.setItem(storageKey, JSON.stringify(draft({ op: 'on-after' })));
      expect(readIncompleteDateDraft(years.expression)?.op).toBe('on-after');
    });

    it('falls back to memory when sessionStorage cannot be read', () => {
      rememberIncompleteDateDraft(years.expression, draft({ op: 'before' }));
      const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });

      try {
        expect(readIncompleteDateDraft(years.expression)?.op).toBe('before');
      } finally {
        getItem.mockRestore();
      }
    });
  });

  it('summarises Last / This / Next and including current', () => {
    expect(
      summariseDateCondition(
        defaultDateConditionDraft(),
        labelOf,
        grainLabelOf,
        'including current',
      ),
    ).toBe('Last 1 Year');
    expect(
      summariseDateCondition(
        draft({ count: '3', grain: DateLevels.Days, includingCurrent: true }),
        labelOf,
        grainLabelOf,
        'including current',
      ),
    ).toBe('Last 3 Days including current');
    expect(
      summariseDateCondition(draft({ op: 'this' }), labelOf, grainLabelOf, 'including current'),
    ).toBe('This Year');
  });

  it('builds the sentence via one interpolated key per shape when t is passed, not concatenation', () => {
    /* Minimal i18next-like fake: templates carry {{operator}}/{{count}}/{{grain}}/{{date}} in
       a locale-chosen order, proving the sentence no longer depends on JS-side word order. */
    const fakeT = ((key: string, options?: Record<string, unknown>) => {
      const templates: Record<string, string> = {
        'filterWidget.dateCondition.summary.current': '{{grain}} the {{operator}}',
        'filterWidget.dateCondition.summary.relative': '{{count}} {{grain}} {{operator}}',
        'filterWidget.dateCondition.summary.date': '{{date}} {{operator}}',
      };
      let result = templates[key];
      Object.entries(options ?? {}).forEach(([k, v]) => {
        result = result.replace(`{{${k}}}`, String(v));
      });
      return result;
    }) as TFunction;

    expect(
      summariseDateCondition(
        draft({ count: '3', grain: DateLevels.Days }),
        labelOf,
        grainLabelOf,
        'including current',
        fakeT,
      ),
    ).toBe('3 Days Last');
    expect(summariseDateCondition(draft({ op: 'this' }), labelOf, grainLabelOf, 'x', fakeT)).toBe(
      'Year the This',
    );
    expect(
      summariseDateCondition(
        draft({ op: 'before', anchor: '09/11/2026' }),
        labelOf,
        grainLabelOf,
        'x',
        fakeT,
      ),
    ).toBe('09/11/2026 Before');
  });

  it('uses its own template for the relative + Including current sentence, not concatenation', () => {
    /* summary.relativeIncludingCurrent exists precisely so a locale can place "including
       current" before the count/grain (ja/ko/zh) or reword it for grammar (ru) instead of
       always gluing includingCurrentLabel onto summary.relative with a trailing space. */
    const fakeT = ((key: string, options?: Record<string, unknown>) => {
      const templates: Record<string, string> = {
        'filterWidget.dateCondition.summary.relative': '{{operator}} {{count}} {{grain}}',
        'filterWidget.dateCondition.summary.relativeIncludingCurrent':
          '{{includingCurrent}} {{operator}} {{count}} {{grain}}',
      };
      let result = templates[key];
      Object.entries(options ?? {}).forEach(([k, v]) => {
        result = result.replace(`{{${k}}}`, String(v));
      });
      return result;
    }) as TFunction;

    expect(
      summariseDateCondition(
        draft({ count: '3', grain: DateLevels.Days, includingCurrent: true }),
        labelOf,
        grainLabelOf,
        'including current',
        fakeT,
      ),
    ).toBe('including current Last 3 Days');
  });

  it('publishes Last N excluding current as offset 1', () => {
    const filter = dateConditionToFilter(years, defaultDateConditionDraft(), DEFAULT_DATE_MASK);
    expect(isRelativeDateFilter(filter)).toBe(true);
    expect(filter.filterJaql()).toEqual({ last: { offset: 1, count: 1 } });
    expect((filter.attribute as DimensionalLevelAttribute).granularity).toBe(DateLevels.Years);
  });

  it('names the level attribute like List so the filter-panel tile is not bare Date', () => {
    const lastMonths = dateConditionToFilter(
      years,
      draft({ count: '3', grain: DateLevels.Months }),
      DEFAULT_DATE_MASK,
      undefined,
      t,
    );
    expect(lastMonths.attribute.name).toBe('attribute.datetimeName.months(Date)');
    expect(lastMonths.attribute.title).toBe('attribute.datetimeName.months(Date)');

    const before = dateConditionToFilter(
      years,
      draft({ op: 'before', anchor: '09/11/2026' }),
      DEFAULT_DATE_MASK,
      undefined,
      t,
    );
    expect(before.attribute.name).toBe('attribute.datetimeName.days(Date)');
    expect((before.attribute as DimensionalLevelAttribute).granularity).toBe(DateLevels.Days);
  });

  it('without t falls back to the column name (legacy) — prefer passing t in UI', () => {
    const filter = dateConditionToFilter(
      years,
      draft({ grain: DateLevels.Quarters }),
      DEFAULT_DATE_MASK,
    );
    expect(filter.attribute.name).toBe('Date');
  });

  it('publishes Last N including current as offset 0', () => {
    const filter = dateConditionToFilter(
      years,
      draft({ count: '3', grain: DateLevels.Days, includingCurrent: true }),
      DEFAULT_DATE_MASK,
    );
    expect(filter.filterJaql()).toEqual({ last: { offset: 0, count: 3 } });
    expect((filter.attribute as DimensionalLevelAttribute).granularity).toBe(DateLevels.Days);
  });

  it('publishes This as last count 1 offset 0 with isNotCurrentPeriod false', () => {
    const filter = dateConditionToFilter(years, draft({ op: 'this' }), DEFAULT_DATE_MASK);
    expect(isCustomFilter(filter)).toBe(true);
    expect(filter.filterJaql()).toEqual({
      last: { count: 1, offset: 0 },
      isNotCurrentPeriod: false,
    });
  });

  it('publishes Next with the next operator', () => {
    const filter = dateConditionToFilter(
      years,
      draft({ op: 'next', count: '2', grain: DateLevels.Months }),
      DEFAULT_DATE_MASK,
    );
    expect(isRelativeDateFilter(filter)).toBe(true);
    expect(filter.filterJaql()).toEqual({ next: { offset: 1, count: 2 } });
  });

  it('publishes inclusive On or after / On or before as from / to at Day', () => {
    const after = dateConditionToFilter(
      years,
      draft({ op: 'on-after', anchor: '09/11/2026' }),
      DEFAULT_DATE_MASK,
    );
    const before = dateConditionToFilter(
      years,
      draft({ op: 'on-before', anchor: '09/11/2026' }),
      DEFAULT_DATE_MASK,
    );
    expect(isDateRangeFilter(after)).toBe(true);
    expect(after.filterJaql()).toEqual({ from: '2026-09-11' });
    expect(before.filterJaql()).toEqual({ to: '2026-09-11' });
    expect((after.attribute as DimensionalLevelAttribute).granularity).toBe(DateLevels.Days);
  });

  it('publishes exclusive After / Before as fromNotEqual / toNotEqual on the original date', () => {
    const after = dateConditionToFilter(
      years,
      draft({ op: 'after', anchor: '09/11/2026' }),
      DEFAULT_DATE_MASK,
    );
    const before = dateConditionToFilter(
      years,
      draft({ op: 'before', anchor: '09/11/2026' }),
      DEFAULT_DATE_MASK,
    );
    expect(after.filterJaql()).toEqual({
      fromNotEqual: '2026-09-11',
      isAdvanced: true,
      custom: true,
    });
    expect(before.filterJaql()).toEqual({
      toNotEqual: '2026-09-11',
      isAdvanced: true,
      custom: true,
    });
  });

  it('round-trips Last including current and This separately', () => {
    const lastIncluding = dateConditionToFilter(
      years,
      draft({ includingCurrent: true }),
      DEFAULT_DATE_MASK,
    );
    const asThis = dateConditionToFilter(years, draft({ op: 'this' }), DEFAULT_DATE_MASK);
    expect(filterToDateConditionDraft(lastIncluding, DEFAULT_DATE_MASK).op).toBe('last');
    expect(filterToDateConditionDraft(lastIncluding, DEFAULT_DATE_MASK).includingCurrent).toBe(
      true,
    );
    expect(filterToDateConditionDraft(asThis, DEFAULT_DATE_MASK).op).toBe('this');
    expect(isEditableDateConditionFilter(lastIncluding)).toBe(true);
    expect(isEditableDateConditionFilter(asThis)).toBe(true);
  });

  it('reads from / to as On or after / On or before', () => {
    const from = filterFactory.dateFrom(
      new DimensionalLevelAttribute('Days', years.expression, DateLevels.Days, 'yyyy-MM-dd'),
      '2026-09-11',
    );
    const to = filterFactory.dateTo(
      new DimensionalLevelAttribute('Days', years.expression, DateLevels.Days, 'yyyy-MM-dd'),
      '2026-09-11',
    );
    expect(filterToDateConditionDraft(from, DEFAULT_DATE_MASK)).toMatchObject({
      op: 'on-after',
      anchor: '09/11/2026',
    });
    expect(filterToDateConditionDraft(to, DEFAULT_DATE_MASK)).toMatchObject({
      op: 'on-before',
      anchor: '09/11/2026',
    });
  });

  it('reads exclusive fromNotEqual / toNotEqual as after / before, not on-after / on-before', () => {
    const after = filterFactory.dateAfter(
      new DimensionalLevelAttribute('Days', years.expression, DateLevels.Days, 'yyyy-MM-dd'),
      '2026-09-11',
    );
    const before = filterFactory.dateBefore(
      new DimensionalLevelAttribute('Days', years.expression, DateLevels.Days, 'yyyy-MM-dd'),
      '2026-09-11',
    );
    expect(filterToDateConditionDraft(after, DEFAULT_DATE_MASK)).toMatchObject({
      op: 'after',
      anchor: '09/11/2026',
    });
    expect(filterToDateConditionDraft(before, DEFAULT_DATE_MASK)).toMatchObject({
      op: 'before',
      anchor: '09/11/2026',
    });
  });

  it('resolves Last 1 Year including current to this calendar year', () => {
    const off = resolveDateConditionRange('last', 1, DateLevels.Years, false, TODAY);
    const on = resolveDateConditionRange('last', 1, DateLevels.Years, true, TODAY);
    expect(off).toEqual({ start: new Date(2025, 0, 1), end: new Date(2025, 11, 31) });
    expect(on).toEqual({ start: new Date(2026, 0, 1), end: new Date(2026, 11, 31) });
  });

  it('resolves Last 3 Days with and without including current', () => {
    const off = resolveDateConditionRange('last', 3, DateLevels.Days, false, TODAY);
    const on = resolveDateConditionRange('last', 3, DateLevels.Days, true, TODAY);
    expect(off).toEqual({ start: new Date(2026, 8, 8), end: new Date(2026, 8, 10) });
    expect(on).toEqual({ start: new Date(2026, 8, 9), end: new Date(2026, 8, 11) });
  });
});
