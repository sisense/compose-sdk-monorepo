import { DataTable } from '@/domains/visualizations/core/chart-data-processor/table-processor.js';
import { categoricalData } from '@/domains/visualizations/core/chart-data/categorical-data.js';

import { loadDataBySingleQuery } from '../../../../helpers/data-loading.js';
import type { SunburstChartData, SunburstChartDataOptionsInternal } from '../types.js';

export const dataTranslators = {
  loadData: loadDataBySingleQuery,

  getChartData: (
    dataOptions: SunburstChartDataOptionsInternal,
    dataTable: DataTable,
  ): SunburstChartData => {
    return categoricalData(dataOptions, dataTable);
  },
};
