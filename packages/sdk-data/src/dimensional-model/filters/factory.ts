/* eslint-disable max-lines */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-shadow */
import {
  withComposeCodeForFilter,
  withComposeCodeForFilterRelations,
} from '../compose-code-utils.js';
import {
  Attribute,
  BaseFilterConfig,
  BaseMeasure,
  DateDimension,
  Filter,
  FilterRelations,
  FilterRelationsNode,
  LevelAttribute,
  Measure,
  MembersFilterConfig,
} from '../interfaces.js';
import {
  CascadingFilter,
  CustomFilter,
  DateOperators,
  DateRangeFilter,
  ExcludeFilter,
  LogicalAttributeFilter,
  LogicalOperators,
  MeasureFilter,
  MembersFilter,
  NumericFilter,
  NumericOperators,
  RankingFilter,
  RankingOperators,
  RelativeDateFilter,
  TextFilter,
  TextOperators,
} from './filters.js';

// LOGICAL FILTERS

/**
 * Creates a filter representing the union of multiple filters on the same attribute. The resulting
 * union filter filters on items that match any of the given filters.
 *
 * To create 'or' filters using different attributes, use the {@link logic.and | `or()`} function.
 *
 * @example
 * Filter for countries that start with the letter 'A' **or** end with the letter 'A'
 * in the Sample ECommerce data model.
 * ```ts
 * filterFactory.union([
 *   filterFactory.startsWith(DM.Country.Country, 'A'),
 *   filterFactory.endsWith(DM.Country.Country, 'A'),
 * ])
 * ```
 * @param filters - Filters to union. The filters must all be on the same attribute.
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const union: (filters: Filter[], config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter(
    (filters, config) => new LogicalAttributeFilter(filters, LogicalOperators.Union, config),
    'union',
  );

/**
 * Creates a filter representing the intersection of multiple filters on the same attribute. The resulting
 * intersection filter filters on items that match all of the given filters.
 *
 * To create 'and' filters using different attributes, use the {@link logic.and | `and()`} function.
 *
 * @example
 * Filter for countries that start with the letter 'A' **and** end with the letter 'A'
 * in the Sample ECommerce data model.
 * ```ts
 * filterFactory.intersection([
 *   filterFactory.startsWith(DM.Country.Country, 'A'),
 *   filterFactory.endsWith(DM.Country.Country, 'A'),
 * ])
 * ```
 * @param filters - Filters to intersect. The filters must all be on the same attribute.
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const intersection: (filters: Filter[], config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter(
    (filters, config) => new LogicalAttributeFilter(filters, LogicalOperators.Intersection, config),
    'intersection',
  );

/**
 * Creates a filter that excludes items matching the given filter
 * from all items or from items matching the optional input filter.
 *
 * @example
 * Filter for items where the country name does not contain the letter 'A'
 * from the Sample ECommerce data model.
 * ```ts
 * filterFactory.exclude(filterFactory.contains(DM.Country.Country, 'A'))
 * ```
 *
 * Filter for items where the country name starts with the letter 'B' but does not contain the letter 'A'
 * from the Sample ECommerce data model. This filter will match countries like 'Belgium', but will not
 * match countries like 'Bermuda'.
 * ```ts
 * filterFactory.exclude(
 *   filterFactory.contains(DM.Country.Country, 'A'),
 *   filterFactory.startsWith(DM.Country.Country, 'B')
 * )
 * ```
 * @param filter - Filter to exclude
 * @param input - Input filter to exclude from, on the same attribute. If not provided, the filter excludes from all items.
 * @param config - Optional configuration for the filter
 * @returns A filter representing an exclusion of the given filter
 * from all attribute members or from the optional input filter
 */
