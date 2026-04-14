import {
  Attribute,
  convertJaqlDataSource,
  DataSource,
  Filter,
  FilterRelations,
  getFilterListAndRelationsJaql,
  JaqlDataSource,
  Measure,
} from '@sisense/sdk-data';
import { getJaqlQueryPayload } from '@sisense/sdk-query-client';

import type { NarrativeRequest } from '@/infra/api/narrative/narrative-api-types.js';
import { NARRATIVE_BY_CSDK } from '@/infra/api/narrative/narrative-constants.js';

/**
 * Parameters for {@link useGetNlgInsights} hook.
 */
export interface UseGetNlgInsightsParams {
  /** The data source that the query targets - e.g. `Sample ECommerce` */
  dataSource: DataSource;

  /** Dimensions of the query */
  dimensions?: Attribute[];

  /** Measures of the query */
  measures?: Measure[];

  /** Filters of the query */
  filters?: Filter[] | FilterRelations;

  /**
   * Boolean flag to enable/disable API call by default
   *
   * If not specified, the default value is `true`
   */
  enabled?: boolean;

  /** The verbosity of the NLG summarization */
  verbosity?: 'Low' | 'High';
}

/**
 * Parameters for building a narration request (before JAQL payload expansion).
 *
 * @sisenseInternal
 */
export interface NarrativeQueryParams extends UseGetNlgInsightsParams {}

/** @internal */
export function prepareNarrativeRequest(
  params: NarrativeQueryParams | NarrativeRequest,
): NarrativeRequest {
  if ('jaql' in params) {
    return {
      ...params,
      jaql: { ...params.jaql, by: NARRATIVE_BY_CSDK },
    };
  }

  const dataSource: JaqlDataSource = convertJaqlDataSource(params.dataSource);

  const { filters = [], relations } = getFilterListAndRelationsJaql(params.filters);
  const { metadata, filterRelations } = getJaqlQueryPayload(
    {
      dataSource: params.dataSource,
      attributes: params.dimensions ?? [],
      measures: params.measures ?? [],
      filters,
      filterRelations: relations,
      highlights: [],
    },
    true,
  );

  const parameters: NarrativeRequest = {
    jaql: {
      datasource: dataSource,
      metadata,
      filterRelations,
      by: NARRATIVE_BY_CSDK,
    },
  };

  if (params.verbosity) {
    parameters.verbosity = params.verbosity;
  }

  return parameters;
}

/**
 * @deprecated Use {@link prepareNarrativeRequest}. Same function; kept for legacy `modules/ai` and framework wrappers.
 */
export const prepareGetNlgInsightsPayload = prepareNarrativeRequest;
