import {
  translateCartesianChartDataOptions,
  getCartesianAttributes,
  getCartesianMeasures,
  isCartesianChartDataOptions,
  isCartesianChartDataOptionsInternal,
} from '../../helpers/data-options.js';
import { getCartesianChartData } from '../../helpers/data.js';
import {
  translateStackableStyleOptionsToDesignOptions,
  isStackableStyleOptions,
} from '../helpers/design-options.js';
import { loadDataBySingleQuery } from '../../../../helpers/data-loading.js';
import curry from 'lodash-es/curry.js';
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../../highcharts-based-chart-renderer/highcharts-based-chart-renderer';
import { getCommonCartesianAlerts } from '../../helpers/alerts.js';
import { barHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder.js';
import { ChartBuilder } from '@/chart/restructured-charts/types.js';

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
