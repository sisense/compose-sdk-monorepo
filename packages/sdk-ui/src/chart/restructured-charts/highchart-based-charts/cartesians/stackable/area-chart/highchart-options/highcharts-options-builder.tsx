import { withMethodsInputOutputCollection } from '@/utils/__development-utils__/highcharts-options-builder-collector';
import omit from 'lodash-es/omit';
import { HighchartsOptionsBuilder } from '../../../../types';
import { getLegacyCartesianChartOptions } from '../../../helpers/highchart-options/get-legacy-cartesian-chart-options';
import { getBasicCartesianLegend } from '../../../helpers/highchart-options/legend';
import { getBasicCartesianTooltip } from '../../../helpers/highchart-options/tooltip';
import { getAxes } from './axes';

export const areaHighchartsOptionsBuilder: HighchartsOptionsBuilder<'area'> =
  withMethodsInputOutputCollection<HighchartsOptionsBuilder<'area'>>({
    objectName: 'areaHighchartsOptionsBuilder',
    maxSnapshots: 1000,
  })({
    getChart: function (ctx) {
      return getLegacyCartesianChartOptions(ctx, 'area').chart;
    },

    getSeries: function (ctx) {
      return getLegacyCartesianChartOptions(ctx, 'area').series;
    },

    getAxes,

    getLegend: function (ctx) {
      return getBasicCartesianLegend(ctx.designOptions.legend);
    },

    getPlotOptions: function (ctx) {
      return getLegacyCartesianChartOptions(ctx, 'area').plotOptions;
    },

    getTooltip: getBasicCartesianTooltip,

    getExtras: function (ctx) {
      const options = getLegacyCartesianChartOptions(ctx, 'area');
      return omit(options, [
        'chart',
        'series',
        'xAxis',
        'yAxis',
        'legend',
        'plotOptions',
        'tooltip',
      ]);
    },
  });
