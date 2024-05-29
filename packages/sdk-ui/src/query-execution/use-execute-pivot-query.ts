/* eslint-disable max-lines-per-function */
import isEqual from 'lodash/isEqual';
import { useEffect, useReducer, useState } from 'react';
import { usePrevious } from '../common/hooks/use-previous';
import { executePivotQuery } from '../query/execute-query';
import { isFiltersChanged } from '../utils/filters-comparator';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { TranslatableError } from '../translation/translatable-error';
import { withTracking } from '../decorators/hook-decorators';
import { ExecutePivotQueryParams, PivotQueryState } from './types';
import { pivotQueryStateReducer } from './pivot-query-state-reducer';
import { getFilterListAndRelations } from '@sisense/sdk-data';

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
 * @param params - Parameters of the query
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
 * @internal
 */
export function useExecutePivotQueryInternal(params: ExecutePivotQueryParams): PivotQueryState {
  const prevParams = usePrevious(params);
  const [queryState, dispatch] = useReducer(pivotQueryStateReducer, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });
  const { isInitialized, app } = useSisenseContext();

  const [isNeverExecuted, setIsNeverExecuted] = useState(true);

  useEffect(() => {
    if (!isInitialized) {
      dispatch({
        type: 'error',
        error: new TranslatableError('errors.executeQueryNoSisenseContext'),
      });
    }
    if (!app) {
      return;
    }
    if (params?.enabled === false) {
      return;
    }

    if (isNeverExecuted || isPivotQueryParamsChanged(prevParams, params)) {
      if (isNeverExecuted) {
        setIsNeverExecuted(false);
      }
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
  }, [app, isInitialized, prevParams, params, isNeverExecuted]);

  // Return the loading state on the first render, before the loading action is
  // dispatched in useEffect().
  if (queryState.data && isPivotQueryParamsChanged(prevParams, params)) {
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
 * TODO refactor to reuse isQueryParamsChanged
 *
 * @param prevParams - Previous query parameters
 * @param newParams - New query parameters
 */
export function isPivotQueryParamsChanged(
  prevParams: ExecutePivotQueryParams | undefined,
  newParams: ExecutePivotQueryParams,
): boolean {
  if (!prevParams && newParams) {
    return true;
  }
  const isSimplySerializableParamsChanged = simplySerializableParamNames.some(
    (paramName) => !isEqual(prevParams?.[paramName], newParams[paramName]),
  );

  const { filters: prevFilterList } = getFilterListAndRelations(prevParams?.filters);
  const { filters: newFilterList } = getFilterListAndRelations(newParams?.filters);

  // Function has to compare logical structure of relations, not just references
  const isRelationsChanged = false;
  const isSliceFiltersChanged = isFiltersChanged(prevFilterList, newFilterList);
  const isHighlightFiltersChanged = isFiltersChanged(prevParams!.highlights, newParams.highlights);

  return (
    isSimplySerializableParamsChanged ||
    isSliceFiltersChanged ||
    isHighlightFiltersChanged ||
    isRelationsChanged
  );
}
