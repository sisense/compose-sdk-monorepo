/**
 * @alpha API Exports
 *
 * Alpha APIs are highly experimental and subject to change.
 * Not recommended for production use.
 */

export { useDashboardTheme } from '../domains/dashboarding/use-dashboard-theme.js';
export type { ThemeConfig } from '../types';

// Widget header configuration (the rest of the tree is public — see public.ts)
export type { WidgetHeaderTitleConfig } from '../domains/widgets/shared/widget-header/widget-header-config.js';

// Translation
export {
  type TranslationDictionary,
  PACKAGE_NAMESPACE as translationNamespace,
} from '@/infra/translation/resources';

// Filter components
export {
  CascadingFilterTile,
  type CascadingFilterTileProps,
} from '../domains/filters/components/cascading-filter-tile';
export {
  CustomFilterTile,
  type CustomFilterTileProps,
} from '../domains/filters/components/custom-filter-tile';

// Filter Widget (props/type live in beta.ts — they are referenced by the public WidgetProps union)
export {
  FilterWidget,
  filterWidgetFilterTypeLabels,
} from '../domains/widgets/components/filter-widget/index.js';

// Dashboard Narrative Widget (props/config live in beta.ts — they are referenced by the
// public WidgetProps and WidgetConfig unions)
export { NarrativeWidget } from '../domains/widgets/components/narrative-widget/index.js';

// Charts related
export {
  isIndicatorRenderOptions,
  isHighchartsOptions,
  type HighchartsOptions,
  type CalendarHeatmapChartEventProps,
} from '../props';

// Modules infrastructure — producer-side API (consumer-side types are @beta)
export { useModuleApiRegistry } from '../infra/modules/modules-context.js';

// Notifications
export type { NotificationsConfig } from '@/infra/notifications/types.js';
export type {
  NotificationAction,
  NotificationCategory,
  NotificationText,
} from '@sisense/sdk-common';
