import type { TFunction } from '@sisense/sdk-common';
import {
  createAttribute,
  DateLevels,
  DimensionalAttribute,
  type DimensionalLevelAttribute,
  filterFactory,
  isMeasureRankingFilter,
  isRankingFilter,
  measureFactory,
  type RankingFilter,
} from '@sisense/sdk-data';
import get from 'lodash-es/get';
import { describe, expect, it } from 'vitest';

import { Commerce } from '@/__test-helpers__/sample-ecommerce';
import { translation } from '@/infra/translation/resources/en';

import {
  emptyRankDraft,
  isRankDraftComplete,
  rankDraftToFilter,
  rankEmptyLabel,
  rankEmptyRows,
  readRankDraft,
  sanitiseRankCount,
  stepRankCount,
  summariseRank,
  summariseRankRows,
} from './rank';

/** Resolves keys against the real English dictionary and interpolates, as i18next would. */
const t = ((key: string, options: Record<string, unknown> = {}) => {
  const template = (get(translation, key) as string | undefined) ?? key;
  return template.replace(/{{-?\s*(\w+)\s*}}/g, (_, name: string) => String(options[name] ?? ''));
}) as unknown as TFunction;

const revenue = measureFactory.sum(Commerce.Revenue);
const customRevenue = measureFactory.customFormula('Weighted Revenue', 'SUM([rev]) * 2', {
  rev: Commerce.Revenue,
});

describe('filter-widget-rank.unit:defaults', () => {
  it('opens a text or numeric attribute on Top 10 with no level', () => {
    expect(emptyRankDraft(false)).toEqual({ direction: 'top', count: '10' });
  });

  it('opens a datetime attribute on Top 1 at Years', () => {
    expect(emptyRankDraft(true)).toEqual({ direction: 'top', count: '1', level: DateLevels.Years });
  });
});

describe('filter-widget-rank.unit:count-input', () => {
  it.each([
    ['0', ''],
    ['00', ''],
    ['abc', ''],
    ['1.1', '11'],
    ['-5', '5'],
    ['007', '7'],
    ['12', '12'],
    ['10', '10'],
    ['', ''],
  ])('keeps %j as %j', (typed, kept) => {
    expect(sanitiseRankCount(typed)).toBe(kept);
  });

  it('caps the count at fifteen digits so it always fits a safe integer', () => {
    expect(sanitiseRankCount('1234567890123456789')).toBe('123456789012345');
  });

  it('has no product limit below the digit guard', () => {
    expect(sanitiseRankCount('1000000')).toBe('1000000');
  });

  it('steps up from empty to 1 and never goes below 1', () => {
    expect(stepRankCount('', 1)).toBe('1');
    expect(stepRankCount('', -1)).toBe('1');
    expect(stepRankCount('1', -1)).toBe('1');
    expect(stepRankCount('10', -1)).toBe('9');
    expect(stepRankCount('10', 1)).toBe('11');
  });

  it('does not step past the digit guard', () => {
    expect(stepRankCount('999999999999999', 1)).toBe('999999999999999');
  });

  it('treats an empty count as incomplete', () => {
    expect(isRankDraftComplete({ direction: 'top', count: '' })).toBe(false);
    expect(isRankDraftComplete({ direction: 'top', count: '5' })).toBe(true);
  });
});

