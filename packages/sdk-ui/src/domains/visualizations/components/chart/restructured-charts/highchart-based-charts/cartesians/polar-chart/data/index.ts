import { loadDataBySingleQuery } from '../../../../helpers/data-loading.js';
import { getCartesianChartData } from '../../helpers/data.js';

/**
 * Data translators for polar charts.
 * Polar charts use the same data loading and processing as cartesian charts.
 */
export const dataTranslators = {
  loadData: loadDataBySingleQuery,
  getChartData: getCartesianChartData,
};
