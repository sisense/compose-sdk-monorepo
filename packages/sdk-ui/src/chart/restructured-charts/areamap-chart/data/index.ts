import { loadDataBySingleQuery } from '../../helpers/data-loading.js';
import { ChartBuilder } from '../../types.js';
import { getAreamapData } from './areamap-data.js';

export const areamapDataTranslators: ChartBuilder<'areamap'>['data'] = {
  loadData: loadDataBySingleQuery,
  getChartData: getAreamapData,
};
