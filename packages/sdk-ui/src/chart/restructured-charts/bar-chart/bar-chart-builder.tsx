import { isSisenseChartProps, SisenseChart } from '@/sisense-chart';
import { ChartBuilder } from '../types.js';
import {
  translateCartesianChartDataOptions,
  getCartesianAttributes,
  getCartesianMeasures,
  isCartesianChartDataOptions,
  isCartesianChartDataOptionsInternal,
} from '../helpers/cartesians/data-options.js';
import { getCartesianChartData } from '../helpers/cartesians/data.js';
import {
  translateStackableStyleOptionsToDesignOptions,
  isStackableStyleOptions,
} from '../helpers/cartesians/stackable/design-options.js';
import { loadDataBySingleQuery } from '../helpers/data-loading.js';
import curry from 'lodash-es/curry.js';

export const barChartBuilder: ChartBuilder<'bar'> = {
  dataOptions: {
    translateDataOptionsToInternal: translateCartesianChartDataOptions,
    getAttributes: getCartesianAttributes,
    getMeasures: getCartesianMeasures,
    isCorrectDataOptions: isCartesianChartDataOptions,
    isCorrectDataOptionsInternal: isCartesianChartDataOptionsInternal,
  },
  data: { loadData: loadDataBySingleQuery, getChartData: getCartesianChartData },
  designOptions: {
    translateStyleOptionsToDesignOptions: curry(translateStackableStyleOptionsToDesignOptions)(
      'bar',
    ),
    isCorrectStyleOptions: isStackableStyleOptions,
  },
  renderer: {
    ChartRendererComponent: SisenseChart,
    isCorrectRendererProps: isSisenseChartProps,
  },
};
