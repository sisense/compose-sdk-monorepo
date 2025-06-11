import omit from 'lodash-es/omit';
import { HighchartsOptionsBuilder } from '../../../types';
import { getLegacyCartesianChartOptions } from '../../helpers/get-legacy-cartesian-chart-options';

export const barHighchartsOptionsBuilder: HighchartsOptionsBuilder<'bar'> = {
  getChart: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'bar').chart;
  },

  getSeries: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'bar').series;
  },

  getAxes: function (ctx) {
    const { xAxis, yAxis } = getLegacyCartesianChartOptions(ctx, 'bar');
    return {
      xAxis,
      yAxis,
    };
  },

  getLegend: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'bar').legend;
  },

  getPlotOptions: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'bar').plotOptions;
  },

  getTooltip: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'bar').tooltip;
  },

  getExtras: function (ctx) {
    const options = getLegacyCartesianChartOptions(ctx, 'bar');
    return omit(options, ['chart', 'series', 'xAxis', 'yAxis', 'legend', 'plotOptions', 'tooltip']);
  },
};
