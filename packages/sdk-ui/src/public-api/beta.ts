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
// docs-visible. Deliberately ungrouped: the docs list the component at the top level and
// a reader reaches these by navigating from it. The FilterWidget component itself remains
// @alpha (alpha.ts) until it is ready for pro-code use.
export type {
  FilterWidgetProps,
  FilterWidgetFilterType,
  FilterWidgetStyleOptions,
  FilterWidgetControlStyleOptions,
  FilterWidgetControlSize,
  FilterWidgetControlCornerRadius,
  FilterWidgetControlAlignHorizontal,
  FilterWidgetControlAlignVertical,
} from '../domains/widgets/components/filter-widget/index.js';
export type { FilterWidgetConfig } from '../domains/widgets/components/widget/index.js';
