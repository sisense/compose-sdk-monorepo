import {
  createAttribute,
  createMeasure,
  filterFactory,
  isRankingFilter,
  measureFactory,
} from '@sisense/sdk-data';
import { assert, describe, expect, it } from 'vitest';

import { FilterOption } from '../../../criteria-filter-tile/criteria-filter-operations.js';
import {
  createRankingFilter,
  DEFAULT_DATETIME_RANKING_COUNT,
  DEFAULT_RANKING_COUNT,
  getRankingStateFromFilter,
  isRankingCondition,
  withoutRankingConditions,
} from './ranking-condition-utils.js';

const attribute = createAttribute({
  name: 'Brand',
  type: 'text-attribute',
  expression: '[Brand.Brand]',
  dataSource: { title: 'Sample ECommerce', live: false },
});

const revenueAttribute = createAttribute({
  name: 'Revenue',
  type: 'numeric-attribute',
  expression: '[Commerce.Revenue]',
  dataSource: { title: 'Sample ECommerce', live: false },
});

const measure = createMeasure(measureFactory.sum(revenueAttribute));

describe('ranking-condition-utils', () => {
  describe('withoutRankingConditions', () => {
    const conditionItems = [
      { value: FilterOption.EQUALS_NUMERIC },
      { value: FilterOption.TOP },
      { value: FilterOption.BOTTOM },
    ];

    it('drops the ranking conditions', () => {
      const result = withoutRankingConditions(filterFactory.members(attribute, []))(conditionItems);

      expect(result).toEqual([{ value: FilterOption.EQUALS_NUMERIC }]);
    });

    it('drops the ranking conditions when creating a filter', () => {
      expect(withoutRankingConditions(null)(conditionItems)).toEqual([
        { value: FilterOption.EQUALS_NUMERIC },
      ]);
    });

    it('keeps every condition when the edited filter is itself a ranking filter', () => {
      // Dropping them would leave the editor's condition control on a value missing from its list,
      // so an existing ranking filter would open blank and could not be edited.
      const rankingFilter = createRankingFilter(
        filterFactory.members(attribute, []),
        FilterOption.TOP,
        5,
        measure,
      );
      assert(rankingFilter);

      expect(withoutRankingConditions(rankingFilter)(conditionItems)).toEqual(conditionItems);
    });

    it('does not mutate the given list', () => {
      const items = [...conditionItems];
      withoutRankingConditions(null)(items);

      expect(items).toEqual(conditionItems);
    });
  });

  it('identifies ranking conditions', () => {
    expect(isRankingCondition(FilterOption.TOP)).toBe(true);
    expect(isRankingCondition(FilterOption.BOTTOM)).toBe(true);
    expect(isRankingCondition(FilterOption.EQUALS_NUMERIC)).toBe(false);
  });

  it('creates a top ranking filter when count and measure are provided', () => {
    const baseFilter = filterFactory.members(attribute, []);
    const result = createRankingFilter(baseFilter, FilterOption.TOP, 5, measure);

    expect(result).not.toBeNull();
    assert(result);
    assert(isRankingFilter(result));
    expect(result.count).toBe(5);
    expect(result.measure.name).toBe(measure.name);
  });

  it('creates a bottom ranking filter when count and measure are provided', () => {
    const baseFilter = filterFactory.members(attribute, []);
    const result = createRankingFilter(baseFilter, FilterOption.BOTTOM, 3, measure);

    expect(result).not.toBeNull();
    assert(result);
    assert(isRankingFilter(result));
    expect(result.count).toBe(3);
  });

  it('returns null when measure is missing', () => {
    const baseFilter = filterFactory.members(attribute, []);
    expect(createRankingFilter(baseFilter, FilterOption.TOP, 5, null)).toBeNull();
  });

  it('uses default count of 10 for text/numeric and 1 for datetime', () => {
    expect(DEFAULT_RANKING_COUNT).toBe(10);
    expect(DEFAULT_DATETIME_RANKING_COUNT).toBe(1);
  });

  it('reads ranking state from an existing filter', () => {
    const rankingFilter = filterFactory.topRanking(attribute, measure, 7);
    expect(getRankingStateFromFilter(rankingFilter)).toEqual({
      count: 7,
      measure,
    });
    expect(getRankingStateFromFilter(filterFactory.members(attribute, []))).toEqual({
      count: DEFAULT_RANKING_COUNT,
      measure: null,
    });
  });
});
