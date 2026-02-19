import { loadDataBySingleQuery } from '../../../../helpers/data-loading.js';
import { ChartBuilder } from '../../../../types.js';
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
  isAreaStyleOptions,
  translateAreaStyleOptionsToDesignOptions,
} from './helpers/design-options.js';
import { areaHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder.js';

export const areaChartBuilder: ChartBuilder<'area'> = {
  dataOptions: {
    translateDataOptionsToInternal: translateCartesianChartDataOptions,
    getAttributes: getCartesianAttributes,
    getMeasures: getCartesianMeasures,
    isCorrectDataOptions: isCartesianChartDataOptions,
    isCorrectDataOptionsInternal: isCartesianChartDataOptionsInternal,
  },
  data: { loadData: loadDataBySingleQuery, getChartData: getCartesianChartData },
  designOptions: {
    translateStyleOptionsToDesignOptions: translateAreaStyleOptionsToDesignOptions,
    isCorrectStyleOptions: isAreaStyleOptions,
  },
  renderer: {
    ChartRendererComponent: createHighchartsBasedChartRenderer({
      highchartsOptionsBuilder: areaHighchartsOptionsBuilder,
      getAlerts: getCommonCartesianAlerts,
    }),
    isCorrectRendererProps: isHighchartsBasedChartRendererProps,
  },
};
