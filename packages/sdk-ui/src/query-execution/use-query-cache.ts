import { useSisenseContext } from '@/sisense-context/sisense-context';

/**
 * React hook that returns the instance to manage query cache.
 *
 * @returns Query cache
 * @group Queries
 * @alpha
 */
export function useQueryCache() {
  const app = useSisenseContext().app;
  return app?.queryCache;
}
