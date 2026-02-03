/**
 * @internal API Exports
 *
 * Such APIs are for CSDK cross-packages usage only.
 * These APIs may change without notice and are not part of the public contract.
 */

// App
export { type ClientApplication, createClientApplication } from '../infra/app/client-application';

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
  translateFiltersAndRelationsToDto,
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

// Context Adapters
export * from '../infra/contexts/custom-widgets-provider/custom-widgets-provider-adapter';

// Utilities
export { translateColumnToAttribute } from '../domains/visualizations/core/chart-data-options/utils';
export { isSameAttribute } from '@/shared/utils/filters';
export {
  isChartWidgetProps,
  isPivotTableWidgetProps,
  isTextWidgetProps,
  isCustomWidgetProps,
} from '../domains/widgets/components/widget-by-id/utils';
export { getChartType } from '../domains/widgets/components/widget-by-id/utils';
export type { SoftUnion } from '@/shared/utils/utility-types';
export type { BeforeMenuOpenHandler } from '../infra/contexts/menu-provider/types';
export * from '../shared/hooks/data-load-state-reducer';
