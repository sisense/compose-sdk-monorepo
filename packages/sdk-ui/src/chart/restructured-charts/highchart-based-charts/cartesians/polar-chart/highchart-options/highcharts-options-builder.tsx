import omit from 'lodash-es/omit';

import { HighchartsOptionsBuilder } from '../../../types';
import { getLegacyCartesianChartOptions } from '../../helpers/highchart-options/get-legacy-cartesian-chart-options';
import { getBasicCartesianLegend } from '../../helpers/highchart-options/legend';
import { getBasicCartesianTooltip } from '../../helpers/highchart-options/tooltip';
import { getAxes } from './axes';

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
