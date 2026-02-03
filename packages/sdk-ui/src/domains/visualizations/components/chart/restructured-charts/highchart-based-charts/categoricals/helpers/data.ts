import { CategoricalChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { DataTable } from '@/domains/visualizations/core/chart-data-processor/table-processor.js';
import { categoricalData } from '@/domains/visualizations/core/chart-data/categorical-data.js';
import { CategoricalChartData } from '@/domains/visualizations/core/chart-data/types.js';

import { loadDataBySingleQuery } from '../../../helpers/data-loading.js';

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
