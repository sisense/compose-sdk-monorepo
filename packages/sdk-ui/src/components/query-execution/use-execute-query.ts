import { Attribute, DataSource, Filter, Measure } from '@sisense/sdk-data';
import { isEqual } from 'lodash';
import { useEffect, useReducer, useRef, useState } from 'react';
import { translation } from '../../locales/en';
import { executeQuery } from '../../query/execute-query';
import { isFiltersChanged } from '../../utils/filters-comparator';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { QueryState, queryStateReducer } from './query-state-reducer';

/**
 * Parameters for {@link useExecuteQuery} hook.
 */
export type ExecuteQueryParams = {
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent {@link SisenseContextProvider} component.
   */
  dataSource?: DataSource;

  /** Dimensions of the query */
  dimensions?: Attribute[];

  /** Measures of the query */
  measures?: Measure[];

  /** Filters that will slice query results */
  filters?: Filter[];

  /** Highlight filters that will highlight results that pass filter criteria */
  highlights?: Filter[];
};

/**
 * React hook that executes a data query.
 * This approach, which offers an alternative to {@link ExecuteQuery} component, is similar to React Query's `useQuery` hook.
 *
 * @example
 ```tsx
  const { data, isLoading, isError } = useExecuteQuery({
    dataSource: DM.DataSource,
    dimensions: [DM.Commerce.AgeRange],
    measures: [measures.sum(DM.Commerce.Revenue)],
    filters: [filters.greaterThan(DM.Commerce.Revenue, 1000)],
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
 * @param params - Parameters of the query
 * @returns Query state that contains the status of the query execution, the result data, or the error if any occurred
 */
export const useExecuteQuery = (params: ExecuteQueryParams): QueryState => {
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
        error: new Error(translation.errors.executeQueryNoSisenseContext),
      });
    }
    if (!app) {
      return;
    }
    if (isNeverExecuted || isQueryParamsChanged(prevParams, params)) {
      if (isNeverExecuted) {
        setIsNeverExecuted(false);
      }
      dispatch({ type: 'loading' });
      const { dataSource, dimensions, measures, filters, highlights } = params;
      void executeQuery(dataSource, dimensions, measures, filters, highlights, app)
        .then((data) => {
          dispatch({ type: 'success', data });
        })
        .catch((error: Error) => {
          dispatch({ type: 'error', error });
        });
    }
  }, [app, isInitialized, prevParams, params, isNeverExecuted]);
  return queryState;
};

/**
 * Hook that returns the value from the previous render.
 *
 * @param value - Value to return from the previous render.
 * @returns Value from the previous render.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/**
 * Checks if the query parameters have changed by deep comparison.
 *
 * @param prevParams - Previous query parameters
 * @param newParams - New query parameters
 */
function isQueryParamsChanged(
  prevParams: ExecuteQueryParams | undefined,
  newParams: ExecuteQueryParams,
): boolean {
  if (!prevParams && newParams) {
    return true;
  }
  const simplySerializableParamNames = ['dataSource', 'dimensions', 'measures'];
  const isSimplySerializableParamsChanged = simplySerializableParamNames.some(
    (paramName) => !isEqual(prevParams?.[paramName], newParams[paramName]),
  );
  const isRegularFiltersChanged = isFiltersChanged(prevParams!.filters, newParams.filters);
  const isHighlightFiltersChanged = isFiltersChanged(prevParams!.highlights, newParams.highlights);

  return isSimplySerializableParamsChanged || isRegularFiltersChanged || isHighlightFiltersChanged;
}
