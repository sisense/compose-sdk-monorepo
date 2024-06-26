import { useEffect, useReducer, useRef } from 'react';
import { withTracking } from '../decorators/hook-decorators';
import { queryStateReducer } from './query-state-reducer';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { QueryDescription, executeQuery } from '../query/execute-query';
import {
  convertFilterRelationsModelToJaql,
  mergeFilters,
  mergeFiltersByStrategy,
} from '../dashboard-widget/utils';
import { isFiltersChanged } from '../utils/filters-comparator';
import { ClientApplication } from '../app/client-application';
import { TranslatableError } from '../translation/translatable-error';
import { RestApi } from '../api/rest-api';
import { useHasChanged } from '../common/hooks/use-has-changed';
import { extractDashboardFiltersForWidget } from '../dashboard-widget/translate-dashboard-filters';
import { fetchWidgetDtoModel } from '../dashboard-widget/use-fetch-widget-dto-model';
import { ExecuteQueryByWidgetIdParams, QueryByWidgetIdState } from './types';
import { Filter } from '@sisense/sdk-data';
import { WidgetModel } from '../models';
import { useShouldLoad } from '../common/hooks/use-should-load';

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
 * @group Fusion Embed
 * @fusionEmbed
 */
export const useExecuteQueryByWidgetId = withTracking('useExecuteQueryByWidgetId')(
  useExecuteQueryByWidgetIdInternal,
);

/**
 * {@link useExecuteQueryByWidgetId} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @internal
 */
export function useExecuteQueryByWidgetIdInternal(params: ExecuteQueryByWidgetIdParams) {
  const isParamsChanged = useParamsChanged(params);
  const shouldLoad = useShouldLoad(params, isParamsChanged);
  const { isInitialized, app } = useSisenseContext();
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

    if (shouldLoad(app)) {
      const {
        widgetOid,
        dashboardOid,
        filters,
        highlights,
        filtersMergeStrategy,
        count,
        offset,
        includeDashboardFilters,
        onBeforeQuery,
      } = params;

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
        includeDashboardFilters,
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
  }, [params, app, isInitialized, shouldLoad]);

  return { ...queryState, query: query.current } as QueryByWidgetIdState;
}

/** List of parameters that can be compared by deep comparison */
const simplySerializableParamNames: (keyof ExecuteQueryByWidgetIdParams)[] = [
  'widgetOid',
  'dashboardOid',
  'count',
  'offset',
  'filtersMergeStrategy',
  'includeDashboardFilters',
  'onBeforeQuery',
];

/**
 * Checks if the query parameters have changed by deep comparison.
 *
 * @param params - New query parameters
 */
export function useParamsChanged(params: ExecuteQueryByWidgetIdParams) {
  return useHasChanged(params, simplySerializableParamNames, (params, prev) => {
    const isRegularFiltersChanged = isFiltersChanged(prev.filters, params.filters);
    const isHighlightFiltersChanged = isFiltersChanged(prev.highlights, params.highlights);
    return isRegularFiltersChanged || isHighlightFiltersChanged;
  });
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
  includeDashboardFilters,
  app,
  onBeforeQuery,
}: ExecuteQueryByWidgetIdParams & { app: ClientApplication }) {
  const api = new RestApi(app.httpClient);
  const { widget: fetchedWidget, dashboard: fetchedDashboard } = await fetchWidgetDtoModel({
    widgetOid,
    dashboardOid,
    includeDashboard: includeDashboardFilters,
    api,
  });
  // TODO: support filter relations extraction from widget
  const widgetModel = new WidgetModel(fetchedWidget);
  const widgetQuery = widgetModel.getExecuteQueryParams();
  const { dataSource, dimensions, measures } = widgetQuery;
  let { filters: widgetFilters, highlights: widgetHighlights } = widgetQuery;

  if (includeDashboardFilters) {
    const { filters: dashboardFilters, highlights: dashboardHighlight } =
      extractDashboardFiltersForWidget(fetchedDashboard!, fetchedWidget);
    widgetFilters = mergeFilters(dashboardFilters, widgetFilters as Filter[]);
    widgetHighlights = mergeFilters(dashboardHighlight, widgetHighlights);
  }

  const mergedFilters = mergeFiltersByStrategy(
    widgetFilters as Filter[],
    filters,
    filtersMergeStrategy,
  );
  const mergedHighlights = mergeFiltersByStrategy(
    widgetHighlights,
    highlights,
    filtersMergeStrategy,
  );

  const filterRelations = fetchedDashboard?.filterRelations?.length
    ? convertFilterRelationsModelToJaql(fetchedDashboard?.filterRelations[0].filterRelations)
    : undefined;

  const executeQueryParams: QueryDescription = {
    dataSource,
    dimensions,
    measures,
    filters: mergedFilters,
    filterRelations,
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
