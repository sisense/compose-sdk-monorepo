import type {
  CartesianChartDataOptions,
  ChartDataOptions,
  StyledMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import { isCartesian } from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import type { ChartType } from '@/index';

import { RESTRUCTURED_CHART_TYPES } from './restructured-chart-types.js';
import type { SupportedChartType } from './types.js';

/**
 * Helper function to detect if chart data options contain forecast or trend analytics.
 *
 * @param dataOptions - Chart data options to inspect.
 * @param chartType - Chart type the data options belong to.
 * @returns `true` if any value column has forecast or trend enabled.
 * @internal
 */
export function hasForecastOrTrend(dataOptions: ChartDataOptions, chartType: ChartType): boolean {
  if (!isCartesian(chartType)) return false;
  const cartesianDataOptions = dataOptions as CartesianChartDataOptions;
  return cartesianDataOptions.value.some(
    (v) =>
      (v as StyledMeasureColumn)?.forecast !== undefined ||
      (v as StyledMeasureColumn)?.trend !== undefined,
  );
}

/**
 * Checks whether a chart type is rendered by the restructured-charts architecture,
 * that is, whether it has a builder in `chartBuildersMap`.
 *
 * @param chartType - Chart type to check.
 * @returns `true` if the chart type has a restructured chart builder.
 * @internal
 */
export function isRestructuredChartType(chartType: ChartType): chartType is SupportedChartType {
  return RESTRUCTURED_CHART_TYPES.some(
    (restructuredChartType) => restructuredChartType === chartType,
  );
}