export const exclude: (filter: Filter, input?: Filter, config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter(
    (filter, input, config) => new ExcludeFilter(filter, input, config),
    'exclude',
  );

// TEXT / NUMERIC FILTERS

/**
 * Creates a filter to isolate attribute values that do not contain a specified string.
 *
 * Matching is case insensitive.
 *
 * You can optionally use wildcard characters for pattern matching, as described in the
 * {@link like | `like()`} function.
 *
 * @example
 * Filter for categories in the Sample ECommerce data model where the category name doesn't contain
 * 'digital'. This filter matches categories not like 'Digital Cameras' and 'MP3 & Digital Media Players'.
 * ```ts
 * filterFactory.contains(DM.Category.Category, 'digital')
 * ```
 * @param attribute - Text attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const doesntContain: (
  attribute: Attribute,
  value: string,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, value, config) =>
    new TextFilter(attribute, TextOperators.DoesntContain, value, config),
  'doesntContain',
);

/**
 * Creates a filter to isolate attribute values that do not end with a specified string.
 *
 * Matching is case insensitive.
 *
 * You can optionally use wildcard characters for pattern matching, as described in the
 * {@link like | `like()`} function.
 *
 * @example
 * Filter for countries in the Sample ECommerce data model where the country name doesn't end with
 * 'land'. This filter matches countries not like 'Iceland' and 'Ireland'.
 * ```ts
 * filterFactory.doesntEndWith(DM.Country.Country, 'land')
 * ```
 * @param attribute - Text attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const doesntEndWith: (
  attribute: Attribute,
  value: string,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, value, config) =>
    new TextFilter(attribute, TextOperators.DoesntEndWith, value, config),
  'doesntEndWith',
);

/**
 * Creates a filter to isolate attribute values that do not start with a specified string.
 *
 * Matching is case insensitive.
 *
 * You can optionally use wildcard characters for pattern matching, as described in the
 * {@link like | `like()`} function.
 *
 * @example
 * Filter for countries in the Sample ECommerce data model where the country name doesn't start with
 * 'United'. This filter matches countries not like 'United States' and 'United Kingdom'.
 * ```ts
 * filterFactory.doesntStartWith(DM.Country.Country, 'United')
 * ```
 * @param attribute - Text attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const doesntStartWith: (
  attribute: Attribute,
  value: string,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, value, config) =>
    new TextFilter(attribute, TextOperators.DoesntStartWith, value, config),
  'doesntStartWith',
);

/**
 * Creates a filter to isolate attribute values that contain a specified string.
 *
 * Matching is case insensitive.
 *
 * You can optionally use wildcard characters for pattern matching, as described in the
 * {@link like | `like()`} function.
 *
 * @example
 * Filter for categories in the Sample ECommerce data model where the category name contains
 * 'digital'. This filter matches categories like 'Digital Cameras' and 'MP3 & Digital Media Players'.
 * ```ts
 * filterFactory.contains(DM.Category.Category, 'digital')
 * ```
 * @param attribute - Text attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const contains: (attribute: Attribute, value: string, config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter(
    (attribute, value, config) => new TextFilter(attribute, TextOperators.Contains, value, config),
    'contains',
  );

/**
 * Creates a filter to isolate attribute values that end with a specified string.
 *
 * Matching is case insensitive.
 *
 * You can optionally use wildcard characters for pattern matching, as described in the
 * {@link like | `like()`} function.
 *
 * @example
 * Filter for countries in the Sample ECommerce data model where the country name ends with
 * 'land'. This filter matches countries like 'Ireland' and 'Iceland'.
 * ```ts
 * filterFactory.endsWith(DM.Country.Country, 'land')
 * ```
 * @param attribute - Text attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const endsWith: (attribute: Attribute, value: string, config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter(
    (attribute, value, config) => new TextFilter(attribute, TextOperators.EndsWith, value, config),
    'endsWith',
  );

/**
 * Creates a filter to isolate attribute values that start with a specified string.
 *
 * Matching is case insensitive.
 *
 * You can optionally use wildcard characters for pattern matching, as described in the
 * {@link like | `like()`} function.
 *
 * @example
 * Filter for countries in the Sample ECommerce data model where the country name starts with
 * 'United'. This filter matches countries like 'United States' and 'United Kingdom'.
 * ```ts
 * filterFactory.startsWith(DM.Country.Country, 'United')
 * ```
 * @param attribute - Text attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const startsWith: (
  attribute: Attribute,
  value: string,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, value, config) => new TextFilter(attribute, TextOperators.StartsWith, value, config),
  'startsWith',
);

/**
 * Creates a filter to isolate attribute values that match a specified string pattern.
 *
 * The pattern can include the following wildcard characters:
 *
 * + `_`: Matches a single character
 * + `%`: Matches multiple characters
 *
 * To search for a literal underscore (`_`) or percent symbol (`%`), use the backslash (`\`) escape
 * character.
 *
 * Matching is case insensitive.
 *
 * @example
 * Filter for countries from the Sample ECommerce data model where the country name starts with an
 * 'A' and ends with an 'a'. This filter matches countries like 'Argentina' and 'Australia'.
 * ```ts
 * filterFactory.like(DM.Country.Country, 'A%a')
 * ```
 * @param attribute - Text attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const like: (attribute: Attribute, value: string, config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter(
    (attribute, value, config) => new TextFilter(attribute, TextOperators.Like, value, config),
    'like',
  );

/**
 * Creates a filter to isolate attribute values that do not equal a specified string or number.
 *
 * When filtering against a string:
 *
 *  + Matching is case insensitive.
 *  + You can optionally use wildcard characters for pattern matching, as described in the
 * {@link like | `like()`} function.
 *
 * @example
 * Filter for items not in new condition from the Sample ECommerce data model.
 * ```ts
 * filterFactory.doesntEqual(DM.Commerce.Condition, 'New')
 * ```
 * @param attribute - Text or numeric attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const doesntEqual: (
  attribute: Attribute,
  value: string | number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter((attribute, value, config) => {
  if (typeof value === 'string') {
    return new TextFilter(attribute, TextOperators.DoesntEqual, value, config);
  } else {
    return numeric(attribute, NumericOperators.DoesntEqual, value, undefined, undefined, config);
  }
}, 'doesntEqual');

/**
 * Creates a filter to isolate attribute values that equal a specified string or number.
 *
 * When filtering against a string:
 *
 *  + Matching is case insensitive.
 *  + You can optionally use wildcard characters for pattern matching, as described in the
 * {@link like | `like()`} function.
 *
 * @example
 * Filter for items in new condition from the Sample ECommerce data model.
 * ```ts
 * filterFactory.equals(DM.Commerce.Condition, 'New')
 * ```
 * @param attribute - Text or numeric attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const equals: (
  attribute: Attribute,
  value: string | number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter((attribute, value, config) => {
  if (typeof value === 'string') {
    return new TextFilter(attribute, TextOperators.Equals, value, config);
  } else {
    return numeric(attribute, NumericOperators.Equals, value, undefined, undefined, config);
  }
}, 'equals');

/**
 * Creates a filter to isolate attribute values strictly greater than a specified number.
 *
 * @example
 * Filter for items where the cost is greater than 100 from the Sample ECommerce data model.
 * ```ts
 * filterFactory.greaterThan(DM.Commerce.Cost, 100)
 * ```
 * @param attribute - Numeric attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const greaterThan: (
  attribute: Attribute,
  value: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, value, config) =>
    numeric(attribute, NumericOperators.FromNotEqual, value, undefined, undefined, config),
  'greaterThan',
);

/**
 * Creates a filter to isolate attribute values greater than or equal to a specified number.
 *
 * @example
 * Filter for items where the cost is greater than or equal to 100 from the Sample ECommerce data model.
 * ```ts
 * filterFactory.greaterThanOrEqual(DM.Commerce.Cost, 100)
 * ```
 * @param attribute - Numeric attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const greaterThanOrEqual: (
  attribute: Attribute,
  value: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, value, config) =>
    numeric(attribute, NumericOperators.From, value, undefined, undefined, config),
  'greaterThanOrEqual',
);

/**
 * Creates a filter to isolate attribute values strictly less than a specified number.
 *
 * @example
 * Filter for items where the cost is less than 100 from the Sample ECommerce data model.
 * ```ts
 * filterFactory.lessThan(DM.Commerce.Cost, 100)
 * ```
 * @param attribute - Numeric attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const lessThan: (attribute: Attribute, value: number, config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter(
    (attribute, value, config) =>
      numeric(attribute, NumericOperators.ToNotEqual, value, undefined, undefined, config),
    'lessThan',
  );

/**
 * Creates a filter to isolate attribute values less than or equal to a specified number.
 *
 * @example
 * Filter for items where the cost is less than or equal to 100 from the Sample ECommerce data model.
 * ```ts
 * filterFactory.lessThanOrEqual(DM.Commerce.Cost, 100)
 * ```
 * @param attribute - Numeric attribute to filter on
 * @param value - Value to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const lessThanOrEqual: (
  attribute: Attribute,
  value: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, value, config) =>
    numeric(attribute, NumericOperators.To, value, undefined, undefined, config),
  'lessThanOrEqual',
);

/**
 * Creates a filter to isolate attribute values within or exactly matching two specified numerical boundaries.
 *
 * @example
 * Filter for items from the Sample ECommerce data model where the cost is greater than or equal to 100 and less than or equal to 200.
 * ```ts
 * filterFactory.between(DM.Commerce.Cost, 100, 200)
 * ```
 * @param attribute - Numeric attribute to filter on
 * @param valueA - Value to filter from
 * @param valueB - Value to filter to
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const between: (
  attribute: Attribute,
  valueA: number,
  valueB: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, valueA, valueB, config) =>
    numeric(attribute, NumericOperators.From, valueA, NumericOperators.To, valueB, config),
  'between',
);

/**
 * Creates a filter that isolates attribute values strictly within two specified numerical boundaries.
 *
 * @example
 * Filter for items from the Sample ECommerce data model where the cost is greater than 100 and less than 200.
 * ```ts
 * filterFactory.betweenNotEqual(DM.Commerce.Cost, 100, 200)
 * ```
 * @param attribute - Numeric attribute to filter on
 * @param valueA - Value to filter from
 * @param valueB - Value to filter to
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const betweenNotEqual: (
  attribute: Attribute,
  valueA: number,
  valueB: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, valueA, valueB, config) =>
    numeric(
      attribute,
      NumericOperators.FromNotEqual,
      valueA,
      NumericOperators.ToNotEqual,
      valueB,
      config,
    ),
  'betweenNotEqual',
);

/**
 * Creates a custom numeric filter that filters for given attribute values.
 *
 * @example
 * Filter for items where the cost is greater than 100 and less than 200
 * from the Sample ECommerce data model.
 * ```ts
 * filterFactory.numeric(
 *   DM.Commerce.Cost,
 *   NumericOperators.From,
 *   100,
 *   NumericOperators.To,
 *   200
 * )
 * ```
 * @param attribute - Numeric attribute to filter
 * @param operatorA - First operator
 * @param valueA - First value
 * @param operatorB - Second operator
 * @param valueB - Second value
 * @param config - Optional configuration for the filter
 * @returns A custom numeric filter of the given attribute
 */
export const numeric: (
  attribute: Attribute,
  operatorA?: string,
  valueA?: number,
  operatorB?: string,
  valueB?: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, operatorA, valueA, operatorB, valueB, config) =>
    new NumericFilter(attribute, operatorA, valueA, operatorB, valueB, config),
  'numeric',
);

