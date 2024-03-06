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
import { DataLoadAction } from '../common/hooks/data-load-state-reducer';
import { FiltersMergeStrategy } from '../dashboard-widget/types';

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

export type QueryAction = DataLoadAction<QueryResultData>;

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

  /** Highlight filters that will highlight results that pass filter criteria */
  highlights?: Filter[];

  /** {@inheritDoc ExecuteQueryParams.count} */
  count?: number;

  /** {@inheritDoc ExecuteQueryParams.offset} */
  offset?: number;

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

export type QueryByWidgetIdState = QueryState & {
  /** Query parameters constructed over the widget */
  query: ExecuteQueryParams | undefined;
};

/**
 * Parameters for {@link useExecuteQuery} hook.
 */
export interface ExecuteQueryParams {
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

  /** Highlight filters that will highlight results that pass filter criteria */
  highlights?: Filter[];

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
export interface ExecuteCsvQueryParams extends ExecuteQueryParams {
  config?: ExecuteCSVQueryConfig;
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
   * Highlight filters that will highlight results that pass filter criteria
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
