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
import { FunnelChartDataOptions, FunnelChartDataOptionsInternal } from '../types';

const MAX_CATEGORICAL_DATA_OPTIONS_LENGTHS = {
  category: 3,
  value: 1,
} as const;

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
    return translateCategoricalDataOptionsToInternal(dataOptions);
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
   * Validates and cleans funnel chart data options.
   */
  validateAndCleanDataOptions: (dataOptions: FunnelChartDataOptions): FunnelChartDataOptions => {
    return flow(
      withCategoryLimitation(MAX_CATEGORICAL_DATA_OPTIONS_LENGTHS.category),
      dataOptions.category.length > 0
        ? withValueLimitation(MAX_CATEGORICAL_DATA_OPTIONS_LENGTHS.value)
        : (data: FunnelChartDataOptions) => data,
    )(dataOptions);
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
