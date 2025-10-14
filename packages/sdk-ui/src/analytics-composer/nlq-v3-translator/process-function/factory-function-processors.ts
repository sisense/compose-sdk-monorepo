/**
 * Custom processing registry for factory functions that require complex validation
 * and transformation beyond basic argument type checking.
 */
import { CustomFunctionProcessor } from '../types.js';
import { processCustomFormula } from './custom-formula/process-custom-formula.js';
import {
  processDateFilter,
  processNumericFilter,
  processStringFilter,
  processStringOrNumericFilter,
} from './filter-processors.js';

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
 * 'filterFactory.dateRange': processDateRangeLogic,
 * ```
 */
export const FUNCTION_PROCESSORS: Record<string, CustomFunctionProcessor> = {
  'measureFactory.customFormula': processCustomFormula,

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

  // Date filters
  'filterFactory.dateFrom': processDateFilter,
  'filterFactory.dateTo': processDateFilter,
  'filterFactory.dateRange': processDateFilter,
  'filterFactory.dateRelative': processDateFilter,
  'filterFactory.dateRelativeFrom': processDateFilter,
  'filterFactory.dateRelativeTo': processDateFilter,
  'filterFactory.thisYear': processDateFilter,
  'filterFactory.thisMonth': processDateFilter,
  'filterFactory.thisQuarter': processDateFilter,
  'filterFactory.today': processDateFilter,
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
