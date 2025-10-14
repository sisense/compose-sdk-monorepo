/* eslint-disable max-params */
import { TFunction } from '@sisense/sdk-common';

import { getDataOptionTitle } from '@/chart-data-options/utils';

import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { CategoricalChartData } from '../../../chart-data/types';
import { CompleteThemeSettings } from '../../../types';
import { HighchartsOptionsInternal } from '../../chart-options-service';
import { TreemapChartDesignOptions } from '../design-options';
import { prepareTreemapLevels } from './treemap-labels';
import { prepareTreemapDataItems } from './treemap-series';
import { getTreemapTooltipSettings } from './treemap-tooltip';

const DEFAULT_TREEMAP_SERIES_COLOR = 'rgb(0, 206, 230)';

const DEFAULT_TREEMAP_SERIES = {
  type: 'treemap',
  layoutAlgorithm: 'strip',
  layoutStartingDirection: 'horizontal',
  clip: false,
  color: DEFAULT_TREEMAP_SERIES_COLOR,
  dataLabels: {
    style: {
      textOutline: 'none',
    },
  },
};

const DEFAULT_TREEMAP_OPTIONS: HighchartsOptionsInternal = {
  title: { text: null },
  chart: {
    type: 'treemap',
    spacing: [20, 20, 20, 20],
    alignTicks: false,
    polar: false,
    animation: {
      duration: 300,
    },
  },
  series: [],
};

export function prepareTreemapOptions(
  chartData: CategoricalChartData,
  dataOptions: CategoricalChartDataOptionsInternal,
  designOptions: TreemapChartDesignOptions,
  translate: TFunction,
  themeSettings?: CompleteThemeSettings,
): HighchartsOptionsInternal {
  return {
    ...DEFAULT_TREEMAP_OPTIONS,
    series: [
      {
        ...DEFAULT_TREEMAP_SERIES,
        name: dataOptions.y[0] ? getDataOptionTitle(dataOptions.y[0]) : '',
        data: prepareTreemapDataItems(chartData, dataOptions, themeSettings),
        levels: prepareTreemapLevels(dataOptions, designOptions, themeSettings),
      },
    ],
    tooltip: getTreemapTooltipSettings(dataOptions, designOptions, translate),
  };
}
