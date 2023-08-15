/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-params */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import {
  Attribute,
  Measure,
  MeasureTemplate,
  Filter,
  MeasureContext,
  CalculatedMeasure,
  BaseMeasure,
} from '../interfaces.js';

import { DimensionalBaseMeasure, DimensionalCalculatedMeasure } from './measures.js';

import { AggregationTypes, MetadataTypes } from '../types.js';
import { normalizeName } from '../base.js';
import { ForecastFormulaOptions, TrendFormulaOptions } from '../../interfaces.js';

/**
 * Defines the different numeric operators that can be used with numeric filters
 *
 * @internal
 */
export const RankingTypes = {
  /**
   * In competition ranking, items that compare equal receive the same ranking number, and then a gap is left in the ranking numbers.
   */
  StandardCompetition: '1224',

  /**
   * Sometimes, competition ranking is done by leaving the gaps in the ranking numbers before the sets of equal-ranking items (rather than after them as in standard competition ranking)
   */
  ModifiedCompetition: '1334',

  /**
   * In dense ranking, items that compare equally receive the same ranking number, and the next items receive the immediately following ranking number.
   */
  Dense: '1223',

  /**
   * In ordinal ranking, all items receive distinct ordinal numbers, including items that compare equal. The assignment of distinct ordinal numbers is arbitrarily.
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
 * Creates a basic aggregated measure.
 * This is a base function to build other aggregation functions (e.g., `sum`, `average`, etc)
 * as listed in {@link AggregationTypes}.
 *
 * @param attribute - Attribute to aggregate
 * @param aggregationType - Aggregation type. See {@link AggregationTypes}
 * @param name - Optional name for the new measure
 * @param format - Numeric formatting to apply
 * @returns A Measure instance
 */
export function aggregate(
  attribute: Attribute,
  aggregationType: string,
  name?: string,
  format?: string,
): BaseMeasure {
  // if (aggregationType == AggregationTypes.Average || aggregationType == AggregationTypes.Max ||
  //     aggregationType == AggregationTypes.Min || aggregationType == AggregationTypes.Median ||
  //     aggregationType == AggregationTypes.Sum) {

  //         if (!MetadataTypes.isNumericDimension(attribute.type)) {

  //             throw `${aggregationType} is supported for numeric attributes only, where ${attribute.name} is ${attribute.type}`;
  //         }
  //     }

  return new DimensionalBaseMeasure(
    name ?? `${aggregationType.toString()} ${attribute.name}`,
    attribute,
    aggregationType,
    format,
  );
}

/**
 * Returns a numeric value as a measure.
 *
 * @param value - Value to be returned as a measure
 * @returns A Calculated Measure instance
 */
export function constant(value: number): CalculatedMeasure {
  return new DimensionalCalculatedMeasure(`${value}`, `${value}`, {});
}

/**
 * Creates a sum aggregation over the given attribute.
 *
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply
 * @returns A Measure instance
 */
export function sum(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.Sum, name, format);
}

/**
 * Creates an average aggregation over the given attribute.
 *
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply
 * @returns A Measure instance
 */
export function average(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.Average, name, format);
}

/**
 * Creates a min aggregation over the given attribute.
 *
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply
 * @returns A Measure instance
 */
export function min(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.Min, name, format);
}

/**
 * Creates a max aggregation over the given attribute.
 *
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply
 * @returns A Measure instance
 */
export function max(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.Max, name, format);
}

/**
 * Creates a median aggregation over the given attribute.
 *
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply
 * @returns A Measure instance
 */
export function median(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.Median, name, format);
}

/**
 * Creates a count aggregation over the given attribute.
 *
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply
 * @returns A Measure instance
 */
export function count(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.Count, name, format);
}
/**
 * Creates a count distinct aggregation over the given attribute.
 *
 * @param attribute - Attribute to aggregate
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply
 * @returns A Measure instance
 */
export function countDistinct(attribute: Attribute, name?: string, format?: string) {
  return aggregate(attribute, AggregationTypes.CountDistinct, name, format);
}

