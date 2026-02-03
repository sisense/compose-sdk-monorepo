import { translateCategoricalChartDataOptions } from '@/domains/visualizations/core/chart-data-options/translate-data-options.js';
import { ChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { type ChartDataOptions } from '@/types';

import {
  getCategoricalAttributes,
  getCategoricalMeasures,
  isCategoricalChartDataOptions,
  isCategoricalChartDataOptionsInternal,
  withDataOptionsLimitations,
} from '../../helpers/data-options.js';
import type { TreemapChartDataOptions, TreemapChartDataOptionsInternal } from '../types.js';

export const dataOptionsTranslators = {
  translateDataOptionsToInternal: (
    dataOptions: TreemapChartDataOptions,
  ): TreemapChartDataOptionsInternal => {
    return translateCategoricalChartDataOptions(
      withDataOptionsLimitations({
        maxCategories: 3,
        maxValues: 1,
      })(dataOptions),
    );
  },

  getAttributes: getCategoricalAttributes,
  getMeasures: getCategoricalMeasures,

  isCorrectDataOptions: (dataOptions: ChartDataOptions): dataOptions is TreemapChartDataOptions => {
    return isCategoricalChartDataOptions(dataOptions);
  },

  isCorrectDataOptionsInternal: (
    dataOptions: ChartDataOptionsInternal,
  ): dataOptions is TreemapChartDataOptionsInternal => {
    return isCategoricalChartDataOptionsInternal(dataOptions);
  },
};
