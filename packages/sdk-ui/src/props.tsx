/* eslint-disable max-lines */
import {
  Attribute,
  Filter,
  Measure,
  DataSource,
  Data,
  QueryResultData,
  FilterRelations,
} from '@sisense/sdk-data';
import {
  ChartDataOptions,
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ThemeSettings,
  PolarStyleOptions,
  PieStyleOptions,
  StackableStyleOptions,
  LineStyleOptions,
  AreaStyleOptions,
  FunnelStyleOptions,
  ScatterStyleOptions,
  ChartStyleOptions,
  ChartType,
  IndicatorStyleOptions,
  DrilldownOptions,
  TableStyleOptions,
  ThemeOid,
  TreemapStyleOptions,
  CustomDrilldownResult,
  MenuPosition,
  MenuItemSection,
  SunburstStyleOptions,
  ChartWidgetStyleOptions,
  TableWidgetStyleOptions,
  DashboardWidgetStyleOptions,
  BoxplotStyleOptions,
  ScattermapStyleOptions,
  AreamapStyleOptions,
  DataPoint,
  ScatterDataPoint,
  AreamapDataPoint,
  BoxplotDataPoint,
  ChartDataPoints,
  ScattermapDataPoint,
  PivotTableStyleOptions,
} from './types';
import { HighchartsOptions } from './chart-options-processor/chart-options-service';
import { ComponentType, PropsWithChildren, ReactNode } from 'react';
import {
  IndicatorChartDataOptions,
  BoxplotChartCustomDataOptions,
  BoxplotChartDataOptions,
  ScatterChartDataOptions,
  TableDataOptions,
  ScattermapChartDataOptions,
  AreamapChartDataOptions,
  PivotTableDataOptions,
} from './chart-data-options/types';
import { AppConfig } from './app/client-application';
import { ExecuteQueryParams, QueryByWidgetIdState, QueryState } from './query-execution';
import { FiltersMergeStrategy } from './dashboard-widget/types';
import { HookEnableParam } from './common/hooks/types';

export type { MenuItemSection, HighchartsOptions };

/**
 * Configurations for Sisense Context
 */
export interface SisenseContextProviderProps {
  /**
   * Default data source explicitly set to be used by child components that are not defined with a data source.
   */
  defaultDataSource?: DataSource;

  /** URL of the Sisense environment the app connects to */
  url: string;

  /**
   * [Single Sign-On](https://docs.sisense.com/main/SisenseLinux/using-single-sign-on-to-access-sisense.htm) toggle
   *
   * This is used when user wants to use sso authentication. Default is false.
   * If set to true, this will override any other authentication method.
   *
   * @category Authentication
   */
  ssoEnabled?: boolean;

  /**
   * Token for [bearer authentication](https://sisense.dev/guides/restApi/using-rest-api.html).
   *
   * This is used only when basic username/password authentication is not specified.
   *
   * @category Authentication
   */
  token?: string;

  /**
   * [Web Access Token](https://docs.sisense.com/main/SisenseLinux/using-web-access-token.htm).
   *
   * This is used only when neither username, password, and token is specified.
   *
   * @category Authentication
   */
  wat?: string;

  /**
   * Application specific configurations such as locale and date formats.
   */
  appConfig?: AppConfig;

  /**
   * Boolean flag to show or hide run-time errors that involve Sisense context in the UI.
   * Example errors include incorrect Sisense URL or invalid authentication.
   * Note that this flag does not hide run-time errors in the console.
   *
   * If not specified, the default value is `true`.
   *
   * @internal
   */
  showRuntimeErrors?: boolean;

  /**
   * Boolean flag to enable sending tracking events to the Sisense instance.
   *
   * If not specified, the default value is `true`.
   *
   * @internal
   */
  enableTracking?: boolean;

  /**
   * Boolean flag to enable sending silent pre-authentication requests to the Sisense instance.
   * Used to check if user is already authenticated, check is performed in an ivisible iframe.
   * Used only with SSO authentication.
   * If not specified, the default value is `false`.
   *
   * @internal
   */
  enableSilentPreAuth?: boolean;
}

