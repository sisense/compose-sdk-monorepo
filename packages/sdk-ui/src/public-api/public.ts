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
export * from '../domains/visualizations/components/table';
export * from '../domains/visualizations/components/pivot-table';
export { TreemapChart } from '../domains/visualizations/components/treemap-chart';
export { SunburstChart } from '../domains/visualizations/components/sunburst-chart';
export { BoxplotChart } from '../domains/visualizations/components/boxplot-chart';
export { ScattermapChart } from '../domains/visualizations/components/scattermap-chart';
export { AreamapChart } from '../domains/visualizations/components/areamap-chart';
export { AreaRangeChart } from '../domains/visualizations/components/area-range-chart';
export { CalendarHeatmapChart } from '../domains/visualizations/components/calendar-heatmap-chart';

// Dashboarding
export * from '../domains/dashboarding';
/**
 * Jump To Dashboard (JTD) configuration types
 *
 * @group Dashboards
 * @shortDescription Configuration types for Jump To Dashboard functionality
 */
export type { JumpToDashboardConfig } from '../domains/dashboarding/hooks/jtd';
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
  BaseQueryParams,
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
  useExecuteCustomWidgetQueryInternal,
  type ExecuteCustomWidgetQueryParams,
  type CustomWidgetQueryState,
} from '../infra/contexts/custom-widgets-provider';

// Contexts
export { SisenseContextProvider } from '../infra/contexts/sisense-context/sisense-context-provider';
export * from '../infra/contexts/sisense-context/custom-sisense-context-provider';
export * from '../infra/contexts/theme-provider/custom-theme-provider';

// Widgets
export { DrilldownWidget } from '../domains/drilldown/components/drilldown-widget';
export { ChartWidget } from '../domains/widgets/components/chart-widget';
export { TableWidget } from '../domains/widgets/components/table-widget';
export { PivotTableWidget } from '../domains/widgets/components/pivot-table-widget';
export { TextWidget } from '../domains/widgets/components/text-widget';
export { Widget } from '../domains/widgets/components/widget';
export { TabberButtonsWidget } from '../domains/widgets/components/tabber-buttons-widget';
export { DrilldownBreadcrumbs } from '../domains/drilldown/components/drilldown-breadcrumbs';

// Custom Widgets
export * from '../infra/contexts/custom-widgets-provider/types';
export { useCustomWidgets } from '../infra/contexts/custom-widgets-provider';

// Models
export {
  useGetDashboardModel,
  useGetDashboardModels,
  useDashboardModel,
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
  type DashboardId,
  type WidgetsOptions,
  type CommonFiltersOptions,
  type CommonFiltersApplyMode,
  type FiltersIgnoringRules,
  UseDashboardModelActionType,
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
export * from '../domains/filters';

// Formulas
export * from '../domains/formulas';

// Data Browser & Data Source
export { DataSchemaBrowser } from '../domains/data-browser/data-schema-browser/data-schema-browser';
export {
  useGetDataSourceDimensions,
  useGetDataSourceFields,
  type GetDataSourceDimensionsParams,
  type DataSourceDimensionsState,
  type DataSourceDimensionsLoadingState,
  type DataSourceDimensionsErrorState,
  type DataSourceDimensionsSuccessState,
} from '../domains/data-browser/data-source-dimensional-model';

// Theming
export { ThemeProvider } from '../infra/contexts/theme-provider';

// General Components
export { LoadingIndicator } from '../shared/components/loading-indicator';
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
export {
  type TranslationDictionary,
  PACKAGE_NAMESPACE as translationNamespace,
} from '@/infra/translation/resources';
export { useFetch, type RequestConfig, type UseQueryResult } from '../shared/hooks/use-fetch';

// Other Bucket (will be refactored)
export * from '../domains/visualizations/core/chart-data-options/types';
export type { AutoZoomNavigatorScrollerLocation } from '../domains/widgets/components/widget-by-id/types';
export * from '../props';
export * from '../types';
export * from '@/shared/utils/gradient';
