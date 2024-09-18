/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import {
  Attribute,
  Measure,
  MeasureTemplate,
  Filter,
  MeasureContext,
  CalculatedMeasure,
  BaseMeasure,
  CustomFormulaContext,
} from '../interfaces.js';
import { DimensionalBaseMeasure, DimensionalCalculatedMeasure } from './measures.js';

import { AggregationTypes, FormulaContext, FormulaJaql, MetadataTypes } from '../types.js';
import { normalizeName } from '../base.js';
import { ForecastFormulaOptions, TrendFormulaOptions } from '../../interfaces.js';
import mapValues from 'lodash-es/mapValues.js';
import { DimensionalAttribute, DimensionalLevelAttribute } from '../attributes.js';
import { isDatetime, isNumber } from './../simple-column-types.js';
import { convertSort, createFilterFromJaql } from '../../utils.js';

/**
 * Defines the different numeric operators that can be used with numeric filters
 *
 * @internal
 */
export const RankingTypes = {
  /**
   * In competition ranking, items that rank equally receive the same ranking number, and then a gap is left after the equally ranked items in the ranking numbers.
   */
  StandardCompetition: '1224',

  /**
   * In modified competition ranking, items that rank equally receive the same ranking number, and a gap is left before the equally ranked items in the ranking numbers.
   */
  ModifiedCompetition: '1334',

  /**
   * In dense ranking, items that rank equally receive the same ranking number, and the next items receive the immediately following ranking number.
   */
  Dense: '1223',

  /**
   * In ordinal ranking, all items receive distinct ordinal numbers, including items that rank equally. The assignment of distinct ordinal numbers for equal-ranking items is arbitrary.
   */
  Ordinal: '1234',
};

/**
 * Defines the different ranking sorting types supported by rank measure
 *
 * @internal
 */
export const RankingSortTypes = {
  Ascending: 'ASC',
  Descending: 'DESC',
};

function addToFormula(builder: string[], context: MeasureContext, o: any) {
  if (typeof o === 'number') {
    builder.push(o.toString());
  } else if (o && MetadataTypes.isMeasureTemplate(o.type)) {
    // default to sum
    o = (<MeasureTemplate>o).sum();

    const name = `[${normalizeName((<Measure>o).name)}]`;
    builder.push(name);
    context[name] = o;
  } else if (o && MetadataTypes.isMeasure(o.type)) {
    const name = `[${normalizeName((<Measure>o).name)}]`;
    builder.push(name);
    context[name] = o;
  } else if (o && MetadataTypes.isFilter(o.type)) {
    const name = `[${normalizeName((<Filter>o).name)}]`;
    builder.push(name);
    context[name] = o;
  } else if (o && MetadataTypes.isAttribute(o.type)) {
    const name = `[${normalizeName((<Attribute>o).name)}]`;
    builder.push(name);
    context[name] = o;
  }
}

function measureFunction(
  measure: Measure,
  name: string,
  func: string,
  options?: string,
): DimensionalCalculatedMeasure {
  const context = <MeasureContext>{};

  const builder = [func + '('];
  addToFormula(builder, context, measure);
  if (options) {
    builder.push(`, ${options}`);
  }
  builder.push(')');

  return new DimensionalCalculatedMeasure(name, builder.join(''), context);
}

type CustomFormulaJaql =
  | (FormulaJaql & { context?: FormulaJaql | FormulaContext })
  | FormulaContext;

function transformFormulaJaqlHelper(jaql: CustomFormulaJaql) {
  const isFormulaJaql = 'formula' in jaql;

  if (isFormulaJaql) {
    return transformCustomFormulaJaql(jaql);
  }

  const sort = convertSort(jaql.sort);
  const hasAggregation = !!jaql.agg;
  const isDatatypeDatetime = isDatetime(jaql.datatype);
  const attributeType = isNumber(jaql.datatype)
    ? MetadataTypes.NumericAttribute
    : MetadataTypes.TextAttribute;
  const attribute = isDatatypeDatetime
    ? new DimensionalLevelAttribute(
        jaql.title,
        jaql.dim,
        DimensionalLevelAttribute.translateJaqlToGranularity(jaql),
        undefined,
        undefined,
        sort,
      )
    : new DimensionalAttribute(jaql.title, jaql.dim, attributeType, undefined, sort);

  if (hasAggregation) {
    return new DimensionalBaseMeasure(
      jaql.title,
      attribute,
      DimensionalBaseMeasure.aggregationFromJAQL(jaql.agg || ''),
      undefined,
      undefined,
      sort,
    );
  }

  if ('filter' in jaql) {
    return createFilterFromJaql(jaql);
  }

  return attribute;
}

/**
 * Transforms a custom formula jaql into a calculated measure instance.
 *
 * As custom formulas can be nested, the function performs a recursive transformation via a helper function.
 *
 * @param jaql - Custom formula jaql
 * @returns Calculated measure instance
 */
