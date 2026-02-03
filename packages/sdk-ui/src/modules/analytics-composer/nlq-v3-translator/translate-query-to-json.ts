import { JSONValue } from '@sisense/sdk-data';

import { BaseQueryParams } from '@/domains/query-execution/index.js';

import { NlqResponseJSON, NlqTranslationError, NlqTranslationResult } from '../types.js';
import { collectTranslationErrors } from './common.js';
import { translateDimensionsToJSON } from './translate-dimensions-to-json.js';
import { translateFiltersToJSON, translateHighlightsToJSON } from './translate-filters-to-json.js';
import { translateMeasuresToJSON } from './translate-measures-to-json.js';

/**
 * Recursively strips [[delimiters]] from all strings in a JSON structure.
 * Transforms "DM.[[Commerce Sales]].[[Order Date]]" → "DM.Commerce Sales.Order Date"
 *
 * @param value - The JSON value to process
 * @returns The value with all [[delimiters]] stripped from strings
 * @internal
 */
function stripDelimitersFromJson<T extends JSONValue>(value: T): T {
  if (typeof value === 'string') {
    return value.replace(/\[\[([^\]]+)\]\]/g, '$1') as T;
  }
  if (Array.isArray(value)) {
    return value.map(stripDelimitersFromJson) as T;
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, stripDelimitersFromJson(v)]),
    ) as T;
  }
  return value; // numbers, booleans, null
}

/**
 * Translates CSDK BaseQueryParams to NLQ JSON format.
 * Direction: CSDK → JSON
 *
 * Converts CSDK objects (Attribute[], Measure[], Filter[], FilterRelations) to NLQ FunctionCall format.
 *
 * @example
 * ```typescript
 * const query: BaseQueryParams = {
 *   dimensions: [DM.Category.Category, DM.Brand.Brand],
 *   measures: [
 *     measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *     measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
 *   ],
 *   filters: [
 *     filterFactory.members(DM.Commerce.Date.Years, ['2024-01-01T00:00:00']),
 *     filterFactory.topRanking(DM.Brand.Brand, measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'), 5),
 *   ],
 * };
 *
 * const result = translateQueryToJSON(query);
 * if (result.success) {
 *   // result.data contains:
 *   // {
 *   //   dimensions: ['DM.Category.Category', 'DM.Brand.Brand'],
 *   //   measures: [
 *   //     { function: 'measureFactory.sum', args: ['DM.Commerce.Revenue', 'Total Revenue'] },
 *   //     { function: 'measureFactory.sum', args: ['DM.Commerce.Cost', 'Total Cost'] },
 *   //   ],
 *   //   filters: [
 *   //     { function: 'filterFactory.members', args: ['DM.Commerce.Date.Years', ['2024-01-01T00:00:00']] },
 *   //     { function: 'filterFactory.topRanking', args: ['DM.Brand.Brand', {...}, 5] },
 *   //   ],
 *   // }
 * } else {
 *   // Handle errors: result.errors contains structured error information
 * }
 * ```
 *
 * @example
 * To translate only measures or shared formulas:
 * ```typescript
 * const result = translateQueryToJSON({
 *   measures: [measureFactory.sum(DM.Commerce.Revenue)],
 *   dimensions: [],
 *   filters: [],
 * });
 * ```
 *
 * @param query - BaseQueryParams object with CSDK objects
 * @returns NlqTranslationResult<NlqResponseJSON> with FunctionCall format or structured errors
 * @internal
 */
export function translateQueryToJSON(
  query: BaseQueryParams,
): NlqTranslationResult<NlqResponseJSON> {
  const translationErrors: NlqTranslationError[] = [];

  // Process each translation category
  const dimensions = collectTranslationErrors<string[]>(
    () => translateDimensionsToJSON(query.dimensions || []),
    translationErrors,
  );

  const measures = collectTranslationErrors(
    () => translateMeasuresToJSON(query.measures || []),
    translationErrors,
  );

  const filters = collectTranslationErrors(
    () => translateFiltersToJSON(query.filters),
    translationErrors,
  );

  let highlights = null;
  if (query.highlights && query.highlights.length > 0) {
    highlights = collectTranslationErrors(
      () => translateHighlightsToJSON(query.highlights),
      translationErrors,
    );
  }

  // If any errors were collected, return structured error response
  if (translationErrors.length > 0) {
    return {
      success: false,
      errors: translationErrors,
    };
  }

  // Return successful result
  const result: NlqResponseJSON = {
    dimensions: dimensions || [],
    measures: measures || [],
    filters: filters || [],
    ...(highlights && { highlights: highlights }),
  };

  return {
    success: true,
    // Strip [[delimiters]] from all strings to preserve original names with spaces
    data: stripDelimitersFromJson(result),
  };
}
