import { useCallback } from 'react';

import type { HttpClient } from '@sisense/sdk-rest-client';
import { useQuery } from '@tanstack/react-query';

import { RestApi } from '@/infra/api/rest-api.js';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context.js';
import { getDataSourceLabel, type LabelableDataSource } from '@/shared/utils/data-sources-utils.js';

const DATA_SOURCE_DISPLAY_NAMES_QUERY_KEY = 'getDataSourceDisplayNames';

/** How long loaded display names are considered fresh. Data models can be renamed at any time. */
const DISPLAY_NAMES_STALE_TIME_MS = 60_000;

/**
 * Loads display names by data source title. Never rejects. On any failure, for example an older
 * Sisense version without the endpoint or field, it logs and returns no display names.
 *
 * @param httpClient - HTTP client of the current app.
 * @returns Display names by data source title.
 */
const fetchDataSourceDisplayNames = async (
  httpClient: HttpClient,
): Promise<ReadonlyMap<string, string>> => {
  try {
    const list = await new RestApi(httpClient).getDataSourceList();
    const items = Array.isArray(list) ? list : [];
    return new Map(
      items.flatMap(({ title, displayName }) =>
        typeof displayName === 'string' ? [[title, displayName] as const] : [],
      ),
    );
  } catch (error) {
    console.warn('Unable to load data source display names, falling back to titles.', error);
    return new Map();
  }
};

/**
 * Returns a resolver of the user-visible label of a data source: its display name, else its title.
 *
 * Display names are cached per app for a minute and refetched when a consumer mounts after that,
 * so a rename shows up the next time a consumer opens. Until they load, or when they are
 * unavailable, the resolver returns the data source `title`.
 *
 * @returns Function resolving a data source to its label.
 * @internal
 */
export const useDataSourceLabelResolver = (): ((dataSource: LabelableDataSource) => string) => {
  const { app, isInitialized } = useSisenseContext();
  const httpClient = isInitialized ? app?.httpClient : undefined;

  const { data: displayNames } = useQuery({
    queryKey: [DATA_SOURCE_DISPLAY_NAMES_QUERY_KEY, httpClient?.url],
    queryFn: () => (httpClient ? fetchDataSourceDisplayNames(httpClient) : new Map()),
    enabled: !!httpClient,
    retry: false,
    staleTime: DISPLAY_NAMES_STALE_TIME_MS,
    // The shared query client disables refetch on mount; opening a consumer must pick up a rename.
    refetchOnMount: true,
  });

  return useCallback(
    (dataSource: LabelableDataSource) => getDataSourceLabel(dataSource, displayNames),
    [displayNames],
  );
};
