/**
 * @public API Exports
 *
 * Public APIs are stable and safe to use in production.
 */

// Charts
export { Chart } from '../domains/visualizations/components/chart';
export { LineChart } from '../domains/visualizations/components/line-chart';
export { ColumnChart } from '../domains/visualizations/components/column-chart';
export { AreaChart } from '../domains/visualizations/components/area-chart';
export { StreamgraphChart } from '../domains/visualizations/components/streamgraph-chart';
export { PieChart } from '../domains/visualizations/components/pie-chart';
export { BarChart } from '../domains/visualizations/components/bar-chart';
export { FunnelChart } from '../domains/visualizations/components/funnel-chart';
export { PolarChart } from '../domains/visualizations/components/polar-chart';
export { ScatterChart } from '../domains/visualizations/components/scatter-chart';
export { IndicatorChart } from '../domains/visualizations/components/indicator-chart';
export { Table } from '../domains/visualizations/components/table';
export { PivotTable } from '../domains/visualizations/components/pivot-table';
export { TreemapChart } from '../domains/visualizations/components/treemap-chart';
export { SunburstChart } from '../domains/visualizations/components/sunburst-chart';
export { BoxplotChart } from '../domains/visualizations/components/boxplot-chart';
export { ScattermapChart } from '../domains/visualizations/components/scattermap-chart';
export { AreamapChart } from '../domains/visualizations/components/areamap-chart';
export { AreaRangeChart } from '../domains/visualizations/components/area-range-chart';
export { CalendarHeatmapChart } from '../domains/visualizations/components/calendar-heatmap-chart';

// Dashboarding
export {
  DashboardById,
  Dashboard,
  useComposedDashboard,
  type ComposableDashboardProps,
  type UseComposedDashboardOptions,
  type ComposedDashboardResult,
  type DashboardByIdProps,
  type DashboardProps,
  type DashboardLayoutOptions,
  type DashboardStyleOptions,
  type DashboardConfig,
  type DashboardByIdConfig,
  type WidgetsPanelConfig,
  type EditModeConfig,
  type DashboardFiltersPanelConfig,
  type TabbersConfig,
  type TabberConfig,
  type TabberTabConfig,
  type DashboardChangeEvent,
  type DashboardFiltersUpdatedEvent,
  type DashboardFiltersPanelCollapseChangedEvent,
  type DashboardWidgetsPanelLayoutUpdatedEvent,
  type DashboardWidgetsPanelIsEditingChangedEvent,
  type DashboardWidgetsDeletedEvent,
} from '../domains/dashboarding';
/**
 * Jump To Dashboard (JTD) configuration types
 *
 * @group Dashboards
 * @shortDescription Configuration types for Jump To Dashboard functionality
 */
export type { JumpToDashboardConfig } from '../domains/dashboarding/hooks/jtd';
export type {
  JumpToDashboardConfigForPivot,
  JtdTarget,
  TriggerMethod,
} from '../domains/dashboarding/hooks/jtd';
export { useJtdWidget } from '../domains/dashboarding/hooks/use-jtd-widget';

// Widgets
export { WidgetById } from '../domains/widgets/components/widget-by-id/widget-by-id';
export {
  type CartesianWidgetType,
  type CategoricalWidgetType,
  type TabularWidgetType,
  type TextWidgetType,
} from '../domains/widgets/components/widget-by-id/types';

// Queries
export {
  ExecuteQuery,
  ExecuteQueryByWidgetId,
  useExecuteQuery,
  useExecuteCsvQuery,
  useExecuteQueryByWidgetId,
  useExecutePivotQuery,
} from '../domains/query-execution';
export type {
  QueryState,
  QueryLoadingState,
  QuerySuccessState,
  QueryErrorState,
  CsvQueryState,
  CsvQueryLoadingState,
  CsvQuerySuccessState,
  CsvQueryErrorState,
  PivotQueryState,
  PivotQueryLoadingState,
  PivotQuerySuccessState,
  PivotQueryErrorState,
  ExecuteQueryParams,
  ExecuteQueryResult,
  ExecuteCsvQueryParams,
  ExecuteCSVQueryConfig,
  ExecuteQueryByWidgetIdParams,
  QueryByWidgetIdState,
  QueryByWidgetIdQueryParams,
  ExecutePivotQueryParams,
} from '../domains/query-execution/types';
export {
  extractDimensionsAndMeasures,
  useExecuteCustomWidgetQuery,
  type ExecuteCustomWidgetQueryParams,
  type CustomWidgetQueryState,
} from '../infra/contexts/custom-widgets-provider';

// Contexts
export { SisenseContextProvider } from '../infra/contexts/sisense-context/sisense-context-provider';

