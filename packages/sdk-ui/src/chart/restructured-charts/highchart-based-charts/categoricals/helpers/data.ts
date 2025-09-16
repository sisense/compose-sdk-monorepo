import { DataTable } from '@/chart-data-processor/table-processor';
import { loadDataBySingleQuery } from '../../../helpers/data-loading';
import { CategoricalChartDataOptionsInternal } from '@/chart-data-options/types';
import { CategoricalChartData } from '@/chart-data/types';
import { categoricalData } from '@/chart-data/categorical-data';

/**
 * Default data loading function for categorical charts.
 * Uses single query execution which is appropriate for most categorical charts.
 */
export const loadCategoricalData = loadDataBySingleQuery;

/**
 * Transforms data table to categorical chart data.
 */
export function getCategoricalChartDataFromTable(
  dataOptions: CategoricalChartDataOptionsInternal,
  dataTable: DataTable,
): CategoricalChartData {
  return categoricalData(dataOptions, dataTable);
}
