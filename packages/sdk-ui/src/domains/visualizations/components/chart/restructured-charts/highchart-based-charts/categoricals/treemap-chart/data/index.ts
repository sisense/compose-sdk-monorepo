import { DataTable } from '@/domains/visualizations/core/chart-data-processor/table-processor.js';
import { categoricalData } from '@/domains/visualizations/core/chart-data/categorical-data.js';

import { loadDataBySingleQuery } from '../../../../helpers/data-loading.js';
import type { TreemapChartData, TreemapChartDataOptionsInternal } from '../types.js';

export const dataTranslators = {
  loadData: loadDataBySingleQuery,

  getChartData: (
    dataOptions: TreemapChartDataOptionsInternal,
    dataTable: DataTable,
    options?: { defaultNumberFormattingEnabled?: boolean },
  ): TreemapChartData => {
    return categoricalData(dataOptions, dataTable, options?.defaultNumberFormattingEnabled);
  },
};
