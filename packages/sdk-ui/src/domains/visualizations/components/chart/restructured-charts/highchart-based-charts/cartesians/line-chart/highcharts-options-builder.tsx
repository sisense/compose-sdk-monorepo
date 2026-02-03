import omit from 'lodash-es/omit';

import { HighchartsOptionsBuilder } from '../../types.js';
import { getLegacyCartesianChartOptions } from '../helpers/highchart-options/get-legacy-cartesian-chart-options.js';
import { getBasicCartesianLegend } from '../helpers/highchart-options/legend.js';
import { getBasicCartesianTooltip } from '../helpers/highchart-options/tooltip.js';
import { getAxes } from './highchart-options/axes.js';

export const lineHighchartsOptionsBuilder: HighchartsOptionsBuilder<'line'> = {
  getChart: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'line').chart;
  },
  getSeries: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'line').series;
  },

  getAxes,

  getLegend: function (ctx) {
    return getBasicCartesianLegend(ctx.designOptions.legend);
  },

  getPlotOptions: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'line').plotOptions;
  },

  getTooltip: getBasicCartesianTooltip,

  getExtras: function (ctx) {
    const options = getLegacyCartesianChartOptions(ctx, 'line');
    return omit(options, ['chart', 'series', 'xAxis', 'yAxis', 'legend', 'plotOptions', 'tooltip']);
  },
};
