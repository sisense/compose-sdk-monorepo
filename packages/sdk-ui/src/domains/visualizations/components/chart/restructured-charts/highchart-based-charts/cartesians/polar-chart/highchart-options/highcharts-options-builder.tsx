import omit from 'lodash-es/omit';

import { HighchartsOptionsBuilder } from '../../../types.js';
import { getLegacyCartesianChartOptions } from '../../helpers/highchart-options/get-legacy-cartesian-chart-options.js';
import { getBasicCartesianLegend } from '../../helpers/highchart-options/legend.js';
import { getBasicCartesianTooltip } from '../../helpers/highchart-options/tooltip.js';
import { getAxes } from './axes.js';

export const polarHighchartsOptionsBuilder: HighchartsOptionsBuilder<'polar'> = {
  getChart: function (ctx) {
    const options = getLegacyCartesianChartOptions(ctx, 'polar');
    return {
      ...options.chart,
      polar: true, // Ensure polar mode is enabled
    };
  },
  getSeries: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'polar').series;
  },

  getAxes,

  getLegend: function (ctx) {
    return getBasicCartesianLegend(ctx.designOptions.legend);
  },

  getPlotOptions: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'polar').plotOptions;
  },

  getTooltip: getBasicCartesianTooltip,

  getExtras: function (ctx) {
    const options = getLegacyCartesianChartOptions(ctx, 'polar');
    return omit(options, ['chart', 'series', 'xAxis', 'yAxis', 'legend', 'plotOptions', 'tooltip']);
  },
};
