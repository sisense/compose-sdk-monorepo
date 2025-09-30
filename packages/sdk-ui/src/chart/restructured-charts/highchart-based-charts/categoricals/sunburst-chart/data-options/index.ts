import { type ChartDataOptions } from '@/types';
import { translateCategoricalChartDataOptions } from '@/chart-data-options/translate-data-options';
import {
  getCategoricalAttributes,
  getCategoricalMeasures,
  isCategoricalChartDataOptions,
  isCategoricalChartDataOptionsInternal,
} from '../../helpers/data-options';
import type { SunburstChartDataOptions, SunburstChartDataOptionsInternal } from '../types';
import { ChartDataOptionsInternal } from '@/chart-data-options/types';

export const dataOptionsTranslators = {
  translateDataOptionsToInternal: (
    dataOptions: SunburstChartDataOptions,
  ): SunburstChartDataOptionsInternal => {
    return translateCategoricalChartDataOptions(dataOptions);
  },

  getAttributes: getCategoricalAttributes,
  getMeasures: getCategoricalMeasures,

  isCorrectDataOptions: (
    dataOptions: ChartDataOptions,
  ): dataOptions is SunburstChartDataOptions => {
    return isCategoricalChartDataOptions(dataOptions);
  },

  isCorrectDataOptionsInternal: (
    dataOptions: ChartDataOptionsInternal,
  ): dataOptions is SunburstChartDataOptionsInternal => {
    return isCategoricalChartDataOptionsInternal(dataOptions);
  },
};