function transformCustomFormulaJaql(jaql: CustomFormulaJaql): CalculatedMeasure {
  const isFormulaJaql = 'formula' in jaql;

  if (!isFormulaJaql) {
    throw new Error('Jaql is not a formula');
  }

  const sort = convertSort(jaql.sort);
  const context: MeasureContext = mapValues(jaql.context ?? {}, (jaqlContextValue) =>
    jaqlContextValue ? transformFormulaJaqlHelper(jaqlContextValue) : {},
  );

  return new DimensionalCalculatedMeasure(
    jaql.title,
    jaql.formula,
    context,
    undefined,
    undefined,
    sort,
  );
}

/**
 * Creates a calculated measure for a valid custom formula built from [base functions](/guides/sdk/reference/functions.html#measured-value-functions).
 *
 * Use square brackets (`[]`) within the `formula` property to include dimensions, measures, or filters.
 * Each unique dimension, measure, or filter included in the `formula` must be defined using a property:value pair in the `context` parameter.
 *
 * You can nest custom formulas by placing one inside the `formula` parameter of another.
 *
 * Note: To use [shared formulas](https://docs.sisense.com/main/SisenseLinux/shared-formulas.htm)
 * from a Fusion instance, you must fetch them first using {@link @sisense/sdk-ui!useGetSharedFormula | useGetSharedFormula}.
 *
 * @example
 * An example of constructing a custom formulas using dimensions, measures, and nested custom formulas
 * from the Sample Ecommerce data model.
 * ```ts
 * // Custom formula
 * const profitabilityRatio = measureFactory.customFormula(
 *   'Profitability Ratio',
 *   '([totalRevenue] - SUM([cost])) / [totalRevenue]',
 *   {
 *     totalRevenue: measureFactory.sum(DM.Commerce.Revenue),
 *     cost: DM.Commerce.Cost,
 *   },
 * );
 *
 * // Nested custom formula
 * const profitabilityRatioRank = measureFactory.customFormula(
 *   'Profitability Ratio Rank',
 *   'RANK([profRatio], "ASC", "1224")',
 *   {
 *     profRatio: profitabilityRatio,
 *   },
 * );
 * ```
 *
 * Another example of constructing a custom formula using measures and filters
 * ```ts
 * const totalCostWithFilter = measureFactory.customFormula(
 *   'Total Cost with Filter',
 *   '(SUM([cost]), [categoryFilter])',
 *   {
 *     cost: DM.Commerce.Cost,
 *     categoryFilter: filterFactory.members(DM.Category.Category, ['Apple Mac Desktops']),
 *   },
 * );
 * ```
 *
 * @param title - Title of the measure to be displayed in legend
 * @param formula - Formula to be used for the measure
 * @param context - Formula context as a map of strings to attributes, measures, or filters
 * @returns A calculated measure instance
 * @group Advanced Analytics
 */
export function customFormula(
  title: string,
  formula: string,
  context: CustomFormulaContext,
): CalculatedMeasure {
  const newContext = Object.entries(context).reduce((acc, [key, val]) => {
    acc[`[${key}]`] = val.jaql().jaql;
    return acc;
  }, {});
  return transformCustomFormulaJaql({ title, formula, context: newContext });
}

function arithmetic(
  operand1: Measure | number,
  operator: string,
  operand2: Measure | number,
  name?: string,
  withParentheses?: boolean,
): CalculatedMeasure {
  const builder = [];
  const context = <MeasureContext>{};

  if (withParentheses === true) {
    builder.push('(');
  }

  addToFormula(builder, context, operand1);
  builder.push(operator);
  addToFormula(builder, context, operand2);

  if (withParentheses === true) {
    builder.push(')');
  }

  const exp = builder.join('');

  return new DimensionalCalculatedMeasure(name ?? exp, exp, context);
}

/**
 * Creates an aggregated measure.
 *
 * This is a base function to build other aggregation functions (e.g., `sum`, `average`, etc.)
 * as listed in {@link AggregationTypes}.
 *
 * @example
 * Calculate the total cost across all items in a category from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.aggregate(DM.Commerce.Cost, 'sum'),
 * ```
 * @param attribute - Attribute to aggregate
 * @param aggregationType - Aggregation type. See {@link AggregationTypes}
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply using a Numeral.js format string. Can only be used for explicit queries. Cannot be used in charts, tables, etc.
 * @returns A measure instance
 * @group Aggregation
 */
export function aggregate(
  attribute: Attribute,
  aggregationType: string,
  name?: string,
  format?: string,
): BaseMeasure {
  return new DimensionalBaseMeasure(
    name ?? `${aggregationType.toString()} ${attribute.name}`,
    attribute,
    aggregationType,
    format,
  );
}

/**
 * Creates a calculated measure from a numeric value.
 *
 * @example
 * Creates a calculated measure from a numeric value.
 * ```ts
 * measureFactory.constant(42)
 * ```
 * @param value - Value to be returned as a measure
 * @returns A calculated measure instance
 * @group Arithmetic
 */
export function constant(value: number): CalculatedMeasure {
  return new DimensionalCalculatedMeasure(`${value}`, `${value}`, {});
}

