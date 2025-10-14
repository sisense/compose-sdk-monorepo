import omit from 'lodash-es/omit';

import { HighchartsOptionsBuilder } from '../../../../types';
import { getLegacyCartesianChartOptions } from '../../../helpers/highchart-options/get-legacy-cartesian-chart-options';
import { getBasicCartesianTooltip } from '../../../helpers/highchart-options/tooltip';
import { getAxes } from './axes';
import { getLegend } from './legend';

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