/**
 * Props for {@link ExecuteQuery} component.
 */
export interface ExecuteQueryProps {
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

  /** Function as child component that is called to render the query results */
  children?: (queryState: QueryState) => ReactNode;

  /** Callback function that is evaluated when query results are ready */
  onDataChanged?: (data: QueryResultData) => void;

  /**
   * Sync or async callback that allows to modify the JAQL payload before it is sent to the server.
   *
   * **Note:** wrap this function in `useCallback` hook to avoid triggering query execution on each render.
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
 * Configurations for Theme.
 *
 * Two options are supported:
 *
 * (1) `ThemeOid` -- Theme identifier as defined in the Sisense application (`Admin page` > `Look and Feel`).
 * See [Sisense documentation](https://docs.sisense.com/main/SisenseLinux/customizing-the-sisense-user-interface.htm)
 * for more details.
 *
 * OR
 *
 * (2) `ThemeSettings` -- Custom theme settings that override the default theme settings.
 */
export type ThemeProviderProps = PropsWithChildren<{
  /**
   *
   * Theme for visual styling of the various components
   */
  theme?: ThemeOid | ThemeSettings;

  /**
   * Used internally for explicitly skipping the tracking call (mainly for
   * SisenseContextProvider, since it internally renders a ThemeProvider).
   *
   * @internal
   */
  skipTracking?: boolean;
}>;

/**
 * Before render handler where any custom adjustments can be made to the chart options
 * of [highcharts](https://api.highcharts.com/highcharts/),
 * which is an underlying charting library used by Sisense.
 *
 * @see {@link https://api.highcharts.com/highcharts/}
 */
export type BeforeRenderHandler = (
  /** Highcharts options */
  highchartsOptions: HighchartsOptions,
) => HighchartsOptions;

/**
 * Click handler for when an abstract data point (data point of any chart) is clicked
 */
export type ChartDataPointsEventHandler = (
  /** Abstract data points that were selected */
  points: ChartDataPoints,
  /** Native MouseEvent */
  nativeEvent: MouseEvent | PointerEvent,
) => void;

/** Click handler for when multiple data points are selected. */
export type DataPointsEventHandler = (
  /** Data points that were selected */
  points: DataPoint[],
  /** Native MouseEvent */
  nativeEvent: MouseEvent,
) => void;

/** Click handler for when a data point is clicked. One parameter, `DataPoint`, is passed to the function. */
export type DataPointEventHandler = (
  /** Data point that was clicked */
  point: DataPoint,
  /** Native PointerEvent */
  nativeEvent: PointerEvent,
) => void;

/** Click handler for when a scatter data point is clicked */
export type ScatterDataPointEventHandler = (
  /** Data point that was clicked */
  point: ScatterDataPoint,
  /** Native PointerEvent */
  nativeEvent: PointerEvent,
) => void;

/** Click handler for when multiple scatter data points are selected. */
export type ScatterDataPointsEventHandler = (
  /** Data points that were selected */
  points: ScatterDataPoint[],
  /** Native MouseEvent */
  nativeEvent: MouseEvent,
) => void;

/**
 * Click handler for when a data point on Areamap is clicked.
 */
export type AreamapDataPointEventHandler = (
  /** Data point that was clicked */
  point: AreamapDataPoint,
  /** Native MouseEvent */
  nativeEvent: MouseEvent,
) => void;

/**
 * Click handler for when a data point on Scattermap is clicked.
 */
export type ScattermapDataPointEventHandler = (
  /** Data point that was clicked */
  point: ScattermapDataPoint,
  /** Native MouseEvent */
  nativeEvent: MouseEvent,
) => void;

/**
 * Click handler for when a data point on Boxplot is clicked.
 */
export type BoxplotDataPointEventHandler = (
  /** Data point that was clicked */
  point: BoxplotDataPoint,
  /** Native PointerEvent */
  nativeEvent: PointerEvent,
) => void;

interface HighchartsBasedChartEventProps {
  /**
   * Before render handler callback that allows adjusting
   * detail chart options prior to render
   *
   * This callback is not supported for Indicator Chart, Areamap Chart, and Scattermap Chart.
   *
   * @category Callbacks
   */
  onBeforeRender?: BeforeRenderHandler;
}

/**
 * Event props for regular (non-specific) charts which uses DataPoint type
 * to describe data points for events.
 */
interface RegularChartEventProps extends HighchartsBasedChartEventProps {
  /**
   * Click handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointClick?: DataPointEventHandler;
  /**
   * Context menu handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointContextMenu?: DataPointEventHandler;
  /**
   * Handler callback for selection of multiple data points
   *
   * @category Callbacks
   */
  onDataPointsSelected?: DataPointsEventHandler;
}

/**
 * Event props for Scatter chart which uses ScatterDataPoint type
 * to describe data points for events.
 */
interface ScatterChartEventProps extends HighchartsBasedChartEventProps {
  /**
   * Click handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointClick?: ScatterDataPointEventHandler;
  /**
   * Context menu handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointContextMenu?: ScatterDataPointEventHandler;
  /**
   * Handler callback for selection of multiple data points
   *
   * @category Callbacks
   */
  onDataPointsSelected?: ScatterDataPointsEventHandler;
}

/**
 * Event props for Areamap chart which uses AreamapDataPoint type
 * to describe data points for events.
 */
interface AreamapChartEventProps {
  /**
   * Click handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointClick?: AreamapDataPointEventHandler;
}

/**
 * Event props for Scattermap chart which uses ScattermapDataPoint type
 * to describe data points for events.
 */
interface ScattermapChartEventProps {
  /**
   * Click handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointClick?: ScattermapDataPointEventHandler;
}

/**
 * Event props for Boxplot chart which uses BoxplotDataPoint type
 * to describe data points for events.
 */
interface BoxplotChartEventProps extends HighchartsBasedChartEventProps {
  /**
   * Click handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointClick?: BoxplotDataPointEventHandler;

  /**
   * Context menu handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointContextMenu?: BoxplotDataPointEventHandler;

  /**
   * Handler callback for selection of multiple data points
   *
   * @category Callbacks
   */
  onDataPointsSelected?: DataPointsEventHandler;
}

/**
 * Base Chart Props to be extended by {@link ChartProps}
 *
 * @internal
 */
export interface BaseChartProps {
  /**
   * Data set for this component, which supports two options:
   *
   * (1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
   * the chart will have an internal query connect to the data source
   * and load the data as specified in {@link dataOptions}, {@link filters}, and {@link highlights}.
   *
   * OR
   *
   * (2) Explicit {@link @sisense/sdk-data!Data | Data}, which is made up of
   * an array of {@link @sisense/sdk-data!Column | columns}
   * and a two-dimensional array of data {@link @sisense/sdk-data!Cell | cells}.
   * This allows the chart component to be used
   * with user-provided data.
   *
   * If neither option is specified,
   * the chart will use the `defaultDataSource` specified in the parent Sisense Context.
   *
   *
   * @category Data
   */
  dataSet?: DataSource | Data;

