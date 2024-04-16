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
import { ExecuteQueryParams, QueryByWidgetIdState } from './query-execution';
import { FiltersMergeStrategy } from './dashboard-widget/types';
import { HookEnableParam } from './common/hooks/types';
import { ExecuteQueryResult } from './query-execution/types';

export type { MenuItemSection, HighchartsOptions };

/**
 * Configurations and authentication for Sisense Context.
 *
 * Use one of the following to authenticate:
 *
 * - {@link ssoEnabled}
 * - {@link token}
 * - {@link wat}
 */
export interface SisenseContextProviderProps {
  /**
   * Default data source explicitly set to be used by child components that are not defined with a data source.
   */
  defaultDataSource?: DataSource;

  /** URL of the Sisense environment the app connects to */
  url: string;

  /**
   * [Single Sign-On](https://docs.sisense.com/main/SisenseLinux/using-single-sign-on-to-access-sisense.htm) toggle.
   *
   * Set to `true` to use SSO authentication. When `true`, this overrides any other authentication methods. Defaults to `false`.
   *
   * @category Authentication
   */
  ssoEnabled?: boolean;

  /**
   * Token for [bearer authentication](https://sisense.dev/guides/restApi/using-rest-api.html).
   *
   * @category Authentication
   */
  token?: string;

  /**
   * [Web Access Token](https://docs.sisense.com/main/SisenseLinux/using-web-access-token.htm).
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
 *
 * @privateRemarks
 * ExecuteQueryProps should inherit docs from ExecuteQueryParams,
 * instead of the other way around because sdk-ui-angular and sdk-ui-vue
 * can inherit docs from ExecuteQueryParams but not from ExecuteQueryProps.
 */
export interface ExecuteQueryProps {
  /** {@inheritDoc ExecuteQueryParams.dataSource} */
  dataSource?: DataSource;

  /** {@inheritDoc ExecuteQueryParams.dimensions} */
  dimensions?: Attribute[];

  /** {@inheritDoc ExecuteQueryParams.measures} */
  measures?: Measure[];

  /** {@inheritDoc ExecuteQueryParams.filters} */
  filters?: Filter[] | FilterRelations;

  /** {@inheritDoc ExecuteQueryParams.highlights} */
  highlights?: Filter[];

  /** {@inheritDoc ExecuteQueryParams.count} */
  count?: number;

  /** {@inheritDoc ExecuteQueryParams.offset} */
  offset?: number;

  /** Function as child component that is called to render the query results */
  children?: (queryResult: ExecuteQueryResult) => ReactNode;

  /** Callback function that is evaluated when query results are ready */
  onDataChanged?: (data: QueryResultData) => void;

