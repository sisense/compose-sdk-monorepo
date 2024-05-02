import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { withTracking } from '@/decorators/hook-decorators';
import { useChatApi } from './api/chat-api-provider';
import {
  Attribute,
  DataSource,
  Filter,
  FilterRelations,
  getFilterListAndRelations,
  isDataSourceInfo,
  Measure,
} from '@sisense/sdk-data';
import { GetNlgQueryResultRequest } from './api/types';
import { GetNlgQueryResultProps } from './get-nlg-query-result';
import { getJaqlQueryPayload, JaqlDataSource } from '@sisense/sdk-query-client';

/**
 * Parameters for {@link useGetNlgQueryResult} hook.
 */
export interface UseGetNlgQueryResultParams {
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
}

/**
 * State for {@link useGetNlgQueryResult} hook.
 */
export interface UseGetNlgQueryResultState {
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

/**
 * @internal
 */
export const useGetNlgQueryResultInternal = (
  params: GetNlgQueryResultProps | GetNlgQueryResultRequest,
  enabled = true,
): UseGetNlgQueryResultState => {
  const payload: GetNlgQueryResultRequest = useMemo(() => {
    if ('jaql' in params) {
      return params;
    } else {
      let datasource: JaqlDataSource;
      if (isDataSourceInfo(params.dataSource)) {
        datasource = { title: params.dataSource.title, live: params.dataSource.type === 'live' };
      } else {
        datasource = params.dataSource;
      }

      const { filters = [], relations } = getFilterListAndRelations(params.filters);
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

      return {
        jaql: {
          datasource,
          metadata,
          filterRelations,
        },
      };
    }
  }, [params]);

  const api = useChatApi();

  const { data, error, isError, isLoading, isSuccess, refetch } = useQuery({
    queryKey: ['getNlgQueryResult', payload, api],
    queryFn: () => api?.ai.getNlgQueryResult(payload),
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
const useGetNlgQueryResultWithoutTracking = (params: UseGetNlgQueryResultParams) => {
  const { enabled, ...restParams } = params;
  return useGetNlgQueryResultInternal(restParams, enabled);
};

/**
 * React hook that fetches an analysis of the provided query using natural language generation (NLG).
 * Specifying a query is similar to providing parameters to a {@link useExecuteQuery} hook, using dimensions, measures, and filters.
 *
 * ::: warning Note
 * This hook is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
 * :::
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetNlgQueryResult({
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
 * @param params - {@link UseGetNlgQueryResultParams}
 * @returns Response object containing a text summary
 * @group Generative AI
 * @beta
 */
export const useGetNlgQueryResult = withTracking('useGetNlgQueryResult')(
  useGetNlgQueryResultWithoutTracking,
);
