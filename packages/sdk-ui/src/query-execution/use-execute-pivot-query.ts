/* eslint-disable max-lines-per-function */
import { useEffect, useReducer } from 'react';
import { useHasChanged } from '../common/hooks/use-has-changed';
import { executePivotQuery } from '../query/execute-query';
import { isFiltersChanged } from '../utils/filters-comparator';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { TranslatableError } from '../translation/translatable-error';
import { withTracking } from '../decorators/hook-decorators';
import { ExecutePivotQueryParams, PivotQueryState } from './types';
import { pivotQueryStateReducer } from './pivot-query-state-reducer';
import { getFilterListAndRelations } from '@sisense/sdk-data';
import { useShouldLoad } from '../common/hooks/use-should-load';

/**
 * React hook that executes a data query for a pivot table.
 * This approach is similar to React Query's `useQuery` hook.
 *
 * ## Example
 *
 * Execute a pivot query on the Sample ECommerce data model and display the results in a table.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=queries%2Fuse-execute-pivot-query&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * @returns Query state that contains the status of the query execution, the result data, or the error if any occurred
 * @group Queries
 * @beta
 */
export const useExecutePivotQuery = withTracking('useExecutePivotQuery')(
  useExecutePivotQueryInternal,
);

/**
 * {@link useExecutePivotQuery} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @param params - Parameters of the query
 * @internal
 */
export function useExecutePivotQueryInternal(params: ExecutePivotQueryParams): PivotQueryState {
  const isPivotQueryParamsChanged = usePivotQueryParamsChanged(params);
  const shouldLoad = useShouldLoad(params, isPivotQueryParamsChanged);
  const [queryState, dispatch] = useReducer(pivotQueryStateReducer, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });
  const { isInitialized, app } = useSisenseContext();

  useEffect(() => {
    if (!isInitialized) {
      dispatch({
        type: 'error',
        error: new TranslatableError('errors.executeQueryNoSisenseContext'),
      });
    }
    if (shouldLoad(app)) {
      dispatch({ type: 'loading' });
      const {
        dataSource,
        rows,
        columns,
        values,
        grandTotals,
        filters,
        highlights,
        count,
        offset,
        onBeforeQuery,
      } = params;

      const { filters: filterList, relations: filterRelations } =
        getFilterListAndRelations(filters);

      void executePivotQuery(
        {
          dataSource,
          rows,
          columns,
          values,
          grandTotals,
          filters: filterList,
          filterRelations,
          highlights,
          count,
          offset,
        },
        app,
        { onBeforeQuery },
      )
        .then((data) => {
          dispatch({ type: 'success', data });
        })
        .catch((error: Error) => {
          dispatch({ type: 'error', error });
        });
    }
  }, [app, isInitialized, params, shouldLoad]);

  // Return the loading state on the first render, before the loading action is
  // dispatched in useEffect().
  if (queryState.data && isPivotQueryParamsChanged) {
    return pivotQueryStateReducer(queryState, { type: 'loading' });
  }

  return queryState;
}

/** List of parameters that can be compared by deep comparison */
const simplySerializableParamNames: (keyof ExecutePivotQueryParams)[] = [
  'dataSource',
  'rows',
  'columns',
  'values',
  'grandTotals',
  'count',
  'offset',
  'onBeforeQuery',
];

/**
 * Checks if the query parameters have changed by deep comparison.
 *
 * @param params - New query parameters
 */
export function usePivotQueryParamsChanged(params: ExecutePivotQueryParams) {
  return useHasChanged(params, simplySerializableParamNames, (params, prev) => {
    // Function has to compare logical structure of relations, not just references
    const { filters: prevFilterList } = getFilterListAndRelations(prev.filters);
    const { filters: newFilterList } = getFilterListAndRelations(params.filters);
    return (
      isFiltersChanged(prevFilterList, newFilterList) ||
      isFiltersChanged(prev.highlights, params.highlights)
    );
  });
}
