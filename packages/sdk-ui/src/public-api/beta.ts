/**
 * @beta API Exports
 *
 * Beta APIs are under evaluation and may change in future releases.
 * Not recommended for production use.
 */

// Dashboard change event for FilterWidget date-granularity changes (referenced
// by the public DashboardChangeEvent union).
export type { DashboardWidgetDateLevelChangedEvent } from '../domains/dashboarding';

// Modules infrastructure — for registering modules via `SisenseContextProvider`'s `modules` prop
export type { Module, ModuleRequirement } from '../infra/modules/types.js';

// Plugin system — for creating and registering custom widget plugins
export type { Plugin, BasePluginInfo } from '../infra/plugins/types.js';
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
  VisualizationStateUpdate,
  DesignPanelProps,
  DesignPanel,
} from '../infra/plugins/widget-plugins/types.js';

// Widget plugin state persistence — bridges local component state with the
// dashboard persistence layer so view-time interactions survive reloads.
export { useSyncedState, type UseSyncedStateOptions } from '../shared/hooks/use-synced-state';

// FilterWidget types — referenced by the public WidgetProps union, so they must be
// docs-visible. The FilterWidget component itself remains @alpha (alpha.ts).
export type {
  FilterWidgetProps,
  FilterWidgetFilterType,
} from '../domains/widgets/components/filter-widget/index.js';
export type { FilterWidgetConfig } from '../domains/widgets/components/widget/index.js';
