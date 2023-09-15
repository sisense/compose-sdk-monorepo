/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-lines */
import {
  DateDimension,
  LevelAttribute,
  Attribute,
  Measure,
  Filter,
  BaseMeasure,
} from '../interfaces.js';

import {
  TextOperators,
  NumericOperators,
  DateOperators,
  LogicalOperators,
  RankingOperators,
  LogicalAttributeFilter,
  MembersFilter,
  ExcludeFilter,
  NumericFilter,
  MeasureFilter,
  RankingFilter,
  TextFilter,
  DateRangeFilter,
  RelativeDateFilter,
} from './filters.js';

// LOGICAL FILTERS

/**
 * Creates a filter representing a union of multiple filters of the same attribute.
 *
 * @param filters - Filters, of the same attribute, to union
 * @returns A filter representing a union of the given filters
 */
export function union(filters: Filter[]): Filter {
  return new LogicalAttributeFilter(filters, LogicalOperators.Union);
}

/**
 * Creates a filter representing an intersection of multiple filters of the same attribute.
 *
 * @param filters - Filters, of the same attribute, to intersect
 * @returns A filter representing an intersection of the given filters
 */
export function intersection(filters: Filter[]): Filter {
  return new LogicalAttributeFilter(filters, LogicalOperators.Intersection);
}

/**
 * Creates a filter representing an exclusion of the given filter
 * from all attribute members or from the optional input filter.
 *
 * @param filter - Filter to exclude
 * @param input - Input filter to exclude from (optional)
 * @returns A filter representing an exclusion of the given filter
 * from all attribute members or from the optional input filter
 */
export function exclude(filter: Filter, input?: Filter): Filter {
  return new ExcludeFilter(filter, input);
}

// TEXT / NUMERIC FILTERS

/**
 * Creates a "doesn't contain" filter.
 *
 * @param attribute - Text attribute to filter
 * @param value - Value to filter by
 * @returns A text filter of the given attribute
 */
export function doesntContain(attribute: Attribute, value: string): Filter {
  return new TextFilter(attribute, TextOperators.DoesntContain, value);
}

/**
 * Creates a "doesn't end with" filter.
 *
 * @param attribute - Text attribute to filter
 * @param value - Value to filter by
 * @returns A text filter of the given attribute
 */
export function doesntEndWith(attribute: Attribute, value: string): Filter {
  return new TextFilter(attribute, TextOperators.DoesntEndWith, value);
}

/**
 * Creates a "doesn't start with" filter.
 *
 * @param attribute - Text attribute to filter
 * @param value - Value to filter by
 * @returns A text filter of the given attribute
 */
export function doesntStartWith(attribute: Attribute, value: string): Filter {
  return new TextFilter(attribute, TextOperators.DoesntStartWith, value);
}

/**
 * Creates a "contains" filter.
 *
 * @param attribute - Text attribute to filter
 * @param value - Value to filter by
 * @returns A text filter of the given attribute
 */
export function contains(attribute: Attribute, value: string): Filter {
  return new TextFilter(attribute, TextOperators.Contains, value);
}

/**
 * Creates an "ends with" filter.
 *
 * @param attribute - Text attribute to filter
 * @param value - Value to filter by
 * @returns A text filter of the given attribute
 */
export function endsWith(attribute: Attribute, value: string): Filter {
  return new TextFilter(attribute, TextOperators.EndsWith, value);
}

/**
 * Creates a "starts with" filter.
 *
 * @param attribute - Text attribute to filter
 * @param value - Value to filter by
 * @returns A text filter of the given attribute
 */
export function startsWith(attribute: Attribute, value: string): Filter {
  return new TextFilter(attribute, TextOperators.StartsWith, value);
}

/**
 * Creates a "like" filter.
 *
 * @param attribute - Text attribute to filter
 * @param value - Value to filter by
 * @returns A text filter of the given attribute
 */
