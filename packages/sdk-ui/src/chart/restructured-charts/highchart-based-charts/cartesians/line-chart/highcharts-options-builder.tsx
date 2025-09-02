import { HighchartsOptionsBuilder } from '../../types';
import omit from 'lodash-es/omit';
import { getLegacyCartesianChartOptions } from '../helpers/highchart-options/get-legacy-cartesian-chart-options';
import { getBasicCartesianLegend } from '../helpers/highchart-options/legend';
import { getBasicCartesianTooltip } from '../helpers/highchart-options/tooltip';
import { getAxes } from './highchart-options/axes';

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