/**
 * Creates a sum aggregation measure over the given attribute.
 *
 * To create a running sum, use {@link runningSum}.
 *
 * @example
 * Calculate the total cost across all items in a category from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.sum(DM.Commerce.Cost)
 * ```
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply using a Numeral.js format string. Can only be used for explicit queries. Cannot be used in charts, tables, etc.
 * @returns A measure instance
 * @group Aggregation
 */
export function sum(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.Sum, name, format);
}

/**
 * Creates an average aggregation measure over the given attribute.
 *
 * Both `average()` and `avg()` can be used interchangeably.
 *
 * @example
 * Calculate the average cost across all items in a category from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.average(DM.Commerce.Cost)
 * ```
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply using a Numeral.js format string. Can only be used for explicit queries. Cannot be used in charts, tables, etc.
 * @returns A measure instance
 * @group Aggregation
 */
export function average(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.Average, name, format);
}

/**
 * {@inheritDoc average}
 *
 * @example
 * Calculate the average cost across all items in a category from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.avg(DM.Commerce.Cost)
 * ```
 * @group Aggregation
 */
export function avg(attribute: Attribute, name?: string, format?: string) {
  return average(attribute, name, format);
}

/**
 * Creates a min aggregation measure over the given attribute.
 *
 * @example
 * Calculate the minimum cost across all items in a category from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.min(DM.Commerce.Cost)
 * ```
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply using a Numeral.js format string. Can only be used for explicit queries. Cannot be used in charts, tables, etc.
 * @returns A measure instance
 * @group Aggregation
 */
export function min(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.Min, name, format);
}

/**
 * Creates a max aggregation measure over the given attribute.
 *
 * @example
 * Calculate the maximum cost across all items in a category from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.max(DM.Commerce.Cost)
 * ```
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply using a Numeral.js format string. Can only be used for explicit queries. Cannot be used in charts, tables, etc.
 * @returns A measure instance
 * @group Aggregation
 */
export function max(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.Max, name, format);
}

/**
 * Creates a median aggregation measure over the given attribute.
 *
 * @example
 * Calculate the median cost across all items in a category from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.median(DM.Commerce.Cost)
 * ```
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply using a Numeral.js format string. Can only be used for explicit queries. Cannot be used in charts, tables, etc.
 * @returns A measure instance
 * @group Aggregation
 */
export function median(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.Median, name, format);
}

/**
 * Creates a count aggregation measure over the given attribute.
 *
 * To count distinct values in the given attribute, use {@link countDistinct}.
 *
 * @example
 * Counts the number of Commerce items from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.count(DM.Commerce.BrandID)
 * ```
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply using a Numeral.js format string. Can only be used for explicit queries. Cannot be used in charts, tables, etc.
 * @returns A measure instance
 * @group Aggregation
 */
export function count(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.Count, name, format);
}
/**
 * Creates a count distinct aggregation measure over the given attribute.
 *
 * To count all values in the given attribute, use {@link count}.
 *
 * @example
 * Calculate the number of distinct brands from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.countDistinct(DM.Brand.BrandID)
 * ```
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply using a Numeral.js format string. Can only be used for explicit queries. Cannot be used in charts, tables, etc.
 * @returns A measure instance
 * @group Aggregation
 */
export function countDistinct(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.CountDistinct, name, format);
}

/**
 * Creates a measured value with the given measure and set of filters.
 *
 * A measured value only includes values from items that match the provided filters.
 *
 * For example you can use a measured value to get a total cost for all items where the cost is greater than 100.
 *
 * Note that the filters on the measured value override the filters on the query, chart, or table the
 * measured value is used in.
 *
 * @example
 * Calculate the total cost across all items in a category from the Sample Ecommerce data model,
 * where the cost is greater than 100. Additional filtering on the cost will not affect this measure.
 * ```ts
 * measureFactory.measuredValue(
 *   measureFactory.sum(DM.Commerce.Cost),
 *   [filterFactory.greaterThan(DM.Commerce.Cost, 100)],
 *   'Cost Greater Than 100'
 * ),
 * ```
 * @param measure - Measure to filter
 * @param filters - Filters to apply to the measure
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply using a Numeral.js format string. Can only be used for explicit queries. Cannot be used in charts, tables, etc.
 * @returns A calculated measure instance
 * @group Advanced Analytics
 */
export function measuredValue(
  measure: Measure,
  filters: Filter[],
  name?: string,
  format?: string,
): CalculatedMeasure {
  const builder: string[] = [];
  const context: MeasureContext = <MeasureContext>{};

  builder.push('(');

  addToFormula(builder, context, measure);

  filters.forEach((f) => {
    builder.push(',');

    addToFormula(builder, context, f);
  });

  builder.push(')');

  const exp = builder.join('');

  return new DimensionalCalculatedMeasure(name ?? exp, exp, context, format);
}

