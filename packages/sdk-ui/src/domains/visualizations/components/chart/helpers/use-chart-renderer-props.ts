import { useMemo } from 'react';

import { Data, DataSource, isDataSource } from '@sisense/sdk-data';

import { ChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { ChartData } from '@/domains/visualizations/core/chart-data/types.js';
import { DesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import { ChartProps } from '@/props';
import { ChartType } from '@/types';

import { ChartRendererProps } from '../types.js';

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
  return useMemo(() => {
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
  }, [
    dataSet,
    chartType,
    chartData,
    internalDataOptions,
    designOptions,
    onBeforeRender,
    onDataPointClick,
    onDataPointContextMenu,
    onDataPointsSelected,
  ]);
}
