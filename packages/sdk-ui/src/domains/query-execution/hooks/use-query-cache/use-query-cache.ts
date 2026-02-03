import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

/**
 * React hook that returns the QueryCacheClient module instance to control query cache.
 *
 * How to enable query cache see in [Query Caching guide](/guides/sdk/guides/client-query-caching.html)
 *
 * @returns QueryCacheClient instance
 * @group Queries
 * @alpha
 */
export function useQueryCache() {
  const app = useSisenseContext().app;
  return app?.queryCache;
}
