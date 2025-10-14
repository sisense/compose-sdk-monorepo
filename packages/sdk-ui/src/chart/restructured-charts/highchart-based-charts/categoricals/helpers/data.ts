import { CategoricalChartDataOptionsInternal } from '@/chart-data-options/types';
import { DataTable } from '@/chart-data-processor/table-processor';
import { categoricalData } from '@/chart-data/categorical-data';
import { CategoricalChartData } from '@/chart-data/types';

import { loadDataBySingleQuery } from '../../../helpers/data-loading';

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