  /**
   * Filters that will slice query results
   *
   * @category Data
   */
  filters?: Filter[] | FilterRelations;

  /**
   * Highlight filters that will highlight results that pass filter criteria
   *
   * @category Data
   */
  highlights?: Filter[];
}

/**
 * Chart props to be able to react on chart events.
 */
interface ChartEventProps extends HighchartsBasedChartEventProps {
  /**
   * Click handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointClick?:
    | DataPointEventHandler
    | ScatterDataPointEventHandler
    | AreamapDataPointEventHandler
    | BoxplotDataPointEventHandler
    | ScattermapDataPointEventHandler;

  /**
   * Context menu handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointContextMenu?:
    | DataPointEventHandler
    | ScatterDataPointEventHandler
    | BoxplotDataPointEventHandler;

  /**
   * Handler callback for selection of multiple data points
   *
   * @category Callbacks
   */
  onDataPointsSelected?: DataPointsEventHandler | ScatterDataPointsEventHandler;
}

/**
 * Props shared across {@link Chart} components.
 */
export interface ChartProps extends BaseChartProps, ChartEventProps {
  /**
   * Default chart type of each series.
   *
   * @category Chart
   */
  chartType: ChartType;

  /**
   * Configurations for how to interpret and present data passed to the chart.
   *
   * @category Chart
   */
  dataOptions: ChartDataOptions;