/**
 * Creates a calculated measure by adding two given numbers or measures.
 *
 * @example
 * ```ts
 * const measure1 = measureFactory.sum(DM.Dimension.Attribute1);
 * const measure2 = measureFactory.sum(DM.Dimension.Attribute2);
 * const measureSum = measureFactory.add(measure1, measure2);
 * ```
 * @param value1 - First value
 * @param value2 - Second value
 * @param name - Optional name for the new measure
 * @param withParentheses - Optional boolean flag whether to wrap the arithmetic operation with parentheses
 * @returns A calculated measure instance
 * @group Arithmetic
 */
export function add(
  value1: Measure | number,
  value2: Measure | number,
  name?: string,
  withParentheses?: boolean,
): CalculatedMeasure {
  return arithmetic(value1, '+', value2, name, withParentheses);
}

/**
 * Creates a calculated measure by subtracting two given numbers or measures. Subtracts `value2` from `value1`.
 *
 * @example
 * ```ts
 * const measure1 = measureFactory.sum(DM.Dimension.Attribute1);
 * const measure2 = measureFactory.sum(DM.Dimension.Attribute2);
 * const measureDifference = measureFactory.subtract(measure1, measure2);
 * ```
 * @param value1 - First value
 * @param value2 - Second value
 * @param name - Optional name for the new measure
 * @param withParentheses - Optional boolean flag whether to wrap the arithmetic operation with parentheses
 * @returns A calculated measure instance
 * @group Arithmetic
 */
export function subtract(
  value1: Measure | number,
  value2: Measure | number,
  name?: string,
  withParentheses?: boolean,
): CalculatedMeasure {
  return arithmetic(value1, '-', value2, name, withParentheses);
}

/**
 * Creates a calculated measure by multiplying two given numbers or measures.
 *
 * @example
 * ```ts
 * const measure1 = measureFactory.sum(DM.Dimension.Attribute1);
 * const measure2 = measureFactory.sum(DM.Dimension.Attribute2);
 * const measureProduct = measureFactory.multiply(measure1, measure2);
 * ```
 * @param value1 - First value
 * @param value2 - Second value
 * @param name - Optional name for the new measure
 * @param withParentheses - Optional boolean flag whether to wrap the arithmetic operation with parentheses
 * @returns A calculated measure instance
 * @group Arithmetic
 */
export function multiply(
  value1: Measure | number,
  value2: Measure | number,
  name?: string,
  withParentheses?: boolean,
): CalculatedMeasure {
  return arithmetic(value1, '*', value2, name, withParentheses);
}

/**
 * Creates a calculated measure by dividing two given numbers or measures. Divides `value1` by `value2`.
 *
 * @example
 * ```ts
 * const measure1 = measureFactory.sum(DM.Dimension.Attribute1);
 * const measure2 = measureFactory.sum(DM.Dimension.Attribute2);
 * const measureQuotient = measureFactory.divide(measure1, measure2);
 * ```
 * @param value1 - First value
 * @param value2 - Second value
 * @param name - Optional name for the new measure
 * @param withParentheses - Optional boolean flag whether to wrap the arithmetic operation with parentheses
 * @returns A calculated measure instance
 * @group Arithmetic
 */
export function divide(
  value1: Measure | number,
  value2: Measure | number,
  name?: string,
  withParentheses?: boolean,
): CalculatedMeasure {
  return arithmetic(value1, '/', value2, name, withParentheses);
}

/**
 * Creates a calculated measure that calculates the running total starting from the beginning
 * of the year up to the current day, week, month, or quarter.
 *
 * The time resolution is determined by the minimum date level of the date dimension in the query
 * that uses the returned measure.
 *
 * @example
 * Calculate the running total of total cost from the Sample Ecommerce data model, starting from the
 * beginning of the year up to the current day, week, month, or quarter.
 * ```ts
 * measureFactory.yearToDateSum(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply the YTD Sum to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function yearToDateSum(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? 'YTD ' + measure.name, 'YTDSum');
}

/**
 * Creates a calculated measure that calculates the running total starting from the beginning
 * of the quarter up to the current day, week, or month.
 *
 * The time resolution is determined by the minimum date level of the date dimension in the query
 * that uses the returned measure.
 *
 * @example
 * Calculate the running total of total cost from the Sample Ecommerce data model, starting from the
 * beginning of the quarter up to the current day, week, or month.
 * ```ts
 * measureFactory.quarterToDateSum(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply the QTD Sum to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function quarterToDateSum(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? 'QTD ' + name, 'QTDSum');
}

/**
 * Creates a calculated measure that calculates the running total starting from the beginning
 * of the month up to the current day or week.
 *
 * The time resolution is determined by the minimum date level of the date dimension in the query
 * that uses the returned measure.
 *
 * @example
 * Calculate the running total of total cost from the Sample Ecommerce data model, starting from the
 * beginning of the month up to the current day or week.
 * ```ts
 * measureFactory.monthToDateSum(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply the MTD Sum to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function monthToDateSum(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? 'MTD ' + measure.name, 'MTDSum');
}

/**
 * Creates a calculated measure that calculates the running total starting from the beginning
 * of the week up to the current day.
 *
 * The time resolution is determined by the minimum date level of the date dimension in the query
 * that uses the returned measure.
 *
 * @example
 * Calculate the running total of total cost from the Sample Ecommerce data model, starting from the
 * beginning of the week up to the current day.
 * ```ts
 * measureFactory.weekToDateSum(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply the WTD Sum to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function weekToDateSum(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? 'MTD ' + measure.name, 'WTDSum');
}

/**
 * Creates a calculated measure that calculates the running total of a given measure.
 *
 * The running sum is calculated using the current sort order of the query it's used in.
 *
 * @example
 * Calculate the running sum of the total cost from the Sample Ecommerce data model across all categories.
 * ```ts
 * measureFactory.runningSum(measureFactory.sum(DM.Commerce.Cost)),
 * ```
 *
 * Running sum values from the Sample Ecommerce data model when categorizing by age range.
 * | AgeRange | Cost | Running Cost |
 * | --- | --- | --- |
 * | 0-18 | 4.32M | 4.32M |
 * | 19-24 | 8.66M | 12.98M |
 * | 25-34 | 21.19M | 34.16M |
 * | 35-44 | 23.64M | 57.8M |
 * | 45-54 | 20.39M | 78.19M |
 * | 55-64 | 11.82M | 90.01M |
 * | 65+ | 17.26M | 107.27M |
 * @param measure - Measure to apply the running sum to
 * @param _continuous - Boolean flag whether to accumulate the sum continuously
 * when there are two or more dimensions. The default value is false.
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Statistics
 */