// Widgets
export { DrilldownWidget } from '../domains/drilldown/components/drilldown-widget';
export { ChartWidget, type ChartWidgetProps } from '../domains/widgets/components/chart-widget';
export {
  PivotTableWidget,
  type PivotTableWidgetProps,
} from '../domains/widgets/components/pivot-table-widget';
export { type TextWidgetProps } from '../domains/widgets/components/text-widget';
export {
  Widget,
  type WidgetProps,
  type WidgetType,
  type WithCommonWidgetProps,
} from '../domains/widgets/components/widget';
export { type CustomWidgetProps } from '../domains/widgets/components/custom-widget';
export { DrilldownBreadcrumbs } from '../domains/drilldown/components/drilldown-breadcrumbs';

// Custom Widgets
export type {
  CustomWidgetComponentProps,
  CustomWidgetComponent,
} from '../infra/contexts/custom-widgets-provider/types';
export {
  useCustomWidgets,
  type UseCustomWidgetsResult,
} from '../infra/contexts/custom-widgets-provider';

// Models
export {
  useGetDashboardModel,
  useGetDashboardModels,
  type DashboardModel,
  type GetDashboardModelParams,
  type GetDashboardModelsParams,
  type DashboardModelState,
  type DashboardModelLoadingState,
  type DashboardModelSuccessState,
  type DashboardModelErrorState,
  type DashboardModelsState,
  type DashboardModelsLoadingState,
  type DashboardModelsSuccessState,
  type DashboardModelsErrorState,
  type GetDashboardModelOptions,
  type GetDashboardModelsOptions,
  type WidgetsPanelColumnLayout,
  type WidgetsPanelLayout,
  type WidgetsPanelColumn,
  type WidgetsPanelRow,
  type WidgetsPanelCell,
  type WidgetId,
  type WidgetsOptions,
  type SpecificWidgetOptions,
  type CommonFiltersOptions,
  type CommonFiltersApplyMode,
  type FiltersIgnoringRules,
} from '../domains/dashboarding/dashboard-model';
export {
  useGetWidgetModel,
  type WidgetModel,
  type WidgetDataOptions,
  type WidgetModelState,
  type WidgetModelLoadingState,
  type WidgetModelErrorState,
  type WidgetModelSuccessState,
  type GetWidgetModelParams,
} from '../domains/widgets/widget-model';
export {
  useGetHierarchyModels,
  type HierarchyModel,
  type Hierarchy,
  type HierarchyId,
  type GetHierarchyModelsParams,
  type HierarchyModelsState,
  type HierarchyModelsLoadingState,
  type HierarchyModelsErrorState,
  type HierarchyModelsSuccessState,
} from '../domains/drilldown/hierarchy-model';

// Filters
export {
  MemberFilterTile,
  type MemberFilterTileProps,
  type Member,
  type SelectedMember,
} from '../domains/filters/components/member-filter-tile';
export {
  DateRangeFilterTile,
  type DateRangeFilterTileProps,
} from '../domains/filters/components/date-filter/date-range-filter-tile';
export {
  RelativeDateFilterTile,
  type RelativeDateFilterTileProps,
} from '../domains/filters/components/date-filter/relative-date-filter-tile';
export {
  CriteriaFilterTile,
  type CriteriaFilterTileProps,
} from '../domains/filters/components/criteria-filter-tile';
export {
  FiltersPanel,
  type FiltersPanelProps,
  type FiltersPanelConfig,
} from '../domains/filters/components/filters-panel';
export { FilterTile, type FilterTileProps } from '../domains/filters/components/filter-tile';
export { type FilterVariant } from '../domains/filters/components/common/filter-utils';
export {
  useGetFilterMembers,
  type GetFilterMembersParams,
  type FilterMembersState,
  type FilterMembersLoadingState,
  type FilterMembersSuccessState,
  type FilterMembersErrorState,
  type GetFilterMembersResult,
  type GetFilterMembersData,
} from '../domains/filters/hooks/use-get-filter-members';

// Formulas
export {
  useGetSharedFormula,
  type GetSharedFormulaParams,
  type UseGetSharedFormulaParams,
  type SharedFormulaState,
  type SharedFormulaLoadingState,
  type SharedFormulaErrorState,
  type SharedFormulaSuccessState,
} from '../domains/formulas';

// Data Browser & Data Source
export {
  useGetDataSourceDimensions,
  type GetDataSourceDimensionsParams,
  type DataSourceDimensionsState,
  type DataSourceDimensionsLoadingState,
  type DataSourceDimensionsErrorState,
  type DataSourceDimensionsSuccessState,
} from '../domains/data-browser/data-source-dimensional-model';

// Theming
export { ThemeProvider, useTheme } from '../infra/contexts/theme-provider';
export type { CompleteThemeSettings } from '../types';