  /** {@inheritDoc ExecuteQueryParams.onBeforeQuery} */
  onBeforeQuery?: (jaql: any) => any | Promise<any>;
}

/**
 * Configurations for Theme.
 *
 * Two options are supported:
 *
 * (1) `ThemeSettings` -- Custom theme settings that override the default theme settings.
 *
 * OR
 *
 * (2) `ThemeOid` -- Theme identifier as defined in a Fusion Embed instance (**Admin > App Configuration > Look and Feel**).
 * See [Customizing the Sisense User Interface](https://docs.sisense.com/main/SisenseLinux/customizing-the-sisense-user-interface.htm) for more details.
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
 * A handler function that allows you to customize the underlying chart element before it is
 * rendered. Use the `highchartsOptions` object that is passed to the callback to change
 * [options values](https://api.highcharts.com/highcharts/) and then return the modified options
 * object. The returned options are then used when rendering the chart.
 *
 * This callback is not supported for Indicator Chart, Areamap Chart, and Scattermap Chart.
 *
 * For an example of how the `BeforeRenderHandler` function can be used, see the
 * [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#callbacks).
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

/**
 * A handler function that allows you to customize what happens when certain events occur to
 * a data point.
 *
 * For an example of how the `DataPointEventHandler` function can be used, see the
 * [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#callbacks).
 */
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
   * A callback that allows you to customize the underlying chart element before it is rendered.
   * Use the `highchartsOptions` object that is passed to the callback to change
   * [options values](https://api.highcharts.com/highcharts/) and then return the modified options
   * object. The returned options are then used when rendering the chart.
   *
   * This callback is not supported for Indicator Chart, Areamap Chart, and Scattermap Chart.
   *
   * For an example of how the `onBeforeRender` callback can be used, see the
   * [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#callbacks).
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
   * A callback that allows you to customize what happens when a data point is clicked.
   *
   * To learn more about callbacks, see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#callbacks).
   *
   * @category Callbacks
   */
  onDataPointClick?: DataPointEventHandler;
  /**
   * A callback that allows you to customize what happens when a context menu is displayed for a data point.
   *
   * To learn more about callbacks, see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#callbacks).
   *
   * @category Callbacks
   */
  onDataPointContextMenu?: DataPointEventHandler;
  /**
   * A callback that allows you to customize what happens when data points are selected.
   *
   * To learn more about callbacks, see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#callbacks).
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
   * Data set for a chart using one of the following options. If neither option is specified, the chart
   * will use the `defaultDataSource` specified in the parent {@link SisenseContextProvider}
   * component.
   *
   *
   * (1) Sisense data source name as a string. For example, `'Sample ECommerce'`. Typically, you
   * retrieve the data source name from a data model you create using the `get-data-model`
   * {@link @sisense/sdk-cli!Command | command} of the Compose SDK CLI. Under the hood, the chart
   * connects to the data source, executes a query, and loads the data as specified in
   * {@link dataOptions}, {@link filters}, and {@link highlights}.
   *
   * To learn more about using data from a Sisense data source, see the
   * [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#sisense-data).
   *
   * OR
   *
   * (2) Explicit {@link @sisense/sdk-data!Data | `Data`}, which is made up of an array of
   * {@link @sisense/sdk-data!Column | `Column` } objects and a two-dimensional array of row data. This approach
   * allows the chart component to be used with any data you provide.
   *
   * To learn more about using data from an external data source, see the
   * [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#explicit-data).
   *
   * Example data in the proper format:
   *
   * ```ts
   * const sampleData = {
   *   columns: [
   *     { name: 'Years', type: 'date' },
   *     { name: 'Quantity', type: 'number' },
   *     { name: 'Units', type: 'number' },
   *   ],
   *   rows: [
   *     ['2019', 5500, 1500],
   *     ['2020', 4471, 7000],
   *     ['2021', 1812, 5000],
   *     ['2022', 5001, 6000],
   *     ['2023', 2045, 4000],
   *   ],
   * };
   * ```
   *
   * @category Data
   */
  dataSet?: DataSource | Data;

  /**
   * Filters to apply to a chart’s data using one of the following options.
   *
   * (1) Array of filters returned from filter factory functions, such as
   * {@link @sisense/sdk-data!filterFactory.greaterThan | `greaterThan()`} and {@link @sisense/sdk-data!filterFactory.members | `members()`}.
   *
   * Use this option for filters that do not require a UI to set them
   * or for filters where you will supply your own UI using non-Sisense components.
   *
   * To learn more about using filter factory functions to create filters, see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#filter-functions).
   *
   * (2) Array of filters controlled by Sisense filter components.
   *
   * Use this option for filters that you want your users to set using Sisense UI components.
   *
   * To learn more about using filter components to create filters, see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#filter-components).
   *
   * @category Data
   */
  filters?: Filter[] | FilterRelations;

  /**
   * Highlights based on filter criteria to apply to a chart using one of the following options.
   *
   * Note that the filter dimensions used in highlights must match those defined in the
   * {@link dataOptions} of the chart.
   *
   * (1) Array of filters returned from filter factory functions, such as
   * {@link @sisense/sdk-data!filterFactory.greaterThan | `greaterThan()`} and {@link @sisense/sdk-data!filterFactory.members | `members()`}.
   *
   * Use this option for highlights that do not require a UI to set them
   * or for highlights where you will supply your own UI using non-Sisense components.
   *
   * To learn more about using filter factory functions to create highlights, see the
   * [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#filter-functions-for-highlighting).
   *
   * (2) Array of filters controlled by Sisense filter components.
   *
   * Use this option for highlights that you want your users to set using Sisense UI components.
   *
   * To learn more about using filter components to create highlights, see the
   * [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#filter-components-for-highlighting).
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
   * Configurations for how to interpret and present a chart's data.
   *
   * To learn more about using data options,
   * see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#dataoptions).
   *
   * @category Chart
   */
  dataOptions: ChartDataOptions;

  /**
   * Configurations for how to style and present a chart's data.
   *
   * To learn more about using style options,
   * see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#styleoptions).
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
   * Configurations for how to interpret and present a chart's data.
   *
   * To learn more about using data options,
   * see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#dataoptions).
   *
   * @category Chart
   */
  dataOptions: CartesianChartDataOptions;
  /**
   * Configurations for how to style and present a chart's data.
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
   * Configurations for how to interpret and present a chart's data.
   *
   * To learn more about using data options,
   * see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#dataoptions).
   *
   * @category Chart
   */
  dataOptions: CartesianChartDataOptions;
  /**
   * Configurations for how to style and present a chart's data.
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
   * Configurations for how to interpret and present a chart's data.
   *
   * To learn more about using data options,
   * see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#dataoptions).
   *
   * @category Chart
   */
  dataOptions: CartesianChartDataOptions;
  /**
   * Configurations for how to style and present a chart's data.
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
   * Configurations for how to style and present a chart's data.
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
   * Configurations for how to interpret and present a chart's data.
   *
   * To learn more about using data options,
   * see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#dataoptions).
   *
   * @category Chart
   */
  dataOptions: CartesianChartDataOptions;
  /**
   * Configurations for how to style and present a chart's data.
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
   * Configurations for how to style and present a chart's data.
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
  /**
   * Configurations for how to interpret and present a chart's data.
   *
   * To learn more about using data options,
   * see the [Compose SDK Charts Guide](/guides/sdk/guides/charts/guide-compose-sdk-charts.html#dataoptions).
   *
   * @category Chart
   */
  dataOptions: CartesianChartDataOptions;
  /**
   * Configurations for how to style and present a chart's data.
   *
   * @category Chart
   */
  styleOptions?: PolarStyleOptions;
}

/**
 * Props of the {@link IndicatorChart} component.
 */
export interface IndicatorChartProps extends BaseChartProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: IndicatorChartDataOptions;
  /**
   * Configurations for how to style and present a chart's data.
   *
   * @category Chart
   */
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
   * Configurations for how to style and present a table's data.
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
   * Configurations for how to style and present a pivot table's data.
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
   * Configurations for how to style and present a chart's data.
   *
   * @category Chart
   */
  styleOptions?: ScatterStyleOptions;
}

/**
 * Props for the {@link DashboardWidget} component
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
   * {@inheritDoc ExecuteQueryByWidgetIdParams.filtersMergeStrategy}
   *
   * @category Data
   */
  filtersMergeStrategy?: FiltersMergeStrategy;
  /**
   * {@inheritDoc ExecuteQueryByWidgetIdParams.includeDashboardFilters}
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
   * Style options for the widget including the widget container and the chart or table inside.
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
 *
 * @privateRemarks
 * ExecuteQueryByWidgetIdProps should inherit docs from ExecuteQueryByWidgetIdParams,
 * instead of the other way around because sdk-ui-angular and sdk-ui-vue
 * can inherit docs from ExecuteQueryByWidgetIdParams but not from ExecuteQueryByWidgetIdProps.
 */
export interface ExecuteQueryByWidgetIdProps {
  /** {@inheritDoc ExecuteQueryByWidgetIdParams.widgetOid} */
  widgetOid: string;

