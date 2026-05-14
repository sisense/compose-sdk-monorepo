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
};
