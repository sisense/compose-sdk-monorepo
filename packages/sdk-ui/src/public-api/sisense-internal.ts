/**
 * @sisenseInternal API Exports
 *
 * Such APIs are for in-company usage only.
 * These APIs may change for in-company needs and are not part of the public contract.
 */

// Dashboarding
export { translateFiltersAndRelationsToDto } from '../domains/dashboarding/dashboard-model/use-dashboard-model/dashboard-model-reducer/utils.js';
export { UseDashboardModelActionType } from '../domains/dashboarding/dashboard-model/use-dashboard-model/dashboard-model-reducer/types.js';
export { type DashboardDto } from '../infra/api/types/dashboard-dto';
export { type WidgetDto } from '../domains/widgets/components/widget-by-id/types';
export { getDashboardModel } from '../domains/dashboarding/dashboard-model/get-dashboard-model.js';

// Tracking Decorators
export { withTracking } from '../infra/decorators/component-decorators/with-tracking';

// Plugins
export { createDataOptionsFromPanels } from '../domains/widgets/components/widget-by-id/translate-widget-data-options';
export { extractCombinedFilters } from '../domains/widgets/components/widget-by-id/translate-dashboard-filters';

// Theming
export { useThemeContext } from '../infra/contexts/theme-provider';

// App settings hook and type
export { useAppSettings } from '../shared/hooks/use-app-settings';
export type { AppSettings } from '../infra/app/settings/settings';

// QuotaNotification component and hooks
export { QuotaNotification } from '../shared/components/quota-notification/quota-notification.js';
export type { QuotaNotificationProps } from '../shared/components/quota-notification/quota-notification.js';
export { useQuotaNotification } from '../shared/hooks/use-quota-notification.js';
export type {
  QuotaNotificationOptions,
  QuotaApiResponse,
  QuotaState,
} from '../shared/hooks/use-quota-notification.js';

// Plugin system — for creating and registering plugins (e.g. custom widgets, design panels)
export type { Plugin } from '../infra/plugins/types.js';
export type {
  WidgetPlugin,
  CustomVisualization,
  CustomVisualizationProps,
  CustomVisualizationStyleOptions,
  CustomVisualizationEventProps,
  CustomVisualizationDataPoint,
  CustomVisualizationDataPointEventHandler,
  CustomVisualizationDataPointContextMenuHandler,
  CustomVisualizationDataPointsEventHandler,
  DesignPanelProps,
  DesignPanel,
} from '../infra/plugins/widget-plugins/types.js';

// Components
export { LoadingIndicator } from '../shared/components/loading-indicator.js';
export { DataSchemaBrowser } from '../domains/data-browser/data-schema-browser/data-schema-browser.js';

// Narrative
export { type NarrativeQueryParams } from '../domains/narrative/core/build-narrative-request.js';
export {
  useGetWidgetNarrative,
  type UseGetWidgetNarrativeOptions,
  type UseGetWidgetNarrativeParams,
  type UseGetWidgetNarrativeResult,
} from '../domains/narrative/hooks/use-get-widget-narrative.js';
export {
  WidgetNarrative,
  type WidgetNarrativeProps,
} from '../domains/narrative/components/widget-narrative.js';

// Others
export type { NlqChartWidgetStyleOptions } from '../types';
export type { RenderTitleHandler } from '../types';
export { isChartWidgetProps } from '../domains/widgets/components/widget-by-id/utils.js';
export { isPivotTableWidgetProps } from '../domains/widgets/components/widget-by-id/utils.js';

// Dashboard persistence
/* legacy */
export { useDashboardPersistence } from '../domains/dashboarding/dashboard-model';

/* recommended approach */
export { createDashboardPersistenceManager } from '../domains/dashboarding/persistence/persistence-manager.js';
export type { DashboardPersistenceManager } from '../domains/dashboarding/persistence/types.js';

// Query Definition (read-only pills above widget in canvas)
export {
  QueryDefinition,
  type QueryDefinitionProps,
  type QueryPillCategory,
  type QueryPillItem,
  type QueryDefinitionViewModel,
} from '../domains/visualizations/core/query-definition';