  /** {@inheritDoc ExecuteQueryByWidgetIdParams.dashboardOid} */
  dashboardOid: string;

  /** {@inheritDoc ExecuteQueryByWidgetIdParams.filters} */
  filters?: Filter[];

  /** {@inheritDoc ExecuteQueryByWidgetIdParams.highlights} */
  highlights?: Filter[];

  /** {@inheritDoc ExecuteQueryParams.count} */
  count?: number;

  /** {@inheritDoc ExecuteQueryParams.offset} */
  offset?: number;

  /** {@inheritDoc ExecuteQueryByWidgetIdParams.filtersMergeStrategy} */
  filtersMergeStrategy?: FiltersMergeStrategy;

  /** {@inheritDoc ExecuteQueryByWidgetIdParams.includeDashboardFilters} */
  includeDashboardFilters?: boolean;

  /** {@inheritDoc ExecuteQueryProps.children} */
  children?: (queryState: QueryByWidgetIdState) => ReactNode;

  /** {@inheritDoc ExecuteQueryProps.onDataChanged} */
  onDataChanged?: (data: QueryResultData, queryParams: ExecuteQueryParams) => void;

  /** {@inheritDoc ExecuteQueryParams.onBeforeQuery} */
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
   * Configurations for how to style and present a chart's data.
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
   * Configurations for how to style and present a chart's data.
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
   * Configurations for how to style and present a chart's data.
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
   * Configurations for how to style and present a chart's data.
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
   * Configurations for how to style and present a chart's data.
   *
   * @category Chart
   */
  styleOptions?: AreamapStyleOptions;
}

/**
 * Props for ContextMenu component.
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
