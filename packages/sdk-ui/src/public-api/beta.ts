/**
 * @beta API Exports
 *
 * Beta APIs are under evaluation and may change in future releases.
 * Not recommended for production use.
 */

export { useQueryCache } from '../domains/query-execution/hooks/use-query-cache/use-query-cache';

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

// Charts
export { SankeyChart } from '../domains/visualizations/components/sankey-chart';
export type { SankeyChartProps } from '../props';
export type { SankeyChartDataOptions } from '../domains/visualizations/core/chart-data-options/types';
export type { SankeyStyleOptions, SankeyChartType } from '../types';
