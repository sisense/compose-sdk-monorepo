import { isBoxplotChartData } from '@/domains/visualizations/core/chart-data/boxplot-data';
import { ChartData } from '@/domains/visualizations/core/chart-data/types';
import { ChartType } from '@/types';

import { isAreamapData } from '../../restructured-charts/areamap-chart/renderer/areamap';
import { isCalendarHeatmapChartData } from '../../restructured-charts/highchart-based-charts/calendar-heatmap-chart/data';
import { isSankeyChartData } from '../../restructured-charts/highchart-based-charts/sankey-chart/types';
import { isKpiChartData } from '../../restructured-charts/kpi-chart/types';
import { isScattermapData } from '../scattermap/scattermap';

/**
 * Returns whether prepared chart data has nothing to visualize
 * (triggers the no-results overlay).
 *
 * @param chartType - Chart type used to interpret `chartData`.
 * @param chartData - Prepared chart data for that type.
 * @returns `true` when the chart should show an empty / no-results state.
 * @internal
 */
export function hasNoResults(chartType: ChartType, chartData: ChartData): boolean {
  if (chartType === 'scatter' && 'scatterDataTable' in chartData) {
    return chartData.scatterDataTable.length === 0;
  }
  if (chartType === 'areamap' && isAreamapData(chartData)) {
    return chartData.geoData.length === 0;
  }
  if (chartType === 'scattermap' && isScattermapData(chartData)) {
    return chartData.locations.length === 0;
  }
  if (chartType === 'boxplot' && isBoxplotChartData(chartData)) {
    return chartData.xValues.length === 0;
  }
  if (chartType === 'calendar-heatmap' && isCalendarHeatmapChartData(chartData)) {
    return chartData.values.length === 0;
  }
  if (chartType === 'sankey' && isSankeyChartData(chartData)) {
    return chartData.links.length === 0;
  }
  if (chartType === 'kpi' && isKpiChartData(chartData)) {
    // The KPI renderer owns both of its empty states -- a zero-row result (`!hasRows`) and a
    // null headline value inside a non-empty result -- deciding between its own no-results
    // overlay and the `noDataText` card shell (design spec null-rule 1). Short-circuiting here
    // on `!hasRows` would make `noDataText` unreachable for empty query results, so this branch
    // never treats a KPI chart as "no results" and always lets the renderer mount.
    return false;
  }
  return 'series' in chartData && chartData.series.length === 0;
}
