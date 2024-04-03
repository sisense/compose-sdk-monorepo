import { withTracking } from '@/decorators/hook-decorators';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { useQuery, type UseQueryResult as TanstackUseQueryResult } from '@tanstack/react-query';

/**
 * Additional request configuration options for the `useFetch` hook.
 */
export type RequestConfig = {
  /**
   * Indicates that the request body is not a JSON object.
   */
  nonJSONBody?: boolean;
  /**
   * Indicates that the response should be treated as a Blob.
   */
  returnBlob?: boolean;
};

/**
 * The result of the `useFetch` hook.
 * Return value of the `useQuery` hook from `@tanstack/react-query`.
 * @link https://tanstack.com/query/v4/docs/framework/react/reference/useQuery
 *
 * @template TData - The type of the data returned by the fetch request
 * @template TError - The type of the error returned by the fetch request
 */
export type UseQueryResult<TData, TError> = TanstackUseQueryResult<TData, TError>;

/**
 * React hook that allows to make authorized fetch request to any Sisense API.
 *
 * @example
 ```tsx
  const { data, isLoading, error } = useFetch<unknown, Error>('api/v1/elasticubes/getElasticubes', {
    method: 'POST',
  });
 ```
 * @param path - The endpoint path to fetch data from. This should be a relative path like '/api/v1/endpoint'.
 * @param init - The request init object
 * @param options - The additional request options
 * @returns Query state that contains the status of the query execution, the result data, or the error if any occurred
 * @group Fusion Embed
 */
export const useFetch = withTracking('useFetch')(
  <TData = unknown, TError = unknown>(
    path: string,
    init?: RequestInit,
    options?: {
      requestConfig?: RequestConfig;
      enabled?: boolean;
    },
  ): UseQueryResult<TData, TError> => {
    const { app } = useSisenseContext();
    const httpClient = app?.httpClient;

    const enabled = options?.enabled ?? true;

    return useQuery({
      queryKey: ['fetch', path, init, options?.requestConfig],
      queryFn: async () => {
        if (!httpClient) {
          throw new Error('HttpClient is not available');
        }
        return httpClient.call(httpClient.url + path, init ?? {}, {
          ...options?.requestConfig,
          skipTrackingParam: true,
        });
      },
      enabled: enabled && !!httpClient, // Ensure the query is enabled only when httpClient is available
    });
  },
);