/**
 * Creates a measured value with the given measure and set of filters.
 *
 * @param measure - Measure to filter
 * @param filters - Filters to apply to the measure
 * @param name - Optional name for the new measure
 * @param format - Optional numeric formatting to apply
 * @returns A Calculated Measure instance
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
 * Adds the two given values.
 *
 * @param value1 - First value
 * @param value2 - Second value
 * @param name - Optional name for the new measure
 * @param withParentheses - Optional boolean flag whether to wrap the arithmetic operation with parentheses
 * @returns A Calculated Measure instance
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
 * Subtract value2 from value1.
 *
 * @param value1 - First value
 * @param value2 - Second value
 * @param name - Optional name for the new measure
 * @param withParentheses - Optional boolean flag whether to wrap the arithmetic operation with parentheses
 * @returns A Calculated Measure instance
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
 * Multiply value1 with value2.
 *
 * @param value1 - First value
 * @param value2 - Second value
 * @param name - Optional name for the new measure
 * @param withParentheses - Optional boolean flag whether to wrap the arithmetic operation with parentheses
 * @returns A Calculated Measure instance
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
 * Divide value1 by value2.
 *
 * @param value1 - First value
 * @param value2 - Second value
 * @param name - Optional name for the new measure
 * @param withParentheses - Optional boolean flag whether to wrap the arithmetic operation with parentheses
 * @returns A Calculated Measure instance
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
 * Calculates year to date (YTD) sum of the given measure. Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply the YTD Sum to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function yearToDateSum(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? 'YTD ' + measure.name, 'YTDSum');
}

/**
 * Calculates quarter to date (QTD) sum of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply the QTD Sum to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function quarterToDateSum(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? 'QTD ' + name, 'QTDSum');
}

/**
 * Calculates month to date (MTD) sum of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply the MTD Sum to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function monthToDateSum(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? 'MTD ' + measure.name, 'MTDSum');
}

/**
 * Calculates week to date (WTD) sum of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply the WTD Sum to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function weekToDateSum(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? 'MTD ' + measure.name, 'WTDSum');
}

/**
 * Returns the running total of the measure by the defined dimension
 * according to the current sorting order in the query.
 *
 * By default, `RSUM` accumulates a measure by the sorting order of the dimension.
 * To accumulate by another order, the relevant measure should be added as an additional column and sorted.
 *
 * Note: Filtering the `RSUM` column by Values,
 * filters the dimensions and recalculates the `RSUM` from the first filtered value.
 *
 * @param measure - Measure to apply the Running Sum to
 * @param _continuous - Boolean flag whether to accumulate the sum continuously
 * when there are two or more dimensions. The default value is False.
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function runningSum(
  measure: Measure,
  _continuous?: boolean,
  name?: string,
): CalculatedMeasure {
  return measureFunction(measure, name ?? 'Running Sum ' + measure.name, 'RSum');
}

/**
 * Calculates growth over time. The time dimension to be used is determined by the time resolution in the query.
 *
 * Formula: `(current value – compared value) / compared value`.
 *
 * @example
 *
 * If this month your value is 12, and last month it was 10, your Growth for this month is 20% (0.2).
 *
 * Calculation: `(12 – 10) / 10 = 0.2`
 *
 * If this year your value is 80, and last year it was 100, your Growth for this year is -20% ( -0.2).
 *
 * Calculation: `(80 – 100) / 100 = -0.2`
 * @param measure - Measure to apply growth to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function growth(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Growth', 'growth');
}

/**
 * Calculates growth rate over time. The time dimension to be used is determined by the time resolution in the query.
 *
 * @example
 * If this month your value is 12, and last month it was 10, your Growth Rate for this month is 12/10 = 120% (1.2).
 *
 * Calculation: `12 / 10 = 1.2`
 *
 * If this year your value is 80, and last year it was 100, your Growth for this year is 80/100 = 80% ( 0.8).
 *
 * Calculation: `80 / 100 = 0.8`
 * @param measure - Measure to apply the Growth rate
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function growthRate(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Growth', 'growthrate');
}

/**
 * Calculates the growth from past week of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply growth to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function growthPastWeek(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Growth', 'growthpastweek');
}

/**
 * Calculates the growth from past month of the given measure.
 * Date dimension will be dynamically taken from the query
 *
 * @param measure - Measure to apply growth to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function growthPastMonth(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Growth', 'growthpastmonth');
}

/**
 * Calculates the growth from past quarter of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply growth to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function growthPastQuarter(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Growth', 'growthpastquarter');
}

/**
 * Calculates the growth from past year of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply growth to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function growthPastYear(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Growth', 'growthpastyear');
}

/**
 * Calculates the difference of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - measure to apply difference to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function difference(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Difference', 'diffpastperiod');
}

/**
 * Calculates the difference from past week of the given measure.
 * Ddate dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply difference to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function diffPastWeek(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Difference', 'diffpastweek');
}

/**
 * Calculates the difference from past month of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply difference to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function diffPastMonth(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Difference', 'diffpastmonth');
}

/**
 * Calculates the difference from past quarter of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply difference to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function diffPastQuarter(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Difference', 'diffpastquarter');
}

/**
 * Calculates the difference from past year of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply difference to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function diffPastYear(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Difference', 'diffpastyear');
}

/**
 * Calculates the value of the past day of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply past value to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function pastDay(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Past Day', 'pastday');
}

/**
 * Calculates the value of the past week of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply past value to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function pastWeek(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Past Week', 'pastweek');
}

/**
 * Calculates the value of the path month of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply past value to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function pastMonth(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Past Month', 'pastmonth');
}

/**
 * Calculates the value of the past quarter of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply past value to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function pastQuarter(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Past Quarter', 'pastquarter');
}

/**
 * Calculates the value of the past year of the given measure.
 * Date dimension will be dynamically taken from the query.
 *
 * @param measure - Measure to apply past value to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function pastYear(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + '  Past Year', 'pastyear');
}

/**
 * Calculates contribution.
 *
 * @param measure - Measure to apply the Contribution logic to
 * @param name - Name for the new measure
 * @returns A Calculated Measure instance
 */
