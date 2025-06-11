import { areamapChartBuilder } from './areamap-chart/areamap-chart-builder.js';
import { barChartBuilder } from './highchart-based-charts/cartesians/stackable/bar-chart/bar-chart-builder.js';
import { columnChartBuilder } from './highchart-based-charts/cartesians/stackable/column-chart/column-chart-builder.js';
import type { ChartBuilder, SupportedChartType } from './types.js';

export const chartBuildersMap: { [K in SupportedChartType]: ChartBuilder<K> } = {
  areamap: areamapChartBuilder,
  column: columnChartBuilder,
  bar: barChartBuilder,
};

export function getChartBuilder<CT extends SupportedChartType>(chartType: CT): ChartBuilder<CT> {
  const chartBuilder = chartBuildersMap[chartType];
  if (chartBuilder) {
    return chartBuilder;
  }
  throw new Error(`Unsupported chart type: ${chartType}`);
}
