import './translation/initialize-i18n';
import './index.css';

export { type ClientApplication, createClientApplication } from './app/client-application';
export * from './chart-data-options/types';
export { Chart } from './chart';
export { ThemeProvider } from './theme-provider';
export * from './dashboard';
export { DashboardWidget } from './widget-by-id/dashboard-widget';
export { WidgetById } from './widget-by-id/widget-by-id';
export {
  isChartWidgetProps,
  isPivotTableWidgetProps,
  isTextWidgetProps,
  isPluginWidgetProps,
} from './widget-by-id/utils';
export {
  type WidgetType,
  type CartesianWidgetType,
  type CategoricalWidgetType,
  type TabularWidgetType,
  type TextWidgetType,
} from './widget-by-id/types';
export { getChartType } from './widget-by-id/utils';
export * from './query-execution';
export { executeQuery } from './query/execute-query';
export { SisenseContextProvider } from './sisense-context/sisense-context-provider';
export { DrilldownWidget } from './widgets/drilldown-widget';
export { processDrilldownSelections } from './widgets/common/use-drilldown-core';
export { ChartWidget } from './widgets/chart-widget';
export { TableWidget } from './widgets/table-widget';
export { PivotTableWidget } from './widgets/pivot-table-widget';
export { TextWidget } from './widgets/text-widget';
export { Widget } from './widgets/widget';
export { ContextMenu } from './common/components/menu/context-menu/context-menu';
export { DrilldownBreadcrumbs } from './widgets/common/drilldown-breadcrumbs';
export * from './line-chart';
export * from './column-chart';
export * from './area-chart';
export * from './pie-chart';
export * from './bar-chart';
export * from './funnel-chart';
export * from './polar-chart';
export * from './scatter-chart';
export * from './indicator-chart';
export * from './table';
export * from './pivot-table';
export * from './treemap-chart';
export * from './sunburst-chart';
export * from './boxplot-chart';
export * from './scattermap-chart';
export * from './areamap-chart';
export * from './area-range-chart';
export * from './sisense-context/custom-sisense-context-provider';
export * from './theme-provider/custom-theme-provider';
export * from './plugins-provider/custom-plugins-provider';
export * from './plugins-provider/types';
export { usePlugins } from './plugins-provider/plugins-provider';
export {
  extractDimensionsAndMeasures,
  useExecutePluginQuery,
} from './plugins-provider/use-execute-plugin-query';
export { getThemeSettingsByOid } from './themes/theme-loader';
export { getDefaultThemeSettings } from './theme-provider/default-theme-settings';
export {
  useGetDashboardModel,
  useGetDashboardModels,
  useDashboardModel,
  getDashboardModel,
  getDashboardModels,
  useGetWidgetModel,
  getWidgetModel,
  translateToDashboardResponse,
  translateToDashboardsResponse,
  useGetHierarchyModels,
  getHierarchyModels,
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
  type WidgetModel,
  type WidgetDataOptions,
  type WidgetModelState,
  type WidgetModelLoadingState,
  type WidgetModelErrorState,
  type WidgetModelSuccessState,
  type GetWidgetModelParams,
  type GetDashboardModelOptions,
  type GetDashboardModelsOptions,
  type WidgetsPanelColumnLayout,
  type WidgetsPanelLayout,
  type WidgetId,
  type WidgetsOptions,
  type CommonFiltersOptions,
  type CommonFiltersApplyMode,
  type FiltersIgnoringRules,
  type HierarchyModel,
  type Hierarchy,
  type HierarchyId,
  type GetHierarchyModelsParams,
  type HierarchyModelsState,
  type HierarchyModelsLoadingState,
  type HierarchyModelsErrorState,
  type HierarchyModelsSuccessState,
  UseDashboardModelActionType,
} from './models';

/**
 * Utility functions to translate a Fusion widget model from and to other widget data structures
 *
 * @group Fusion Assets
 * @fusionEmbed
 * @shortDescription Utility functions to translate a Fusion widget model from and to other widget data structures
 */
export * as widgetModelTranslator from './models/widget/widget-model-translator';
/**
 * Utility functions to translate a Fusion dashboard model from and to other dashboard data structures
 *
 * @group Fusion Assets
 * @fusionEmbed
 * @shortDescription Utility functions to translate a Fusion dashboard model from and to other dashboard data structures
 */
export * as dashboardModelTranslator from './models/dashboard/dashboard-model-translator';

/**
 * Utility functions to manipulate `DashboardProps`
 *
 * @group Dashboards
 * @shortDescription Utility functions to manipulate dashboard elements
 */
export * as dashboardHelpers from './dashboard/dashboard-helpers';

export type { AutoZoomNavigatorScrollerLocation } from './widget-by-id/types';
export { boxWhiskerProcessResult } from './boxplot-utils';
export { queryStateReducer } from './query-execution/query-state-reducer';

export * from './props';
export * from './types';

export * from './filters';
export * from './formulas';
export { trackHook } from './decorators/hook-decorators';
export * from './common/hooks/data-load-state-reducer';
export { createDataOptionsFromPanels } from './widget-by-id/translate-widget-data-options';
export { type DashboardDto } from './api/types/dashboard-dto';
export { type WidgetDto } from './widget-by-id/types';
export { extractCombinedFilters } from './widget-by-id/translate-dashboard-filters';
export { useThemeContext } from './theme-provider';
export { LoadingIndicator } from './common/components/loading-indicator';
export { LoadingOverlay } from './common/components/loading-overlay';
export { useFetch, type RequestConfig, type UseQueryResult } from './common/hooks/use-fetch';
export { useGetDataSourceFields } from './common/hooks/fusion-endpoints/use-get-data-source-fields';
export type { EmptyObject } from './utils/utility-types';
export { translateColumnToAttribute } from './chart-data-options/utils';
export { isSameAttribute } from './utils/filters';
export { updateDrilldownSelections } from './widgets/common/use-drilldown-core';
export { getSelectionTitleMenuItem, getDrilldownMenuItems } from './widgets/hooks/use-drilldown';

export {
  type TranslationDictionary,
  PACKAGE_NAMESPACE as translationNamespace,
} from '@/translation/resources';
