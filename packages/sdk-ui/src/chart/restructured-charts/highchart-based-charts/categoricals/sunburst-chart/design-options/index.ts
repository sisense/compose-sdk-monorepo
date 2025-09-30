import { getSunburstChartDesignOptions } from '@/chart-options-processor/style-to-design-options-translator/translate-to-highcharts-options';
import { type ChartStyleOptions } from '@/types';
import type { SunburstChartStyleOptions, SunburstChartDesignOptions } from '../types';

export const designOptionsTranslators = {
  translateStyleOptionsToDesignOptions: (
    styleOptions: SunburstChartStyleOptions,
  ): SunburstChartDesignOptions => {
    return getSunburstChartDesignOptions(styleOptions);
  },

  isCorrectStyleOptions: (
    styleOptions: ChartStyleOptions,
  ): styleOptions is SunburstChartStyleOptions => {
    return !(!styleOptions || typeof styleOptions !== 'object');
  },
};
