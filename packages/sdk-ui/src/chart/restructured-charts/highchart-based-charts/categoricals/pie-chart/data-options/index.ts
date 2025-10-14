import { Attribute, Measure } from '@sisense/sdk-data';
import flow from 'lodash-es/flow';

import { ChartDataOptions, ChartDataOptionsInternal } from '@/chart-data-options/types';
import {
  withCategoryLimitation,
  withValueLimitation,
} from '@/chart-data-options/validate-data-options/validate-categorical-data-options';

import {
  getCategoricalAttributes,
  getCategoricalMeasures,
  isCategoricalChartDataOptions,
  isCategoricalChartDataOptionsInternal,
  translateCategoricalDataOptionsToInternal,
} from '../../helpers/data-options';
import { PieChartDataOptions, PieChartDataOptionsInternal } from '../types';

const MAX_CATEGORICAL_DATA_OPTIONS_LENGTHS = {
  category: 3,
  value: 1,
} as const;

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
    return translateCategoricalDataOptionsToInternal(dataOptions);
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
   * Validates and cleans pie chart data options.
   */
  validateAndCleanDataOptions: (dataOptions: PieChartDataOptions): PieChartDataOptions => {
    return flow(
      withCategoryLimitation(MAX_CATEGORICAL_DATA_OPTIONS_LENGTHS.category),
      dataOptions.category.length > 0
        ? withValueLimitation(MAX_CATEGORICAL_DATA_OPTIONS_LENGTHS.value)
        : (data: PieChartDataOptions) => data,
    )(dataOptions);
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
