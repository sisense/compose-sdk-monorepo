import { useCallback, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  prepareGetNlgInsightsPayload,
  type UseGetNlgInsightsParams,
} from '@/domains/narrative/core/build-narrative-request.js';
import type { GetNlgInsightsRequest } from '@/infra/api/narrative/narrative-api-types.js';
import { getNarrative } from '@/infra/api/narrative/narrative-endpoints.js';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { withTracking } from '@/infra/decorators/hook-decorators';

import type { GetNlgInsightsProps } from './get-nlg-insights.js';

export { prepareGetNlgInsightsPayload, type UseGetNlgInsightsParams };

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
  const { app } = useSisenseContext();
  const httpClient = app?.httpClient;

  const narrationOptions = useMemo(
    () => ({
      isUnifiedNarrationEnabled: app?.settings?.isUnifiedNarrationEnabled ?? false,
      isSisenseAiEnabled: app?.settings?.isSisenseAiEnabled ?? false,
    }),
    [app?.settings?.isUnifiedNarrationEnabled, app?.settings?.isSisenseAiEnabled],
  );

  const payload: GetNlgInsightsRequest = useMemo(() => {
    return prepareGetNlgInsightsPayload(params);
  }, [params]);

  const { data, error, isError, isLoading, isSuccess, refetch } = useQuery({
    queryKey: ['narrative', payload, narrationOptions],
    queryFn: () => {
      if (!httpClient) {
        return Promise.reject(new Error('HttpClient is required for narrative requests'));
      }
      return getNarrative(httpClient, payload, narrationOptions);
    },
    select: (response) => response?.data?.answer,
    enabled,
  });

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    refetch: useCallback(() => {
      void refetch();
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
