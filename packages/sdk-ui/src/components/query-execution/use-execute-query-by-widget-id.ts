/* eslint-disable max-lines-per-function */
import { useEffect, useReducer, useRef, useState } from 'react';
import { Attribute, Measure, Filter, MetadataTypes } from '@sisense/sdk-data';
import { ExecuteQueryParams } from './index.js';
import { queryStateReducer, QueryState } from './query-state-reducer.js';
import { useSisenseContext } from '../sisense-context/sisense-context.js';
import { translation } from '../../locales/en.js';
import { fetchWidget } from '../../dashboard-widget/fetch-widget';
import { createDimensionalElementFromJaql } from '../../dashboard-widget/translate-widget-data-options';
import { executeQuery } from '../../query/execute-query.js';
import {
  getRootPanelItem,
  mergeFilters,
  mergeFiltersByStrategy,
} from '../../dashboard-widget/utils.js';
import { FiltersMergeStrategy, WidgetDto } from '../../dashboard-widget/types.js';
import { usePrevious } from './use-execute-query.js';
import { isEqual } from 'lodash';
import { isFiltersChanged } from '../../utils/filters-comparator.js';

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

  /** {@inheritDoc ExecuteQueryByWidgetIdProps.filtersMergeStrategy} */
  filtersMergeStrategy?: FiltersMergeStrategy;
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
    widgetOid: '64473e07dac1920034bce77f'
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
        error: new Error(translation.errors.executeQueryNoSisenseContext),
      });
    }

    if (!app) {
      return;
    }

    if (isNeverExecuted || isParamsChanged(prevParams, params)) {
      const { widgetOid, dashboardOid } = params;

      if (isNeverExecuted) {
        setIsNeverExecuted(false);
      }

      dispatch({ type: 'loading' });

      void fetchWidget(widgetOid, dashboardOid, app)
        .then((fetchedWidget: WidgetDto) => {
          const {
            dataSource,
            dimensions,
            measures,
            filters: widgetFilters,
            highlights: widgetHighlights,
          } = extractQueryFromWidget(fetchedWidget);
          const filters = mergeFiltersByStrategy(
            widgetFilters,
            params.filters,
            params.filtersMergeStrategy,
          );
          const highlights = mergeFilters(params.highlights, widgetHighlights);
          query.current = { dataSource, dimensions, measures, filters, highlights };
          return executeQuery(dataSource, dimensions, measures, filters, highlights, app);
        })
        .then((data) => {
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
function isParamsChanged(
  prevParams: ExecuteQueryByWidgetIdParams | undefined,
  newParams: ExecuteQueryByWidgetIdParams,
) {
  if (!prevParams && newParams) {
    return true;
  }

  const isRegularFiltersChanged = isFiltersChanged(prevParams!.filters, newParams.filters);
  const isHighlightFiltersChanged = isFiltersChanged(prevParams!.highlights, newParams.highlights);

  return (
    ['widgetOid', 'dashboardOid'].some(
      (paramName) => !isEqual(prevParams?.[paramName], newParams[paramName]),
    ) ||
    isRegularFiltersChanged ||
    isHighlightFiltersChanged
  );
}

/**
 * Extracts query parameters from a widget object.
 *
 * @param {WidgetDto} widget - The widget from which to extract query parameters.
 * @returns {ExecuteQueryParams} An object containing extracted query parameters.
 */
function extractQueryFromWidget(widget: WidgetDto): ExecuteQueryParams {
  const { panels } = widget.metadata;
  const dataSource = widget.datasource.title;
  const measures: Measure[] = [];
  const dimensions: Attribute[] = [];
  const filters: Filter[] = [];

  panels.forEach((panel) => {
    panel?.items
      ?.filter((item) => !item.disabled)
      .forEach((item) => {
        const root = getRootPanelItem(item);
        const element = createDimensionalElementFromJaql(root.jaql, root.format);

        if (MetadataTypes.isFilter(element)) {
          filters.push(element as Filter);
        } else if (MetadataTypes.isMeasure(element)) {
          measures.push(element as Measure);
        } else {
          dimensions.push(element as Attribute);
        }
      });
  });

  return {
    dataSource,
    measures,
    dimensions,
    filters,
    highlights: [],
  };
}
