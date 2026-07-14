import type { HttpClient } from '@sisense/sdk-rest-client';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

/**
 * Returns the authenticated HTTP client from SisenseContext.
 *
 * Use this to make authorized REST API calls from components wrapped inside
 * `SisenseContextProvider` when domain-specific hooks are not available.
 *
 * @returns HttpClient when the app is initialized, undefined otherwise
 *
 * @sisenseInternal
 */
export const useHttpClient = (): HttpClient | undefined => {
  const { app } = useSisenseContext();
  return app?.httpClient;
};
