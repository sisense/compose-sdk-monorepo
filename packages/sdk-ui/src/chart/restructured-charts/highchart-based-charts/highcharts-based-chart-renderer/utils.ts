import { ChartType } from '@/types';

import { HighchartBasedChartTypes } from '../types';

export const isHighchartsBasedChart = (
  chartType: ChartType,
): chartType is HighchartBasedChartTypes => {
  return [
    'column',
    'bar',
    'line',
    'area',
    'polar',
    'pie',
    'funnel',
    'treemap',
    'calendar-heatmap',
    'sunburst',
    'streamgraph',
  ].includes(chartType);
};
