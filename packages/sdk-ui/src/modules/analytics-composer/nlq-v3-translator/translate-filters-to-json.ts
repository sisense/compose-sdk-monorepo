import { Filter, FilterRelations, isFilterRelations, JSONValue } from '@sisense/sdk-data';

import { NlqTranslationError, NlqTranslationResult } from '../types.js';
import { parseComposeCodeToFunctionCall } from './parse-compose-code.js';
import { FunctionCall } from './types.js';

const UNKNOWN_ERROR_MESSAGE = 'Unknown error';

/**
 * Translates CSDK Filter array or FilterRelations to NLQ JSON format (FunctionCall array).
 *
 * Parses composeCode directly to FunctionCall format. The composeCode contains [[delimiters]]
 * around names that need normalization, which are stripped at the final step in translateQueryToJSON.
 *
 * @param filters - Filter array or FilterRelations object
 * @returns NlqTranslationResult<FunctionCall[]> with array of FunctionCall objects or structured errors
 * @internal
 */
export function translateFiltersToJSON(
  filters: Filter[] | FilterRelations | undefined,
): NlqTranslationResult<FunctionCall[]> {
  if (!filters) {
    return { success: true, data: [] };
  }

  const errors: NlqTranslationError[] = [];

  // Handle FilterRelations (single object with composeCode containing the entire expression)
  if (isFilterRelations(filters)) {
    if (!filters.composeCode) {
      return {
        success: false,
        errors: [
          {
            category: 'filters',
            index: -1,
            input: filters as unknown as JSONValue,
            message: `FilterRelations is missing composeCode. Operator: ${
              filters.operator || 'unknown'
            }`,
          },
        ],
      };
    }

    try {
      // Parse composeCode directly - delimiters stripped at end in translateQueryToJSON
      const functionCall = parseComposeCodeToFunctionCall(filters.composeCode);
      return { success: true, data: [functionCall] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
      return {
        success: false,
        errors: [
          {
            category: 'filters',
            index: -1,
            input: filters as unknown as JSONValue,
            message: `Failed to parse composeCode for FilterRelations: ${errorMessage}. ComposeCode: "${filters.composeCode}"`,
          },
        ],
      };
    }
  }

  // Handle Filter array
  const results: FunctionCall[] = [];
  filters.forEach((filter, index) => {
    if (!filter.composeCode) {
      errors.push({
        category: 'filters',
        index,
        input: filter as unknown as JSONValue,
        message: `Filter at index ${index} (${
          (filter as any).name || 'unnamed'
        }) is missing composeCode`,
      });
      return;
    }

    try {
      // Parse composeCode directly - delimiters stripped at end in translateQueryToJSON
      const functionCall = parseComposeCodeToFunctionCall(filter.composeCode);
      results.push(functionCall);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
      errors.push({
        category: 'filters',
        index,
        input: filter as unknown as JSONValue,
        message: `Failed to parse composeCode for filter at index ${index}: ${errorMessage}. ComposeCode: "${filter.composeCode}"`,
      });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
}

/**
 * Translates CSDK Filter array to NLQ JSON format (FunctionCall array).
 *
 * Parses composeCode directly to FunctionCall format. The composeCode contains [[delimiters]]
 * around names that need normalization, which are stripped at the final step in translateQueryToJSON.
 * Same as translateFiltersToJSON but specifically for highlights array.
 *
 * @param highlights - Array of CSDK Filter objects
 * @returns NlqTranslationResult<FunctionCall[]> with array of FunctionCall objects or structured errors
 * @internal
 */
export function translateHighlightsToJSON(
  highlights: Filter[] | undefined,
): NlqTranslationResult<FunctionCall[]> {
  if (!highlights) {
    return { success: true, data: [] };
  }

  const results: FunctionCall[] = [];
  const errors: NlqTranslationError[] = [];

  highlights.forEach((filter, index) => {
    if (!filter.composeCode) {
      errors.push({
        category: 'highlights',
        index,
        input: filter as unknown as JSONValue,
        message: `Highlight filter at index ${index} (${
          (filter as any).name || 'unnamed'
        }) is missing composeCode`,
      });
      return;
    }

    try {
      // Parse composeCode directly - delimiters stripped at end in translateQueryToJSON
      const functionCall = parseComposeCodeToFunctionCall(filter.composeCode);
      results.push(functionCall);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
      errors.push({
        category: 'highlights',
        index,
        input: filter as unknown as JSONValue,
        message: `Failed to parse composeCode for highlight filter at index ${index}: ${errorMessage}. ComposeCode: "${filter.composeCode}"`,
      });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
}
