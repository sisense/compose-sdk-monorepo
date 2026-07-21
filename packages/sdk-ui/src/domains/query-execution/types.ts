import {
  Attribute,
  DataSource,
  Filter,
  FilterRelations,
  Measure,
  PivotAttribute,
  PivotGrandTotals,
  PivotMeasure,
  PivotQueryResultData,
  QueryResultData,
} from '@sisense/sdk-data';

import { DataLoadAction } from '../../shared/hooks/data-load-state-reducer';
import { FiltersMergeStrategy } from '../widgets/components/widget-by-id/types';

/**
 * State of a query execution.
 */
export type CsvQueryState = CsvQueryLoadingState | CsvQueryErrorState | CsvQuerySuccessState;

/**
 * State of a query execution that is loading.
 */
export type CsvQueryLoadingState = {
  /** Whether the query is loading */
  isLoading: true;
  /** Whether the query has failed */
  isError: false;
  /** Whether the query has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: undefined;
  /** The result data if the query has succeeded */
  data: Blob | string | undefined;
  /** The status of the query execution */
  status: 'loading';
};

/**
 * State of a query execution that has failed.
 */
export type CsvQueryErrorState = {
  /** Whether the query is loading */
  isLoading: false;
  /** Whether the query has failed */
  isError: true;
  /** Whether the query has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: Error;
  /** The result data if the query has succeeded */
  data: undefined;
  /** The status of the query execution */
  status: 'error';
};

/**
 * State of a query execution that has succeeded.
 */
export type CsvQuerySuccessState = {
  /** Whether the query is loading */
  isLoading: false;
  /** Whether the query has failed */
  isError: false;
  /** Whether the query has succeeded */
  isSuccess: true;
  /** The error if any occurred */
  error: undefined;
  /** The result data if the query has succeeded */
  data: Blob | string;
  /** The status of the query execution */
  status: 'success';
};

export type CsvQueryAction = DataLoadAction<Blob | string>;

/**
 * State of an on-demand Excel (JAQL) export request.
 */
export type ExcelQueryState =
  | ExcelQueryLoadingState
  | ExcelQueryErrorState
  | ExcelQuerySuccessState;

/**
 * State of an Excel export that is loading.
 */
export type ExcelQueryLoadingState = {
  /** Whether the export is loading */
  isLoading: true;
  /** Whether the export has failed */
  isError: false;
  /** Whether the export has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: undefined;
  /** XLSX blob when the export has succeeded */
  data: Blob | undefined;
  /** Status of the export */
  status: 'loading';
};

/**
 * State of an Excel export that has failed.
 */
export type ExcelQueryErrorState = {
  /** Whether the export is loading */
  isLoading: false;
  /** Whether the export has failed */
  isError: true;
  /** Whether the export has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: Error;
  /** Result data when the export has succeeded */
  data: undefined;
  /** Status of the export */
  status: 'error';
};

/**
 * State of an Excel export that has succeeded.
 */
export type ExcelQuerySuccessState = {
  /** Whether the export is loading */
  isLoading: false;
  /** Whether the export has failed */
  isError: false;
  /** Whether the export has succeeded */
  isSuccess: true;
  /** The error if any occurred */
  error: undefined;
  /** XLSX blob */
  data: Blob;
  /** Status of the export */
  status: 'success';
};

export type ExcelQueryAction = DataLoadAction<Blob>;

/**
 * State of a query execution.
 */
export type QueryState = QueryLoadingState | QueryErrorState | QuerySuccessState;

/**
 * State of a query execution that is loading.
 */
export type QueryLoadingState = {
  /** Whether the query is loading */
  isLoading: true;
  /** Whether the query has failed */
  isError: false;
  /** Whether the query has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: undefined;
  /** The result data if the query has succeeded */
  data: QueryResultData | undefined;
  /** The status of the query execution */
  status: 'loading';
};

/**
 * State of a query execution that has failed.
 */
