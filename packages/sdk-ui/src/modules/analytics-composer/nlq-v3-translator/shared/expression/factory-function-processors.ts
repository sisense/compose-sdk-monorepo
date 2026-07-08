/**
 * Custom processing registry for factory functions that require complex validation
 * and transformation beyond basic argument type checking.
 */
import { CustomFunctionProcessor } from '../../types.js';
import { processCustomFormula } from './custom-formula/process-custom-formula.js';
import {
  processDatetimeFromFilter,
  processDatetimeMembersFilter,
  processDatetimeRangeFilter,
  processDatetimeRelativeFilter,
  processDatetimeToFilter,
} from './datetime-filter-processors.js';
import {
  processExcludeFilter,
  processNumericFilter,
  processStringFilter,
  processStringOrNumericFilter,
} from './filter-processors.js';
import { processNumericMeasure } from './measure-processors.js';
import { processMeasuredValue } from './process-measured-value.js';

/**
 * Registry mapping function paths to their custom processing functions.
 *
 * Processors handle both validation and preprocessing/transformation
 * of arguments beyond basic schema validation.
 *
 * @example
 * ```typescript
 * // Adding a new custom processor
 * 'measureFactory.rank': processRankingParameters,
 * ```
 */
export const FUNCTION_PROCESSORS: Record<string, CustomFunctionProcessor> = {
  'measureFactory.customFormula': processCustomFormula,
  'measureFactory.measuredValue': processMeasuredValue,

  // Numeric-only aggregations: reject text and datetime attributes (BE throws otherwise)
  'measureFactory.sum': processNumericMeasure,
  'measureFactory.average': processNumericMeasure,
  'measureFactory.avg': processNumericMeasure,
  'measureFactory.stdev': processNumericMeasure,
  'measureFactory.variance': processNumericMeasure,
  'measureFactory.median': processNumericMeasure,

  // String | Number filters
  'filterFactory.equals': processStringOrNumericFilter,
  'filterFactory.doesntEqual': processStringOrNumericFilter,

  // Numeric filters
  'filterFactory.greaterThan': processNumericFilter,
  'filterFactory.greaterThanOrEqual': processNumericFilter,
  'filterFactory.lessThan': processNumericFilter,
  'filterFactory.lessThanOrEqual': processNumericFilter,
  'filterFactory.between': processNumericFilter,
  'filterFactory.betweenNotEqual': processNumericFilter,
  'filterFactory.numeric': processNumericFilter,

  // String filters
  'filterFactory.contains': processStringFilter,
  'filterFactory.doesntContain': processStringFilter,
  'filterFactory.startsWith': processStringFilter,
  'filterFactory.doesntStartWith': processStringFilter,
  'filterFactory.endsWith': processStringFilter,
  'filterFactory.doesntEndWith': processStringFilter,
  'filterFactory.like': processStringFilter,

  // Exclude filter
  'filterFactory.exclude': processExcludeFilter,

  // Datetime filters
  'filterFactory.members': processDatetimeMembersFilter,
  'filterFactory.dateFrom': processDatetimeFromFilter,
  'filterFactory.dateTo': processDatetimeToFilter,
  'filterFactory.dateRange': processDatetimeRangeFilter,
  'filterFactory.dateRelative': processDatetimeRelativeFilter,
  'filterFactory.dateRelativeFrom': processDatetimeRelativeFilter,
  'filterFactory.dateRelativeTo': processDatetimeRelativeFilter,
};

/**
 * Utility function to check if a function has custom processing.
 *
 * @param functionPath - The function path to check
 * @returns True if the function has custom processing
 */
export function hasCustomProcessing(functionPath: string): boolean {
  return `${functionPath}` in FUNCTION_PROCESSORS;
}

/**
 * Utility function to get the custom processor for a function.
 *
 * @param functionPath - The function path to get processor for
 * @returns The processor function or undefined if no custom processing
 */
export function getCustomProcessor(functionPath: string): CustomFunctionProcessor | undefined {
  return FUNCTION_PROCESSORS[`${functionPath}`];
}

/**
 * Get all function paths that have custom processing.
 *
 * @returns Array of function paths with custom processors
 */
export function getFunctionsWithCustomProcessing(): string[] {
  return Object.keys(FUNCTION_PROCESSORS);
}
