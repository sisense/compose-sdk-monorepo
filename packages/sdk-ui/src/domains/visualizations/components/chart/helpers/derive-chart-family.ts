import {
  isAreamap,
  isBoxplot,
  isCalendarHeatmap,
  isCartesian,
  isCategorical,
  isIndicator,
  isKpi,
  isRange,
  isSankey,
  isScatter,
  isScattermap,
} from '@/domains/visualizations/core/chart-options-processor/translations/types';
import { ChartType } from '@/types';

/**
 * Derives chart family from chart type.
 *
 * @param chartType - chart type
 * @returns chart family
 * @internal
 */
export const deriveChartFamily = (chartType: string): string => {
  if (isCartesian(chartType as ChartType)) {
    return 'cartesian';
  }
  if (isCategorical(chartType as ChartType)) {
    return 'categorical';
  }
  if (isScatter(chartType as ChartType)) {
    return 'scatter';
  }
  if (isScattermap(chartType as ChartType)) {
    return 'scattermap';
  }
  if (isIndicator(chartType as ChartType)) {
    return 'indicator';
  }
  if (isAreamap(chartType as ChartType)) {
    return 'areamap';
  }
  if (isBoxplot(chartType as ChartType)) {
    return 'boxplot';
  }
  if (isCalendarHeatmap(chartType as ChartType)) {
    return 'calendar-heatmap';
  }
  if (isRange(chartType as ChartType)) {
    return 'range';
  }
  if (isSankey(chartType as ChartType)) {
    return 'sankey';
  }
  if (isKpi(chartType as ChartType)) {
    return 'kpi';
  }

  return 'table';
};
