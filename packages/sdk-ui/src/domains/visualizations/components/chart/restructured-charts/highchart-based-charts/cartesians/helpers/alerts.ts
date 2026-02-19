import isString from 'lodash-es/isString';

import { seriesSliceWarning } from '@/shared/utils/data-limit-warning';
import { categoriesSliceWarning } from '@/shared/utils/data-limit-warning';

import { BuildContext } from '../../types.js';
import { CartesianChartTypes } from '../types.js';

export const getCommonCartesianAlerts = (ctx: BuildContext<CartesianChartTypes>): string[] => {
  const { chartData, designOptions } = ctx;
  const { seriesCapacity, categoriesCapacity } = designOptions.dataLimits;

  const xAxisWarning =
    chartData.xValues.length > categoriesCapacity
      ? categoriesSliceWarning('x', chartData.xValues.length, categoriesCapacity)
      : null;

  const seriesWarning =
    chartData.series.length > seriesCapacity
      ? seriesSliceWarning(chartData.series.length, seriesCapacity)
      : null;

  return [xAxisWarning, seriesWarning].filter(isString);
};