export type QueryErrorState = {
  /** Whether the query is loading */
  isLoading: false;
  /** Whether the query has failed */
  isError: true;
  /** Whether the query has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: Error;
  /** The result data if the query has succeeded */
  data: undefined;
  /** The status of the query execution */
  status: 'error';
};

/**
 * State of a query execution that has succeeded.
 */
export type QuerySuccessState = {
  /** Whether the query is loading */
  isLoading: false;
  /** Whether the query has failed */
  isError: false;
  /** Whether the query has succeeded */
  isSuccess: true;
  /** The error if any occurred */
  error: undefined;
  /** The result data if the query has succeeded */
  data: QueryResultData;
  /** The status of the query execution */
  status: 'success';
};

export type QueryAction =
  | DataLoadAction<QueryResultData>
  | {
      type: 'success-load-more';
      data: QueryResultData;
    };

/**
 * Parameters for {@link useExecuteQueryByWidgetId} hook.
 */
export interface ExecuteQueryByWidgetIdParams {
  /** Identifier of the widget */
  widgetOid: string;

  /** Identifier of the dashboard that contains the widget */
  dashboardOid: string;

  /**
   * Filters that will slice query results.
   *
   * The provided filters will be merged with the existing widget filters based on `filtersMergeStrategy`
   */
  filters?: Filter[];

  /**
   * Highlight filters that will highlight results that pass filter criteria.
   *
   * NOTE that highlight filters in the "Include all" state are silently omitted from the
   * query. To clear a highlight, remove it from the array.
   */
  highlights?: Filter[];

  /** {@inheritDoc ExecuteQueryParams.count} */
  count?: number;

  /** {@inheritDoc ExecuteQueryParams.offset} */
  offset?: number;

  /**
   * Boolean flag whether to include the total row count of the query result,
   * ignoring the `count` and `offset` paging.
   *
   * When enabled, the total is returned as `rowCount` in the query state
   * ({@link QueryByWidgetIdState.rowCount}) and is reused for subsequent pages of the same query.
   *
   * Row count feature requires a Sisense instance version of 2026.3.0 or greater.
   * On older versions, the query still succeeds and `rowCount` stays `undefined`.
   *
   * Not supported for pivot table widgets.
   *
   * If not specified, the default value is `false`
   *
   * @beta
   */
  includeRowCount?: boolean;

  /**
   * Strategy for merging the existing widget filters (including highlights) with the filters provided via the `filters` and `highlights` props:
   *
   * - `widgetFirst` - prioritizes the widget filters over the provided filters in case of filter conflicts by certain attributes.
   * - `codeFirst` - prioritizes the provided filters over the widget filters in case of filter conflicts by certain attributes.
   * - `codeOnly` - applies only the provided filters and completely ignores the widget filters.
   *
   * If not specified, the default strategy is `codeFirst`.
   */
  filtersMergeStrategy?: FiltersMergeStrategy;

  /**
   * Boolean flag whether to include dashboard filters in the widget's `filters` and `highlights`
   *
   * If not specified, the default value is `false`.
   */
  includeDashboardFilters?: boolean;

  /** {@inheritDoc ExecuteQueryParams.onBeforeQuery} */
  onBeforeQuery?: (jaql: any) => any | Promise<any>;

  /** {@inheritDoc ExecuteQueryParams.enabled} */
  enabled?: boolean;
}

/**
 * Query parameters constructed over either a chart widget or pivot table widget. This is returned as part of the query state {@link QueryByWidgetIdState}.
 */
export type QueryByWidgetIdQueryParams = {
  /** Query parameters constructed over the chart widget */
  query: ExecuteQueryParams | undefined;

  /** Query parameters constructed over the pivot table widget */
  pivotQuery: ExecutePivotQueryParams | undefined;
};

/**
 * State of a query execution retrieving data of Fusion widget.
 */
export type QueryByWidgetIdState = QueryState &
  QueryByWidgetIdQueryParams & {
    /**
     * Total row count of the query result, ignoring the `count` and `offset` paging.
     *
     * Populated only when {@link ExecuteQueryByWidgetIdParams.includeRowCount} is enabled and
     * the Sisense instance supports the row count API; `undefined` otherwise.
     *
     * @beta
     */
    rowCount?: number;
  };

