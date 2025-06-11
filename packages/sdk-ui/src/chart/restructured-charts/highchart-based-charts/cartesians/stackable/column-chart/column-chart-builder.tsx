import curry from 'lodash-es/curry.js';
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
import {
  createHighchartsBasedChartRenderer,
  isHighchartsBasedChartRendererProps,
} from '../../../highcharts-based-chart-renderer/highcharts-based-chart-renderer.js';
import { columnHighchartsOptionsBuilder } from './highcharts-options-builder.js';
import { getCommonCartesianAlerts } from '../../helpers/alerts.js';
import { ChartBuilder } from '../../../../types.js';

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
    ChartRendererComponent: createHighchartsBasedChartRenderer({
      highchartsOptionsBuilder: columnHighchartsOptionsBuilder,
      getAlerts: getCommonCartesianAlerts,
    }),
    isCorrectRendererProps: isHighchartsBasedChartRendererProps,
  },
};