export function like(attribute: Attribute, value: string): Filter {
  return new TextFilter(attribute, TextOperators.Like, value);
}

/**
 * Creates a "doesn't equal" filter.
 *
 * @param attribute - Text or numeric attribute to filter
 * @param value - Value to filter by
 * @returns A filter of the given attribute
 */
export function doesntEqual(attribute: Attribute, value: string | number): Filter {
  if (typeof value === 'string') {
    return new TextFilter(attribute, TextOperators.DoesntEqual, value);
  } else {
    return numeric(attribute, NumericOperators.DoesntEqual, value);
  }
}

/**
 * Creates an "equals" filter.
 *
 * @param attribute - Text or numeric attribute to filter
 * @param value - Value to filter by
 * @returns A filter of the given attribute
 */
export function equals(attribute: Attribute, value: string | number): Filter {
  if (typeof value === 'string') {
    return new TextFilter(attribute, TextOperators.Equals, value);
  } else {
    return numeric(attribute, NumericOperators.Equals, value);
  }
}

/**
 * Creates a "greater than" filter.
 *
 * @param attribute - Numeric attribute to filter
 * @param value - Value to filter by
 * @returns A numeric filter of the given attribute
 */
export function greaterThan(attribute: Attribute, value: number): Filter {
  return numeric(attribute, NumericOperators.FromNotEqual, value);
}

/**
 * Creates a "greater than or equal" filter.
 *
 * @param attribute - Numeric attribute to filter
 * @param value - Value to filter by
 * @returns A numeric filter of the given attribute
 */
export function greaterThanOrEqual(attribute: Attribute, value: number): Filter {
  return numeric(attribute, NumericOperators.From, value);
}

/**
 * Creates a "less than" filter.
 *
 * @param attribute - Numeric attribute to filter
 * @param value - Value to filter by
 * @returns A numeric filter of the given attribute
 */
export function lessThan(attribute: Attribute, value: number): Filter {
  return numeric(attribute, NumericOperators.ToNotEqual, value);
}

/**
 * Creates a "less than or equal" filter.
 *
 * @param attribute - Numeric attribute to filter
 * @param value - Value to filter by
 * @returns A numeric filter of the given attribute
 */
export function lessThanOrEqual(attribute: Attribute, value: number): Filter {
  return numeric(attribute, NumericOperators.To, value);
}

/**
 * Creates a "between" filter.
 *
 * @param attribute - Numeric attribute to filter
 * @param valueA - Value to filter from
 * @param valueB - Value to filter to
 * @returns A numeric filter of the given attribute
 */
export function between(attribute: Attribute, valueA: number, valueB: number): Filter {
  return numeric(attribute, NumericOperators.From, valueA, NumericOperators.To, valueB);
}

/**
 * Creates a "between, but not equal" filter.
 *
 * @param attribute - Numeric attribute to filter
 * @param valueA - Value to filter from
 * @param valueB - Value to filter to
 * @returns A numeric filter of the given attribute
 */
export function betweenNotEqual(attribute: Attribute, valueA: number, valueB: number): Filter {
  return numeric(
    attribute,
    NumericOperators.FromNotEqual,
    valueA,
    NumericOperators.ToNotEqual,
    valueB,
  );
}

/**
 * Creates a custom numeric filter.
 *
 * @param attribute - Numeric attribute to filter
 * @param operatorA - First operator
 * @param valueA - First value
 * @param operatorB - Second operator
 * @param valueB - Second value
 * @returns A custom numeric filter of the given attribute
 */
export function numeric(
  attribute: Attribute,
  operatorA?: string,
  valueA?: number,
  operatorB?: string,
  valueB?: number,
): Filter {
  return new NumericFilter(attribute, operatorA, valueA, operatorB, valueB);
}

/**
 * Creates a filter on the given members of the given attribute.
 *
 * @param attribute - Attribute to filter
 * @param members - Array of member values to filter by
 * @returns A filter instance representing the given members of the given attribute
 */
