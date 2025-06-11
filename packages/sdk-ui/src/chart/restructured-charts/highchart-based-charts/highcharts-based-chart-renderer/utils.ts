import { ChartType } from '@/types';

export const isHighchartsBasedChart = (chartType: ChartType): boolean => {
  return ['column', 'bar'].includes(chartType);
};
