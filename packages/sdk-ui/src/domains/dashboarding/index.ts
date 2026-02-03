export { DashboardById } from './dashboard-by-id.js';
export { Dashboard } from './dashboard.js';
export {
  useComposedDashboard,
  useComposedDashboardInternal,
  type ComposableDashboardProps,
  type UseComposedDashboardOptions,
  type ComposedDashboardResult,
} from './use-composed-dashboard.js';
export { useDashboardTheme, type DashboardThemeParams } from './use-dashboard-theme.js';

// Dashboard Hooks
export * from './hooks/index.js';
export type {
  DashboardByIdProps,
  DashboardProps,
  DashboardLayoutOptions,
  DashboardStyleOptions,
  DashboardConfig,
  DashboardByIdConfig,
  WidgetsPanelConfig,
  EditModeConfig,
  DashboardFiltersPanelConfig,
  TabbersConfig,
  TabberConfig,
  TabberTabConfig,
  DashboardChangeEvent,
  DashboardFiltersUpdatedEvent,
  DashboardFiltersPanelCollapseChangedEvent,
  DashboardWidgetsPanelLayoutUpdatedEvent,
  DashboardWidgetsPanelIsEditingChangedEvent,
  DashboardWidgetsDeletedEvent,
} from './types.js';
