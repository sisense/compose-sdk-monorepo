import { Data, DataSource, isDataSource } from '@sisense/sdk-data';

import { ChartDataOptionsInternal } from '@/chart-data-options/types';
import { ChartData } from '@/chart-data/types';
import { DesignOptions } from '@/chart-options-processor/translations/types';
import { ChartProps } from '@/props';
import { ChartType } from '@/types';

import { ChartRendererProps } from '../types';

type UnpreparedInternalChartProps = {
  dataSet?: DataSource | Data;
  chartType: ChartType;
  chartData: ChartData | null;
  internalDataOptions: ChartDataOptionsInternal;
  designOptions: DesignOptions | null;
  onDataPointClick?: ChartProps['onDataPointClick'];
  onDataPointContextMenu?: ChartProps['onDataPointContextMenu'];
  onDataPointsSelected?: ChartProps['onDataPointsSelected'];
  onBeforeRender?: ChartProps['onBeforeRender'];
  // separate filters may be needed for scattermap renederer
  filters?: ChartProps['filters'];
};

/**
 * Prepares the props for the chart renderer.
 *
 * @param internalProps - unprepared internal chart props.
 * @returns Chart renderer props or null if the chart props is not ready yet
 * @internal
 */
export function useChartRendererProps(
  internalProps: UnpreparedInternalChartProps,
): ChartRendererProps | null {
  const {
    dataSet,
    chartType,
    chartData,
    internalDataOptions,
    designOptions,
    onBeforeRender,
    onDataPointClick,
    onDataPointContextMenu,
    onDataPointsSelected,
  } = internalProps;
  if (!internalDataOptions || !designOptions) {
    return null;
  }
  return {
    dataSource: isDataSource(dataSet) ? dataSet : null,
    chartType,
    chartData,
    dataOptions: internalDataOptions,
    designOptions,
    onBeforeRender,
    onDataPointClick,
    onDataPointContextMenu,
    onDataPointsSelected,
  };
}
