/* eslint-disable max-lines */
import { Attribute, Filter, Measure, DataSource, Data, QueryResultData } from '@sisense/sdk-data';
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
  StyleOptions,
  ChartType,
  IndicatorStyleOptions,
  DrilldownOptions,
  TableStyleOptions,
  ThemeOid,
  WidgetStyleOptions,
  TreemapStyleOptions,
  CustomDrilldownResult,
  MenuPosition,
  MenuItemSection,
} from './types';
import { HighchartsOptions } from './chart-options-processor/chart-options-service';
import { PropsWithChildren, ReactNode } from 'react';
import {
  IndicatorDataOptions,
  ScatterChartDataOptions,
  TableDataOptions,
} from './chart-data-options/types';
import {
  DataPointEventHandler,
  DataPointsEventHandler,
  ScatterDataPointEventHandler,
  ScatterDataPointsEventHandler,
} from './chart-options-processor/apply-event-handlers';
import { AppConfig } from './app/client-application';
import { ExecuteQueryParams } from './query-execution';
import { FiltersMergeStrategy } from './dashboard-widget/types';

export type {
  ScatterDataPointEventHandler,
  ScatterDataPointsEventHandler,
  DataPointEventHandler,
  DataPointsEventHandler,
  MenuItemSection,
  HighchartsOptions,
};

/**
 * Props for {@link SisenseContextProvider} component
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
}

/**
 * Props for {@link ExecuteQuery} component.
 */
export interface ExecuteQueryProps {
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
  children?: (queryResult: QueryResultData) => ReactNode;

  /** Callback function that is evaluated when query results are ready */
  onDataChanged?: (data: QueryResultData) => void;
}

/**
 * Props for {@link ThemeProvider} component.
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

interface ChartEventProps {
  /**
   * Click handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointClick?: DataPointEventHandler | ScatterDataPointEventHandler;
  /**
   * Context menu handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointContextMenu?: DataPointEventHandler | ScatterDataPointEventHandler;
  /**
   * Handler callback for selection of multiple data points
   *
   * @category Callbacks
   */
  onDataPointsSelected?: DataPointsEventHandler | ScatterDataPointsEventHandler;

  /**
   * Before render handler callback that allows adjusting
   * detail chart options prior to render
   *
   * This callback is not yet supported for {@link IndicatorChart}
   *
   * @category Callbacks
   */
  onBeforeRender?: BeforeRenderHandler;
}

interface CartesianChartEventProps extends ChartEventProps {
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

interface ScatterChartEventProps extends ChartEventProps {
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
 * Base Chart Props to be extended by {@link ChartProps}
 *
 * @internal
 */
export interface BaseChartProps {
  /**
   * Data set for this chart, which supports two options:
   *
   * (1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
   * the chart will have an internal {@link ExecuteQuery} connect to the data source
   * and load the data as specified in {@link dataOptions}, {@link filters}, and {@link highlights}.
   *
   * OR
   *
   * (2) Explicit {@link @sisense/sdk-data!Data}, which is made up of
   * an array of {@link @sisense/sdk-data!Column | columns}
   * and a two-dimensional array of data {@link @sisense/sdk-data!Cell | cells}.
   * This allows the chart component to be used
   * with user-provided data.
   *
   * If neither option is specified,
   * the chart will use the `defaultDataSource` specified in the parent {@link SisenseContextProvider} component.
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
  filters?: Filter[];

  /**
   * Highlight filters that will highlight results that pass filter criteria
   *
   * @category Data
   */
  highlights?: Filter[];
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
  styleOptions?: StyleOptions;

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
export interface AreaChartProps extends BaseChartProps, CartesianChartEventProps {
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
export interface BarChartProps extends BaseChartProps, CartesianChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: CartesianChartDataOptions;
  /**
   * Configuration that define functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: StackableStyleOptions;
}

/**
 * Props of the {@link ColumnChart} component.
 */
export interface ColumnChartProps extends BaseChartProps, CartesianChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: CartesianChartDataOptions;
  /**
   * Configuration that define functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: StackableStyleOptions;
}

/**
 * Props of the {@link FunnelChart} component.
 */
export interface FunnelChartProps extends BaseChartProps, CartesianChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: CategoricalChartDataOptions;
  /**
   * Configuration that define functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: FunnelStyleOptions;
}

/**
 * Props of the {@link LineChart} component.
 */
export interface LineChartProps extends BaseChartProps, CartesianChartEventProps {
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
export interface PieChartProps extends BaseChartProps, CartesianChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: CategoricalChartDataOptions;
  /**
   * Configuration that define functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: PieStyleOptions;
}

/**
 * Props of the {@link PolarChart} component.
 */
export interface PolarChartProps extends BaseChartProps, CartesianChartEventProps {
  /** Configurations for how to interpret and present the data passed to the chart */
  dataOptions: CartesianChartDataOptions;
  /** Configuration that define functional style of the various chart elements */
  styleOptions?: PolarStyleOptions;
}

/**
 * Props of the {@link IndicatorChart} component.
 */
export interface IndicatorChartProps extends BaseChartProps {
  /** Configurations for how to interpret and present the data passed to the chart */
  dataOptions: IndicatorDataOptions;
  /** Configuration that define functional style of the various chart elements */
  styleOptions?: IndicatorStyleOptions;
}

/**
 * Props of the {@link Table} component.
 */
export interface TableProps {
  /**
   * Data set for this chart, which supports two options:
   *
   * (1) Data source name (as a `string`) - e.g. `Sample ECommerce`. Under the hood,
   * the chart will have an internal {@link ExecuteQuery} connect to the data source
   * and load the data as specified in {@link dataOptions} and {@link filters}.
   *
   * OR
   *
   * (2) Explicit {@link @sisense/sdk-data!Data}, which is made up of
   * an array of {@link @sisense/sdk-data!Column | columns}
   * and a two-dimensional array of data {@link @sisense/sdk-data!Cell | cells}.
   * This allows the chart component to be used
   * with user-provided data.
   *
   * If neither option is specified,
   * the chart will use the `defaultDataSource` specified in the parent {@link SisenseContextProvider} component.
   *
   *
   * @category Data
   */
  dataSet?: DataSource | Data;

  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: TableDataOptions;

