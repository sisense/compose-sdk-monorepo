import { Attribute, Filter, isRankingFilter, Measure } from '@sisense/sdk-data';

import {
  CRITERIA_FILTER_MAP,
  FilterOption,
} from '../../../criteria-filter-tile/criteria-filter-operations.js';

export const DEFAULT_RANKING_COUNT = 10;
export const DEFAULT_DATETIME_RANKING_COUNT = 1;

export type RankingConditionType = typeof FilterOption.TOP | typeof FilterOption.BOTTOM;

export function isRankingCondition(condition: string): condition is RankingConditionType {
  return condition === FilterOption.TOP || condition === FilterOption.BOTTOM;
}

export function getRankingCountFromFilter(filter: Filter): number {
  if (!isRankingFilter(filter)) {
    return DEFAULT_RANKING_COUNT;
  }
  return filter.count;
}

export function getRankingMeasureFromFilter(filter: Filter): Measure | null {
  if (!isRankingFilter(filter)) {
    return null;
  }
  return filter.measure;
}

export function getRankingStateFromFilter(filter: Filter): {
  count: number;
  measure: Measure | null;
} {
  if (!isRankingFilter(filter)) {
    return { count: DEFAULT_RANKING_COUNT, measure: null };
  }
  return {
    count: filter.count,
    measure: filter.measure,
  };
}

export function createRankingFilter(
  baseFilter: Filter,
  condition: RankingConditionType,
  count: number,
  measure: Measure | null,
  attributeOverride?: Attribute,
): Filter | null {
  if (!measure || !Number.isFinite(count) || count <= 0) {
    return null;
  }

  const attribute = attributeOverride ?? baseFilter.attribute;
  const builder = CRITERIA_FILTER_MAP[condition];
  return builder.fn(attribute, measure, count, baseFilter.config);
}