  /**
   * Style options union across chart types.
   *
   * @category Chart
   */
  styleOptions?: ChartStyleOptions;

  /**
   * Used to force a refresh of the chart from outside the chart component
   * Since added to dependencies of useEffect, will trigger a query execution
   *
   * @internal
   */
  refreshCounter?: number;
}

/**
 * Props of the {@link AreaChart} component.
 */
export interface AreaChartProps
  extends BaseChartProps,
    RegularChartEventProps,
    HighchartsBasedChartEventProps {
  /**
   * Configurations for how to interpret and present data passed to the chart.
   *
   * @category Chart
   */
  dataOptions: CartesianChartDataOptions;
  /**
   * Configuration that defines the functional style of the various chart elements.
   *
   * @category Chart
   */
  styleOptions?: AreaStyleOptions;
}

/**
 * Props of the {@link BarChart} component.
 */
export interface BarChartProps
  extends BaseChartProps,
    RegularChartEventProps,
    HighchartsBasedChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: CartesianChartDataOptions;
  /**
   * Configuration that defines functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: StackableStyleOptions;
}

/**
 * Props of the {@link ColumnChart} component.
 */
export interface ColumnChartProps
  extends BaseChartProps,
    HighchartsBasedChartEventProps,
    RegularChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: CartesianChartDataOptions;
  /**
   * Configuration that defines functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: StackableStyleOptions;
}

/**
 * Props of the {@link FunnelChart} component.
 */
export interface FunnelChartProps
  extends BaseChartProps,
    HighchartsBasedChartEventProps,
    RegularChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: CategoricalChartDataOptions;
  /**
   * Configuration that defines functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: FunnelStyleOptions;
}

/**
 * Props of the {@link LineChart} component.
 */
export interface LineChartProps
  extends BaseChartProps,
    HighchartsBasedChartEventProps,
    RegularChartEventProps {
  /**
   * Configurations for how to interpret and present data passed to the chart.
   *
   * @category Chart
   */
  dataOptions: CartesianChartDataOptions;
  /**
   * Configuration that defines the functional style of the various chart elements.
   *
   * @category Chart
   */
  styleOptions?: LineStyleOptions;
}

/**
 * Props of the {@link PieChart} component.
 */
export interface PieChartProps
  extends BaseChartProps,
    HighchartsBasedChartEventProps,
    RegularChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: CategoricalChartDataOptions;
  /**
   * Configuration that defines functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: PieStyleOptions;
}

/**
 * Props of the {@link PolarChart} component.
 */
export interface PolarChartProps
  extends BaseChartProps,
    HighchartsBasedChartEventProps,
    RegularChartEventProps {
  /** Configurations for how to interpret and present the data passed to the chart */
  dataOptions: CartesianChartDataOptions;
  /** Configuration that defines functional style of the various chart elements */
  styleOptions?: PolarStyleOptions;
}

/**
 * Props of the {@link IndicatorChart} component.
 */
export interface IndicatorChartProps extends BaseChartProps {
  /** Configurations for how to interpret and present the data passed to the chart */
  dataOptions: IndicatorChartDataOptions;
  /** Configuration that defines functional style of the various chart elements */
  styleOptions?: IndicatorStyleOptions;
}

/**
 * Props of the {@link Table} component.
 */
export interface TableProps {
  /**
   * {@inheritDoc ChartProps.dataSet}
   *
   *
   * @category Data
   */
  dataSet?: DataSource | Data;

