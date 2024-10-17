/* eslint-disable max-params */
import { CategoricalChartData } from '../../../chart-data/types';
import { HighchartsOptionsInternal } from '../../chart-options-service';
import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { CompleteThemeSettings, UniformDataColorOptions } from '../../../types';
import { SunburstChartDesignOptions } from '../design-options';
import { getTreemapTooltipSettings } from '../treemap/treemap-tooltip';
import { getPaletteColor } from '../../../chart-data-options/coloring/utils';
import { prepareSunburstLevels } from './sunburst-levels';
import { prepareSunburstDataItems, SUNBURST_ROOT_PARENT_ID } from './sunburst-series';
import { getLegendSettings } from '../legend-section';
import { TooltipFormatterContextObject } from '@sisense/sisense-charts';
import './sunburst.scss';
import { getLegend } from '../../style-to-design-options-translator/translate-to-highcharts-options';
import { getDataOptionTitle } from '@/chart-data-options/utils';

const DEFAULT_SUNBURST_SERIES = {
  type: 'sunburst',
  borderWidth: 0,
  dataLabels: {
    style: {
      textOutline: 'none',
    },
  },
};

const DEFAULT_SUNBURST_OPTIONS: HighchartsOptionsInternal = {
  title: { text: null },
  chart: {
    type: 'sunburst',
    spacing: [20, 20, 20, 20],
    alignTicks: false,
    polar: false,
    animation: {
      duration: 300,
    },
  },
  series: [],
  plotOptions: {
    series: {},
    sunburst: {
      events: {
        legendItemClick: function (e) {
          e.preventDefault();
        },
      },
    },
  },
};

export function prepareSunburstOptions(
  chartData: CategoricalChartData,
  dataOptions: CategoricalChartDataOptionsInternal,
  designOptions: SunburstChartDesignOptions,
  themeSettings?: CompleteThemeSettings,
): HighchartsOptionsInternal {
  return {
    ...DEFAULT_SUNBURST_OPTIONS,
    series: [
      {
        ...DEFAULT_SUNBURST_SERIES,
        name: 'Root',
        data: prepareSunburstDataItems(chartData, dataOptions, themeSettings),
        levels: prepareSunburstLevels(chartData, dataOptions, designOptions, themeSettings),
        showInLegend: false,
        turboThreshold: 2000,
      },
      ...dataOptions.breakBy.map((column, index) => ({
        name: getDataOptionTitle(column),
        showInLegend: true,
        color:
          (column?.color as UniformDataColorOptions)?.color ||
          getPaletteColor(themeSettings?.palette.variantColors, index),
        data: [],
        states: {
          hover: {
            enabled: false,
          },
        },
      })),
    ],
    tooltip: getTreemapTooltipSettings(dataOptions, designOptions, {
      displayTotalContribution: true,
      displayColorCircles: true,
      shouldSkip: (context: TooltipFormatterContextObject) =>
        context.point.options.id === SUNBURST_ROOT_PARENT_ID,
    }),
    legend: getLegendSettings(getLegend(designOptions.legend)),
  };
}
