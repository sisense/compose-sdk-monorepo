import { getLegendSettings } from '@/domains/visualizations/core/chart-options-processor/translations/legend-section.js';
import {
  prepareSunburstSeries,
  prepareSunburstTooltip,
} from '@/domains/visualizations/core/chart-options-processor/translations/sunburst/sunburst-options.js';

import { HighchartsOptionsBuilder } from '../../../types.js';

export const sunburstHighchartsOptionsBuilder: HighchartsOptionsBuilder<'sunburst'> = {
  getChart: () => ({
    type: 'sunburst',
    spacing: [20, 20, 20, 20],
    alignTicks: false,
    polar: false,
    animation: {
      duration: 300,
    },
  }),

  getSeries: (ctx) => {
    return prepareSunburstSeries(
      ctx.chartData,
      ctx.dataOptions,
      ctx.designOptions,
      ctx.extraConfig.themeSettings,
    );
  },

  getAxes: () => ({
    xAxis: undefined,
    yAxis: undefined,
  }),

  getLegend: (ctx) => {
    return getLegendSettings(ctx.designOptions.legend);
  },

  getPlotOptions: () => ({
    series: {},
    sunburst: {
      events: {
        legendItemClick: function (e) {
          e.preventDefault();
        },
      },
    },
  }),

  getTooltip: (ctx) => {
    return prepareSunburstTooltip(ctx.dataOptions, ctx.designOptions, ctx.extraConfig.translate);
  },

  getExtras: () => ({
    title: { text: null },
  }),
};
