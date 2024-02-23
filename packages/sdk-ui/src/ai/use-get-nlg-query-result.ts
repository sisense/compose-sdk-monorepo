import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { withTracking } from '@/decorators/hook-decorators';
import { useChatApi } from './api/chat-api-provider.js';
import type { GetNlgQueryResultRequest } from './api/types.js';

/**
 * Parameters for {@link useGetNlgQueryResult} hook.
 *
 */
export interface UseGetNlgQueryResultParams extends GetNlgQueryResultRequest {
  /**
   * Boolean flag to enable/disable API call by default
   *
   * If not specified, the default value is `true`
   */
  enabled?: boolean;
}

export const useGetNlgQueryResultInternal = (params: UseGetNlgQueryResultParams) => {
  const { enabled = true, ...payload } = params;

  const api = useChatApi();

  const { data, isError, isLoading, isSuccess, fetchStatus, refetch } = useQuery({
    queryKey: ['getNlgQueryResult', payload, api],
    queryFn: () => api?.ai.getNlgQueryResult(payload),
    select: (data) => data?.data?.answer,
    enabled: !!api && enabled,
  });

  return {
    data,
    isError,
    isLoading,
    isSuccess,
    fetchStatus,
    refetch: useCallback(() => {
      refetch();
    }, [refetch]),
  };
};

/**
 * React hook that fetches an analysis of the provided JAQL using natural language generation (NLG).
 *
 * Note that in the example below, this hook expects `metadata` to be in standard JAQL syntax.
 *
 * ::: warning Note
 * This hook is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
 * :::
 *
 * @example
 * ```tsx
 * import { SisenseContextProvider } from '@sisense/sdk-ui';
 * import { AiContextProvider, useGetNlgQueryResult } from '@sisense/sdk-ui/ai';
 *
 * function Page() {
 *   const { data } = useGetNlgQueryResult({
 *     jaql: {
 *       datasource: { title: 'Sample ECommerce' },
 *       metadata: [
 *         {
 *           jaql: {
 *             column: 'Date',
 *             datatype: 'datetime',
 *             dim: '[Commerce.Date]',
 *             firstday: 'mon',
 *             level: 'years',
 *             table: 'Commerce',
 *             title: 'Date',
 *           },
 *         },
 *         {
 *           jaql: {
 *             agg: 'sum',
 *             column: 'Revenue',
 *             datatype: 'numeric',
 *             dim: '[Commerce.Revenue]',
 *             table: 'Commerce',
 *             title: 'total of Revenue',
 *           },
 *         },
 *       ],
 *     },
 *     style: 'Large',
 *   });
 *   return (
 *     <>
 *       <h1>Summary</h1>
 *       <p>{data}</p>
 *     </>
 *   );
 * }
 *
 * function App() {
 *   return (
 *     <SisenseContextProvider {...sisenseContextProps}>
 *       <AiContextProvider>
 *         <Page />
 *       </AiContextProvider>
 *     </SisenseContextProvider>
 *   );
 * }
 * ```
 * @param params - {@link UseGetNlgQueryResultParams}
 * @returns Response object containing a text summary
 * @beta
 */
export const useGetNlgQueryResult = withTracking('useGetNlgQueryResult')(
  useGetNlgQueryResultInternal,
);
