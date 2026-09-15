import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

/**
 * React hook that returns the QueryCacheClient module instance to control query cache.
 *
 * How to enable query cache see in [Query Caching guide](/guides/sdk/guides/client-query-caching.html)
 *
 * @example
 * ```tsx
 * import { useQueryCache } from '@sisense/sdk-ui';
 *
 * const CodeExample = () => {
 *   const queryCache = useQueryCache();
 *
 *   return <button onClick={() => queryCache?.clear()}>Clear query cache</button>;
 * };
 *
 * export default CodeExample;
 * ```
 *
 * @returns QueryCacheClient instance
 * @group Queries
 *
 * @beta
 */
export function useQueryCache() {
  const app = useSisenseContext().app;
  return app?.queryCache;
}
