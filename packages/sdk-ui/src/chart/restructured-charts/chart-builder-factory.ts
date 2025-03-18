import { areamapChartBuilder } from './areamap-chart/areamap-chart-builder.js';
import { barChartBuilder } from './bar-chart/bar-chart-builder.js';
import { columnChartBuilder } from './column-chart/column-chart-builder.js';
import type { ChartBuilder, SupportedChartType } from './types.js';

export const chartBuildersMap: Record<SupportedChartType, ChartBuilder<SupportedChartType>> = {
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