export function runningSum(
  measure: Measure,
  _continuous?: boolean,
  name?: string,
): CalculatedMeasure {
  return measureFunction(measure, name ?? 'Running Sum ' + measure.name, 'RSum');
}

/**
 * Creates a calculated measure that calculates growth over a period of time.
 *
 * The time resolution is determined by the minimum date level of the date dimension in the query
 * that uses the returned measure.
 *
 * Growth is calculated using the following formula: `(currentPeriod – previousPeriod) / previousPeriod`.
 *
 * For example, if this period the value is 12 and the previous period's value was 10, the growth for
 * this period is 20%, returned as '0.2' (calculation: `(12 – 10) / 10 = 0.2`).
 *
 * If the previous period's value is greater than the current period, the growth will be negative.
 *
 * For example, if this period the value is 80, and the previous period's was 100, the growth for
 * this period is -20%, returned as `-0.2` (calculation: `(80 – 100) / 100 = -0.2`).
 *
 * @example
 * Calculate the growth in total cost this period in comparison to the previous period from the
 * Sample Ecommerce data model.
 * ```ts
 * measureFactory.growth(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply growth to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Statistics
 */
export function growth(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Growth', 'growth');
}

/**
 * Creates a calculated measure that calculates growth rate over a period of time.
 *
 * The time resolution is determined by the minimum date level of the date dimension in the query
 * that uses the returned measure.
 *
 * Growth rate is calculated using the following formula: `currentPeriod / previousPeriod`.
 *
 * For example, if this period the value is 12 and the previous period's value was 10, the growth rate for
 * this period is 120%, returned as '1.2' (calculation: `12 / 10 = 1.2`).
 *
 * If the previous period's value is greater than the current period, the growth rate will be less than one.
 *
 * For example, if this period the value is 80, and the previous period's was 100, the growth for
 * this period is 80%, returned as `0.8` (calculation: `80 / 100 = .8`).
 *
 * @example
 * Calculate the growth rate in total cost this period in comparison to the previous period from the
 * Sample Ecommerce data model.
 * ```ts
 * measureFactory.growthRate(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply the Growth rate
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Statistics
 */
export function growthRate(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Growth', 'growthrate');
}

/**
 * Creates a calculated measure that calculates the growth from the previous week to the current week.
 *
 * The date dimension will be dynamically taken from the query that uses the returned measure.
 *
 * Growth is calculated using the following formula: `(currentWeek – previousWeek) / previousWeek`.
 *
 * For example, if this week the value is 12 and the previous week's value was 10, the growth for
 * this week is 20%, returned as '0.2' (calculation: `(12 – 10) / 10 = 0.2`).
 *
 * If the previous week's value is greater than the current week, the growth will be negative.
 *
 * For example, if this week the value is 80, and the previous week's was 100, the growth for
 * this week is -20%, returned as `-0.2` (calculation: `(80 – 100) / 100 = -0.2`).
 *
 * @example
 * Calculate the growth in total cost this week in comparison to the previous week from the Sample
 * Ecommerce data model.
 * ```ts
 * measureFactory.growthPastWeek(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply growth to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Statistics
 */
export function growthPastWeek(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Growth', 'growthpastweek');
}

/**
 * Creates a calculated measure that calculates the growth from the previous month to the current month.
 *
 * The date dimension will be dynamically taken from the query that uses the returned measure.
 *
 * Growth is calculated using the following formula: `(currentMonth – previousMonth) / previousMonth`.
 *
 * For example, if this month the value is 12 and the previous month's value was 10, the growth for
 * this month is 20%, returned as '0.2' (calculation: `(12 – 10) / 10 = 0.2`).
 *
 * If the previous month's value is greater than the current month, the growth will be negative.
 *
 * For example, if this month the value is 80, and the previous month's was 100, the growth for
 * this month is -20%, returned as `-0.2` (calculation: `(80 – 100) / 100 = -0.2`).
 *
 * @example
 * Calculate the growth in total cost this month in comparison to the previous month from the Sample
 * Ecommerce data model.
 * ```ts
 * measureFactory.growthPastMonth(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply growth to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Statistics
 */
