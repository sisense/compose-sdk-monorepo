import { getSelectedConditionOption } from './condition-filter-util.js';
import {
  FilterModalType,
  AnyTypeFilterJaql,
  DatetimeLevel,
  FilterType,
  FILTER_TYPES,
  nonSupportedMinutesBuckets,
  IncludeAllFilterJaql,
  PeriodFilterJaql,
  SpecificItemsFilterJaql,
  RangeFilterJaql,
  ConditionFilterJaql,
  ConditionFilterType,
  FilterJaqlInternal,
  FilterJaqlWrapperWithType,
  DEFAULT_FILTER_JAQL_WRAPPER,
  BackgroundFilterExtraProps,
} from './types.js';
import { getCorrectTimeLevel } from './date-time-filter-util.js';

const isIncludeAllFilter = (filter: AnyTypeFilterJaql): boolean =>
  (filter as IncludeAllFilterJaql)?.all;

const getInnerPeriodFilter = (
  filter: PeriodFilterJaql,
): { count: number; offset: number; anchor?: string } => (filter.last ? filter.last : filter.next);

const isPeriodFilter = (filter: AnyTypeFilterJaql): boolean =>
  getInnerPeriodFilter(filter as PeriodFilterJaql)?.offset < 2;

export const isSpecificItemsFilter = (
  filter: AnyTypeFilterJaql,
): filter is SpecificItemsFilterJaql => (filter as SpecificItemsFilterJaql)?.members?.length >= 0;

const isFromOrToDefined = (fromRange?: string | number, toRange?: string | number) =>
  (fromRange && typeof fromRange === 'string') || (toRange && typeof toRange === 'string');

const isFromAndToEmpty = (from?: string | number, to?: string | number) => from === '' && to === '';

const isDateRangeFilter = (filter: AnyTypeFilterJaql, dataType: FilterModalType): boolean => {
  const { from, to } = filter as RangeFilterJaql;

  if (dataType !== FilterModalType.DATE_TIME) return false;

  if (isFromOrToDefined(from, to)) return true;

  return isFromAndToEmpty(from, to);
};

export const isNumericRangeFilter = (filter: AnyTypeFilterJaql): boolean => {
  const { from, to } = filter as RangeFilterJaql;

  return !!(from !== undefined && to !== undefined && !filter.isBetween);
};

export const isConditionFilter = (filter: AnyTypeFilterJaql): filter is ConditionFilterJaql =>
  getSelectedConditionOption(filter as ConditionFilterJaql) !== ConditionFilterType.NONE;

const isAdvancedFilter = (filter: AnyTypeFilterJaql): boolean =>
  Object.keys(filter).includes('isAdvanced');

const isTimeLevelNotSupported = (timeData: { level?: DatetimeLevel; bucket?: string }): boolean =>
  !!(
    timeData.level &&
    timeData.bucket &&
    timeData.level === DatetimeLevel.MINUTES &&
    nonSupportedMinutesBuckets.includes(timeData.bucket)
  );

const isInvalidFilter = (filter: AnyTypeFilterJaql): boolean =>
  filter.filterType === FILTER_TYPES.INVALID;

export const getFilterType = (
  filter: AnyTypeFilterJaql,
  dataType = FilterModalType.DATE_TIME,
  timeData?: { level?: DatetimeLevel; bucket?: string },
): FilterType => {
  if (timeData && isTimeLevelNotSupported(timeData)) return FILTER_TYPES.ADVANCED;

  if (isAdvancedFilter(filter)) return FILTER_TYPES.ADVANCED;
  if (isIncludeAllFilter(filter)) return FILTER_TYPES.INCLUDE_ALL;
  if (isPeriodFilter(filter)) return FILTER_TYPES.PERIOD;
  if (isSpecificItemsFilter(filter)) return FILTER_TYPES.SPECIFIC_ITEMS;
  if (isDateRangeFilter(filter, dataType)) return FILTER_TYPES.DATE_RANGE;
  if (isNumericRangeFilter(filter)) return FILTER_TYPES.NUMERIC_RANGE;
  if (isConditionFilter(filter)) return FILTER_TYPES.CONDITION;
  if (isInvalidFilter(filter)) return FILTER_TYPES.INVALID;

  return FILTER_TYPES.INVALID;
};

/**
 * Extracts Filter Type from Filter Jaql
 *
 * @param jaql - jaql
 * @param dataType - data type
 * @return FilterJaqlWrapperType
 * @internal
 */
export const extractFilterTypeFromFilterJaql = (
  jaql: FilterJaqlInternal,
  dataType: FilterModalType,
): FilterJaqlWrapperWithType => {
  const { level: filterLevel, filter, bucket } = jaql;
  const filterFromJaql = filter || DEFAULT_FILTER_JAQL_WRAPPER.filter;

  const filterToReturn: FilterJaqlWrapperWithType = {
    filter: {
      ...filterFromJaql,
      filterType: getFilterType(filterFromJaql, dataType),
    },
  };

  if (dataType === FilterModalType.DATE_TIME) {
    const backgroundFilter = filterFromJaql as BackgroundFilterExtraProps;
    const level = backgroundFilter?.level || filterLevel;

    filterToReturn.level = getCorrectTimeLevel(level, bucket);
    filterToReturn.filter.filterType = getFilterType(filterFromJaql, dataType, { level, bucket });
  }

  return filterToReturn;
};
