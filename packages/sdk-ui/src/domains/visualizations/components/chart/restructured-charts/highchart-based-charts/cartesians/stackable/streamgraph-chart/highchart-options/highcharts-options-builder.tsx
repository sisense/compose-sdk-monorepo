import omit from 'lodash-es/omit';

import { HighchartsOptionsBuilder } from '../../../../types.js';
import { getLegacyCartesianChartOptions } from '../../../helpers/highchart-options/get-legacy-cartesian-chart-options.js';
import { getBasicCartesianLegend } from '../../../helpers/highchart-options/legend.js';
import { getBasicCartesianTooltip } from '../../../helpers/highchart-options/tooltip.js';
import { getAxes } from './axes.js';
import { getPlotOptions } from './plot-options.js';

/**
 * Highcharts options builder for Streamgraph charts.
 *
 * Follows the HighchartsOptionsBuilder interface to construct
 * Highcharts configuration from processed chart data and design options.
 */
export const streamgraphHighchartsOptionsBuilder: HighchartsOptionsBuilder<'streamgraph'> = {
  /**
   * Build chart-level configuration.
   */
  getChart: function (ctx) {
    const legacyOptions = getLegacyCartesianChartOptions(ctx, 'area');
    return {
      ...legacyOptions.chart,
      type: 'streamgraph',
    };
  },

  /**
   * Build series data configuration.
   *
   * Streamgraph series are similar to area series but with streamgraph type.
   */
  getSeries: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'area').series;
  },

  /**
   * Build X and Y axis configurations.
   *
   * Streamgraphs typically have minimal Y-axis and standard X-axis.
   */
  getAxes,

  /**
   * Build legend configuration.
   *
   * Legends can be overwhelming with many series in streamgraphs,
   * so series labels are often preferred.
   */
  getLegend: function (ctx) {
    return getBasicCartesianLegend(ctx.designOptions.legend);
  },

  /**
   * Build plot options including series label configuration.
   */
  getPlotOptions,

  /**
   * Build tooltip configuration.
   */
  getTooltip: getBasicCartesianTooltip,

  /**
   * Any additional Highcharts options.
   */
  getExtras: function (ctx) {
    const options = getLegacyCartesianChartOptions(ctx, 'area');
    return omit(options, ['chart', 'series', 'xAxis', 'yAxis', 'legend', 'plotOptions', 'tooltip']);
  },
};
