import {
  DateLevels,
  DateOperators,
  DimensionalLevelAttribute,
  isRelativeDateFilter,
} from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import type { RelativeSpec } from './time-frame-catalogue';
import { CATALOGUE_ORDER, specKey } from './time-frame-catalogue';
import {
  countOf,
  DEFAULT_OFFERED_FRAMES,
  filterToTimeFrame,
  offsetOf,
  timeFrameToFilter,
} from './time-frame-jaql';

/** A datetime dimension attribute at Days granularity, mirroring the sample-ecommerce Date. */
const DAY_LEVEL = new DimensionalLevelAttribute('Days in Date', '[Commerce.Date]', DateLevels.Days);

describe('offsetOf — the offset rule', () => {
  it('`This X` emits offset 0 (includes the current period)', () => {
    expect(offsetOf({ tense: 'this', count: 1, grain: 'Month' })).toBe(0);
  });

  it('paired `This & last X` and `This & next X` emit offset 0', () => {
    expect(offsetOf({ tense: 'last', count: 2, grain: 'Month', withCurrent: true })).toBe(0);
    expect(offsetOf({ tense: 'next', count: 2, grain: 'Year', withCurrent: true })).toBe(0);
  });

  it('`Last N days` (Day grain rolling) emits offset 0 — the one-sided rolling exception', () => {
    expect(offsetOf({ tense: 'last', count: 7, grain: 'Day' })).toBe(0);
    expect(offsetOf({ tense: 'last', count: 30, grain: 'Day' })).toBe(0);
    expect(offsetOf({ tense: 'last', count: 90, grain: 'Day' })).toBe(0);
  });

  it('`Next N days` is NOT affected by the rolling exception — offset 1', () => {
    expect(offsetOf({ tense: 'next', count: 7, grain: 'Day' })).toBe(1);
    expect(offsetOf({ tense: 'next', count: 30, grain: 'Day' })).toBe(1);
  });

  it('`Yesterday` and `Tomorrow` (Day count=1) emit offset 1 — the exception needs count ≥ 2', () => {
    expect(offsetOf({ tense: 'last', count: 1, grain: 'Day' })).toBe(1);
    expect(offsetOf({ tense: 'next', count: 1, grain: 'Day' })).toBe(1);
  });

  it('plain `Last N X` at Week / Month / Quarter / Year emits offset 1', () => {
    for (const grain of ['Week', 'Month', 'Quarter', 'Year'] as const) {
      expect(offsetOf({ tense: 'last', count: 3, grain })).toBe(1);
      expect(offsetOf({ tense: 'next', count: 3, grain })).toBe(1);
    }
  });
});

describe('countOf', () => {
  it('is 1 for `this` regardless of the passed count', () => {
    expect(countOf({ tense: 'this', count: 5, grain: 'Year' })).toBe(1);
  });

  it('clamps to at least 1 for `last`/`next` — never 0 or negative', () => {
    expect(countOf({ tense: 'last', count: 0, grain: 'Day' })).toBe(1);
    expect(countOf({ tense: 'next', count: -3, grain: 'Month' })).toBe(1);
  });
});

