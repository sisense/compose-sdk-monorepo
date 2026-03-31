/**
 * @internal API Exports
 *
 * Such APIs are for CSDK cross-packages usage only.
 * These APIs may change without notice and are not part of the public contract.
 */

// App
export { type ClientApplication } from '../infra/app/types';
export { createClientApplication } from '../infra/app/client-application';

// Queries
export { queryStateReducer } from '../domains/query-execution/hooks/shared/query-state-reducer';
export {
  useExecuteCsvQueryInternal,
  useExecutePivotQueryInternal,
  executeQueryByWidgetId,
} from '../domains/query-execution';
export {
  executeCsvQuery,
  executePivotQuery,
  executeQuery,
} from '../domains/query-execution/core/execute-query';

// Models
export {
  useDashboardModel,
  getDashboardModel,
  getDashboardModels,
  translateToDashboardResponse,
  translateToDashboardsResponse,
} from '../domains/dashboarding/dashboard-model';
export { getWidgetModel } from '@/domains/widgets/widget-model';
export { getHierarchyModels } from '@/domains/drilldown/hierarchy-model';

// Theming
export { getThemeSettingsByOid } from '../infra/themes/theme-loader';
export { getDefaultThemeSettings } from '../infra/contexts/theme-provider/default-theme-settings';

// Drilldown
export { updateDrilldownSelections } from '../domains/drilldown/hooks/use-drilldown-core';
export {
  getSelectionTitleMenuItem,
  getDrilldownMenuItems,
} from '../domains/drilldown/hooks/use-drilldown';
export { processDrilldownSelections } from '../domains/drilldown/hooks/use-drilldown-core';

// Widgets
export { CommonWidget, type CommonWidgetProps } from '../domains/widgets/components/common-widget';
export { TableWidget, type TableWidgetProps } from '../domains/widgets/components/table-widget';

// Context Adapters
export {
  CustomWidgetsProviderAdapter,
  type CustomWidgetsContextAdapter,
  type CustomWidgetsProviderAdapterProps,
} from '../infra/contexts/custom-widgets-provider/custom-widgets-provider-adapter';

// Plugin system (internal — for framework adapters)
export { CustomPluginContextProvider } from '../infra/plugins/custom-plugin-context-provider.js';
export type {
  CustomPluginContextProviderProps,
  CustomPluginContextProviderContext,
} from '../infra/plugins/custom-plugin-context-provider.js';

// Formulas
export { useGetSharedFormulaInternal } from '../domains/formulas/use-get-shared-formula';

// Utilities
export { translateColumnToAttribute } from '../domains/visualizations/core/chart-data-options/utils';
export { isSameAttribute } from '@/shared/utils/filters';
export {
  isTextWidgetProps,
  isCustomWidgetProps,
} from '../domains/widgets/components/widget-by-id/utils';
export { getChartType } from '../domains/widgets/components/widget-by-id/utils';
export type { SoftUnion } from '@/shared/utils/utility-types';
export type { BeforeMenuOpenHandler } from '../infra/contexts/menu-provider/types';
export {
  type DataState,
  type DataLoadingState,
  type DataErrorState,
  type DataSuccessState,
  dataLoadStateReducer,
} from '../shared/hooks/data-load-state-reducer';
export { trackHook } from '../infra/decorators/hook-decorators/with-tracking';

// Widget helpers
export { widgetHelpers } from '../domains/widgets/helpers';
