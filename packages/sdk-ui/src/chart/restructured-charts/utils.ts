import {
  CartesianChartDataOptions,
  ChartDataOptions,
  StyledMeasureColumn,
} from '@/chart-data-options/types';
import { isCartesian } from '@/chart-options-processor/translations/types';
import { ChartType } from '@/index';

import { chartBuildersMap } from './chart-builder-factory.js';
import { SupportedChartType } from './types.js';

type ChartTypeWithAvailableBuilder = keyof typeof chartBuildersMap;

/**
 * Helper function to detect if chart data options contain forecast or trend analytics
 */
export function hasForecastOrTrend(dataOptions: ChartDataOptions, chartType: ChartType): boolean {
  if (!isCartesian(chartType)) return false;
  const cartesianDataOptions = dataOptions as CartesianChartDataOptions;
  return cartesianDataOptions.value.some(
    (v) =>
      (v as StyledMeasureColumn)?.forecast !== undefined ||
      (v as StyledMeasureColumn)?.trend !== undefined,
  );
}

export function isRestructuredChartType(chartType: ChartType): chartType is SupportedChartType {
  const restructuredChartTypes: ChartTypeWithAvailableBuilder[] = [
    'areamap',
    'area',
    'column',
    'bar',
    'line',
    'polar',
    'pie',
    'funnel',
    'calendar-heatmap',
    'treemap',
    'sunburst',
  ];
  return restructuredChartTypes.includes(chartType as SupportedChartType);
}