describe('timeFrameToFilter → RelativeDateFilter — JAQL contract', () => {
  const attribute = DAY_LEVEL;

  const build = (spec: RelativeSpec) => timeFrameToFilter(spec, attribute);

  it('emits the bare {last:{count,offset}} clause — no isNotCurrentPeriod', () => {
    const filter = build({ tense: 'this', count: 1, grain: 'Month' });
    expect(isRelativeDateFilter(filter)).toBe(true);
    const jaql = filter.filterJaql();
    expect(jaql).toEqual({ last: { count: 1, offset: 0 } });
    // The one field the datasource JAQL endpoint rejects with HTTP 500 must not appear.
    expect(jaql).not.toHaveProperty('isNotCurrentPeriod');
  });

  it('`Last 7 days` → {last:{count:7,offset:0}} at Days (the rolling exception)', () => {
    const filter = build({ tense: 'last', count: 7, grain: 'Day' });
    const jaql = filter.filterJaql();
    expect(jaql).toEqual({ last: { count: 7, offset: 0 } });
    expect(filter.level.granularity).toBe(DateLevels.Days);
  });

  it('`Next 7 days` → {next:{count:7,offset:1}} at Days (exception is one-sided)', () => {
    const filter = build({ tense: 'next', count: 7, grain: 'Day' });
    const jaql = filter.filterJaql();
    expect(jaql).toEqual({ next: { count: 7, offset: 1 } });
  });

  it('`Last 2 months` → {last:{count:2,offset:1}} at Months', () => {
    const filter = build({ tense: 'last', count: 2, grain: 'Month' });
    const jaql = filter.filterJaql();
    expect(jaql).toEqual({ last: { count: 2, offset: 1 } });
    expect(filter.level.granularity).toBe(DateLevels.Months);
  });

  it('`This & last month` → {last:{count:2,offset:0}} at Months (paired: includes current)', () => {
    const filter = build({ tense: 'last', count: 2, grain: 'Month', withCurrent: true });
    const jaql = filter.filterJaql();
    expect(jaql).toEqual({ last: { count: 2, offset: 0 } });
  });

  it('`This year` → {last:{count:1,offset:0}} at Years, operator Last', () => {
    const filter = build({ tense: 'this', count: 1, grain: 'Year' });
    const jaql = filter.filterJaql();
    expect(jaql).toEqual({ last: { count: 1, offset: 0 } });
    expect(filter.level.granularity).toBe(DateLevels.Years);
    expect(filter.operator).toBe(DateOperators.Last);
  });

  it('emits attribute name including the grain (`Months in Date`, not bare column)', () => {
    // A host syncing the filter-panel tile title from JAQL title needs the level in the name.
    const filter = build({ tense: 'last', count: 3, grain: 'Month' });
    // With no translator, createLevelAttribute uses the base column name — we assert the
    // expression is preserved and the granularity is at the frame's grain rather than the
    // input attribute's, so a host can identify the level.
    expect(filter.level.granularity).toBe(DateLevels.Months);
    expect(filter.level.expression).toBe('[Commerce.Date]');
  });

  it('every catalogue frame publishes a filter whose JAQL matches offsetOf/countOf', () => {
    for (const spec of CATALOGUE_ORDER) {
      const filter = build(spec);
      const jaql = filter.filterJaql();
      const tenseKey = spec.tense === 'next' ? 'next' : 'last';
      expect(jaql).toEqual({ [tenseKey]: { count: countOf(spec), offset: offsetOf(spec) } });
      expect(jaql).not.toHaveProperty('isNotCurrentPeriod');
    }
  });
});

describe('filterToTimeFrame — seed rules', () => {
  const attribute = DAY_LEVEL;

  it('reads {last:{count:1,offset:0}} at Months back as `This month`', () => {
    const monthsFilter = timeFrameToFilter({ tense: 'this', count: 1, grain: 'Month' }, attribute);
    const spec = filterToTimeFrame(monthsFilter, DEFAULT_OFFERED_FRAMES);
    expect(spec && specKey(spec)).toBe('this:1:Month');
  });

  it('reads {last:{count:7,offset:0}} at Days back as `Last 7 days` when offered', () => {
    const day7 = timeFrameToFilter({ tense: 'last', count: 7, grain: 'Day' }, attribute);
    const offered: RelativeSpec[] = [
      { tense: 'this', count: 1, grain: 'Day' },
      { tense: 'last', count: 7, grain: 'Day' },
    ];
    const spec = filterToTimeFrame(day7, offered);
    expect(spec && specKey(spec)).toBe('last:7:Day');
  });

  it('reads {last:{count:2,offset:0}} at Months as `This & last month`, NOT `Last 2 months`', () => {
    // Same count and grain, different withCurrent — the reverse mapping must not conflate them.
    const paired = timeFrameToFilter(
      { tense: 'last', count: 2, grain: 'Month', withCurrent: true },
      attribute,
    );
    const offered: RelativeSpec[] = [
      { tense: 'last', count: 2, grain: 'Month' },
      { tense: 'last', count: 2, grain: 'Month', withCurrent: true },
    ];
    const spec = filterToTimeFrame(paired, offered);
    expect(spec && specKey(spec)).toBe('last:2:Month:c');
  });

  it('returns undefined when the clause matches no offered frame — nothing invented', () => {
    // `last:5:Month` is not in the default 11.
    const orphan = timeFrameToFilter({ tense: 'last', count: 5, grain: 'Month' }, attribute);
    const spec = filterToTimeFrame(orphan, DEFAULT_OFFERED_FRAMES);
    expect(spec).toBeUndefined();
  });

  it('returns undefined for null / a non-RelativeDateFilter — treated as nothing-selected', () => {
    expect(filterToTimeFrame(null, DEFAULT_OFFERED_FRAMES)).toBeUndefined();
    expect(filterToTimeFrame(undefined, DEFAULT_OFFERED_FRAMES)).toBeUndefined();
  });
});
