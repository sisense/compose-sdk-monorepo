/**
 * @beta API Exports
 *
 * Beta APIs are under evaluation and may change in future releases.
 * Not recommended for production use.
 */

export { useQueryCache } from '../domains/query-execution/hooks/use-query-cache/use-query-cache';

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
  DesignPanelProps,
  DesignPanel,
} from '../infra/plugins/widget-plugins/types.js';

// Charts
export { SankeyChart } from '../domains/visualizations/components/sankey-chart';
export type { SankeyChartProps } from '../props';
export type { SankeyChartDataOptions } from '../domains/visualizations/core/chart-data-options/types';
export type { SankeyStyleOptions, SankeyChartType } from '../types';
