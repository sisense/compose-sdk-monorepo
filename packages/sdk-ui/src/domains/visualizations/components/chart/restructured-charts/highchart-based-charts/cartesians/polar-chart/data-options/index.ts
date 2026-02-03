import {
  getCartesianAttributes,
  getCartesianMeasures,
  isCartesianChartDataOptions,
  isCartesianChartDataOptionsInternal,
  translateCartesianChartDataOptions,
} from '../../helpers/data-options.js';

/**
 * Data options translators for polar charts.
 * Polar charts use the same data structure as cartesian charts.
 */
export const dataOptionsTranslators = {
  translateDataOptionsToInternal: translateCartesianChartDataOptions,
  getAttributes: getCartesianAttributes,
  getMeasures: getCartesianMeasures,
  isCorrectDataOptions: isCartesianChartDataOptions,
  isCorrectDataOptionsInternal: isCartesianChartDataOptionsInternal,
};
