import { useCallback } from 'react';

import { DataSource } from '@sisense/sdk-data';
import { useQuery } from '@tanstack/react-query';

import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { withTracking } from '@/infra/decorators/hook-decorators';
import { widgetComposer } from '@/modules/analytics-composer';
import { HookEnableParam } from '@/shared/hooks/types';

import { useChatApi } from './api/chat-api-provider.js';
import { ChatRestApi } from './api/chat-rest-api.js';
import {
  GetNlqResultRequest,
  NLQ_RESULT_CHART_TYPES,
  NlqResult,
  NlqResultChartType,
} from './api/types.js';

export interface GetNlqResultParams {
  /** Data source for queries to run against */
  dataSource: DataSource;

  /** Text containing the natural language query */
  query: string;

  /** Possible chart types to be used in NLQ results */
  chartTypes?: NlqResultChartType[];

  /**
   * Enable suggested axis titles in generated widget
   *
   * If not specified, the default value is `false`
   *
   * @internal
   */
  enableAxisTitlesInWidgetProps?: boolean;
}

/**
 * Result type for NLQ request execution
 *
 * @internal
 */
export interface ExecuteGetNlqResult {
  /** Raw NLQ response from API for additional processing */
  nlqResult: NlqResult | undefined;
  /** Processed widget props ready for rendering */
  widgetProps: WidgetProps | undefined;
}

/** @internal */
export function prepareGetNlqResultPayload(params: GetNlqResultParams): {
  contextTitle: string;
  request: GetNlqResultRequest;
} {
  const { dataSource, query, chartTypes } = params;
  const dataSourceTitle = typeof dataSource === 'string' ? dataSource : dataSource.title;

  return {
    contextTitle: dataSourceTitle,
    request: {
      text: query,
      // Timezone is not used by AI API, but it is currently required by the endpoint
      timezone: 'UTC',
      chartTypes: chartTypes ?? [...NLQ_RESULT_CHART_TYPES],
    },
  };
}

/**
 * Executes a natural language query request and returns processed widget props along with the raw response.
 *
 * @param params - NLQ query parameters
 * @param api - Chat REST API instance
 * @returns Promise resolving to processed widget props and raw response
 * @internal
 */
export async function executeGetNlqResult(
  params: GetNlqResultParams,
  api: ChatRestApi,
): Promise<ExecuteGetNlqResult> {
  const { contextTitle, request } = prepareGetNlqResultPayload(params);

  const nlqResult = await api.ai.getNlqResult(contextTitle, request);

  const widgetProps = nlqResult
    ? widgetComposer.toWidgetProps(nlqResult, {
        useCustomizedStyleOptions: params.enableAxisTitlesInWidgetProps || false,
      })
    : undefined;

  return {
    widgetProps: widgetProps,
    nlqResult: nlqResult,
  };
}

/**
 * Parameters for {@link useGetNlqResult} hook.
 */
export interface UseGetNlqResultParams extends GetNlqResultParams, HookEnableParam {}

/**
 * State for {@link useGetNlqResult} hook.
 */
export interface UseGetNlqResultState {
  /** Whether the data fetching is loading */
  isLoading: boolean;
  /** Whether the data fetching has failed */
  isError: boolean;
  /** Whether the data fetching has succeeded */
  isSuccess: boolean;
  /** The result data */
  data: WidgetProps | undefined;
  /** The error if any occurred */
  error: unknown;
  /** Callback to trigger a refetch of the data */
  refetch: () => void;
}

/**
 * @param params - {@link UseGetNlqResultParams}
 * @internal
 */
export const useGetNlqResultInternal = (params: UseGetNlqResultParams): UseGetNlqResultState => {
  const { contextTitle, request } = prepareGetNlqResultPayload(params);
  const api = useChatApi();

  const cacheKey = ['getNlqResult', contextTitle, request, api];
  const { isLoading, isError, isSuccess, data, error, refetch } = useQuery({
    queryKey: cacheKey,
    queryFn: () =>
      api
        ? executeGetNlqResult(params, api).then((result) => result.widgetProps)
        : Promise.reject('No API available'),
    enabled: !!api && params.enabled,
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
 * React hook that enables natural language query (NLQ) against a data model or perspective.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetNlqResult({
 *    dataSource: 'Sample ECommerce',
 *    query: 'Show me total revenue by age range'
 * });
 *
 * if (isLoading) {
 *   return <div>Loading...</div>;
 * }
 *
 * return (
 *   {
 *      data &&
 *      <Widget {...data} />
 *   }
 * );
 * ```
 * @returns NLQ load state that contains the status of the execution, the result (data) as WidgetProps
 * @group Generative AI
 * @beta
 */
export const useGetNlqResult = withTracking('useGetNlqResult')(useGetNlqResultInternal);
