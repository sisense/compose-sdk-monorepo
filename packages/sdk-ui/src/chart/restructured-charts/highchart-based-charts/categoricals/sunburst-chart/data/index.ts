import { categoricalData } from '@/chart-data/categorical-data';
import { loadDataBySingleQuery } from '../../../../helpers/data-loading';
import type { SunburstChartData, SunburstChartDataOptionsInternal } from '../types';
import { DataTable } from '@/chart-data-processor/table-processor';

export const dataTranslators = {
  loadData: loadDataBySingleQuery,

  getChartData: (
    dataOptions: SunburstChartDataOptionsInternal,
    dataTable: DataTable,
  ): SunburstChartData => {
    return categoricalData(dataOptions, dataTable);
  },
};