export function members(attribute: Attribute, members: string[]): Filter {
  return new MembersFilter(attribute, members);
}

// DATE FILTERS

/**
 * Creates a filter on all values starting at the given date of the given level.
 *
 * @param level - Date level attribute to filter. See {@link DateLevels} for supported levels.
 * @param from - Date or String representing the value to filter from
 * @returns A filter instance filtering all values starting at the given value
 */
export function dateFrom(level: LevelAttribute, from: Date | string): Filter {
  return dateRange(level, from, undefined);
}

/**
 * Creates a filter on all values ending at the given date of the given level.
 *
 * @param level - Date level attribute to filter. See {@link DateLevels} for supported levels.
 * @param to - Date or String representing the last member to filter to
 * @returns A filter instance filtering all values ending at the given value
 */
export function dateTo(level: LevelAttribute, to: Date | string): Filter {
  return dateRange(level, undefined, to);
}

/**
 * Creates a range filter between the given "from" and "to" arguments.
 *
 * @param level - Date level attribute to filter. See {@link DateLevels} for supported levels.
 * @param from - Date or String representing the start member to filter from
 * @param to - Date or String representing the end member to filter to
 * @returns A filter instance filtering all values ending at the given value
 */
export function dateRange(level: LevelAttribute, from?: Date | string, to?: Date | string): Filter {
  return new DateRangeFilter(level, from, to);
}

/**
 * Creates a relative date filter.
 *
 * @param level - Date level attribute to filter. See {@link DateLevels} for supported levels.
 * @param offset - offset to skip from the given anchor, or Today if not provided,
 * positive/negative to skip forward/backward
 * @param count - number of members to filter
 * @param anchor - Anchor to filter from, Today is used if not provided
 * @returns A relative date filter
 */
export function dateRelative(
  level: LevelAttribute,
  offset: number,
  count: number,
  anchor?: Date | string,
): Filter {
  return new RelativeDateFilter(level, offset, count, undefined, anchor);
}

/**
 * Creates a relative date filter from the given anchor date.
 *
 * @param level - Date level attribute to filter. See {@link DateLevels} for supported levels.
 * @param offset - offset to skip from the given anchor, or Today if not provided
 * @param count - number of members to filter
 * @param anchor - Anchor to filter from, Today is used if not provided
 * @returns A relative date filter
 */
export function dateRelativeFrom(
  level: LevelAttribute,
  offset: number,
  count: number,
  anchor?: Date | string,
): Filter {
  return new RelativeDateFilter(level, offset, count, DateOperators.Next, anchor);
}

/**
 * Creates a relative date filter to the given anchor date.
 *
 * @param level - Date level attribute to filter. See {@link DateLevels} for supported levels.
 * @param offset - offset to skip from the given anchor, or Today if not provided
 * @param count - number of members to filter
 * @param anchor - Anchor to filter from, Today is used if not provided
 * @returns A relative date filter
 */
export function dateRelativeTo(
  level: LevelAttribute,
  offset: number,
  count: number,
  anchor?: Date | string,
): Filter {
  return new RelativeDateFilter(level, offset, count, DateOperators.Last, anchor);
}

/**
 * Creates a filter on "This Year" of the given date dimension.
 *
 * @param dimension - date dimension to filter
 * @returns A "This Year" filter of the given dimension
 */
export function thisYear(dimension: DateDimension): Filter {
  return dateRelativeTo(dimension.Years, 0, 1);
}

/**
 * Creates a filter on "This Month" of the given date dimension.
 *
 * @param dimension - date dimension to filter
 * @returns A "This Month" filter of the given dimension
 */
export function thisMonth(dimension: DateDimension): Filter {
  return dateRelativeTo(dimension.Months, 0, 1);
}

/**
 * Creates a filter on "This Quarter" of the given date dimension.
 *
 * @param dimension - date dimension to filter
 * @returns A "This Quarter" filter of the given dimension
 */