describe('filter-widget-rank.unit:query-payload', () => {
  it('builds a RankingFilter for Top with the count and measure', () => {
    const filter = rankDraftToFilter(
      { direction: 'top', count: '5' },
      Commerce.AgeRange,
      revenue,
      t,
    ) as RankingFilter;

    expect(isRankingFilter(filter)).toBe(true);
    expect(filter.operator).toBe('top');
    expect(filter.count).toBe(5);
    expect(filter.measure).toBe(revenue);
    expect(filter.attribute).toBe(Commerce.AgeRange);
    expect(filter.filterJaql()).toEqual({ top: 5, by: revenue.jaql(true) });
  });

  it('builds a RankingFilter for Bottom', () => {
    const filter = rankDraftToFilter(
      { direction: 'bottom', count: '3' },
      Commerce.AgeRange,
      revenue,
      t,
    ) as RankingFilter;

    expect(filter.operator).toBe('bottom');
    expect(filter.filterJaql()).toEqual({ bottom: 3, by: revenue.jaql(true) });
  });

  it('is never a members filter or a measure-ranking filter', () => {
    const filter = rankDraftToFilter(
      { direction: 'top', count: '5' },
      Commerce.AgeRange,
      revenue,
      t,
    ) as RankingFilter;

    expect(isMeasureRankingFilter(filter)).toBe(false);
    expect('members' in filter).toBe(false);
  });

  it('ranks by a calculated measure', () => {
    const filter = rankDraftToFilter(
      { direction: 'top', count: '2' },
      Commerce.AgeRange,
      customRevenue,
      t,
    ) as RankingFilter;

    expect(filter.measure).toBe(customRevenue);
  });

  it('builds nothing without a measure or without a count', () => {
    expect(
      rankDraftToFilter({ direction: 'top', count: '5' }, Commerce.AgeRange, undefined, t),
    ).toBeNull();
    expect(
      rankDraftToFilter({ direction: 'top', count: '' }, Commerce.AgeRange, revenue, t),
    ).toBeNull();
  });

  it('builds a datetime ranking on the attribute at the draft level', () => {
    const filter = rankDraftToFilter(
      { direction: 'top', count: '1', level: DateLevels.Quarters },
      Commerce.Date.Years,
      revenue,
      t,
    ) as RankingFilter;

    expect((filter.attribute as DimensionalLevelAttribute).granularity).toBe(DateLevels.Quarters);
    expect(filter.attribute.expression).toBe(Commerce.Date.Years.expression);
  });

  // Date Condition and Time Frame treat a level attribute that is not a DimensionalLevelAttribute
  // the same way: re-level it rather than ignore the draft's level.
  it('re-levels a level attribute that is not a DimensionalLevelAttribute', () => {
    const foreign = Object.assign(
      createAttribute({
        name: 'Date',
        expression: '[Commerce.Date (Calendar)]',
        type: 'datetime',
      }),
      { granularity: DateLevels.Years },
    );

    const filter = rankDraftToFilter(
      { direction: 'top', count: '1', level: DateLevels.Quarters },
      foreign,
      revenue,
      t,
    ) as RankingFilter;

    expect((filter.attribute as DimensionalLevelAttribute).granularity).toBe(DateLevels.Quarters);
    expect(filter.attribute.expression).toBe(foreign.expression);
  });

  it('keeps the data source of a level attribute it has to rebuild', () => {
    const dataSource: ConstructorParameters<typeof DimensionalAttribute>[5] = {
      title: 'Sample ECommerce',
    };
    // Built through the constructor: `dataSource` is read-only on the attribute it returns.
    const foreign = Object.assign(
      new DimensionalAttribute(
        'Date',
        '[Commerce.Date (Calendar)]',
        'datetime',
        undefined,
        undefined,
        dataSource,
      ),
      { granularity: DateLevels.Years },
    );

    const filter = rankDraftToFilter(
      { direction: 'top', count: '1', level: DateLevels.Quarters },
      foreign,
      revenue,
      t,
    ) as RankingFilter;

    expect((filter.attribute as DimensionalLevelAttribute).dataSource).toEqual(dataSource);
  });

  it('ranks the attribute itself when it has no level, whatever level the draft carries', () => {
    const plainDate = createAttribute({
      name: 'Date',
      expression: '[Commerce.Date]',
      type: 'datetime',
    });

    const filter = rankDraftToFilter(
      { direction: 'top', count: '1', level: DateLevels.Quarters },
      plainDate,
      revenue,
      t,
    ) as RankingFilter;

    expect(filter.attribute).toBe(plainDate);
  });

  it('keeps the host attribute when the draft level is the one it is already on', () => {
    const filter = rankDraftToFilter(
      { direction: 'top', count: '1', level: DateLevels.Years },
      Commerce.Date.Years,
      revenue,
      t,
    ) as RankingFilter;

    expect(filter.attribute).toBe(Commerce.Date.Years);
  });
});