/**
 * Base query parameters
 *
 * @internal
 */
export interface BaseQueryParams {
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.
   */
  dataSource?: DataSource;

  /** Dimensions of the query */
  dimensions?: Attribute[];

  /** Measures of the query */
  measures?: Measure[];

  /** Filters that will slice query results */
  filters?: Filter[] | FilterRelations;

  /**
   * Highlight filters that will highlight results that pass filter criteria.
   *
   * NOTE that highlight filters in the "Include all" state are silently omitted from the
   * query. To clear a highlight, remove it from the array.
   */
  highlights?: Filter[];
}

/**
 * Parameters for {@link useExecuteQuery} hook.
 */
export interface ExecuteQueryParams extends BaseQueryParams {
  /**
   * Number of rows to return in the query result
   *
   * If not specified, the default value is `20000`
   */
  count?: number;

  /**
   * Offset of the first row to return
   *
   * If not specified, the default value is `0`
   */
  offset?: number;

  /**
   * Boolean flag to control if query is executed
   *
   * If not specified, the default value is `true`
   */
  enabled?: boolean;

  /**
   * Boolean flag whether to include `ungroup: true` in non-aggregated JAQL queries.
   *
   * This improves computation and performance of querying tables when no aggregation is needed
   *
   * If not specified, the default value is `false`
   */
  ungroup?: boolean;

  /**
   * Boolean flag whether to include the total row count of the query result,
   * ignoring the `count` and `offset` paging.
   *
   * When enabled, an additional row count query is sent to the server alongside
   * the data query, and the total is returned in {@link ExecuteQueryResult.rowCount}.
   * The retrieved total is reused for subsequent pages of the same query.
   *
   * Row count feature requires a Sisense instance version of 2026.3.0 or greater.
   * On older versions, the query still succeeds and `rowCount` stays `undefined`.
   *
   * If not specified, the default value is `false`
   *
   * @beta
   */
  includeRowCount?: boolean;

  /**
   * Sync or async callback that allows to modify the JAQL payload before it is sent to the server.
   *
   * **Note:** In React, wrap this function in `useCallback` hook to avoid triggering query execution on each render.
   * ```tsx
   * const onBeforeQuery = useCallback((jaql) => {
   *   // modify jaql here
   *   return jaql;
   * }, []);
   * ```
   */
  onBeforeQuery?: (jaql: any) => any | Promise<any>;
}

/**
 * Result of a query execution.
 */
export type ExecuteQueryResult = QueryState & {
  /** Function to refetch the query */
  refetch: () => void;
  /**
   * Function to load more data rows
   *
   * @internal
   */
  loadMore: (count: number) => void;
  /**
   * Flag indicating whether all items have been loaded
   *
   * @internal
   */
  isAllItemsLoaded: boolean;
  /**
   * Total row count of the query result, ignoring the `count` and `offset` paging.
   *
   * Populated only when {@link ExecuteQueryParams.includeRowCount} is enabled and
   * the Sisense instance supports the row count API; `undefined` otherwise.
   *
   * @beta
   */
  rowCount?: number;
};

/** Configuration for {@link useExecuteCsvQuery} hook. */
export type ExecuteCSVQueryConfig = {
  /**
   * If set to true, the data will be returned as a Blob.
   */
  asDataStream?: boolean;
};

/**
 * Parameters for {@link useExecuteCsvQuery} hook.
 */
export interface ExecuteCsvQueryParams extends Omit<ExecuteQueryParams, 'includeRowCount'> {
  config?: ExecuteCSVQueryConfig;
}

/**
 * Parameters for {@link useExecuteExcelQueryInternal} (JAQL XLSX export).
 *
 * @internal
 */
