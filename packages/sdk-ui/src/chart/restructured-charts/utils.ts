import { ChartType } from '@/index';
import { chartBuildersMap } from './chart-builder-factory.js';
import { SupportedChartType } from './types.js';

type ChartTypeWithAvailableBuilder = keyof typeof chartBuildersMap;

export function isRestructuredChartType(chartType: ChartType): chartType is SupportedChartType {
  const restructuredChartTypes: ChartTypeWithAvailableBuilder[] = ['areamap', 'column', 'bar'];
  return restructuredChartTypes.includes(chartType as SupportedChartType);
}
