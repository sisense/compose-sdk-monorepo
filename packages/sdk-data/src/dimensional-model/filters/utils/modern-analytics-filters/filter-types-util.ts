/* eslint-disable max-lines */
import { getSelectedConditionOption } from './condition-filter-util.js';
import {
  FilterModalTypes,
  FilterJaqlTypes,
  DatetimeLevel,
  FilterTypes,
  FILTER_TYPES,
  nonSupportedMinutesBuckets,
  IncludeAllJaql,
  PeriodJaql,
  SpecificItemsJaql,
  RangeJaql,
  ConditionJaql,
  ConditionTypes,
  FilterJaqlInternal,
  FilterJaqlWrapperType,
  FILTER_JAQL_WRAPPER,
  BackgroundFilterExtraProps,
} from './types.js';
import { getCorrectTimeLevel } from './date-time-filter-util.js';

export const isIncludeAllFilter = (
  filter: FilterJaqlTypes,
  currentDefaultFilter: FilterTypes,
): FilterTypes => {
  if ((filter as IncludeAllJaql)?.all) {
    return FILTER_TYPES.INCLUDE_ALL;
  }

  return currentDefaultFilter;
};

export const getInnerPeriodFilter = (
  filter: PeriodJaql,
): {
  count: number;
  offset: number;
  anchor?: string;
} => {
  return filter.last ? filter.last : filter.next;
};

export const isPeriodFilter = (
  filter: FilterJaqlTypes,
  currentDefaultFilter: FilterTypes,
): FilterTypes => {
  const period = getInnerPeriodFilter(filter as PeriodJaql);
  if (period?.offset < 2) {
    return FILTER_TYPES.PERIOD;
  }

  return currentDefaultFilter;
};

export const isSpecificItemsFilter = (
  filter: FilterJaqlTypes,
  currentDefaultFilter: FilterTypes,
): FilterTypes => {
  const specificItemsFilter = filter as SpecificItemsJaql;

  if (specificItemsFilter?.members) {
    if (specificItemsFilter.members.length > 0) {
      return FILTER_TYPES.SPECIFIC_ITEMS;
    }

    return FILTER_TYPES.INCLUDE_ALL;
  }

  return currentDefaultFilter;
};

const areFromOrToDefined = (fromRange?: string | number, toRange?: string | number) =>
  (fromRange && typeof fromRange === 'string') || (toRange && typeof toRange === 'string');
const areFromAndToEmpty = (from?: string | number, to?: string | number) =>
  from === '' && to === '';

export const isDateRangeFilter = (
  filter: FilterJaqlTypes,
  currentDefaultFilter: FilterTypes,
  dataType: FilterModalTypes,
): FilterTypes => {
  const { from, to } = filter as RangeJaql;

  if (dataType !== FilterModalTypes.DATE_TIME) {
    return currentDefaultFilter;
  }

  if (areFromOrToDefined(from, to)) {
    return FILTER_TYPES.DATE_RANGE;
  }

  if (areFromAndToEmpty(from, to)) {
    return FILTER_TYPES.INCLUDE_ALL;
  }

  return currentDefaultFilter;
};

export const isNumericRangeFilter = (
  filter: FilterJaqlTypes,
  currentDefaultFilter: FilterTypes,
): FilterTypes => {
  const { from, to } = filter as RangeJaql;

  if (from !== undefined && to !== undefined && !filter.isBetween) {
    return FILTER_TYPES.NUMERIC_RANGE;
  }

  return currentDefaultFilter;
};

export const isConditionFilter = (
  filter: FilterJaqlTypes,
  currentDefaultFilter: FilterTypes,
): FilterTypes => {
  if (getSelectedConditionOption(filter as ConditionJaql) !== ConditionTypes.NONE) {
    return FILTER_TYPES.CONDITION;
  }

  return currentDefaultFilter;
};

export const isAdvancedFilter = (
  filter: FilterJaqlTypes,
  currentDefaultFilter: FilterTypes,
): FilterTypes => {
  if (Object.keys(filter).includes('isAdvanced')) {
    return FILTER_TYPES.ADVANCED;
  }

  return currentDefaultFilter;
};

export const isTimeLevelNotSupported = (timeData: {
  level?: DatetimeLevel;
  bucket?: string;
}): boolean => {
  const { level, bucket } = timeData;

  return !!(
    level &&
    bucket &&
    level === DatetimeLevel.MINUTES &&
    nonSupportedMinutesBuckets.includes(bucket)
  );
};

export const isInvalidFilter = (filter: FilterJaqlTypes, currentDefaultFilter: FilterTypes) => {
  if (filter.jaqlType === FILTER_TYPES.INVALID) {
    return FILTER_TYPES.INVALID;
  }

  return currentDefaultFilter;
};

export const getFilterType = (
  filter: FilterJaqlTypes,
  dataType = FilterModalTypes.DATE_TIME,
  timeData?: { level?: DatetimeLevel; bucket?: string },
): FilterTypes => {
  let filterType: FilterTypes = FILTER_TYPES.ADVANCED;

  if (timeData && isTimeLevelNotSupported(timeData)) {
    return filterType;
  }

  filterType = isIncludeAllFilter(filter, filterType);
  filterType = isPeriodFilter(filter, filterType);
  filterType = isSpecificItemsFilter(filter, filterType);
  filterType = isConditionFilter(filter, filterType);
  filterType = isNumericRangeFilter(filter, filterType);
  filterType = isDateRangeFilter(filter, filterType, dataType);
  filterType = isAdvancedFilter(filter, filterType);
  filterType = isInvalidFilter(filter, filterType);

  return filterType;
};

/**
 * Extracts Type from Filter Jaql
 *
 * @param jaql - jaql
 * @param dataType - data type
 * @return FilterJaqlWrapperType
 * @internal
 */
export const extractTypeFromFilterJaql = (
  jaql: FilterJaqlInternal,
  dataType: FilterModalTypes,
): FilterJaqlWrapperType => {
  const { level: filterLevel, filter, bucket } = jaql;
  const filterFromJaql = filter || FILTER_JAQL_WRAPPER.filter;

  const filterToReturn: FilterJaqlWrapperType = {
    filter: {
      ...filterFromJaql,
      jaqlType: getFilterType(filterFromJaql, dataType),
    },
  };

  if (dataType === FilterModalTypes.DATE_TIME) {
    const backgroundFilter = filterFromJaql as BackgroundFilterExtraProps;
    const level = backgroundFilter?.level || filterLevel;

    filterToReturn.level = getCorrectTimeLevel(level, bucket);
    filterToReturn.filter.jaqlType = getFilterType(filterFromJaql, dataType, { level, bucket });
  }

  return filterToReturn;
};