export function contribution(measure: Measure, name?: string): CalculatedMeasure {
  return measureFunction(measure, name ?? measure.name + ' Contribution', 'contribution');
}

/**
 * Fits a specified trend type to your measure. The trend types include linear,
 * logarithmic, advanced smoothing, and local estimates. It allows for an optional
 * feature to automatically identify and ignore anomalous values in the series.
 *
 * Trend requires a Sisense instance version of L2023.6.0 or greater.
 *
 * @param measure - Measure to apply the trend logic to
 * @param name - Name for the new measure
 * @param options - Trend options
 * @returns A Calculated Measure instance
 */
export function trend(
  measure: Measure,
  name?: string,
  options?: TrendFormulaOptions,
): CalculatedMeasure {
  let params: string | undefined;
  const adjustValues = (value: string) =>
    value
      .replace('advancedSmoothing', 'Advanced Smoothing')
      .replace('localEstimates', 'Local Estimates');
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
 * Calculates Forecast leveraging advanced autoML techniques to generate
 * a forecast for a given measure.
 *
 * This function offers flexibility with auto-selection of the best
 * statistical model or user-selected models, and it also provides control
 * over the time period used for training the model, as well as options to
 * improve forecast accuracy by supplying expected lower and upper limits.
 *
 * In addition to forecast, upper and lower confidence interval is returned
 * with the name of the new measure and a suffix of _upper and _lower
 * respectively.
 *
 * Forecast requires a Sisense instance version of L2023.6.0 or greater.
 *
 * @param measure - Measure to apply the forecast logic to
 * @param name - Name for the new measure
 * @param options - Forecast options
 * @returns A Calculated Measure instance
 */
export function forecast(
  measure: Measure,
  name?: string,
  options?: ForecastFormulaOptions,
): CalculatedMeasure {
  let params: string | undefined;

  if (options) {
    // create ISO string values for any Date objects
    const adjustedOptions = { ...options };
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
 * Calculates the rank of a value in a list of values.
 *
 * @example
 * `RANK(Total Cost, “ASC”, “1224”, Product, Years)`
 * will return the rank of the total annual cost per each product were sorted in ascending order.
 * @param measure - Measure to apply the Contribution logic to
 * @param name - Name for the new measure
 * @param sort - By default sort order is descending.
 * @param rankType - By default the type is standard competition ranking `(“1224” ranking)`.
 * Supports also modified competition ranking `(“1334” ranking)`, dense ranking `(“1223” ranking)`,
 * and ordinal ranking `(“1234” ranking)`.
 * @param groupBy - Rank partitions attributes
 * @returns A rank measure
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
