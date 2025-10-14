import { DataSource } from '@sisense/sdk-data';

import { ChartData } from '@/chart-data/types';
import { DesignOptions } from '@/chart-options-processor/translations/types';

import { ChartDataOptionsInternal, ChartProps, ChartType } from '..';

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