export function growthPastMonth(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Growth', 'growthpastmonth');
}

/**
 * Creates a calculated measure that calculates the growth from the previous quarter to the current quarter.
 *
 * The date dimension will be dynamically taken from the query that uses the returned measure.
 *
 * Growth is calculated using the following formula: `(currentQuarter – previousQuarter) / previousQuarter`.
 *
 * For example, if this quarter the value is 12 and the previous quarter's value was 10, the growth for
 * this quarter is 20%, returned as '0.2' (calculation: `(12 – 10) / 10 = 0.2`).
 *
 * If the previous quarter's value is greater than the current quarter, the growth will be negative.
 *
 * For example, if this quarter the value is 80, and the previous quarter's was 100, the growth for
 * this quarter is -20%, returned as `-0.2` (calculation: `(80 – 100) / 100 = -0.2`).
 *
 * @example
 * Calculate the growth in total cost this quarter in comparison to the previous quarter from the
 * Sample Ecommerce data model.
 * ```ts
 * measureFactory.growthPastQuarter(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply growth to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Statistics
 */
export function growthPastQuarter(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Growth', 'growthpastquarter');
}

/**
 * Creates a calculated measure that calculates the growth from the previous year to the current year.
 *
 * The date dimension will be dynamically taken from the query that uses the returned measure.
 *
 * Growth is calculated using the following formula: `(currentYear – previousYear) / previousYear`.
 *
 * For example, if this year the value is 12 and the previous year's value was 10, the growth for
 * this year is 20%, returned as '0.2' (calculation: `(12 – 10) / 10 = 0.2`).
 *
 * If the previous year's value is greater than the current year, the growth will be negative.
 *
 * For example, if this year the value is 80, and the previous year's was 100, the growth for
 * this year is -20%, returned as `-0.2` (calculation: `(80 – 100) / 100 = -0.2`).
 *
 * @example
 * Calculate the growth in total cost this year in comparison to the previous year from the Sample
 * Ecommerce data model.
 * ```ts
 * measureFactory.growthPastYear(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply growth to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Statistics
 */
export function growthPastYear(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Growth', 'growthpastyear');
}

/**
 * Creates a calculated measure that calculates the difference between this period's data
 * and the data from the previous period for the given measure.
 *
 * The time resolution is determined by the minimum date level of the date dimension in the query
 * that uses the returned measure.
 *
 * @example
 * Calculate the difference between this period's total cost and the previous period's total cost
 * from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.difference(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply difference to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function difference(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Difference', 'diffpastperiod');
}

/**
 * Creates a calculated measure that calculates the difference between this week's data
 * and the data from the previous week for the given measure.
 *
 * The date dimension will be dynamically taken from the query that uses the returned measure.
 *
 * @example
 * Calculate the difference between this week's total cost and the previous week's total cost from
 * the Sample Ecommerce data model.
 * ```ts
 * measureFactory.diffPastWeek(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply difference to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function diffPastWeek(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Difference', 'diffpastweek');
}

/**
 * Creates a calculated measure that calculates the difference between this month's data
 * and the data from the previous month for the given measure.
 *
 * The date dimension will be dynamically taken from the query that uses the returned measure.
 *
 * @example
 * Calculate the difference between this month's total cost and the previous month's total cost from
 * the Sample Ecommerce data model.
 * ```ts
 * measureFactory.diffPastMonth(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply difference to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function diffPastMonth(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Difference', 'diffpastmonth');
}

/**
 * Creates a calculated measure that calculates the difference between this quarter's data
 * and the data from the previous quarter for the given measure.
 *
 * The date dimension will be dynamically taken from the query that uses the returned measure.
 *
 * @example
 * Calculate the difference between this quarter's total cost and the previous quarter's total cost
 * from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.diffPastQuarter(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply difference to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function diffPastQuarter(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Difference', 'diffpastquarter');
}

/**
 * Creates a calculated measure that calculates the difference between this year's data
 * and the data from the previous year for the given measure.
 *
 * The date dimension will be dynamically taken from the query that uses the returned measure.
 *
 * @example
 * Calculate the difference between this year's total cost and the previous year's total cost from
 * the Sample Ecommerce data model.
 * ```ts
 * measureFactory.diffPastYear(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply difference to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function diffPastYear(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Difference', 'diffpastyear');
}

/**
 * Creates a calculated measure that calculates the value for the previous day.
 *
 * @example
 * Calculate total cost for the previous day from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.pastDay(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply past value to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function pastDay(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Past Day', 'pastday');
}

/**
 * Creates a calculated measure that calculates the value for the same day in the previous week.
 *
 * The time resolution is determined by the minimum date level of the date dimension in the query
 * that uses the returned measure.
 *
 * @example
 * Calculate total cost for the corresponding day one week ago from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.pastWeek(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply past value to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function pastWeek(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Past Week', 'pastweek');
}

/**
 * Creates a calculated measure that calculates the value for the same day or week in the previous month.
 *
 * The time resolution is determined by the minimum date level of the date dimension in the query
 * that uses the returned measure.
 *
 * @example
 * Calculate total cost for the corresponding day or week one month ago from the Sample Ecommerce
 * data model.
 * ```ts
 * measureFactory.pastMonth(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply past value to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function pastMonth(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Past Month', 'pastmonth');
}

/**
 * Creates a calculated measure that calculates the value for the same day, week, or month in the previous quarter.
 *
 * The time resolution is determined by the minimum date level of the date dimension in the query
 * that uses the returned measure.
 *
 * @example
 * Calculate total cost for the corresponding day, week, or month one quarter ago from the Sample
 * Ecommerce data model.
 * ```ts
 * measureFactory.pastQuarter(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply past value to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function pastQuarter(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Past Quarter', 'pastquarter');
}

/**
 * Creates a calculated measure that calculates the value for the same day, week, month, or quarter in the previous year.
 *
 * The time resolution is determined by the minimum date level of the date dimension in the query
 * that uses the returned measure.
 *
 * @example
 * Calculate total cost for the corresponding day, week, month, or quarter one year ago from the
 * Sample Ecommerce data model.
 * ```ts
 * measureFactory.pastYear(measureFactory.sum(DM.Commerce.Cost))
 * ```
 * @param measure - Measure to apply past value to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Time-based
 */