/**
 * Creates a filter to isolate attribute values that match any of the specified strings.
 *
 * Matching is case sensitive.
 *
 * @example
 * Filter for items where the condition is 'Used' or 'Refurbished'
 * from the Sample ECommerce data model.
 * ```ts
 * filterFactory.members(DM.Commerce.Condition, ['Used', 'Refurbished'])
 * ```
 * @param attribute - Attribute to filter on
 * @param members - Array of member values to filter by
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 * @shortDescription Creates filter on attribute to match certain string values
 */
export const members: (
  attribute: Attribute,
  members: string[],
  config?: MembersFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, members, config) => new MembersFilter(attribute, members, config),
  'members',
);

// DATE FILTERS

/**
 * Creates a filter to isolate date values starting from and including the given date and level.
 *
 * @example
 * Filter for items in the Sample ECommerce data model where the date is not before the year 2010.
 * ```ts
 * filterFactory.dateFrom(DM.Commerce.Date.Years, '2010-01')
 * ```
 * @param level - Date {@link LevelAttribute} to filter on
 * @param from - Date or string representing the value to filter from
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const dateFrom: (
  level: LevelAttribute,
  from: Date | string,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (level, from, config) => dateRange(level, from, undefined, config),
  'dateFrom',
);

/**
 * Creates a filter to isolate items up until and including the given date and level.
 *
 * @example
 * Filter for items where the date is from the year 2010 or earlier in the Sample ECommerce data model.
 * ```ts
 * filterFactory.dateTo(DM.Commerce.Date.Years, '2010-01')
 * ```
 * @param level - Date {@link LevelAttribute} to filter on
 * @param to - Date or string representing the last member to filter to
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const dateTo: (
  level: LevelAttribute,
  to: Date | string,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (level, to, config) => dateRange(level, undefined, to, config),
  'dateTo',
);

/**
 * Creates a filter to isolate items between and including the given dates and level.
 *
 * @example
 * Filter for items in the Sample ECommerce data model where the date is from the years 2009, 2010, or 2011.
 * ```ts
 * filterFactory.dateRange(DM.Commerce.Date.Years, '2009-01', '2011-01')
 * ```
 * @param level - Date {@link LevelAttribute} to filter on
 * @param from - Date or string representing the start member to filter from
 * @param to - Date or string representing the end member to filter to
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const dateRange: (
  level: LevelAttribute,
  from?: Date | string,
  to?: Date | string,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (level, from, to, config) => new DateRangeFilter(level, from, to, config),
  'dateRange',
);

/**
 * Creates a filter to isolate items with a date dimension value within a specified range after a
 * given date and level.
 *
 * Although the `offset` can be used to set a beginning date prior to the `anchor`, the filter range always
 * continues forward after the offset beginning date. So, using an `offset` of `-6` and a `count` of `18` when `level`
 * is a month level creates a range that begins 6 month before the `anchor` date and extends to 12 months after
 * the `anchor` date.
 *
 * @example
 * Filter for items in the Sample ECommerce data model where the date is in 2011 or the first half of 2012.
 * ```ts
 * filterFactory.dateRelative(DM.Commerce.Date.Months, 0, 18, '2011-01'),
 * ```
 *
 * Filter for items in the Sample ECommerce data model where the date is in the second half of 2010 or in 2011.
 * ```ts
 * filterFactory.dateRelative(DM.Commerce.Date.Months, -6, 18, '2011-01'),
 * ```
 *
 * Filter for items in the Sample ECommerce data model where the date is in the past 6 months.
 * ```ts
 * filterFactory.dateRelative(DM.Commerce.Date.Months, -6, 6),
 * ```
 * @param level - Date {@link LevelAttribute} to filter on
 * @param offset - Number of levels to skip from the given `anchor` or the default of the current day.
 * Positive numbers skip forwards and negative numbers skip backwards (e.g. `-6` is 6 months backwards when `level` is a months level attribute)
 * @param count - Number of levels to include in the filter (e.g. `6` is 6 months when `level` is a months level attribute)
 * @param anchor - Date to filter from, defaults to the current day
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const dateRelative: (
  level: LevelAttribute,
  offset: number,
  count: number,
  anchor?: Date | string,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (level, offset, count, anchor, config) =>
    new RelativeDateFilter(level, offset, count, undefined, anchor, config),
  'dateRelative',
);

/**
 * Creates a filter to isolate items with a date dimension value within a specified range after a
 * given date and level.
 *
 * @example
 * Filter for items in the Sample ECommerce data model where the date is in 2011 or the first half of 2012.
 * ```ts
 * filterFactory.dateRelativeFrom(DM.Commerce.Date.Months, 0, 18, '2011-01'),
 * ```
 * @param level - Date {@link LevelAttribute} to filter on
 * @param offset - Number of levels to skip from the given `anchor` or the default of the current day (e.g. `6` is 6 months when `level` is a months level attribute)
 * @param count - Number of levels to include in the filter (e.g. `6` is 6 months when `level` is a months level attribute)
 * @param anchor - Date to filter from, defaults to the current day
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const dateRelativeFrom: (
  level: LevelAttribute,
  offset: number,
  count: number,
  anchor?: Date | string,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (level, offset, count, anchor, config) =>
    new RelativeDateFilter(level, offset, count, DateOperators.Next, anchor, config),
  'dateRelativeFrom',
);

/**
 * Creates a filter to isolate items with a date dimension value within a specified range before a
 * given date and level.
 *
 * @example
 * Filter for items in the Sample ECommerce data model where the date is in the first half of 2010 or in 2011.
 * ```ts
 * filterFactory.dateRelativeTo(DM.Commerce.Date.Months, 0, 18, '2011-12'),
 * ```
 * @param level - Date {@link LevelAttribute} to filter on
 * @param offset - Number of levels to skip from the given `anchor` or the default of the current day (e.g. `6` is 6 months when `level` is a months level attribute)
 * @param count - Number of levels to include in the filter (e.g. `6` is 6 months when `level` is a months level attribute)
 * @param anchor - Date to filter to, defaults to the current day
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const dateRelativeTo: (
  level: LevelAttribute,
  offset: number,
  count: number,
  anchor?: Date | string,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (level, offset, count, anchor, config) =>
    new RelativeDateFilter(level, offset, count, DateOperators.Last, anchor, config),
  'dateRelativeTo',
);

/**
 * Creates a filter to isolate items with a date dimension value in the current calendar year.
 *
 * @example
 * Filter for items where the date is in the current calendar year in the Sample ECommerce data model.
 * ```ts
 * filterFactory.thisYear(DM.Commerce.Date)
 * ```
 * @param dimension - Date dimension to filter
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const thisYear: (dimension: DateDimension, config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter(
    (dimension, config) => dateRelativeTo(dimension.Years, 0, 1, undefined, config),
    'thisYear',
  );

/**
 * Creates a filter to isolate items with a date dimension value in the current calendar month.
 *
 * @example
 * Filter for items where the date is in the current calendar month in the Sample ECommerce data model.
 * ```ts
 * filterFactory.thisMonth(DM.Commerce.Date)
 * ```
 * @param dimension - Date dimension to filter
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const thisMonth: (dimension: DateDimension, config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter(
    (dimension, config) => dateRelativeTo(dimension.Months, 0, 1, undefined, config),
    'thisMonth',
  );

/**
 * Creates a filter to isolate items with a date dimension value in the current quarter.
 *
 * @example
 * Filter for items where the date is in the current quarter in the Sample ECommerce data model.
 * ```ts
 * filterFactory.thisQuarter(DM.Commerce.Date)
 * ```
 * @param dimension - Date dimension to filter
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const thisQuarter: (dimension: DateDimension, config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter(
    (dimension, config) => dateRelativeTo(dimension.Quarters, 0, 1, undefined, config),
    'thisQuarter',
  );

/**
 * Creates a filter to isolate items with a date dimension value of the current date.
 *
 * @example
 * Filter for items where the date is today in the Sample ECommerce data model.
 * ```ts
 * filterFactory.today(DM.Commerce.Date)
 * ```
 * @param dimension - date dimension to filter
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const today: (dimension: DateDimension, config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter(
    (dimension, config) => dateRelativeTo(dimension.Days, 0, 1, undefined, config),
    'today',
  );

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
 * @param config - Optional configuration for the filter
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
  config?: BaseFilterConfig,
): Filter {
  return new MeasureFilter(attribute, measure, operatorA, valueA, operatorB, valueB, config);
}

/**
 * Creates a filter to isolate a measure value equal to a given number.
 *
 * @example
 * Filter for categories that have an average revenue equal 50 in the Sample ECommerce data model.
 * ```ts
 * filterFactory.measureEquals(
 *   measureFactory.average(DM.Commerce.Revenue),
 *   50
 * )
 * ```
 * @param measure - Measure to filter by
 * @param value - Value
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const measureEquals: (
  measure: BaseMeasure,
  value: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (measure, value, config) =>
    measureBase(
      measure.attribute,
      measure,
      NumericOperators.Equals,
      value,
      undefined,
      undefined,
      config,
    ),
  'measureEquals',
);

/**
 * Creates a filter to isolate a measure value greater than to a given number.
 *
 * @example
 * Filter for categories that have an average revenue greater than
 * to 50 in the Sample ECommerce data model.
 * ```ts
 * filterFactory.measureGreaterThan(
 *   measureFactory.average(DM.Commerce.Revenue),
 *   50
 * )
 * ```
 * @param measure - Measure to filter by
 * @param value - Min value
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const measureGreaterThan: (
  measure: BaseMeasure,
  value: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (measure, value, config) =>
    measureBase(
      measure.attribute,
      measure,
      NumericOperators.FromNotEqual,
      value,
      undefined,
      undefined,
      config,
    ),
  'measureGreaterThan',
);

/**
 * Creates a filter to isolate a measure value greater than or equal to a given number.
 *
 * @example
 * Filter for categories that have an average revenue greater than
 * or equal to 50 in the Sample ECommerce data model.
 * ```ts
 * filterFactory.measureGreaterThanOrEqual(
 *   measureFactory.average(DM.Commerce.Revenue),
 *   50
 * )
 * ```
 * @param measure - Measure to filter by
 * @param value - Min value
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const measureGreaterThanOrEqual: (
  measure: BaseMeasure,
  value: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (measure, value, config) =>
    measureBase(
      measure.attribute,
      measure,
      NumericOperators.From,
      value,
      undefined,
      undefined,
      config,
    ),
  'measureGreaterThanOrEqual',
);

/**
 * Creates a filter to isolate a measure value less than or equal to a given number.
 *
 * @example
 * Filter for categories that have an average revenue less than
 * or equal to 100 in the Sample ECommerce data model.
 * ```ts
 * filterFactory.measureLessThanOrEqual(
 *   measureFactory.average(DM.Commerce.Revenue),
 *   100
 * )
 * ```
 * @param measure - Measure to filter by
 * @param value - Max value
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const measureLessThanOrEqual: (
  measure: BaseMeasure,
  value: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (measure, value, config) =>
    measureBase(
      measure.attribute,
      measure,
      NumericOperators.To,
      value,
      undefined,
      undefined,
      config,
    ),
  'measureLessThanOrEqual',
);

/**
 * Creates a filter to isolate a measure value less than a given number.
 *
 * @example
 * Filter for categories that have an average revenue less than 100 in the Sample ECommerce data model.
 * ```ts
 * filterFactory.measureLessThan(
 *   measureFactory.average(DM.Commerce.Revenue),
 *   100
 * )
 * ```
 * @param measure - Measure to filter by
 * @param value - Value
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const measureLessThan: (
  measure: BaseMeasure,
  value: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (measure, value, config) =>
    measureBase(
      measure.attribute,
      measure,
      NumericOperators.ToNotEqual,
      value,
      undefined,
      undefined,
      config,
    ),
  'measureLessThan',
);

/**
 * Creates a filter to isolate a measure value between or equal to two given numbers.
 *
 * @example
 * Filter for categories that have an average revenue greater than or equal to 50 and less than
 * or equal to 100 in the Sample ECommerce data model.
 * ```ts
 * filterFactory.measureBetween(
 *   measureFactory.average(DM.Commerce.Revenue),
 *   50,
 *   100
 * )
 * ```
 * @param measure - Measure to filter by
 * @param valueA - Min value
 * @param valueB - Max value
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const measureBetween: (
  measure: BaseMeasure,
  valueA: number,
  valueB: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (measure, valueA, valueB, config) =>
    measureBase(
      measure.attribute,
      measure,
      NumericOperators.From,
      valueA,
      NumericOperators.To,
      valueB,
      config,
    ),
  'measureBetween',
);

/**
 * Creates a filter to isolate a measure value between but not equal to two given numbers.
 *
 * @example
 * Filter for categories that have an average revenue greater than 50 and less than
 * 100 in the Sample ECommerce data model.
 * ```ts
 * filterFactory.measureBetweenNotEqual(
 *   measureFactory.average(DM.Commerce.Revenue),
 *   50,
 *   100
 * )
 * ```
 * @param measure - Measure to filter by
 * @param valueA - Min value
 * @param valueB - Max value
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const measureBetweenNotEqual: (
  measure: BaseMeasure,
  valueA: number,
  valueB: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (measure, valueA, valueB, config) =>
    measureBase(
      measure.attribute,
      measure,
      NumericOperators.FromNotEqual,
      valueA,
      NumericOperators.ToNotEqual,
      valueB,
      config,
    ),
  'measureBetweenNotEqual',
);

// RANKING FILTERS

/**
 * Creates a filter to isolate items that rank towards the top for a given measure.
 *
 * @example
 * Filter for age ranges with the top 3 highest total revenue in the Sample ECommerce data model.
 * ```ts
 * filterFactory.topRanking(
 *   DM.Commerce.AgeRange,
 *   measureFactory.sum(DM.Commerce.Revenue),
 *   3
 * )
 * ```
 * @param attribute - Attribute to filter
 * @param measure - Measure to filter by
 * @param count - Number of members to return
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const topRanking: (
  attribute: Attribute,
  measure: Measure,
  count: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, measure, count, config) =>
    new RankingFilter(attribute, measure, RankingOperators.Top, count, config),
  'topRanking',
);

/**
 * Creates a filter to isolate items that rank towards the bottom for a given measure.
 *
 * @example
 * Filter for age ranges with the bottom 3 lowest total revenue in the Sample ECommerce data model.
 * ```ts
 * filterFactory.bottomRanking(
 *   DM.Commerce.AgeRange,
 *   measureFactory.sum(DM.Commerce.Revenue),
 *   3
 * )
 * ```
 * @param attribute - Attribute to filter
 * @param measure - Measure to filter by
 * @param count - Number of members to return
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const bottomRanking: (
  attribute: Attribute,
  measure: Measure,
  count: number,
  config?: BaseFilterConfig,
) => Filter = withComposeCodeForFilter(
  (attribute, measure, count, config) =>
    new RankingFilter(attribute, measure, RankingOperators.Bottom, count, config),
  'bottomRanking',
);

const relate = (node: FilterRelationsNode): FilterRelationsNode => {
  if (Array.isArray(node)) {
    const [first, ...rest] = node;
    return rest.length === 0
      ? relate(first)
      : {
          operator: 'AND',
          left: relate(first),
          right: relate(rest),
        };
  }
  return node;
};

// CASCADING FILTERS

/**
 * Creates a filter that contains a list of dependent/cascading filters,
 * where each filter depends on the results or state of the previous ones in the array.
 *
 * Each filter in the array operates in the context of its predecessors, and the
 * cascading behavior ensures that all filters are applied sequentially.
 *
 * @example
 * ```ts
 * // Create a cascading filter for gender and age range
 * const cascadingFilter = filterFactory.cascading(
 *   [
 *     filterFactory.members(DM.Commerce.Gender, ['Male', 'Female']),
 *     filterFactory.members(DM.Commerce.AgeRange, ['0-18']),
 *   ],
 *   { disabled: true }, // Optional configuration to disable the cascading filter
 * );
 * ```
 * @param filters - Array of dependent filters
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 */
export const cascading: (filters: Filter[], config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter((filters, config) => new CascadingFilter(filters, config), 'cascading');

/**
 * Set of logic operators for filter relations construction
 *
 * These operators are still in beta.
 *
 * @example
 * ```ts
 * import { filters } from '@sisense/sdk-data';
 *
 * // define filters
 * const revenueFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 1000);
 * const countryFilter = filterFactory.members(DM.Commerce.Country, ['USA', 'Canada']);
 * const genderFilter = filterFactory.doesntContain(DM.Commerce.Gender, 'Unspecified');
 * const costFilter = filterFactory.between(DM.Commerce.Cost, 1000, 2000);
 *
 * // create filter relations of two filters
 * const orFilerRelations = filterFactory.logic.or(revenueFilter, countryFilter);
 * // revenueFilter OR countryFilter
 *
 * // filter relations can have nested filter relations
 * const mixedFilterRelations = filterFactory.logic.and(genderFilter, orFilerRelations);
 * // genderFilter AND (revenueFilter OR countryFilter)
 *
 * // array, specified in filter relations, will be converted to an intersection of filters automatically
 * const arrayFilterRelations = filterFactory.logic.or([genderFilter, costFilter], mixedFilterRelations);
 * // (genderFilter AND costFilter) OR (genderFilter AND (revenueFilter OR countryFilter))
 * ```
 * @beta
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace logic {
  /**
   * Creates an 'AND' filter relations
   *
   * @example
   * Create filter relations for items that have a revenue greater than 100 and are in new condition
   * in the Sample ECommerce data model.
   * ```ts
   * const revenueFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 100);
   * const conditionFilter = filterFactory.equals(DM.Commerce.Condition, 'New');
   *
   * const andFilerRelation = filterFactory.logic.and(revenueFilter, conditionFilter);
   * ```
   * @param left First filter or filter relations
   * @param right Second filter or filter relations
   * @returns Filter relations
   * @beta
   */
  export const and: (left: FilterRelationsNode, right: FilterRelationsNode) => FilterRelations =
    withComposeCodeForFilterRelations(
      (left, right) => ({
        operator: 'AND',
        left: relate(left),
        right: relate(right),
      }),
      'and',
    );

  /**
   * Creates an 'OR' filter relations
   *
   * @example
   * Create filter relations for items that have a revenue greater than 100 or are in new condition
   * in the Sample ECommerce data model.
   * ```ts
   * const revenueFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 100);
   * const conditionFilter = filterFactory.equals(DM.Commerce.Condition, 'New');
   *
   * const orFilerRelation = filterFactory.logic.or(revenueFilter, conditionFilter);
   * ```
   * @param left First filter or filter relations
   * @param right Second filter or filter relations
   * @returns Filter relations
   * @beta
   */
  export const or: (left: FilterRelationsNode, right: FilterRelationsNode) => FilterRelations =
    withComposeCodeForFilterRelations(
      (left, right) => ({
        operator: 'OR',
        left: relate(left),
        right: relate(right),
      }),
      'or',
    );
}

// CUSTOM FILTER

/**
 * Creates a filter from JAQL
 *
 * @param attribute - Attribute to filter
 * @param jaql - Filter Jaql
 * @param config - Optional configuration for the filter
 * @returns A filter instance
 * @internal
 */
export const customFilter: (attribute: Attribute, jaql: any, config?: BaseFilterConfig) => Filter =
  withComposeCodeForFilter(
    (attribute, jaql, config) => new CustomFilter(attribute, jaql, config),
    'customFilter',
  );
