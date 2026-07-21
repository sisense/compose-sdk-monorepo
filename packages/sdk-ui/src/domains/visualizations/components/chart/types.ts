import { DataSource } from '@sisense/sdk-data';

import { type ChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { ChartData } from '@/domains/visualizations/core/chart-data/types';
import { DesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/types';
import { type ChartProps } from '@/props.js';
import { type ChartType } from '@/types.js';

/**
 * Props object to be passed to the chart renderer.
 *
 * @internal
 */
export type ChartRendererProps = {
  dataSource?: DataSource | null;
  chartType?: ChartType;
  chartData: ChartData | null;
  dataOptions: ChartDataOptionsInternal;
  designOptions: DesignOptions;
  onDataPointClick?: ChartProps['onDataPointClick'];
  onDataPointContextMenu?: ChartProps['onDataPointContextMenu'];
  onDataPointsSelected?: ChartProps['onDataPointsSelected'];
  onBeforeRender?: ChartProps['onBeforeRender'];
  /**
   * Paint signal from the active renderer after it finishes painting.
   * Used for Sankey `onReady` (Fusion `domready`): RegularChart stores the
   * flag and fires the consumer callback via `useFireOnReady`. Highcharts
   * wires this to `chart.events.load` / `render`.
   *
   * @internal
   */
  onReady?: ChartProps['onReady'];
};
