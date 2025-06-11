import { CartesianChartDataOptionsInternal } from '@/chart-data-options/types';
import { DataTable } from '@/chart-data-processor/table-processor';
import { cartesianData as legacyGetCartesianChartData } from '@/chart-data/cartesian-data.js';
import { CartesianChartData } from '@/chart-data/types';

export function getCartesianChartData(
  chartDataOptions: CartesianChartDataOptionsInternal,
  dataTable: DataTable,
): CartesianChartData {
  // TODO: refactor this function and move the logic from legacyGetCartesianChartData here
  return legacyGetCartesianChartData(chartDataOptions, dataTable);
}