export interface ExecuteExcelQueryParams extends Omit<ExecuteQueryParams, 'includeRowCount'> {
  /** `false` = repeat rows (Angular default); `true` = merge rows. */
  mergeRows: boolean;
  /** Suggested download file name (e.g. from widget title). */
  filename?: string;
  /**
   * Widget id for export (`ChartWidget` / `Widget` `id`). Required when `enabled` runs an export;
   * optional on the type so idle/default param objects can omit it.
   */
  widgetId?: string;
  /**
   * Widget presentation type for export (e.g. Compose `ChartType` from `ChartWidget` `chartType`).
   */
  widgetType?: string;
  /**
   * Widget title for Fusion JAQL `widget` segment (`oid;title`). Optional; defaults to empty string.
   */
  widgetTitle?: string;
  /**
   * Monotonic id assigned by {@link useExcelQueryFileLoader} on each `execute` so each click starts
   * a distinct export even when query fields and `mergeRows` match the previous run.
   *
   * @internal
   */
  exportRunId?: number;
}

/**
 * State of a pivot query execution.
 */
export type PivotQueryState =
  | PivotQueryLoadingState
  | PivotQueryErrorState
  | PivotQuerySuccessState;

/**
 * State of a query execution that is loading.
 */
export type PivotQueryLoadingState = {
  /** Whether the query is loading */
  isLoading: true;
  /** Whether the query has failed */
  isError: false;
  /** Whether the query has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: undefined;
  /** The result data if the query has succeeded */
  data: PivotQueryResultData | undefined;
  /** The status of the query execution */
  status: 'loading';
};

/**
 * State of a query execution that has failed.
 */
export type PivotQueryErrorState = {
  /** Whether the query is loading */
  isLoading: false;
  /** Whether the query has failed */
  isError: true;
  /** Whether the query has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: Error;
  /** The result data if the query has succeeded */
  data: undefined;
  /** The status of the query execution */
  status: 'error';
};

/**
 * State of a query execution that has succeeded.
 */
export type PivotQuerySuccessState = {
  /** Whether the query is loading */
  isLoading: false;
  /** Whether the query has failed */
  isError: false;
  /** Whether the query has succeeded */
  isSuccess: true;
  /** The error if any occurred */
  error: undefined;
  /** The result data if the query has succeeded */
  data: PivotQueryResultData;
  /** The status of the query execution */
  status: 'success';
};

export type PivotQueryAction = DataLoadAction<PivotQueryResultData>;

/**
 * Parameters for {@link useExecutePivotQuery} hook.
 */
export interface ExecutePivotQueryParams {
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.
   *
   * @category Data Options
   */
  dataSource?: DataSource;

  /**
   * Dimensions for the rows of the pivot table
   *
   * @category Data Options
   */
  rows?: (Attribute | PivotAttribute)[];

  /**
   * Dimensions for the columns of the pivot table
   *
   * @category Data Options
   */
  columns?: (Attribute | PivotAttribute)[];

  /**
   * Measures for the values of the pivot table
   *
   * @category Data Options
   */
  values?: (Measure | PivotMeasure)[];

  /**
   * Options for grand totals
   *
   * @category Data Options
   */
  grandTotals?: PivotGrandTotals;

  /**
   * Filters that will slice query results
   *
   * @category Filtering
   */
  filters?: Filter[] | FilterRelations;

  /**
   * Filters that will highlight query results
   *
   * @category Filtering
   */
  highlights?: Filter[];

  /**
   * {@inheritDoc ExecuteQueryProps.count}
   *
   * @category Pagination
   *
   * [To be reviewed for pivot table]
   * @internal
   */
  count?: number;

  /**
   * {@inheritDoc ExecuteQueryProps.offset}
   *
   * @category Pagination
   *
   * [To be reviewed for pivot table]
   * @internal
   */
  offset?: number;

  /**
   * Boolean flag to control if query is executed
   *
   * If not specified, the default value is `true`
   *
   * @category Control
   */
  enabled?: boolean;

  /** {@inheritDoc ExecuteQueryProps.onBeforeQuery} */
  onBeforeQuery?: (jaql: any) => any | Promise<any>;
}
