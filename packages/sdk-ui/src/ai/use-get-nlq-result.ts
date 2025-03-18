import { withTracking } from '@/decorators/hook-decorators';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useChatApi } from './api/chat-api-provider';
import { widgetComposer } from '@/analytics-composer';
import { WidgetProps } from '@/props';
import { DataSource } from '@sisense/sdk-data';
import { HookEnableParam } from '@/common/hooks/types';
import { GetNlqResultRequest, NLQ_RESULT_CHART_TYPES, NlqResultChartType } from './api/types';

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
   * @internal
   */
  enableAxisTitlesInWidgetProps?: boolean;
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

  const { isLoading, isError, isSuccess, data, error, refetch } = useQuery({
    queryKey: ['getNlqResult', contextTitle, request, api],
    queryFn: () => api?.ai.getNlqResult(contextTitle, request),
    enabled: !!api && params.enabled,
  });

  const widgetProps = data
    ? widgetComposer.toWidgetProps(data, {
        useCustomizedStyleOptions: params.enableAxisTitlesInWidgetProps || false,
      })
    : undefined;

  return {
    isLoading,
    isError,
    isSuccess,
    data: widgetProps,
    error,
    refetch: useCallback(() => {
      refetch();
    }, [refetch]),
  };
};

/**
 * React hook that enables natural language query (NLQ) against a data model or perspective.
 *
 * ::: warning Note
 * This hook is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
 * :::
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
