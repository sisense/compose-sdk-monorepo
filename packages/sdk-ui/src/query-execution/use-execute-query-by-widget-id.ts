/* eslint-disable max-lines-per-function */
import { useEffect, useReducer, useRef, useState } from 'react';
import { type Filter } from '@sisense/sdk-data';
import { ExecuteQueryParams } from './index.js';
import { queryStateReducer, QueryState } from './query-state-reducer.js';
import { useSisenseContext } from '../sisense-context/sisense-context.js';
import { executeQuery } from '../query/execute-query.js';
import { mergeFilters, mergeFiltersByStrategy } from '../dashboard-widget/utils.js';
import { FiltersMergeStrategy, WidgetDto } from '../dashboard-widget/types.js';
import { isEqual } from 'lodash';
import { isFiltersChanged } from '../utils/filters-comparator.js';
import { ClientApplication } from '../app/client-application.js';
import { extractQueryFromWidget } from './utils.js';
import { TranslatableError } from '../translation/translatable-error.js';
import { RestApi } from '../api/rest-api.js';
import { usePrevious } from '../common/hooks/use-previous.js';

/**
 * Parameters for {@link useExecuteQueryByWidgetId} hook.
 */
export interface ExecuteQueryByWidgetIdParams {
  /** {@inheritDoc ExecuteQueryByWidgetIdProps.widgetOid} */
  widgetOid: string;

  /** {@inheritDoc ExecuteQueryByWidgetIdProps.dashboardOid} */
  dashboardOid: string;

  /** {@inheritDoc ExecuteQueryByWidgetIdProps.filters} */
  filters?: Filter[];

  /** {@inheritDoc ExecuteQueryByWidgetIdProps.highlights} */
  highlights?: Filter[];

  /** {@inheritDoc ExecuteQueryProps.count} */
  count?: number;

  /** {@inheritDoc ExecuteQueryProps.offset} */
  offset?: number;

  /** {@inheritDoc ExecuteQueryByWidgetIdProps.filtersMergeStrategy} */
  filtersMergeStrategy?: FiltersMergeStrategy;

  /** {@inheritDoc ExecuteQueryByWidgetIdProps.onBeforeQuery} */
  onBeforeQuery?: (jaql: any) => any | Promise<any>;
}

export type QueryByWidgetIdState = QueryState & {
  /** Query parameters constructed over the widget */
  query: ExecuteQueryParams | undefined;
};

/**
 * React hook that executes a data query extracted from an existing widget in the Sisense instance.
 *
 * This approach, which offers an alternative to {@link ExecuteQueryByWidgetId} component, is similar to React Query's `useQuery` hook.
 *
 *
 * @example
 * The example below executes a query over the existing dashboard widget with the specified widget and dashboard OIDs.
 ```tsx
  const { data, isLoading, isError } = useExecuteQueryByWidgetId({
    widgetOid: '64473e07dac1920034bce77f',
    dashboardOid: '6441e728dac1920034bce737'
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
 * See also hook {@link useExecuteQuery}, which execute a query specified in code.
 * @param params - Parameters to identify the target widget
 * @returns Query state that contains the status of the query execution, the result data, the constructed query parameters, or the error if any occurred
 */
export const useExecuteQueryByWidgetId = (params: ExecuteQueryByWidgetIdParams) => {
  const prevParams = usePrevious(params);
  const { isInitialized, app } = useSisenseContext();
  const [isNeverExecuted, setIsNeverExecuted] = useState(true);
  const query = useRef<QueryByWidgetIdState['query']>(undefined);
  const [queryState, dispatch] = useReducer(queryStateReducer, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

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

    if (isNeverExecuted || isParamsChanged(prevParams, params)) {
      const {
        widgetOid,
        dashboardOid,
        filters,
        highlights,
        filtersMergeStrategy,
        count,
        offset,
        onBeforeQuery,
      } = params;

      if (isNeverExecuted) {
        setIsNeverExecuted(false);
      }

      dispatch({ type: 'loading' });

      void executeQueryByWidgetId({
        widgetOid,
        dashboardOid,
        filters,
        highlights,
        filtersMergeStrategy,
        app,
        count,
        offset,
        onBeforeQuery,
      })
        .then(({ data, query: executedQuery }) => {
          query.current = executedQuery;
          dispatch({ type: 'success', data });
        })
        .catch((error: Error) => {
          dispatch({ type: 'error', error });
        });
    }
  }, [params, prevParams, isNeverExecuted, app, isInitialized]);

  return { ...queryState, query: query.current } as QueryByWidgetIdState;
};

/**
 * Checks if the parameters have changed by deep comparison.
 *
 * @param prevParams - Previous query parameters
 * @param newParams - New query parameters
 */
export function isParamsChanged(
  prevParams: ExecuteQueryByWidgetIdParams | undefined,
  newParams: ExecuteQueryByWidgetIdParams,
) {
  if (!prevParams && newParams) {
    return true;
  }

  const isRegularFiltersChanged = isFiltersChanged(prevParams!.filters, newParams.filters);
  const isHighlightFiltersChanged = isFiltersChanged(prevParams!.highlights, newParams.highlights);

  return (
    ['widgetOid', 'dashboardOid', 'count', 'offset'].some(
      (paramName) => !isEqual(prevParams?.[paramName], newParams[paramName]),
    ) ||
    isRegularFiltersChanged ||
    isHighlightFiltersChanged
  );
}

/** @internal */
export async function executeQueryByWidgetId({
  widgetOid,
  dashboardOid,
  filters,
  highlights,
  filtersMergeStrategy,
  count,
  offset,
  app,
  onBeforeQuery,
}: ExecuteQueryByWidgetIdParams & { app: ClientApplication }) {
  const api = new RestApi(app.httpClient);
  const fetchedWidget: WidgetDto = await api.getWidget(widgetOid, dashboardOid);
  const {
    dataSource,
    dimensions,
    measures,
    filters: widgetFilters,
    highlights: widgetHighlights,
  } = extractQueryFromWidget(fetchedWidget);

  const mergedFilters = mergeFiltersByStrategy(widgetFilters, filters, filtersMergeStrategy);
  const mergedHighlights = mergeFilters(highlights, widgetHighlights);

  const executeQueryParams: ExecuteQueryParams = {
    dataSource,
    dimensions,
    measures,
    filters: mergedFilters,
    highlights: mergedHighlights,
    count,
    offset,
  };
  const data = await executeQuery(executeQueryParams, app, { onBeforeQuery });

  return {
    data,
    query: executeQueryParams,
  };
}
