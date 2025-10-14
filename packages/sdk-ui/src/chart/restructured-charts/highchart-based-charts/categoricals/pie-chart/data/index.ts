import { DataTable } from '@/chart-data-processor/table-processor';

import { getCategoricalChartDataFromTable, loadCategoricalData } from '../../helpers/data';
import { PieChartData, PieChartDataOptionsInternal } from '../types';

/**
 * Data translators for pie charts.
 */
export const dataTranslators = {
  /**
   * Loads data for pie charts using the default categorical data loading approach.
   */
  loadData: loadCategoricalData,

  /**
   * Transforms data table to pie chart data.
   */
  getChartData: (dataOptions: PieChartDataOptionsInternal, dataTable: DataTable): PieChartData => {
    return getCategoricalChartDataFromTable(dataOptions, dataTable);
  },
};
