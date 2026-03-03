/**
 * @sisenseInternal API Exports
 *
 * Such APIs are for in-company usage only.
 * These APIs may change for in-company needs and are not part of the public contract.
 */

// Dashboarding
export { useDashboardPersistence } from '../domains/dashboarding/dashboard-model';
// Tracking Decorators
export * from '../infra/decorators/component-decorators/with-tracking';

/** List of unclear exports which should be verified */
export { createDataOptionsFromPanels } from '../domains/widgets/components/widget-by-id/translate-widget-data-options';
export { extractCombinedFilters } from '../domains/widgets/components/widget-by-id/translate-dashboard-filters';
export { trackHook } from '../infra/decorators/hook-decorators';
export { useThemeContext } from '../infra/contexts/theme-provider';
export { type DashboardDto } from '../infra/api/types/dashboard-dto';
export { type WidgetDto } from '../domains/widgets/components/widget-by-id/types';

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
