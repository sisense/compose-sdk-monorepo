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
import { getStreamgraphChartData } from './helpers/chart-data.js';
import {
  getDefaultStreamgraphStyleOptions,
  isStreamgraphStyleOptions,
  translateStreamgraphStyleOptionsToDesignOptions,
} from './helpers/design-options.js';
import { streamgraphHighchartsOptionsBuilder } from './highchart-options/highcharts-options-builder.js';

/**
 * Chart builder for Streamgraph charts.
 *
 * Implements the ChartBuilder interface to provide all necessary
 * functionality for data loading, processing, styling, and rendering.
 */
export const streamgraphChartBuilder: ChartBuilder<'streamgraph'> = {
  /**
   * Data options configuration.
   * Reuses Cartesian data options since streamgraph has the same structure.
   */
  dataOptions: {
    translateDataOptionsToInternal: translateCartesianChartDataOptions,
    getAttributes: getCartesianAttributes,
    getMeasures: getCartesianMeasures,
    isCorrectDataOptions: isCartesianChartDataOptions,
    isCorrectDataOptionsInternal: isCartesianChartDataOptionsInternal,
  },

  /**
   * Data loading and processing.
   */
  data: {
    loadData: loadDataBySingleQuery,
    getChartData: getStreamgraphChartData,
  },

  /**
   * Design options configuration.
   * Converts user-facing style options to internal design options.
   */
  designOptions: {
    translateStyleOptionsToDesignOptions: translateStreamgraphStyleOptionsToDesignOptions,
    isCorrectStyleOptions: isStreamgraphStyleOptions,
    getDefaultStyleOptions: getDefaultStreamgraphStyleOptions,
  },

  /**
   * Chart renderer configuration.
   * Uses Highcharts-based renderer with streamgraph-specific options builder.
   */
  renderer: {
    ChartRendererComponent: createHighchartsBasedChartRenderer({
      highchartsOptionsBuilder: streamgraphHighchartsOptionsBuilder,
      getAlerts: getCommonCartesianAlerts,
    }),
    isCorrectRendererProps: isHighchartsBasedChartRendererProps,
  },
};
