import { areamapChartBuilder } from './areamap-chart/areamap-chart-builder.js';
import { areaChartBuilder } from './highchart-based-charts/cartesians/stackable/area-chart/area-chart-builder.js';
import { barChartBuilder } from './highchart-based-charts/cartesians/stackable/bar-chart/bar-chart-builder.js';
import { columnChartBuilder } from './highchart-based-charts/cartesians/stackable/column-chart/column-chart-builder.js';
import { lineChartBuilder } from './highchart-based-charts/cartesians/line-chart/line-chart-builder.js';
import { polarChartBuilder } from './highchart-based-charts/cartesians/polar-chart/polar-chart-builder.js';
import type { ChartBuilder, SupportedChartType } from './types.js';

export const chartBuildersMap: { [K in SupportedChartType]: ChartBuilder<K> } = {
  areamap: areamapChartBuilder,
  area: areaChartBuilder,
  column: columnChartBuilder,
  bar: barChartBuilder,
  line: lineChartBuilder,
  polar: polarChartBuilder,
};

export function getChartBuilder<CT extends SupportedChartType>(chartType: CT): ChartBuilder<CT> {
  const chartBuilder = chartBuildersMap[chartType];
  if (chartBuilder) {
    return chartBuilder;
  }
  throw new Error(`Unsupported chart type: ${chartType}`);
}