export function pastYear(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Past Year', 'pastyear');
}

/**
 * Creates a calculated contribution measure.
 *
 * A contribution measure calculates the contribution, in percentage, of a measure towards the total.
 * Percentages are expressed as a number between 0 and 1 (e.g. 42% is `0.42`).
 *
 * For example, using the Sample Ecommerce data model you can retrieve the total cost of products
 * categorized by age range. Using a contribution measure you can calculate how much each age range's
 * total cost contributes to the total cost across all age ranges. So, the total cost for the 35-44
 * age range is 23.64M, which is 22% of the 107.27M of all age ranges together. Therefore, the
 * contribution of the 35-44 age range is `.22`.
 *
 * @example
 * Calculates the percentage of the total cost across all categories for items in a category from the
 * Sample Ecommerce data model.
 * ```ts
 * measureFactory.contribution(measureFactory.sum(DM.Commerce.Cost))
 * ```
 *
 * Contribution values from the Sample Ecommerce data model when categorizing by age range.
 * | AgeRange | Cost | Contribution |
 * | --- | --- | --- |
 * | 0-18 | 4.32M | 0.04 |
 * | 19-24 | 8.66M | 0.08 |
 * | 25-34 | 21.19M | 0.2 |
 * | 35-44 | 23.64M | 0.22 |
 * | 45-54 | 20.39M | 0.19 |
 * | 55-64 | 11.82M | 0.11 |
 * | 65+ | 17.26M | 0.16 |
 * @param measure - Measure to apply the Contribution logic to
 * @param name - Name for the new measure
 * @returns A calculated measure instance
 * @group Statistics
 */
export function contribution(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + ' Contribution', 'contribution');
}

/**
 * Creates a calculated measure that computes a specified trend type for a given measure.
 *
 * The trend types include linear (the default), logarithmic, advanced smoothing, and local estimates.
 * You can also opt to automatically identify and ignore anomalous values in the series.
 *
 * Trend requires a Sisense instance version of L2023.6.0 or greater.
 *
 * @example
 * Calculate the trend in total cost from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.trend(
 *   measureFactory.sum(DM.Commerce.Cost),
 *   'Total Cost Trend',
 *   {
 *     modelType: 'advancedSmoothing',
 *     ignoreAnomalies: true,
 *   }
 * )
 * ```
 * @param measure - Measure to apply the trend logic to
 * @param name - Name for the new measure
 * @param options - Trend options
 * @returns A calculated measure instance
 * @group Advanced Analytics
 */
export function trend(
  measure: Measure,
  name?: string,
  options?: TrendFormulaOptions,
): CalculatedMeasure {
  let params: string | undefined;
  const adjustValues = (value: string) =>
    value.replace('advancedSmoothing', 'smooth').replace('localEstimates', 'local');
  if (options) {
    // make a comma separated name=value string based on options
    params = Object.entries(options)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      .map((e) => adjustValues(`"${e[0]}=${e[1]}"`))
      .join(',');
  }
  return measureFunction(measure, name ?? measure.name + ' Trend', 'trend', params);
}

