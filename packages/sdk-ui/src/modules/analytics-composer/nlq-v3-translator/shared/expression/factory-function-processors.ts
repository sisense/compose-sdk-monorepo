/**
 * Custom processing registry for factory functions that require complex validation
 * and transformation beyond basic argument type checking.
 */
import { type CustomFunctionProcessor, isRecordStringUnknown } from '../../types.js';
import { resolveCalculatedDimensionDataType } from './custom-formula/infer-calculated-dimension-type.js';
import { processCustomFormula } from './custom-formula/process-custom-formula.js';
import {
  processDateMeasureMembersFilter,
  processDateMeasureRelativeFilter,
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
import { processAttributeMeasure, processNumericMeasure } from './measure-processors.js';
import { processMeasuredValue } from './process-measured-value.js';

/**
 * Wraps context keys in brackets, since the formula references them with brackets.
 *
 * @param formulaContext - Formula context whose keys may arrive without brackets.
 * @returns The same context keyed by bracket reference.
 */
function withBracketedKeys(formulaContext: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(formulaContext).map(([key, value]) => [
      key.startsWith('[') ? key : `[${key}]`,
      value,
    ]),
  );
}

/**
 * Processes attributeFactory.customFormula: validates it like a measure formula without the
 * aggregation requirement, then sets the data type its formula decides, or the given one.
 *
 * @param processedArgs - The title, formula, context and optional data type.
 * @param context - Processing context.
 * @returns Processed args with the resolved data type at index 3.
 */
const processCalculatedDimension: CustomFunctionProcessor = (processedArgs, context) => {
  const [title, formula, formulaContext] = processCustomFormula(processedArgs, context, {
    requireAggregative: false,
  });
  const dataType =
    typeof formula === 'string' && isRecordStringUnknown(formulaContext)
      ? resolveCalculatedDimensionDataType(
          formula,
          withBracketedKeys(formulaContext),
          processedArgs[3],
        )
      : undefined;
  return dataType ? [title, formula, formulaContext, dataType] : [title, formula, formulaContext];
};

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
  // A calculated dimension groups rather than aggregates, so the aggregative-function requirement
  // that applies to measures is lifted here.
  'attributeFactory.customFormula': processCalculatedDimension,
  'measureFactory.measuredValue': processMeasuredValue,

  // Numeric-only aggregations: reject text and datetime attributes (BE throws otherwise)
  // Any-type aggregations: reject only a calculated dimension, which the engine cannot aggregate
  'measureFactory.min': processAttributeMeasure,
  'measureFactory.max': processAttributeMeasure,
  'measureFactory.count': processAttributeMeasure,
  'measureFactory.countDistinct': processAttributeMeasure,
  'measureFactory.aggregate': processAttributeMeasure,
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
  'filterFactory.dateMeasureMembers': processDateMeasureMembersFilter,
  'filterFactory.dateMeasureRelativeFrom': processDateMeasureRelativeFilter,
  'filterFactory.dateMeasureRelativeTo': processDateMeasureRelativeFilter,
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
