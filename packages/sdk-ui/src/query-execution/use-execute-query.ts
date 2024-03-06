/* eslint-disable max-lines-per-function */
import { isEqual } from 'lodash';
import { useEffect, useReducer, useState } from 'react';
import { usePrevious } from '../common/hooks/use-previous';
import { executeQuery } from '../query/execute-query';
import { isFiltersChanged, isRelationsChanged } from '../utils/filters-comparator';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { queryStateReducer } from './query-state-reducer';
import { TranslatableError } from '../translation/translatable-error';
import { withTracking } from '../decorators/hook-decorators';
import { ExecuteQueryParams, QueryState } from './types';
import { getFilterListAndRelations } from '@sisense/sdk-data';

/**
 * React hook that executes a data query.
 * This approach, which offers an alternative to {@link ExecuteQuery} component, is similar to React Query's `useQuery` hook.
 *
 * @example
 ```tsx
  const { data, isLoading, isError } = useExecuteQuery({
    dataSource: DM.DataSource,
    dimensions: [DM.Commerce.AgeRange],
    measures: [measureFactory.sum(DM.Commerce.Revenue)],
    filters: [filterFactory.greaterThan(DM.Commerce.Revenue, 1000)],
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }
  if (data) {
    return <div>{`Total Rows: ${data.rows.length}`}</div>;
  }
  return null;
 ```

 * See also hook {@link useExecuteQueryByWidgetId}, which extracts data from an existing widget in the Sisense instance.
 *
 * See [this blog post]( https://www.sisense.com/blog/take-control-of-your-data-visualizations/) for examples
 * of using the hook to fetch data from Sisense for third-party charts.
 * @param params - Parameters of the query
 * @returns Query state that contains the status of the query execution, the result data, or the error if any occurred
 */
export const useExecuteQuery = withTracking('useExecuteQuery')(useExecuteQueryInternal);

/**
 * {@link useExecuteQuery} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @internal
 */
export function useExecuteQueryInternal(params: ExecuteQueryParams): QueryState {
  const prevParams = usePrevious(params);
  const [queryState, dispatch] = useReducer(queryStateReducer, {
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
    if (isNeverExecuted || isQueryParamsChanged(prevParams, params)) {
      if (isNeverExecuted) {
        setIsNeverExecuted(false);
      }
      const {
        dataSource,
        dimensions,
        measures,
        filters,
        highlights,
        count,
        offset,
        onBeforeQuery,
      } = params;

      const { filters: filterList, relations: filterRelations } =
        getFilterListAndRelations(filters);
      void executeQuery(
        {
          dataSource,
          dimensions,
          measures,
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
  if (queryState.data && isQueryParamsChanged(prevParams, params)) {
    return queryStateReducer(queryState, { type: 'loading' });
  }

  return queryState;
}

/** List of parameters that can be compared by deep comparison */
const simplySerializableParamNames: (keyof ExecuteQueryParams)[] = [
  'dataSource',
  'dimensions',
  'measures',
  'count',
  'offset',
  'onBeforeQuery',
];

/**
 * Checks if the query parameters have changed by deep comparison.
 *
 * @param prevParams - Previous query parameters
 * @param newParams - New query parameters
 */
export function isQueryParamsChanged(
  prevParams: ExecuteQueryParams | undefined,
  newParams: ExecuteQueryParams,
): boolean {
  if (!prevParams && newParams) {
    return true;
  }
  const isSimplySerializableParamsChanged = simplySerializableParamNames.some(
    (paramName) => !isEqual(prevParams?.[paramName], newParams[paramName]),
  );

  const { filters: prevFilterList, relations: prevRelationsList } = getFilterListAndRelations(
    prevParams?.filters,
  );
  const { filters: newFilterList, relations: newRelationsList } = getFilterListAndRelations(
    newParams?.filters,
  );

  // TODO: check if relations are changed
  // Function has to compare logical structure of relations, not just references
  const isSliceFiltersChanged = isFiltersChanged(prevFilterList, newFilterList);
  const isFilterRelationsChanged =
    isSliceFiltersChanged ||
    isRelationsChanged(prevFilterList, newFilterList, prevRelationsList, newRelationsList);
  const isHighlightFiltersChanged = isFiltersChanged(prevParams!.highlights, newParams.highlights);

  return (
    isSimplySerializableParamsChanged ||
    isSliceFiltersChanged ||
    isHighlightFiltersChanged ||
    isFilterRelationsChanged
  );
}
