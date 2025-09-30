import { categoricalData } from '@/chart-data/categorical-data';
import { loadDataBySingleQuery } from '../../../../helpers/data-loading';
import type { TreemapChartData, TreemapChartDataOptionsInternal } from '../types';
import { DataTable } from '@/chart-data-processor/table-processor';

export const dataTranslators = {
  loadData: loadDataBySingleQuery,

  getChartData: (
    dataOptions: TreemapChartDataOptionsInternal,
    dataTable: DataTable,
  ): TreemapChartData => {
    return categoricalData(dataOptions, dataTable);
  },
};
