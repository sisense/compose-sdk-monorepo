import { getCategoryTooltipSettings } from '@/chart-options-processor/tooltip';
import { getFunnelPlotOptions } from '@/chart-options-processor/translations/funnel-plot-options';
import { formatFunnelChartData } from '@/chart-options-processor/translations/funnel-series';
import { getLegendSettings } from '@/chart-options-processor/translations/legend-section';
import { determineHighchartsChartType } from '@/chart-options-processor/translations/translations-to-highcharts';

import { HighchartsOptionsBuilder } from '../../../types';

export const funnelHighchartsOptionsBuilder: HighchartsOptionsBuilder<'funnel'> = {
  getChart: function (ctx) {
    const sisenseChartType = determineHighchartsChartType('funnel', ctx.designOptions);

    return {
      type: sisenseChartType,
      spacing: [30, 30, 30, 30],
      alignTicks: false,
      polar: false,
    };
  },

  getSeries: function (ctx) {
    const { series: funnelSeries } = formatFunnelChartData(
      ctx.chartData,
      ctx.dataOptions,
      ctx.designOptions,
      ctx.extraConfig.themeSettings,
    );
    return funnelSeries;
  },

  getAxes: function () {
    // Funnel charts don't use traditional axes
    return {
      xAxis: [],
      yAxis: [],
    };
  },

  getLegend: function (ctx) {
    return getLegendSettings(ctx.designOptions.legend);
  },

  getPlotOptions: function (ctx) {
    return getFunnelPlotOptions(ctx.designOptions, ctx.dataOptions);
  },

  getTooltip: function (ctx) {
    return getCategoryTooltipSettings(
      ctx.designOptions.seriesLabels?.showPercentDecimals,
      ctx.dataOptions,
    );
  },

  getExtras: function () {
    return {
      title: { text: null },
    };
  },
};