  /**
   * Configurations for how to interpret and present the data passed to the component
   *
   * @category Representation
   */
  dataOptions: TableDataOptions;

  /**
   * Filters that will slice query results
   *
   * @category Data
   */
  filters?: Filter[] | FilterRelations;

  /**
   * Configurations that define functional style of the various table elements
   *
   * @category Representation
   */
  styleOptions?: TableStyleOptions;

  /**
   * Used to force a refresh of the table from outside the table component
   * Since added to dependencies of useEffect, will trigger a query execution
   *
   * @internal
   */
  refreshCounter?: number;
}

/**
 * Props of the {@link PivotTable} component.
 */
export interface PivotTableProps {
  /**
   * Data source name (as a `string`) - e.g. `Sample ECommerce`.
   *
   * If not specified, the component will use the `defaultDataSource` specified in the parent Sisense Context.
   *
   * @category Data
   */
  dataSet?: DataSource;

  /**
   * Configurations for how to interpret and present the data passed to the component
   *
   * @category Representation
   */
  dataOptions: PivotTableDataOptions;

  /**
   * Filters that will slice query results
   *
   * @category Data
   */
  filters?: Filter[] | FilterRelations;

  /**
   * Configurations that define functional style of the various table elements
   *
   * @category Representation
   */
  styleOptions?: PivotTableStyleOptions;

  /**
   * Used to force a refresh of the table from outside the table component
   * Since added to dependencies of useEffect, will trigger a query execution
   *
   * @internal
   */
  refreshCounter?: number;
}

/**
 * Props of the {@link ScatterChart} component.
 */
export interface ScatterChartProps
  extends BaseChartProps,
    ScatterChartEventProps,
    HighchartsBasedChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: ScatterChartDataOptions;
  /**
   * Configuration that defines functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: ScatterStyleOptions;
}

/**
 * Props for the {@link DashboardWidget} component
 *
 */
export interface DashboardWidgetProps
  extends Omit<ChartWidgetProps, 'dataSource' | 'dataOptions' | 'chartType' | 'styleOptions'> {
  /**
   * Identifier of the widget
   *
   * @category Widget
   */
  widgetOid: string;
  /**
   * Identifier of the dashboard that contains the widget
   *
   * @category Widget
   */
  dashboardOid: string;
  /**
   * Filters that will slice query results
   *
   * Provided filters will be merged with the existing filters from the widget configuration.
   *
   * @category Data
   */
  filters?: Filter[];
  /**
   * Highlight filters that will highlight results that pass filter criteria
   *
   * @category Data
   */
  highlights?: Filter[];
  /**
   * {@inheritDoc ExecuteQueryByWidgetIdProps.filtersMergeStrategy}
   *
   * @category Data
   */
  filtersMergeStrategy?: FiltersMergeStrategy;
  /**
   * {@inheritDoc ExecuteQueryByWidgetIdProps.includeDashboardFilters}
   *
   * @category Data
   */
  includeDashboardFilters?: boolean;
  /**
   * Title of the widget
   *
   * If not specified, it takes the existing value from the widget configuration.
   *
   * @category Widget
   */
  title?: string;
  /**
   * Description of the widget
   *
   * If not specified, it takes the existing value from the widget configuration.
   *
   * @category Widget
   */
  description?: string;
  /**
   * Style options for the the widget including the widget container and the chart or table inside.
   *
   *
   * @category Widget
   */
  styleOptions?: DashboardWidgetStyleOptions;
  /**
   * {@inheritDoc ChartWidgetProps.drilldownOptions}
   *
   * @category Widget
   * @internal
   */
  drilldownOptions?: DrilldownOptions;
}

/**
 * Props for the {@link ChartWidget} component
 *
 */
export interface ChartWidgetProps extends ChartEventProps {
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.
   *
   * @category Data
   */
  dataSource?: DataSource;

  /**
   * Filters that will slice query results
   *
   * @category Data
   */
  filters?: Filter[] | FilterRelations;

  /**
   * Highlight filters that will highlight results that pass filter criteria
   *
   * @category Data
   */
  highlights?: Filter[];

