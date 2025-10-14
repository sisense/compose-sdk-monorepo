import { translateCategoricalChartDataOptions } from '@/chart-data-options/translate-data-options';
import { ChartDataOptionsInternal } from '@/chart-data-options/types';
import { type ChartDataOptions } from '@/types';

import {
  getCategoricalAttributes,
  getCategoricalMeasures,
  isCategoricalChartDataOptions,
  isCategoricalChartDataOptionsInternal,
} from '../../helpers/data-options';
import type { TreemapChartDataOptions, TreemapChartDataOptionsInternal } from '../types';

export const dataOptionsTranslators = {
  translateDataOptionsToInternal: (
    dataOptions: TreemapChartDataOptions,
  ): TreemapChartDataOptionsInternal => {
    return translateCategoricalChartDataOptions(dataOptions);
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
