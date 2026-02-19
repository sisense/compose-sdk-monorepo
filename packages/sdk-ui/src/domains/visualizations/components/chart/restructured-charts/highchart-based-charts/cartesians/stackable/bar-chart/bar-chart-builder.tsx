import curry from 'lodash-es/curry.js';

import { ChartBuilder } from '@/domains/visualizations/components/chart/restructured-charts/types.js';

import { loadDataBySingleQuery } from '../../../../helpers/data-loading.js';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../../highcharts-based-chart-renderer/highcharts-based-chart-renderer.js';
import { getCommonCartesianAlerts } from '../../helpers/alerts.js';
import {
  getCartesianAttributes,
  getCartesianMeasures,
  isCartesianChartDataOptions,
  isCartesianChartDataOptionsInternal,
  translateCartesianChartDataOptions,
} from '../../helpers/data-options.js';
import { getCartesianChartData } from '../../helpers/data.js';
import {
  isStackableStyleOptions,
  translateStackableStyleOptionsToDesignOptions,
} from '../helpers/design-options.js';
import { barHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder.js';

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
    ChartRendererComponent: createHighchartsBasedChartRenderer({
      highchartsOptionsBuilder: barHighchartsOptionsBuilder,
      getAlerts: getCommonCartesianAlerts,
    }),
    isCorrectRendererProps: isHighchartsBasedChartRendererProps,
  },
};
