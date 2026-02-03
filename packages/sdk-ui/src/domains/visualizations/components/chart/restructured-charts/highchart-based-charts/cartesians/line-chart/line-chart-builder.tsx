import curry from 'lodash-es/curry.js';

import { loadDataBySingleQuery } from '../../../helpers/data-loading.js';
import { ChartBuilder } from '../../../types.js';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer.js';
import { getCommonCartesianAlerts } from '../helpers/alerts.js';
import {
  getCartesianAttributes,
  getCartesianMeasures,
  isCartesianChartDataOptions,
  isCartesianChartDataOptionsInternal,
  translateCartesianChartDataOptions,
} from '../helpers/data-options.js';
import { getCartesianChartData } from '../helpers/data.js';
import {
  isLineStyleOptions,
  translateLineStyleOptionsToDesignOptions,
} from './helpers/design-options.js';
import { lineHighchartsOptionsBuilder } from './highcharts-options-builder.js';

export const lineChartBuilder: ChartBuilder<'line'> = {
  dataOptions: {
    translateDataOptionsToInternal: translateCartesianChartDataOptions,
    getAttributes: getCartesianAttributes,
    getMeasures: getCartesianMeasures,
    isCorrectDataOptions: isCartesianChartDataOptions,
    isCorrectDataOptionsInternal: isCartesianChartDataOptionsInternal,
  },
  data: { loadData: loadDataBySingleQuery, getChartData: getCartesianChartData },
  designOptions: {
    translateStyleOptionsToDesignOptions: curry(translateLineStyleOptionsToDesignOptions),
    isCorrectStyleOptions: isLineStyleOptions,
  },
  renderer: {
    ChartRendererComponent: createHighchartsBasedChartRenderer({
      highchartsOptionsBuilder: lineHighchartsOptionsBuilder,
      getAlerts: getCommonCartesianAlerts,
    }),
    isCorrectRendererProps: isHighchartsBasedChartRendererProps,
  },
};
