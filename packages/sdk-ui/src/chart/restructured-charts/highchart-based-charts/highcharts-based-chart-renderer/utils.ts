import { ChartType } from '@/types';
import { HighchartBasedChartTypes } from '../types';

export const isHighchartsBasedChart = (
  chartType: ChartType,
): chartType is HighchartBasedChartTypes => {
  return ['column', 'bar', 'line', 'area', 'polar', 'pie', 'calendar-heatmap'].includes(chartType);
};
