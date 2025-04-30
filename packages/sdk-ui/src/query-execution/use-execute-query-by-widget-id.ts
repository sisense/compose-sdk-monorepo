import { useEffect, useReducer, useRef } from 'react';
import { withTracking } from '../decorators/hook-decorators';
import { queryStateReducer } from './query-state-reducer';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { executePivotQuery, executeQuery } from '../query/execute-query';
import {
  convertFilterRelationsModelToJaql,
  isPivotWidget,
  mergeFilters,
} from '../widget-by-id/utils';
import { isFiltersChanged } from '../utils/filters-comparator';
import { ClientApplication } from '../app/client-application';
import { TranslatableError } from '../translation/translatable-error';
import { RestApi } from '../api/rest-api';
import { useHasChanged } from '../common/hooks/use-has-changed';
import { extractDashboardFiltersForWidget } from '../widget-by-id/translate-dashboard-filters';
import { fetchWidgetDtoModel } from '../widget-by-id/use-fetch-widget-dto-model';
import {
  ExecutePivotQueryParams,
  ExecuteQueryByWidgetIdParams,
  ExecuteQueryParams,
  QueryByWidgetIdState,
  QueryByWidgetIdQueryParams,
} from './types';
import { Filter, getFilterListAndRelationsJaql, QueryResultData } from '@sisense/sdk-data';
import { widgetModelTranslator } from '../models';
import { useShouldLoad } from '../common/hooks/use-should-load';
import { convertToQueryDescription } from './utils';
import { mergeFiltersByStrategy } from '@/utils/filter-relations';

/**
 * React hook that executes a data query extracted from an existing widget in the Sisense instance.
 *
 * This approach, which offers an alternative to {@link ExecuteQueryByWidgetId} component, is similar to React Query's `useQuery` hook.
 *
 * **Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.
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
 * @returns Query state that contains the status of the query execution, the result data, the constructed query parameters, or the error if any occurred
 * @group Fusion Assets
 * @fusionEmbed
 */
export const useExecuteQueryByWidgetId = withTracking('useExecuteQueryByWidgetId')(
  useExecuteQueryByWidgetIdInternal,
);

/**
 * {@link useExecuteQueryByWidgetId} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @param params - Parameters to identify the target widget
 * @internal
 */
export function useExecuteQueryByWidgetIdInternal(params: ExecuteQueryByWidgetIdParams) {
  const isParamsChanged = useParamsChanged(params);
  const shouldLoad = useShouldLoad(params, isParamsChanged);
  const { isInitialized, app } = useSisenseContext();
  const query = useRef<QueryByWidgetIdState['query']>(undefined);
  const pivotQuery = useRef<QueryByWidgetIdState['pivotQuery']>(undefined);
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
        .then(({ data, query: executedQuery, pivotQuery: executedPivotQuery }) => {
          query.current = executedQuery;
          pivotQuery.current = executedPivotQuery;
          dispatch({ type: 'success', data });
        })
        .catch((error: Error) => {
          dispatch({ type: 'error', error });
        });
    }
  }, [params, app, isInitialized, shouldLoad]);

  return {
    ...queryState,
    query: query.current,
    pivotQuery: pivotQuery.current,
  } as QueryByWidgetIdState;
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
}: ExecuteQueryByWidgetIdParams & { app: ClientApplication }): Promise<
  { data: QueryResultData } & QueryByWidgetIdQueryParams
> {
  const api = new RestApi(app.httpClient);
  const { widget: fetchedWidget, dashboard: fetchedDashboard } = await fetchWidgetDtoModel({
    widgetOid,
    dashboardOid,
    includeDashboard: includeDashboardFilters,
    api,
  });

  if (!fetchedWidget) {
    throw new TranslatableError('errors.widgetWithOidNotFound', { widgetOid });
  }

  const widgetModel = widgetModelTranslator.fromWidgetDto(fetchedWidget);

  const prepareExecuteQueryParams = (
    query: ExecuteQueryParams | ExecutePivotQueryParams,
    isPivot: boolean,
  ): ExecuteQueryParams | ExecutePivotQueryParams => {
    const { dataSource, filters: widgetFilters, highlights: widgetHighlights } = query;

    // TODO: correctly handle filter relations - here just getting only pure filters array without relations
    const { filters: widgetFiltersWithoutRelations } = getFilterListAndRelationsJaql(widgetFilters);
    let mergedFilters = widgetFiltersWithoutRelations;
    let mergedHighlights = widgetHighlights;

    if (includeDashboardFilters && fetchedDashboard) {
      const { filters: dashboardFilters, highlights: dashboardHighlight } =
        extractDashboardFiltersForWidget(fetchedDashboard, fetchedWidget);
      mergedFilters = mergeFilters(dashboardFilters, widgetFiltersWithoutRelations);
      mergedHighlights = mergeFilters(dashboardHighlight, widgetHighlights);
    }

    mergedFilters = mergeFiltersByStrategy(
      mergedFilters,
      filters,
      filtersMergeStrategy,
    ) as Filter[];
    mergedHighlights = mergeFiltersByStrategy(
      mergedHighlights,
      highlights,
      filtersMergeStrategy,
    ) as Filter[];

    const filterRelations = fetchedDashboard?.filterRelations?.length
      ? convertFilterRelationsModelToJaql(fetchedDashboard.filterRelations[0].filterRelations)
      : undefined;

    const baseParams = {
      dataSource,
      filters: mergedFilters,
      filterRelations,
      highlights: mergedHighlights,
      count,
      offset,
    };

    if (isPivot) {
      const { rows, columns, values, grandTotals } = query as ExecutePivotQueryParams;
      return {
        ...baseParams,
        rows,
        columns,
        values,
        grandTotals,
      };
    } else {
      const { dimensions, measures } = query as ExecuteQueryParams;
      return {
        ...baseParams,
        dimensions,
        measures,
      };
    }
  };

  if (isPivotWidget(widgetModel.widgetType)) {
    const widgetQuery = widgetModelTranslator.toExecutePivotQueryParams(widgetModel);
    const executePivotQueryParams: ExecutePivotQueryParams = prepareExecuteQueryParams(
      widgetQuery,
      true,
    );
    const pivotQueryDescription = convertToQueryDescription(executePivotQueryParams);
    const pivotData = await executePivotQuery(pivotQueryDescription, app, { onBeforeQuery });

    return {
      // return flat table structure only
      data: pivotData.table,
      query: undefined,
      // return pivotQuery instead of query
      pivotQuery: executePivotQueryParams,
    };
  } else {
    const widgetQuery = widgetModelTranslator.toExecuteQueryParams(widgetModel);
    const executeQueryParams: ExecuteQueryParams = prepareExecuteQueryParams(widgetQuery, false);
    const queryDescription = convertToQueryDescription(executeQueryParams);
    const data = await executeQuery(queryDescription, app, { onBeforeQuery });

    return {
      data,
      query: executeQueryParams,
      pivotQuery: undefined,
    };
  }
}