  /**
   * Default chart type of each series
   *
   * @category Chart
   */
  chartType: ChartType;

  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: ChartDataOptions;

  /**
   * Style options for both the chart and widget including the widget header
   *
   * @category Widget
   */
  styleOptions?: ChartWidgetStyleOptions;

  /**
   * List of categories to allow drilldowns on
   *
   * @category Widget
   */
  drilldownOptions?: DrilldownOptions;

  /**
   * React nodes to be rendered at the top of component, before the chart
   *
   * @category Widget
   * @internal
   */
  topSlot?: ReactNode;

  /**
   * React nodes to be rendered at the bottom of component, after the chart
   *
   * @category Widget
   * @internal
   */
  bottomSlot?: ReactNode;

  /**
   * ContextMenu items for when data points are selected or right-clicked
   *
   * @category Widget
   * @internal
   */
  contextMenuItems?: MenuItemSection[];

  /**
   * Callback for when context menu is closed
   *
   * @category Widget
   * @internal
   */
  onContextMenuClose?: () => void;

  /**
   * Title of the widget
   *
   * @category Widget
   */
  title?: string;

  /**
   *  Description of the widget
   *
   * @category Widget
   */
  description?: string;

  /**
   * Boolean flag whether selecting data points triggers highlight filter of the selected data
   *
   * Recommended to turn on when the Chart Widget component is enhanced with data drilldown by the Drilldown Widget component
   *
   * If not specified, the default value is `false`
   *
   * @category Widget
   */
  highlightSelectionDisabled?: boolean;
}

/**
 * Props for the {@link TableWidget} component
 *
 * @internal
 */
export interface TableWidgetProps {
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.
   *
   * @category Data
   */
  dataSource?: DataSource;

  /**
   * Filters that will slice query results
   *
   * @category Data
   */
  filters?: Filter[] | FilterRelations;

  /**
   * Configurations for how to interpret and present the data passed to the table
   *
   * @category Chart
   */
  dataOptions: TableDataOptions;

  /**
   * Style options for both the table and widget including the widget header
   *
   * @category Widget
   */
  styleOptions?: TableWidgetStyleOptions;

  /**
   * React nodes to be rendered at the top of component, before the table
   *
   * @category Widget
   */
  topSlot?: ReactNode;

  /**
   * React nodes to be rendered at the bottom of component, after the table
   *
   * @category Widget
   */
  bottomSlot?: ReactNode;

  /**
   * Title of the widget
   *
   * @category Widget
   */
  title?: string;

  /**
   *  Description of the widget
   *
   * @category Widget
   */
  description?: string;
}

/**
 * Props for {@link ExecuteQueryByWidgetId} component.
 */
export interface ExecuteQueryByWidgetIdProps {
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

  /** {@inheritDoc ExecuteQueryProps.count} */
  count?: number;

  /** {@inheritDoc ExecuteQueryProps.offset} */
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

  /** Function as child component that is called to render the query results */
  children?: (queryState: QueryByWidgetIdState) => ReactNode;

  /** Callback function that is evaluated when query results are ready */
  onDataChanged?: (data: QueryResultData, queryParams: ExecuteQueryParams) => void;

