import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { withTracking } from '@/decorators/hook-decorators';
import { useChatApi } from './api/chat-api-provider';
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
import { GetNlgInsightsRequest } from './api/types';
import { GetNlgInsightsProps } from './get-nlg-insights';
import { getJaqlQueryPayload } from '@sisense/sdk-query-client';

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
 * State for {@link useGetNlgInsights} hook.
 */
export interface UseGetNlgInsightsState {
  /** Whether the data fetching is loading */
  isLoading: boolean;
  /** Whether the data fetching has failed */
  isError: boolean;
  /** Whether the data fetching has succeeded */
  isSuccess: boolean;
  /** The result data */
  data: string | undefined;
  /** The error if any occurred */
  error: unknown;
  /** Callback to trigger a refetch of the data */
  refetch: () => void;
}

/** @internal */
export function prepareGetNlgInsightsPayload(
  params: UseGetNlgInsightsParams | GetNlgInsightsRequest,
): GetNlgInsightsRequest {
  if ('jaql' in params) {
    return params;
  } else {
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

    const parameters: GetNlgInsightsRequest = {
      jaql: {
        datasource: dataSource,
        metadata,
        filterRelations,
      },
    };

    if (params.verbosity) {
      parameters.verbosity = params.verbosity;
    }

    return parameters;
  }
}

/**
 *
 * @param params - {@link UseGetNlgInsightsParams}
 * @param enabled - boolean flag to enable/disable this hook
 * @internal
 */
export const useGetNlgInsightsInternal = (
  params: GetNlgInsightsProps | GetNlgInsightsRequest,
  enabled = true,
): UseGetNlgInsightsState => {
  const payload: GetNlgInsightsRequest = useMemo(() => {
    return prepareGetNlgInsightsPayload(params);
  }, [params]);

  const api = useChatApi();

  const { data, error, isError, isLoading, isSuccess, refetch } = useQuery({
    queryKey: ['getNlgInsights', payload, api],
    queryFn: () => api?.ai.getNlgInsights(payload),
    select: (data) => data?.data?.answer,
    enabled: !!api && enabled,
  });

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    refetch: useCallback(() => {
      refetch();
    }, [refetch]),
  };
};

/**
 * @internal
 */
const useGetNlgInsightsWithoutTracking = (params: UseGetNlgInsightsParams) => {
  const { enabled, ...restParams } = params;
  return useGetNlgInsightsInternal(restParams, enabled);
};

/**
 * React hook that fetches an analysis of the provided query using natural language generation (NLG).
 * Specifying a query is similar to providing parameters to a {@link useExecuteQuery} hook, using dimensions, measures, and filters.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetNlgInsights({
 *   dataSource: 'Sample ECommerce',
 *   dimensions: [DM.Commerce.Date.Years],
 *   measures: [measureFactory.sum(DM.Commerce.Revenue)],
 * });
 *
 * if (isLoading) {
 *   return <div>Loading...</div>;
 * }
 *
 * return <p>{data}</p>;
 * ```
 * @returns Response object containing a text summary
 * @group Generative AI
 */
export const useGetNlgInsights = withTracking('useGetNlgInsights')(
  useGetNlgInsightsWithoutTracking,
);