describe('filter-widget-rank.unit:read-back', () => {
  it('reads a ranking filter into a draft', () => {
    const filter = filterFactory.bottomRanking(Commerce.AgeRange, revenue, 7);

    expect(readRankDraft(filter, false)).toEqual({ direction: 'bottom', count: '7' });
  });

  it('reads the level of a datetime ranking filter', () => {
    const filter = filterFactory.topRanking(Commerce.Date.Months, revenue, 2);

    expect(readRankDraft(filter, true)).toEqual({
      direction: 'top',
      count: '2',
      level: DateLevels.Months,
    });
  });

  it('reads a datetime ranking on an attribute with no level as the default level', () => {
    const plainDate = createAttribute({
      name: 'Date',
      expression: '[Commerce.Date]',
      type: 'datetime',
    });
    const filter = filterFactory.topRanking(plainDate, revenue, 2);

    expect(readRankDraft(filter, true)).toEqual({
      direction: 'top',
      count: '2',
      level: DateLevels.Years,
    });
  });

  it('ignores anything that is not a ranking filter', () => {
    expect(readRankDraft(filterFactory.members(Commerce.AgeRange, ['a']), false)).toBeNull();
    expect(readRankDraft(null, false)).toBeNull();
    expect(readRankDraft(undefined, false)).toBeNull();
  });

  it('round-trips a draft through the filter it builds', () => {
    const draft = { direction: 'bottom' as const, count: '12', level: DateLevels.Weeks };
    const filter = rankDraftToFilter(draft, Commerce.Date.Years, revenue, t);

    expect(readRankDraft(filter, true)).toEqual(draft);
  });
});

describe('filter-widget-rank.unit:summary', () => {
  it('words a Top ranking as "Top N By <measure>"', () => {
    const filter = filterFactory.topRanking(Commerce.AgeRange, customRevenue, 10) as RankingFilter;

    expect(summariseRank(filter, t)).toBe('Top 10 By Weighted Revenue');
  });

  it('words a Bottom ranking as "Bottom N By <measure>"', () => {
    const filter = filterFactory.bottomRanking(
      Commerce.AgeRange,
      customRevenue,
      5,
    ) as RankingFilter;

    expect(summariseRank(filter, t)).toBe('Bottom 5 By Weighted Revenue');
  });

  it('does not put the level of the filtered attribute in the sentence', () => {
    const filter = filterFactory.topRanking(
      Commerce.Date.Quarters,
      customRevenue,
      1,
    ) as RankingFilter;

    expect(summariseRank(filter, t)).toBe('Top 1 By Weighted Revenue');
  });

  it('names a base measure by its aggregation and field, with the level of a date field', () => {
    const filter = filterFactory.topRanking(
      Commerce.AgeRange,
      measureFactory.countDistinct(Commerce.Date.Years),
      3,
    ) as RankingFilter;

    expect(summariseRank(filter, t)).toBe('Top 3 By # of unique Years in Date');
  });

  it('keeps characters such as & unescaped', () => {
    const measure = measureFactory.customFormula('Profit & Loss', 'SUM([rev])', {
      rev: Commerce.Revenue,
    });
    const filter = filterFactory.topRanking(Commerce.AgeRange, measure, 4) as RankingFilter;

    expect(summariseRank(filter, t)).toBe('Top 4 By Profit & Loss');
  });

  it('words the empty state as "Ranked by <measure>"', () => {
    expect(rankEmptyLabel(customRevenue, t)).toBe('Ranked by Weighted Revenue');
  });
});

describe('filter-widget-rank.unit:hover-rows', () => {
  it('splits an applied Top ranking into the rule and the measure', () => {
    const filter = filterFactory.topRanking(Commerce.AgeRange, customRevenue, 10) as RankingFilter;

    expect(summariseRankRows(filter, t)).toEqual(['Top 10 By:', 'Weighted Revenue']);
  });

  it('splits an applied Bottom ranking into the rule and the measure', () => {
    const filter = filterFactory.bottomRanking(
      Commerce.AgeRange,
      customRevenue,
      5,
    ) as RankingFilter;

    expect(summariseRankRows(filter, t)).toEqual(['Bottom 5 By:', 'Weighted Revenue']);
  });

  it('names a date measure with its level, like the sentence does', () => {
    const filter = filterFactory.topRanking(
      Commerce.AgeRange,
      measureFactory.countDistinct(Commerce.Date.Years),
      3,
    ) as RankingFilter;

    expect(summariseRankRows(filter, t)).toEqual(['Top 3 By:', '# of unique Years in Date']);
  });

  it('splits the empty state into "Ranked by:" and the measure', () => {
    expect(rankEmptyRows(customRevenue, t)).toEqual(['Ranked by:', 'Weighted Revenue']);
  });
});
