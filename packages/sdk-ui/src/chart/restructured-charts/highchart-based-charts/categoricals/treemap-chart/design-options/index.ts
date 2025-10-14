import { getTreemapChartDesignOptions } from '@/chart-options-processor/style-to-design-options-translator/translate-to-highcharts-options';
import { type ChartStyleOptions } from '@/types';

import type { TreemapChartDesignOptions, TreemapChartStyleOptions } from '../types';

export const designOptionsTranslators = {
  translateStyleOptionsToDesignOptions: (
    styleOptions: TreemapChartStyleOptions,
  ): TreemapChartDesignOptions => {
    return getTreemapChartDesignOptions(styleOptions);
  },

  isCorrectStyleOptions: (
    styleOptions: ChartStyleOptions,
  ): styleOptions is TreemapChartStyleOptions => {
    return !(!styleOptions || typeof styleOptions !== 'object');
  },
};