  /**
   * Filters that will slice query results
   *
   * @category Data
   */
  filters?: Filter[];

  /**
   * Configurations that define functional style of the various chart elements
   *
   * @category Chart
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
 * Props of the {@link ScatterChart} component.
 */
export interface ScatterChartProps extends BaseChartProps, ScatterChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: ScatterChartDataOptions;
  /**
   * Configuration that define functional style of the various chart elements
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
  extends Omit<ChartWidgetProps, 'dataSource' | 'dataOptions' | 'chartType' | 'styleOptions'>,
    ChartEventProps {
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
   * Style options for the widget container including the widget header
   *
   * @category Widget
   */
  widgetStyleOptions?: WidgetStyleOptions;
  /**
   * General style options for the visual component of the widget – for example, chart or table.
   *
   * @category Widget
   */
  styleOptions?: {
    /**
     * Total width of the component, which is considered in the following order of priority:
     *
     * 1. Value passed to this property (in pixels)
     * 2. Width of the container wrapping this component
     * 3. Default value as specified per chart type
     *
     */
    width?: number;
    /**
     * Total height of the component, which is considered in the following order of priority:
     *
     * 1. Value passed to this property (in pixels).
     * 2. Height of the container wrapping this component
     * 3. Default value as specified per chart type
     */
    height?: number;
  };
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
   * If not specified, the query will use the `defaultDataSource` specified in the parent {@link SisenseContextProvider} component.
   *
   * @category Data
   */
  dataSource?: DataSource;

  /**
   * Filters that will slice query results
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
   * Style options for both the widget as a whole and specifically for the widget header
   *
   * @category Widget
   */
  widgetStyleOptions?: WidgetStyleOptions;

  /**
   * Style options union across chart types
   *
   * @category Chart
   */
  styleOptions?: StyleOptions;

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
   * If not specified, the query will use the `defaultDataSource` specified in the parent {@link SisenseContextProvider} component.
   *
   * @category Data
   */
  dataSource?: DataSource;

  /**
   * Filters that will slice query results
   *
   * @category Data
   */
  filters?: Filter[];

  /**
   * Configurations for how to interpret and present the data passed to the table
   *
   * @category Chart
   */
  dataOptions: TableDataOptions;

  /**
   * Style options for both the widget as a whole and specifically for the widget header
   *
   * @category Widget
   */
  widgetStyleOptions?: WidgetStyleOptions;

  /**
   * Style options for table
   *
   * @category Chart
   */
  styleOptions?: TableStyleOptions;

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
   * Strategy for merging the existing widget filters with the filters provided via the `filters` prop:
   *
   * - `widgetFirst` - prioritizes the widget filters over the provided filters in case of filter conflicts by certain attributes.
   * - `codeFirst` - prioritizes the provided filters over the widget filters in case of filter conflicts by certain attributes.
   * - `codeOnly` - applies only the provided filters and completely ignores the widget filters.
   *
   * If not specified, the default strategy is `widgetFirst`.
   */
  filtersMergeStrategy?: FiltersMergeStrategy;

  /** Function as child component that is called to render the query results */
  children?: (queryResult: QueryResultData, queryParams: ExecuteQueryParams) => ReactNode;

  /** Callback function that is evaluated when query results are ready */
  onDataChanged?: (data: QueryResultData, queryParams: ExecuteQueryParams) => void;
}

/**
 * Props of the {@link TreemapChart} component.
 */
export interface TreemapChartProps extends BaseChartProps, CartesianChartEventProps {
  /**
   * Configurations for how to interpret and present the data passed to the chart
   *
   * @category Chart
   */
  dataOptions: CategoricalChartDataOptions;
  /**
   * Configuration that define functional style of the various chart elements
   *
   * @category Chart
   */
  styleOptions?: TreemapStyleOptions;
}

/**
 * Props for {@link ContextMenu} component.
 */
export type ContextMenuProps = {
  /**
   * Position of the context menu
   *
   * @category Widget
   */
  position?: MenuPosition | null;
  /**
   * Callback function that is evaluated when context menu is closed
   *
   * @category Widget
   */
  closeContextMenu: () => void;
  /**
   * Sections of menu items
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
};

export type DrilldownBreadcrumbsProps = {
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
   * Callback function that is evaluated when X button is clicked
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
};

/**
 * Props for the {@link DrilldownWidget} component
 */
export type DrilldownWidgetProps = {
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
   * React component to be rendered as breadcrumbs
   *
   * {@link DrilldownBreadcrumbs} will be used if not provided
   *
   * @category Widget
   */
  breadcrumbsComponent?: (drilldownBreadcrumbProps: DrilldownBreadcrumbsProps) => JSX.Element;
  /**
   * React component to be rendered as context menu
   *
   * {@link ContextMenu} will be used if not provided
   *
   * @category Widget
   */
  contextMenuComponent?: (contextMenuProps: ContextMenuProps) => JSX.Element;
  /**
   * A function that allows to pass calculated drilldown filters
   * and new dimension to a ReactNode to be rendered (custom chart)
   *
   * @category Widget
   */
  children: (customDrilldownResult: CustomDrilldownResult) => ReactNode;
};
