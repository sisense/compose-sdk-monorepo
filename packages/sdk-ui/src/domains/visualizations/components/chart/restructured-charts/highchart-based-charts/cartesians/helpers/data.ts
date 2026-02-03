import { CartesianChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { DataTable } from '@/domains/visualizations/core/chart-data-processor/table-processor';
import { cartesianData as legacyGetCartesianChartData } from '@/domains/visualizations/core/chart-data/cartesian-data.js';
import { CartesianChartData } from '@/domains/visualizations/core/chart-data/types';

export function getCartesianChartData(
  chartDataOptions: CartesianChartDataOptionsInternal,
  dataTable: DataTable,
): CartesianChartData {
  // TODO: refactor this function and move the logic from legacyGetCartesianChartData here
  return legacyGetCartesianChartData(chartDataOptions, dataTable);
}
