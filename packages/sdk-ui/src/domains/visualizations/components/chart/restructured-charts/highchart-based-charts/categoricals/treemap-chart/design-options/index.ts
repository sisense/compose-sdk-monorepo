import { DeepPartial } from 'ts-essentials';

import { getTreemapChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/style-to-design-options-translator/translate-to-highcharts-options.js';
import { type ChartStyleOptions } from '@/types';

import type { TreemapChartDesignOptions, TreemapChartStyleOptions } from '../types.js';

export const designOptionsTranslators = {
  translateStyleOptionsToDesignOptions: (
    styleOptions: TreemapChartStyleOptions,
  ): TreemapChartDesignOptions => {
    return getTreemapChartDesignOptions(styleOptions);
  },

  getDefaultStyleOptions: (): TreemapChartStyleOptions => {
    return {
      seriesLabels: {
        enabled: true,
      },
      tooltip: {
        mode: 'value',
      },
    };
  },

  translateLegacyStyleOptionsToModern: (
    styleOptions?: DeepPartial<TreemapChartStyleOptions>,
  ): DeepPartial<TreemapChartStyleOptions> => {
    const styleOptionsWithDefaults = styleOptions ?? {};
    if (styleOptionsWithDefaults?.labels && !styleOptionsWithDefaults?.seriesLabels) {
      return {
        ...styleOptionsWithDefaults,
        seriesLabels: styleOptionsWithDefaults.labels.category?.map((label) => ({
          enabled: label?.enabled ?? true,
        })),
      };
    }
    return styleOptionsWithDefaults;
  },

  isCorrectStyleOptions: (
    styleOptions: ChartStyleOptions,
  ): styleOptions is TreemapChartStyleOptions => {
    return !(!styleOptions || typeof styleOptions !== 'object');
  },
};
