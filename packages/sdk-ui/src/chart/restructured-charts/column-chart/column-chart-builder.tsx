import { isSisenseChartProps, SisenseChart } from '@/sisense-chart';
import curry from 'lodash-es/curry.js';
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
import { ChartBuilder } from '../types.js';

export const columnChartBuilder: ChartBuilder<'column'> = {
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
      'column',
    ),
    isCorrectStyleOptions: isStackableStyleOptions,
  },
  renderer: {
    ChartRendererComponent: SisenseChart,
    isCorrectRendererProps: isSisenseChartProps,
  },
};