  /**
   * Sync or async callback that allows to modify the JAQL payload before it is sent to the server.
   *
   * **Note:** wrap this function in `useCallback` hook to avoid triggering query execution on each render.
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
 * Props of the {@link TreemapChart} component.
 */
export interface TreemapChartProps
  extends BaseChartProps,
    HighchartsBasedChartEventProps,
    RegularChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: CategoricalChartDataOptions;
  /**
   * Configuration that defines functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: TreemapStyleOptions;
}

/**
 * Props of the {@link SunburstChart} component.
 */
export interface SunburstChartProps
  extends BaseChartProps,
    RegularChartEventProps,
    HighchartsBasedChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: CategoricalChartDataOptions;
  /**
   * Configuration that defines functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: SunburstStyleOptions;
}

/**
 * Props of the {@link BoxplotChart} component.
 */
export interface BoxplotChartProps
  extends BaseChartProps,
    BoxplotChartEventProps,
    HighchartsBasedChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: BoxplotChartDataOptions | BoxplotChartCustomDataOptions;
  /**
   * Configuration that defines functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: BoxplotStyleOptions;
}

/**
 * Props of the {@link ScattermapChart} component.
 */
export interface ScattermapChartProps extends BaseChartProps, ScattermapChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: ScattermapChartDataOptions;
  /**
   * Configuration that defines functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: ScattermapStyleOptions;
}

/**
 * Props of the {@link AreamapChart} component.
 */
export interface AreamapChartProps extends BaseChartProps, AreamapChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: AreamapChartDataOptions;
  /**
   * Configuration that defines functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: AreamapStyleOptions;
}

/**
 * Props for {@link ContextMenu} component.
 */
export interface ContextMenuProps {
  /**
   * Context menu position
   *
   * @category Widget
   */
  position?: MenuPosition | null;
  /**
   * Callback function that is evaluated when the context menu is closed
   *
   * @category Widget
   */
  closeContextMenu: () => void;
  /**
   * Menu item sections
   *
   * @category Widget
   */
  itemSections?: MenuItemSection[];
  /**
   * React nodes to be rendered at the bottom of the context menu
   *
   * @category Widget
   */
  children?: React.ReactNode;
}

export interface DrilldownBreadcrumbsProps {
  /**
   * List of drilldown filters formatted to be displayed as breadcrumbs
   *
   * @category Widget
   */
  filtersDisplayValues: string[][];
  /**
   * Currently selected drilldown dimension
   *
   * @category Widget
   */
  currentDimension: Attribute;
  /**
   * Callback function that is evaluated when the close (X) button is clicked
   *
   * @category Widget
   */
  clearDrilldownSelections: () => void;
  /**
   * Callback function that is evaluated when a breadcrumb is clicked
   *
   * @category Widget
   */
  sliceDrilldownSelections: (i: number) => void;
}

/**
 * An object that allows users to pass advanced configuration options as a prop for the {@link DrilldownWidget} component
 */
export type DrilldownWidgetConfig = {
  /**
   * Boolean to override default breadcrumbs location and instead only return them as a property of the 'children' function
   *
   * @category Widget
   */
  isBreadcrumbsDetached?: boolean;
  /**
   * React component to be rendered as breadcrumbs
   *
   * {@link DrilldownBreadcrumbs} will be used if not provided
   *
   * @category Widget
   */
  breadcrumbsComponent?: ComponentType<DrilldownBreadcrumbsProps>;
  /**
   * Boolean to override default breadcrumbs location and instead only return them as a property of the 'children' function
   *
   * @category Widget
   */
  contextMenuComponent?: (contextMenuProps: ContextMenuProps) => JSX.Element;
};

/**
 * Props for the {@link DrilldownWidget} component
 */
export interface DrilldownWidgetProps {
  /**
   * List of dimensions to allow drilldowns on
   *
   * @category Widget
   */
  drilldownDimensions: Attribute[];
  /**
   * Initial dimension to apply first set of filters to
   *
   * @category Widget
   */
  initialDimension: Attribute;
  /**
   * An object that allows users to pass advanced configuration options as a prop for the {@link DrilldownWidget} component
   *
   * @category Widget
   */
  config?: DrilldownWidgetConfig;
  /**
   * React component to be rendered as context menu
   *
   * {@link ContextMenu} will be used if not provided
   *
   * @category Widget
   */
  children: (customDrilldownResult: CustomDrilldownResult) => ReactNode;
}

/**
 * Params of the {@link useGetSharedFormula} hook
 *
 * Can consist either of an oid or a name/dataSource pair
 */
export interface UseGetSharedFormulaParams extends HookEnableParam {
  /**
   * Formula identifier
   */
  oid?: string;
  /**
   * Formula name
   */
  name?: string;
  /**
   * Data source - e.g. `Sample ECommerce`
   */
  dataSource?: DataSource;
}
