import { ChartType } from '@/types';
import { HighchartBasedChartTypes } from '../types';

export const isHighchartsBasedChart = (
  chartType: ChartType,
): chartType is HighchartBasedChartTypes => {
  return ['column', 'bar', 'line', 'area', 'polar'].includes(chartType);
};
