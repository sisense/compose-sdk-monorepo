import { getCategoryTooltipSettings } from '@/chart-options-processor/tooltip';
import { getLegendSettings } from '@/chart-options-processor/translations/legend-section';
import { getPiePlotOptions } from '@/chart-options-processor/translations/pie-plot-options';
import {
  getPieConvolutionSeries,
  getPieSeries,
} from '@/chart-options-processor/translations/pie-series';
import { determineHighchartsChartType } from '@/chart-options-processor/translations/translations-to-highcharts';

import { HighchartsOptionsBuilder } from '../../../types';

export const pieHighchartsOptionsBuilder: HighchartsOptionsBuilder<'pie'> = {
  getChart: function (ctx) {
    const sisenseChartType = determineHighchartsChartType('pie', ctx.designOptions);
    const topSpacings = 20;

    return {
      type: sisenseChartType,
      spacing: [topSpacings, 20, 20, 20],
      alignTicks: false,
      polar: false,
    };
  },

  getSeries: function (ctx) {
    return getPieSeries({
      chartData: ctx.chartData,
      dataOptions: ctx.dataOptions,
      seriesCapacity: ctx.designOptions.dataLimits.seriesCapacity,
      convolution: ctx.designOptions.convolution,
      themeSettings: ctx.extraConfig.themeSettings,
    });
  },

  getAxes: function () {
    // Pie charts don't use traditional axes
    return {
      xAxis: [],
      yAxis: [],
    };
  },

  getLegend: function (ctx) {
    return getLegendSettings(ctx.designOptions.legend);
  },

  getPlotOptions: function (ctx) {
    return getPiePlotOptions({
      pieType: ctx.designOptions.pieType,
      seriesLabels: ctx.designOptions.seriesLabels,
      chartDataOptions: ctx.dataOptions,
      themeSettings: ctx.extraConfig.themeSettings,
      semiCircle: ctx.designOptions.semiCircle,
    });
  },

  getTooltip: function (ctx) {
    return getCategoryTooltipSettings(
      ctx.designOptions.seriesLabels?.percentageLabels?.showDecimals,
      ctx.dataOptions,
    );
  },

  getExtras: function (ctx) {
    const convolutionSeries = getPieConvolutionSeries({
      chartData: ctx.chartData,
      dataOptions: ctx.dataOptions,
      seriesCapacity: ctx.designOptions.dataLimits.seriesCapacity,
      convolution: ctx.designOptions.convolution,
      themeSettings: ctx.extraConfig.themeSettings,
    });

    return {
      title: { text: null },
      drilldown: {
        activeDataLabelStyle: {
          cursor: 'pointer',
          fontWeight: 'bold',
          textDecoration: 'none',
        },
        series: convolutionSeries,
      },
    };
  },
};
