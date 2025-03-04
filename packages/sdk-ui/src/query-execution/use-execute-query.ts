import { useCallback, useEffect, useReducer, useState } from 'react';
import {
  clearExecuteQueryCache,
  createExecuteQueryCacheKey,
  executeQueryWithCache,
  executeQuery as executeQueryWithoutCache,
} from '../query/execute-query';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { queryStateReducer } from './query-state-reducer';
import { TranslatableError } from '../translation/translatable-error';
import { withTracking } from '../decorators/hook-decorators';
import { ExecuteQueryParams, ExecuteQueryResult } from './types';
import { getFilterListAndRelationsJaql } from '@sisense/sdk-data';
import { ClientApplication } from '@/app/client-application';
import { CacheKey } from '@/utils/create-cache';
import { useQueryParamsChanged } from '@/query-execution/query-params-comparator';
import { useShouldLoad } from '../common/hooks/use-should-load';

/**
 * React hook that executes a data query.
 *
 * This approach, which offers an alternative to the {@link ExecuteQuery} component, is similar to React Query's `useQuery` hook.
 *
 * ## Example
 *
 * Execute a query to retrieve revenue per country per year from the Sample ECommerce data model. Then display the data in a table and column chart.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=queries%2Fuse-execute-query-sorting&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * Additional `useExecuteQuery()` examples:
 *
 * - [Query with Sorting](https://www.sisense.com/platform/compose-sdk/playground/?example=queries%2Fuse-execute-query-sorting)
 * - [Take Control of Your Data Visualizations]( https://www.sisense.com/blog/take-control-of-your-data-visualizations/) blog post with examples of using the hook to fetch data to display in third-party charts.
 *
 * @returns Query state that contains the status of the query execution, the result data, or the error if any occurred
 * @group Queries
 */
export const useExecuteQuery = withTracking('useExecuteQuery')(useExecuteQueryInternal);

/**
 * {@link useExecuteQuery} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @param params - Parameters of the query
 * @internal
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function useExecuteQueryInternal(params: ExecuteQueryParams): ExecuteQueryResult {
  const isParamsChanged = useQueryParamsChanged(params);
  const shouldLoad = useShouldLoad(params, isParamsChanged);
  const [shouldForceRefetch, setShouldForceRefetch] = useState(false);
  const [lastQueryCacheKey, setLastQueryCacheKey] = useState<CacheKey | undefined>();
  const { isInitialized, app } = useSisenseContext();
  const isCacheEnabled = app?.settings.queryCacheConfig?.enabled;
  const executeQuery = isCacheEnabled ? executeQueryWithCache : executeQueryWithoutCache;

  const [loadMoreOffset, setLoadMoreOffset] = useState(
    (params.offset ?? 0) + (params.count ?? app?.settings.queryLimit ?? 0),
  );
  const [loadMoreCount, setLoadMoreCount] = useState(0);
  const [isAllItemsLoaded, setIsAllItemsLoaded] = useState(false);
  const [shouldLoadMore, setShouldLoadMore] = useState(false);

  const resetLoadMore = useCallback(() => {
    setLoadMoreOffset((params.offset ?? 0) + (params.count ?? app?.settings.queryLimit ?? 0));
    setIsAllItemsLoaded(false);
    setLoadMoreCount(0);
    setShouldLoadMore(false);
  }, [params, app]);

  useEffect(() => {
    if (isParamsChanged) {
      resetLoadMore();
    }
  }, [resetLoadMore, isParamsChanged]);

  const [queryState, dispatch] = useReducer(queryStateReducer, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

  const refetch = useCallback(() => {
    if (isCacheEnabled && lastQueryCacheKey) {
      clearExecuteQueryCache(lastQueryCacheKey);
      setLastQueryCacheKey(undefined);
    }
    if (!queryState.isLoading) {
      resetLoadMore();
      setShouldForceRefetch(true);
    }
  }, [isCacheEnabled, lastQueryCacheKey, queryState.isLoading, resetLoadMore]);

  const runQuery = useCallback(
    (app: ClientApplication, params: ExecuteQueryParams, extendData = false) => {
      const {
        dataSource,
        dimensions,
        measures,
        filters,
        highlights,
        count = app.settings.queryLimit,
        offset,
        ungroup,
        onBeforeQuery,
      } = params;

      dispatch({ type: 'loading' });

      const { filters: filterList, relations: filterRelations } =
        getFilterListAndRelationsJaql(filters);
      const executeQueryParams: Parameters<typeof executeQuery> = [
        {
          dataSource,
          dimensions,
          measures,
          filters: filterList,
          filterRelations,
          highlights,
          count,
          offset,
          ungroup,
        },
        app,
        { onBeforeQuery },
      ];
      if (isCacheEnabled) {
        const newQueryCacheKey = createExecuteQueryCacheKey(...executeQueryParams);
        if (lastQueryCacheKey !== newQueryCacheKey) {
          setLastQueryCacheKey(newQueryCacheKey);
        }
      }
      void executeQuery(...executeQueryParams)
        .then((data) => {
          if (count > data.rows.length) {
            setIsAllItemsLoaded(true);
          }
          dispatch({ type: extendData ? 'success-load-more' : 'success', data });
        })
        .catch((error: Error) => {
          dispatch({ type: 'error', error });
        });
    },
    [executeQuery, isCacheEnabled, lastQueryCacheKey],
  );

  const loadMore = useCallback(
    (count: number) => {
      if (
        params.enabled !== false &&
        app &&
        count > 0 &&
        !isAllItemsLoaded &&
        !queryState.isError &&
        !queryState.isLoading
      ) {
        setLoadMoreCount(count);
        setShouldLoadMore(true);
      }
    },
    [
      params,
      app,
      isAllItemsLoaded,
      setLoadMoreCount,
      queryState.isLoading,
      queryState.isError,
      setShouldLoadMore,
    ],
  );

  useEffect(() => {
    if (isInitialized && shouldLoadMore && app) {
      runQuery(
        app,
        {
          ...params,
          count: loadMoreCount,
          offset: loadMoreOffset,
        },
        true,
      );

      setLoadMoreOffset(loadMoreOffset + loadMoreCount);
      setShouldLoadMore(false);
    }
  }, [isInitialized, params, loadMoreOffset, loadMoreCount, shouldLoadMore, app, runQuery]);

  useEffect(() => {
    if (!isInitialized) {
      dispatch({
        type: 'error',
        error: new TranslatableError('errors.executeQueryNoSisenseContext'),
      });
    }
    if (shouldForceRefetch) {
      setShouldForceRefetch(false);
    }
    if (shouldLoad(app, shouldForceRefetch)) {
      runQuery(app, params);
    }
  }, [app, executeQuery, isInitialized, params, runQuery, shouldLoad, shouldForceRefetch]);

  // Return the loading state on the first render, before the loading action is
  // dispatched in useEffect().
  if (queryState.data && isParamsChanged) {
    return { ...queryStateReducer(queryState, { type: 'loading' }), refetch, loadMore };
  }

  return { ...queryState, refetch, loadMore };
}
