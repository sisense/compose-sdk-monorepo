import omit from 'lodash-es/omit';

import { HighchartsOptionsBuilder } from '../../../../types.js';
import { getLegacyCartesianChartOptions } from '../../../helpers/highchart-options/get-legacy-cartesian-chart-options.js';
import { getBasicCartesianTooltip } from '../../../helpers/highchart-options/tooltip.js';
import { getAxes } from './axes.js';
import { getLegend } from './legend.js';

export const barHighchartsOptionsBuilder: HighchartsOptionsBuilder<'bar'> = {
  getChart: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'bar').chart;
  },

  getSeries: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'bar').series;
  },

  getAxes,

  getLegend,

  getPlotOptions: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'bar').plotOptions;
  },

  getTooltip: getBasicCartesianTooltip,

  getExtras: function (ctx) {
    const options = getLegacyCartesianChartOptions(ctx, 'bar');
    return omit(options, ['chart', 'series', 'xAxis', 'yAxis', 'legend', 'plotOptions', 'tooltip']);
  },
};
