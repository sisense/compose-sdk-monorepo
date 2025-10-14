import { getDataOptionTitle } from '@/chart-data-options/utils';
import { prepareTreemapLevels } from '@/chart-options-processor/translations/treemap/treemap-labels';
import { prepareTreemapDataItems } from '@/chart-options-processor/translations/treemap/treemap-series';
import { getTreemapTooltipSettings } from '@/chart-options-processor/translations/treemap/treemap-tooltip';

import { HighchartsOptionsBuilder } from '../../../types';

const DEFAULT_TREEMAP_SERIES_COLOR = 'rgb(0, 206, 230)';

export const treemapHighchartsOptionsBuilder: HighchartsOptionsBuilder<'treemap'> = {
  getChart: () => ({
    type: 'treemap',
    spacing: [20, 20, 20, 20],
    alignTicks: false,
    polar: false,
    animation: {
      duration: 300,
    },
  }),

  getSeries: (ctx) => {
    return [
      {
        type: 'treemap',
        layoutAlgorithm: 'strip',
        layoutStartingDirection: 'horizontal',
        clip: false,
        color: DEFAULT_TREEMAP_SERIES_COLOR,
        name: ctx.dataOptions.y[0] ? getDataOptionTitle(ctx.dataOptions.y[0]) : '',
        data: prepareTreemapDataItems(
          ctx.chartData,
          ctx.dataOptions,
          ctx.extraConfig.themeSettings,
        ),
        levels: prepareTreemapLevels(
          ctx.dataOptions,
          ctx.designOptions,
          ctx.extraConfig.themeSettings,
        ),
        dataLabels: {
          style: {
            textOutline: 'none',
          },
        },
      },
    ];
  },

  getAxes: () => ({
    xAxis: undefined,
    yAxis: undefined,
  }),

  getLegend: () => ({
    enabled: false,
  }),

  getPlotOptions: () => ({
    series: {},
  }),

  getTooltip: (ctx) => {
    return getTreemapTooltipSettings(ctx.dataOptions, ctx.designOptions, ctx.extraConfig.translate);
  },

  getExtras: () => ({
    title: { text: null },
  }),
};
