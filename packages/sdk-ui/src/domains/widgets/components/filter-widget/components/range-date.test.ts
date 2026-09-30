import { DateLevels, DimensionalLevelAttribute, filterFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { DEFAULT_DATE_MASK } from './date-text.js';
import {
  emptyRangeDraft,
  filterToRangeDraft,
  isEditableRangeFilter,
  isInclusiveDateRangeFilter,
  isInvertedRangeDraft,
  isRangeDraftEmpty,
  isRangeDraftUsable,
  judgeRangeEnd,
  rangeDraftToFilter,
  withRangeEnd,
} from './range-date.js';

const years = new DimensionalLevelAttribute(
  'Years',
  '[Commerce.Date (Calendar)]',
  DateLevels.Years,
  'yyyy',
);

const mask = DEFAULT_DATE_MASK; // MM/DD/YYYY

describe('emptyRangeDraft / isRangeDraftEmpty', () => {
  it('starts empty', () => {
    expect(isRangeDraftEmpty(emptyRangeDraft())).toBe(true);
  });

  it('is not empty once either end holds text', () => {
    expect(isRangeDraftEmpty(withRangeEnd(emptyRangeDraft(), 'from', '03/01/2026'))).toBe(false);
    expect(isRangeDraftEmpty(withRangeEnd(emptyRangeDraft(), 'to', '03/01/2026'))).toBe(false);
  });
});

describe('isInvertedRangeDraft', () => {
  it('is false when either end is empty or unparseable', () => {
    expect(isInvertedRangeDraft(mask, emptyRangeDraft())).toBe(false);
    expect(isInvertedRangeDraft(mask, { from: '03/10/2026', to: '' })).toBe(false);
    expect(isInvertedRangeDraft(mask, { from: 'nope', to: '03/10/2026' })).toBe(false);
  });

  it('is true when From lands after To', () => {
    expect(isInvertedRangeDraft(mask, { from: '04/10/2026', to: '01/14/2026' })).toBe(true);
  });

  it('is false for a same-day pair or a correctly ordered pair', () => {
    expect(isInvertedRangeDraft(mask, { from: '03/10/2026', to: '03/10/2026' })).toBe(false);
    expect(isInvertedRangeDraft(mask, { from: '01/14/2026', to: '04/10/2026' })).toBe(false);
  });
});

describe('judgeRangeEnd', () => {
  it('flags a malformed or nonexistent entry per-end, before checking order', () => {
    // Wrong shape (too short/wrong grouping) is malformed; a right-shaped but impossible
    // day (including an out-of-range month/day like 13/45) is nonexistent — same split
    // date-text.ts already draws (its own docstring gives 33/33/3333 as nonexistent).
    expect(judgeRangeEnd(mask, emptyRangeDraft(), 'from', '1/2/26')).toBe('malformed');
    expect(judgeRangeEnd(mask, emptyRangeDraft(), 'from', '13/45/2026')).toBe('nonexistent');
    expect(judgeRangeEnd(mask, emptyRangeDraft(), 'from', '02/31/2026')).toBe('nonexistent');
  });

  it('never flags an empty entry', () => {
    expect(judgeRangeEnd(mask, { from: '', to: '03/10/2026' }, 'from', '')).toBeNull();
  });

  it('flags the field just typed into as inverted, not the other one', () => {
    const draft = { from: '', to: '01/14/2026' };
    expect(judgeRangeEnd(mask, draft, 'from', '04/10/2026')).toBe('inverted');
  });

  it('does not flag inverted when the other end is still empty', () => {
    expect(judgeRangeEnd(mask, emptyRangeDraft(), 'from', '04/10/2026')).toBeNull();
  });

  it('lifts once the order is cured from either end', () => {
    // From later than To — inverted when typed into From...
    expect(judgeRangeEnd(mask, { from: '', to: '01/14/2026' }, 'from', '04/10/2026')).toBe(
      'inverted',
    );
    // ...but curing it from the To side clears the fault for that edit.
    expect(judgeRangeEnd(mask, { from: '04/10/2026', to: '' }, 'to', '05/01/2026')).toBeNull();
  });
});

describe('isRangeDraftUsable', () => {
  it('is usable when both ends are empty (clears)', () => {
    expect(isRangeDraftUsable(mask, emptyRangeDraft())).toBe(true);
  });

  it('is usable with exactly one valid end (open-ended)', () => {
    expect(isRangeDraftUsable(mask, { from: '03/01/2026', to: '' })).toBe(true);
    expect(isRangeDraftUsable(mask, { from: '', to: '03/31/2026' })).toBe(true);
  });

  it('is unusable with a malformed/nonexistent end', () => {
    expect(isRangeDraftUsable(mask, { from: '13/45/2026', to: '' })).toBe(false);
    expect(isRangeDraftUsable(mask, { from: '', to: '02/31/2026' })).toBe(false);
  });

  it('is unusable when inverted', () => {
    expect(isRangeDraftUsable(mask, { from: '04/10/2026', to: '01/14/2026' })).toBe(false);
  });

  it('is usable with both ends valid and correctly ordered', () => {
    expect(isRangeDraftUsable(mask, { from: '01/14/2026', to: '04/10/2026' })).toBe(true);
  });
});

describe('rangeDraftToFilter', () => {
  it('returns null for a both-empty draft', () => {
    expect(rangeDraftToFilter(years, emptyRangeDraft(), mask)).toBeNull();
  });

  it('builds an inclusive from-only filter', () => {
    const filter = rangeDraftToFilter(years, { from: '03/01/2026', to: '' }, mask);
    expect(filter?.filterJaql()).toEqual({ from: '2026-03-01' });
  });

  it('builds an inclusive to-only filter', () => {
    const filter = rangeDraftToFilter(years, { from: '', to: '03/31/2026' }, mask);
    expect(filter?.filterJaql()).toEqual({ to: '2026-03-31' });
  });

  it('builds an inclusive both-bounds filter — never fromNotEqual/toNotEqual', () => {
    const filter = rangeDraftToFilter(years, { from: '01/14/2026', to: '04/10/2026' }, mask);
    expect(filter?.filterJaql()).toEqual({ from: '2026-01-14', to: '2026-04-10' });
  });

  it('always publishes at Days level, regardless of the incoming attribute level', () => {
    const filter = rangeDraftToFilter(years, { from: '03/01/2026', to: '' }, mask);
    expect((filter?.attribute as DimensionalLevelAttribute).granularity).toBe(DateLevels.Days);
  });
});

describe('filterToRangeDraft / isEditableRangeFilter', () => {
  it('reads a two-sided DateRangeFilter into masked draft text', () => {
    const filter = filterFactory.dateRange(years, '2026-01-14', '2026-04-10');
    expect(isEditableRangeFilter(filter)).toBe(true);
    expect(filterToRangeDraft(filter, mask)).toEqual({ from: '01/14/2026', to: '04/10/2026' });
  });

  it('reads an open-ended (from-only / to-only) DateRangeFilter', () => {
    const fromOnly = filterFactory.dateRange(years, '2026-03-01', undefined);
    expect(filterToRangeDraft(fromOnly, mask)).toEqual({ from: '03/01/2026', to: '' });
    const toOnly = filterFactory.dateRange(years, undefined, '2026-03-31');
    expect(filterToRangeDraft(toOnly, mask)).toEqual({ from: '', to: '03/31/2026' });
  });

  it('reads a null/undefined/non-DateRangeFilter as the empty draft', () => {
    expect(filterToRangeDraft(null, mask)).toEqual(emptyRangeDraft());
    expect(filterToRangeDraft(undefined, mask)).toEqual(emptyRangeDraft());
    expect(isEditableRangeFilter(filterFactory.contains(years, 'x'))).toBe(false);
  });

  // A date Condition anchor's exclusive DateRangeFilter must not be read as Range's own
  // inclusive shape: `.from`/`.to` return the raw stored value regardless of operator, so
  // reading `dateBefore`'s exclusive `to` as an inclusive upper bound and republishing it
  // through `rangeDraftToFilter` would silently change what date the filter excludes.
  it('rejects an exclusive Before/After anchor — it is a DateRangeFilter but not Range shaped', () => {
    const before = filterFactory.dateBefore(years, '2026-04-10');
    const after = filterFactory.dateAfter(years, '2026-01-14');
    expect(isEditableRangeFilter(before)).toBe(false);
    expect(isEditableRangeFilter(after)).toBe(false);
    expect(filterToRangeDraft(before, mask)).toEqual(emptyRangeDraft());
    expect(filterToRangeDraft(after, mask)).toEqual(emptyRangeDraft());
  });
});

describe('isInclusiveDateRangeFilter', () => {
  it('accepts a two-sided, from-only, to-only, and empty-config DateRangeFilter', () => {
    expect(
      isInclusiveDateRangeFilter(filterFactory.dateRange(years, '2026-01-14', '2026-04-10')),
    ).toBe(true);
    expect(
      isInclusiveDateRangeFilter(filterFactory.dateRange(years, '2026-03-01', undefined)),
    ).toBe(true);
    expect(
      isInclusiveDateRangeFilter(filterFactory.dateRange(years, undefined, '2026-03-31')),
    ).toBe(true);
    expect(isInclusiveDateRangeFilter(filterFactory.dateRange(years, undefined, undefined))).toBe(
      true,
    );
  });

  it('rejects the exclusive Before/After shape', () => {
    expect(isInclusiveDateRangeFilter(filterFactory.dateBefore(years, '2026-04-10'))).toBe(false);
    expect(isInclusiveDateRangeFilter(filterFactory.dateAfter(years, '2026-01-14'))).toBe(false);
  });

  it('rejects anything that is not a DateRangeFilter at all, and null/undefined', () => {
    expect(isInclusiveDateRangeFilter(filterFactory.contains(years, 'x'))).toBe(false);
    expect(isInclusiveDateRangeFilter(filterFactory.dateRelativeTo(years, 1, 1))).toBe(false);
    expect(isInclusiveDateRangeFilter(null)).toBe(false);
    expect(isInclusiveDateRangeFilter(undefined)).toBe(false);
  });
});
