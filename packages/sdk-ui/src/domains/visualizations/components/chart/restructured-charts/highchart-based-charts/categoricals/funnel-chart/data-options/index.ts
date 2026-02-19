import { Attribute, Measure } from '@sisense/sdk-data';

import {
  ChartDataOptions,
  ChartDataOptionsInternal,
} from '@/domains/visualizations/core/chart-data-options/types.js';

import {
  getCategoricalAttributes,
  getCategoricalMeasures,
  isCategoricalChartDataOptions,
  isCategoricalChartDataOptionsInternal,
  translateCategoricalDataOptionsToInternal,
  withDataOptionsLimitations,
} from '../../helpers/data-options.js';
import { FunnelChartDataOptions, FunnelChartDataOptionsInternal } from '../types.js';

/**
 * Data options translators for funnel charts.
 */
export const dataOptionsTranslators = {
  /**
   * Translates funnel chart data options to internal format.
   */
  translateDataOptionsToInternal: (
    dataOptions: FunnelChartDataOptions,
  ): FunnelChartDataOptionsInternal => {
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
   * Gets attributes from funnel chart data options.
   */
  getAttributes: (internalDataOptions: FunnelChartDataOptionsInternal): Attribute[] => {
    return getCategoricalAttributes(internalDataOptions);
  },

  /**
   * Gets measures from funnel chart data options.
   */
  getMeasures: (internalDataOptions: FunnelChartDataOptionsInternal): Measure[] => {
    return getCategoricalMeasures(internalDataOptions);
  },

  /**
   * Type guard to check if data options are funnel chart data options.
   */
  isCorrectDataOptions: (dataOptions: ChartDataOptions): dataOptions is FunnelChartDataOptions => {
    return isCategoricalChartDataOptions(dataOptions);
  },

  /**
   * Type guard to check if internal data options are funnel chart data options.
   */
  isCorrectDataOptionsInternal: (
    dataOptions: ChartDataOptionsInternal,
  ): dataOptions is FunnelChartDataOptionsInternal => {
    return isCategoricalChartDataOptionsInternal(dataOptions);
  },
};
