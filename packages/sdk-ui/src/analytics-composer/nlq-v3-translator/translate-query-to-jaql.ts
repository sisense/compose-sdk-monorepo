import { type DataSource, getFilterListAndRelationsJaql } from '@sisense/sdk-data';
import { getJaqlQueryPayload } from '@sisense/sdk-query-client';
import type { JaqlQueryPayload } from '@sisense/sdk-query-client';

import { BaseQueryParams } from '@/query-execution/types.js';
import { prepareQueryParams, type QueryDescription } from '@/query/execute-query.js';

/**
 * Converts BaseQueryParams to QueryDescription format
 *
 * @param queryParams - The query parameters to convert
 * @returns QueryDescription
 */
function baseQueryParamsToQueryDescription(queryParams: BaseQueryParams): QueryDescription {
  // Extract filters and filter relations from BaseQueryParams
  // BaseQueryParams.filters can be Filter[] | FilterRelations, but QueryDescription.filters is Filter[]
  const { filters: pureFilters, relations: filterRelations } = getFilterListAndRelationsJaql(
    queryParams.filters || [],
  );

  return {
    dataSource: queryParams.dataSource,
    dimensions: queryParams.dimensions,
    measures: queryParams.measures,
    filters: pureFilters,
    filterRelations,
    highlights: queryParams.highlights,
    // No count/offset/ungroup - these are execution concerns, not translation concerns
  };
}

/**
 * Converts BaseQueryParams to JAQL payload
 *
 * This is a pure TypeScript function that works in Node.js environments
 * and converts query parameters to JAQL without requiring React hooks or browser APIs.
 *
 * Reuses the existing query preparation logic from executeQuery to avoid duplication.
 *
 * @param queryParams - The base query parameters from NLQ translation
 * @param defaultDataSource - Default data source if not specified in queryParams
 * @param shouldSkipHighlightsWithoutAttributes - Whether to skip highlights without corresponding attributes
 * @returns The JAQL query payload
 * @internal
 */
export function translateQueryToJaql(
  queryParams: BaseQueryParams,
  defaultDataSource?: DataSource,
  shouldSkipHighlightsWithoutAttributes = false,
): JaqlQueryPayload {
  // Convert BaseQueryParams to QueryDescription format
  const queryDescription = baseQueryParamsToQueryDescription(queryParams);

  // Reuse existing logic from executeQuery to prepare internal query description
  const internalQueryDescription = prepareQueryParams(queryDescription, defaultDataSource);

  // Generate JAQL payload
  return getJaqlQueryPayload(internalQueryDescription, shouldSkipHighlightsWithoutAttributes);
}