/**
 * Creates a calculated measure that generates a forecast based on a specified measure employing
 * advanced autoML techniques.
 *
 * This function offers flexible options allowing you to:
 * + Let the function auto-select the best statistical model or explicitly choose a preferred model
 * + Control the time period used for training the model
 * + Set additional options to improve forecast accuracy by supplying expected lower and upper limits.
 *
 * In addition to the forecast, upper and lower confidence intervals are returned
 * with the name of the new measure and a suffix of _upper and _lower
 * respectively.
 *
 * Forecast requires a Sisense instance version of L2023.6.0 or greater.
 *
 * @example
 * Calculate a forecast for total cost from the Sample Ecommerce data model from the Sample
 * Ecommerce data model.
 * ```ts
 * measureFactory.forecast(
 *   measureFactory.sum(DM.Commerce.Cost),
 *   'Total Cost Forecast',
 *   {
 *     modelType: 'prophet',
 *     roundToInt: true,
 *   }
 * )
 * ```
 * @param measure - Measure to apply the forecast logic to
 * @param name - Name for the new measure
 * @param options - Forecast options
 * @returns A calculated measure instance
 * @group Advanced Analytics
 */
export function forecast(
  measure: Measure,
  name?: string,
  options?: ForecastFormulaOptions,
): CalculatedMeasure {
  let params: string | undefined;

  if (options) {
    // create ISO string values for any Date objects
    const adjustedOptions = { forecastHorizon: 3, ...options };
    if (adjustedOptions.startDate) {
      const startDate = new Date(adjustedOptions.startDate);
      adjustedOptions.startDate = startDate.toISOString().replace(/.\d+Z$/g, '');
    }
    if (adjustedOptions.endDate) {
      const endDate = new Date(adjustedOptions.endDate);
      adjustedOptions.endDate = endDate.toISOString().replace(/.\d+Z$/g, '');
    }

    // make a comma separated name=value string based on options
    params = Object.entries(adjustedOptions)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      .map((e) => `"${e[0]}=${e[1]}"`)
      .join(',');
  } else {
    params = '"forecastHorizon=3"';
  }
  return measureFunction(measure, name ?? measure.name + ' Forecast', 'forecast', params);
}

/**
 * Creates a calculated measure that calculates the rank of a value in a list of values.
 *
 * This function includes options that allow you do customize the ranking order and how to handle
 * equally ranked items.
 *
 * The order options are:
 * + `'DESC'` (default): Descending, meaning the largest number is ranked first.
 * + `'ASC'`: Ascending, meaning the smallest number is ranked first.
 *
 * The rank type options are:
 * + `'1224'`: Standard competition, meaning items that rank equally receive the same ranking number,
 *   and then a gap is left after the equally ranked items in the ranking numbers.
 * + `'1334'`: Modified competition ranking, meaning items that rank equally receive the same ranking number,
 *   and a gap is left before the equally ranked items in the ranking numbers.
 * + `'1223'`: Dense ranking, meaning items that rank equally receive the same ranking number,
 *   and the next items receive the immediately following ranking number.
 * + `'1234'`: Ordinal ranking, meaning all items receive distinct ordinal numbers,
 *   including items that rank equally. The assignment of distinct ordinal numbers for equal-ranking items is arbitrary.
 *
 * @example
 * Calculate the rank of the total cost per category, sorted with the smallest cost ranked first,
 * and ranking ties are handled using the ordinal ranking type from the Sample Ecommerce data model.
 * ```ts
 * measureFactory.rank(
 *   measureFactory.sum(DM.Commerce.Cost),
 *   'Cost Rank',
 *   measureFactory.RankingSortTypes.Ascending,
 *   measureFactory.RankingTypes.Ordinal
 * )
 * ```
 *
 * Ranking values from the Sample Ecommerce data model when categorizing by age range using the above ranking.
 * | AgeRange | Cost | Cost Rank |
 * | --- | --- | --- |
 * | 0-18 | 4.32M | 1 |
 * | 19-24 | 8.66M | 2 |
 * | 25-34 | 21.19M | 6 |
 * | 35-44 | 23.64M | 7 |
 * | 45-54 | 20.39M | 5 |
 * | 55-64 | 11.82M | 3 |
 * | 65+ | 17.26M | 4 |
 * @param measure - Measure to apply the ranking logic to
 * @param name - Name for the new measure
 * @param sort - Sorting for ranking. By default sort order is descending, where the largest number is ranked first.
 * @param rankType - How to handle equally ranked items. By default the type is standard competition ranking.
 * @param groupBy - Rank partition attributes
 * @returns A calculated measure instance
 * @group Statistics
 */
export function rank(
  measure: Measure,
  name?: string,
  sort: string = RankingSortTypes.Descending,
  rankType: string = RankingTypes.StandardCompetition,
  groupBy: Attribute[] = [],
): CalculatedMeasure {
  const builder: string[] = [];
  const context: MeasureContext = <MeasureContext>{};

  builder.push('rank(');

  addToFormula(builder, context, measure);

  builder.push(`,${sort},${rankType}`);

  groupBy.forEach((groupByAttr) => {
    builder.push(',');

    addToFormula(builder, context, groupByAttr);
  });

  builder.push(')');

  const exp = builder.join('');

  // default name
  if (!name) {
    name = `${measure.name} rank`;
  }

  return new DimensionalCalculatedMeasure(name, exp, context);
}