// General Components
export { LoadingOverlay, type LoadingOverlayProps } from '../shared/components/loading-overlay';
export { ContextMenu } from '../shared/components/menu/context-menu/context-menu';

/**
 * Utilities
 */
export { boxWhiskerProcessResult } from '../domains/visualizations/components/boxplot-chart/boxplot-utils';

/**
 * Utility functions to translate a Fusion widget model from and to other widget data structures
 *
 * @group Fusion Assets
 * @fusionEmbed
 * @shortDescription Utility functions to translate a Fusion widget model from and to other widget data structures
 */
export * as widgetModelTranslator from '../domains/widgets/widget-model/widget-model-translator';

/**
 * Utility functions to translate a Fusion dashboard model from and to other dashboard data structures
 *
 * @group Fusion Assets
 * @fusionEmbed
 * @shortDescription Utility functions to translate a Fusion dashboard model from and to other dashboard data structures
 */
export * as dashboardModelTranslator from '../domains/dashboarding/dashboard-model/dashboard-model-translator';

/**
 * Utility functions to manipulate `DashboardProps`
 *
 * @group Dashboards
 * @shortDescription Utility functions to manipulate dashboard elements
 */
export * as dashboardHelpers from '../domains/dashboarding/dashboard-helpers';

export type { EmptyObject } from '@/shared/utils/utility-types';

// Infra
export { useFetch, type RequestConfig, type UseQueryResult } from '../shared/hooks/use-fetch';

// Chart Data Options Types
export type {
  StyledColumn,
  SeriesStyleOptions,
  StyledMeasureColumn,
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  IndicatorChartDataOptions,
  ScatterChartDataOptions,
  AreamapChartDataOptions,
  CalendarHeatmapChartDataOptions,
  TableDataOptions,
  TabularChartDataOptions,
  PivotTableDataOptions,
  ScattermapLocationLevel,
  ScattermapChartDataOptions,
  BoxWhiskerType,
  BoxplotChartDataOptions,
  BoxplotChartCustomDataOptions,
  AreaRangeMeasureColumn,
  RangeChartDataOptions,
  ChartDataOptions,
  RegularChartDataOptions,
} from '../domains/visualizations/core/chart-data-options/types';

// Props
export type {
  TabberButtonsWidgetProps,
  SisenseContextProviderProps,
  ExecuteQueryProps,
  ThemeProviderProps,
  BeforeRenderHandler,
  IndicatorBeforeRenderHandler,
  ChartDataPointsEventHandler,
  DataPointsEventHandler,
  DataPointEventHandler,
  ScatterDataPointEventHandler,
  ScatterDataPointsEventHandler,
  AreamapDataPointEventHandler,
  ScattermapDataPointEventHandler,
  BoxplotDataPointEventHandler,
  IndicatorDataPointEventHandler,
  CalendarHeatmapDataPointEventHandler,
  CalendarHeatmapDataPointsEventHandler,
  PivotTableDataPointEventHandler,
  ChartEventProps,
  ChartProps,
  AreaChartProps,
  StreamgraphChartProps,
  BarChartProps,
  ColumnChartProps,
  FunnelChartProps,
  LineChartProps,
  PieChartProps,
  PolarChartProps,
  IndicatorChartProps,
  TableProps,
  PivotTableProps,
  ScatterChartProps,
  WidgetByIdProps,
  ExecuteQueryByWidgetIdProps,
  TreemapChartProps,
  SunburstChartProps,
  BoxplotChartProps,
  ScattermapChartProps,
  AreamapChartProps,
  AreaRangeChartProps,
  ContextMenuProps,
  DrilldownBreadcrumbsProps,
  DrilldownWidgetConfig,
  DrilldownWidgetProps,
  CalendarHeatmapChartProps,
} from '../props';
export type { AutoZoomNavigatorScrollerLocation } from '../domains/widgets/components/widget-by-id/types';

