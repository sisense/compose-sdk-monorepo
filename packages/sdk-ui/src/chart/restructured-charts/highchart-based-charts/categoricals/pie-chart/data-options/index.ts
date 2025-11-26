import { Attribute, Measure } from '@sisense/sdk-data';

import { ChartDataOptions, ChartDataOptionsInternal } from '@/chart-data-options/types';

import {
  getCategoricalAttributes,
  getCategoricalMeasures,
  isCategoricalChartDataOptions,
  isCategoricalChartDataOptionsInternal,
  translateCategoricalDataOptionsToInternal,
  withDataOptionsLimitations,
} from '../../helpers/data-options';
import { PieChartDataOptions, PieChartDataOptionsInternal } from '../types';

/**
 * Data options translators for pie charts.
 */
export const dataOptionsTranslators = {
  /**
   * Translates pie chart data options to internal format.
   */
  translateDataOptionsToInternal: (
    dataOptions: PieChartDataOptions,
  ): PieChartDataOptionsInternal => {
    // [categories:1, values:1] || [categories:0, values:any]
    const limitedDataOptions =
      dataOptions.category.length > 0
        ? withDataOptionsLimitations({
            maxCategories: 1,
            maxValues: 1,
          })(dataOptions)
        : dataOptions;
    return translateCategoricalDataOptionsToInternal(limitedDataOptions);
  },

  /**
   * Gets attributes from pie chart data options.
   */
  getAttributes: (internalDataOptions: PieChartDataOptionsInternal): Attribute[] => {
    return getCategoricalAttributes(internalDataOptions);
  },

  /**
   * Gets measures from pie chart data options.
   */
  getMeasures: (internalDataOptions: PieChartDataOptionsInternal): Measure[] => {
    return getCategoricalMeasures(internalDataOptions);
  },

  /**
   * Type guard to check if data options are pie chart data options.
   */
  isCorrectDataOptions: (dataOptions: ChartDataOptions): dataOptions is PieChartDataOptions => {
    return isCategoricalChartDataOptions(dataOptions);
  },

  /**
   * Type guard to check if internal data options are pie chart data options.
   */
  isCorrectDataOptionsInternal: (
    dataOptions: ChartDataOptionsInternal,
  ): dataOptions is PieChartDataOptionsInternal => {
    return isCategoricalChartDataOptionsInternal(dataOptions);
  },
};
