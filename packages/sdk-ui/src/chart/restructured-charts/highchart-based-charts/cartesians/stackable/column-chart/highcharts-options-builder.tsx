import { HighchartsOptionsBuilder } from '../../../types';
import omit from 'lodash-es/omit';
import { getLegacyCartesianChartOptions } from '../../helpers/get-legacy-cartesian-chart-options';

export const columnHighchartsOptionsBuilder: HighchartsOptionsBuilder<'column'> = {
  getChart: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'column').chart;
  },
  getSeries: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'column').series;
  },

  getAxes: function (ctx) {
    const { xAxis, yAxis } = getLegacyCartesianChartOptions(ctx, 'column');
    return {
      xAxis,
      yAxis,
    };
  },

  getLegend: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'column').legend;
  },

  getPlotOptions: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'column').plotOptions;
  },

  getTooltip: function (ctx) {
    return getLegacyCartesianChartOptions(ctx, 'column').tooltip;
  },

  getExtras: function (ctx) {
    const options = getLegacyCartesianChartOptions(ctx, 'column');
    return omit(options, ['chart', 'series', 'xAxis', 'yAxis', 'legend', 'plotOptions', 'tooltip']);
  },
};