// Types
export type {
  SortDirection,
  PivotRowsSort,
  AppConfig,
  DateConfig,
  CalendarDayOfWeek,
  IndicatorComponents,
  ScatterMarkerSize,
  LegendPosition,
  Coordinates,
  TableColorOptions,
  IndicatorRenderOptions,
  GeoDataElement,
  RawGeoDataElement,
  CartesianChartType,
  CategoricalChartType,
  ScatterChartType,
  IndicatorChartType,
  BoxplotChartType,
  ScattermapChartType,
  AreamapChartType,
  CalendarHeatmapChartType,
  TableType,
  TableChartType,
  RangeChartType,
  TextStyle,
  DataColorCondition,
  ConditionalDataColorOptions,
  DataColorOptions,
  RangeDataColorOptions,
  UniformDataColorOptions,
  AreaSubtype,
  AreaRangeSubtype,
  LineSubtype,
  PieSubtype,
  PolarSubtype,
  StackableSubtype,
  BoxplotSubtype,
  MonthOfYear,
  DayOfWeek,
  DateLevel,
  TabberButtonsWidgetStyleOptions,
  TabberButtonsWidgetCustomOptions,
  Color,
  ColorPaletteTheme,
  Navigator,
  LineWidth,
  DashStyle,
  EndCapType,
  LineOptions,
  Markers,
  X2Title,
  SeriesLabelsTextStyle,
  SeriesLabelsBase,
  SeriesLabelsAligning,
  SeriesLabels,
  TotalLabelsTextStyle,
  TotalLabels,
  LegendTitleOptions,
  LegendItemsOptions,
  LegendSymbolsOptions,
  LegendOptions,
  Legend,
  Labels,
  AxisLabel,
  Convolution,
  DataLimits,
  LineStyleOptions,
  AreaRangeStyleOptions,
  AreaStyleOptions,
  StreamgraphStyleOptions,
  StackableStyleOptions,
  PiePercentageLabels,
  PieSeriesLabels,
  PieStyleOptions,
  FunnelSeriesLabels,
  FunnelStyleOptions,
  PolarStyleOptions,
  IndicatorStyleOptions,
  TableStyleOptions,
  TabularChartStyleOptions,
  PivotTableStyleOptions,
  NumericSimpleIndicatorStyleOptions,
  NumericBarIndicatorStyleOptions,
  GaugeIndicatorStyleOptions,
  ScatterSeriesLabels,
  ScatterStyleOptions,
  TreemapSeriesLabels,
  TreemapStyleOptions,
  SunburstSeriesLabelsBase,
  SunburstSeriesLabels,
  SunburstStyleOptions,
  BoxplotStyleOptions,
  AreamapType,
  AreamapStyleOptions,
  ScattermapMarkers,
  ScattermapStyleOptions,
  CalendarHeatmapCellLabels,
  CalendarHeatmapSubtype,
  CalendarHeatmapStyleOptions,
  CalendarHeatmapViewType,
  ChartStyleOptions,
  RegularChartStyleOptions,
  ValueToColorMap,
  MultiColumnValueToColorMap,
  ChartType,
  RegularChartType,
  SeriesChartType,
  DecimalScale,
  NumberFormatConfig,
  ThemeOid,
  ChartThemeSettings,
  AiChatThemeSettings,
  ThemeSettingsFontSource,
  ThemeSettingsFont,
  FontsLoaderSettings,
  TypographyThemeSettings,
  GeneralThemeSettings,
  SpaceSizes,
  RadiusSizes,
  ShadowsTypes,
  AlignmentTypes,
  WidgetThemeSettings,
  FilterThemeSettings,
  ThemeSettings,
  WidgetStyleOptions,
  WidgetContainerStyleOptions,
  WidgetByIdStyleOptions,
  ChartWidgetStyleOptions,
  PivotTableWidgetStyleOptions,
  TextWidgetStyleOptions,
  CustomWidgetStyleOptions,
  DrilldownOptions,
  PivotTableDrilldownOptions,
  PivotTableSelectableDrilldownOptions,
  PivotTableNonSelectableDrilldownOptions,
  DrilldownSelection,
  DataOptionLocation,
  ChartDataPoints,
  ChartDataPoint,
  DataPoint,
  DataPointEntry,
  BasicDataPointEntry,
  AttributeDataPointEntry,
  MeasureDataPointEntry,
  ScatterDataPoint,
  BoxplotDataPoint,
  IndicatorDataPoint,
  CalendarHeatmapDataPoint,
  PivotTableDataPoint,
  AreamapDataPoint,
  ScattermapDataPoint,
  CustomWidgetDataPoint,
  CustomWidgetDataPointEventHandler,
  CustomWidgetDataPointContextMenuHandler,
  CustomWidgetDataPointsEventHandler,
  CustomWidgetEventProps,
  AbstractDataPointWithEntries,
  MenuPosition,
  MenuItemSection,
  CustomDrilldownResult,
  LoadingIndicatorConfig,
  GenericDataOptions,
  NestedTranslationResources,
  CustomTranslationObject,
  TranslationConfig,
} from '../types';

// Gradient utilities
export {
  type GradientPosition,
  type ColorValue,
  type GradientStop,
  type LinearGradientDirection,
  type RadialGradientConfig,
  type LinearGradientColor,
  type RadialGradientColor,
  type GradientColor,
  isLinearGradient,
  isRadialGradient,
  isGradient,
  GradientDirections,
  RadialGradientPresets,
  createLinearGradient,
  createRadialGradient,
} from '@/shared/utils/gradient';