export function thisQuarter(dimension: DateDimension): Filter {
  return dateRelativeTo(dimension.Quarters, 0, 1);
}

/**
 * Creates a filter on "Today" of the given date dimension.
 *
 * @param dimension - date dimension to filter
 * @returns A "Today" filter of the given dimension
 */
export function today(dimension: DateDimension): Filter {
  return dateRelativeTo(dimension.Days, 0, 1);
}

// MEASURE-RELATED FILTERS

/**
 * Creates a filter on all measure values matching the provided criteria.
 *
 * @param attribute - Attribute to filter
 * @param measure - Measure to filter by
 * @param operatorA - Operator to apply on `valueA` ({@link NumericOperators})
 * @param valueA - First value
 * @param operatorB - Operator to apply on `valueB` ({@link NumericOperators})
 * @param valueB - Second value
 * @returns A filter representing the provided logic
 * @internal
 */
export function measureBase(
  attribute: Attribute,
  measure: Measure,
  operatorA?: string,
  valueA?: number,
  operatorB?: string,
  valueB?: number,
): Filter {
  return new MeasureFilter(attribute, measure, operatorA, valueA, operatorB, valueB);
}

/**
 * Creates a filter on all measure values that are greater than or equal to the given value.
 *
 * @param measure - Measure to filter by
 * @param value - Min value
 * @returns A filter representing the "greater than or equal to" logic
 */
export function measureGreaterThanOrEqual(measure: BaseMeasure, value: number): Filter {
  return measureBase(measure.attribute, measure, NumericOperators.From, value);
}

/**
 * Creates a filter on all measure values less than or equal to the given value.
 *
 * @param measure - Measure to filter by
 * @param value - Max value
 * @returns A filter representing the "less than or equal to" logic
 */
export function measureLessThanOrEqual(measure: BaseMeasure, value: number): Filter {
  return measureBase(measure.attribute, measure, NumericOperators.To, value);
}

/**
 * Creates a filter on all measure values within a range.
 *
 * @param measure - Measure to filter by
 * @param valueA - Min value
 * @param valueB - Max value
 * @returns A filter representing the "between" logic
 */
export function measureBetween(measure: BaseMeasure, valueA: number, valueB: number): Filter {
  return measureBase(
    measure.attribute,
    measure,
    NumericOperators.From,
    valueA,
    NumericOperators.To,
    valueB,
  );
}

/**
 * Creates a filter on all measure values within a range but not equal to the min and max values.
 *
 * @param measure - Measure to filter by
 * @param valueA - Min value
 * @param valueB - Max value
 * @returns A filter representing the "between, not equal" logic
 */
export function measureBetweenNotEqual(
  measure: BaseMeasure,
  valueA: number,
  valueB: number,
): Filter {
  return measureBase(
    measure.attribute,
    measure,
    NumericOperators.FromNotEqual,
    valueA,
    NumericOperators.ToNotEqual,
    valueB,
  );
}

// RANKING FILTERS

/**
 * Creates a filter representing a top ranking logic.
 *
 * @param attribute - Attribute to filter
 * @param measure - Measure to filter by
 * @param count - Number of members to return
 * @returns A filter representing a top ranking logic on the given attribute by the given measure
 */
export function topRanking(attribute: Attribute, measure: Measure, count: number): Filter {
  return new RankingFilter(attribute, measure, RankingOperators.Top, count);
}

/**
 * Creates a filter representing a bottom ranking logic.
 *
 * @param attribute - Attribute to filter
 * @param measure - Measure to filter by
 * @param count - Number of members to return
 * @returns A filter representing a bottom ranking logic on the given attribute by the given measure
 */
export function bottomRanking(attribute: Attribute, measure: Measure, count: number): Filter {
  return new RankingFilter(attribute, measure, RankingOperators.Bottom, count);
}
