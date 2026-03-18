/**
 * @sisenseInternal API Exports
 *
 * Such APIs are for in-company usage only.
 * These APIs may change for in-company needs and are not part of the public contract.
 */

// Dashboarding
export { useDashboardPersistence } from '../domains/dashboarding/dashboard-model';
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

// Components
export { LoadingIndicator } from '../shared/components/loading-indicator.js';
export { DataSchemaBrowser } from '../domains/data-browser/data-schema-browser/data-schema-browser.js';

// Others
export type { NlqChartWidgetStyleOptions } from '../types';
export type { RenderTitleHandler } from '../types';
export { isChartWidgetProps } from '../domains/widgets/components/widget-by-id/utils.js';
export { isPivotTableWidgetProps } from '../domains/widgets/components/widget-by-id/utils.js';
