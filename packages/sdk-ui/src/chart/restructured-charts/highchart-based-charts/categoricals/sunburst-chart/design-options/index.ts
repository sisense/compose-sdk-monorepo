import { DeepPartial } from 'ts-essentials';

import { getSunburstChartDesignOptions } from '@/chart-options-processor/style-to-design-options-translator/translate-to-highcharts-options';
import { type ChartStyleOptions } from '@/types';

import type { SunburstChartDesignOptions, SunburstChartStyleOptions } from '../types';

export const designOptionsTranslators = {
  translateStyleOptionsToDesignOptions: (
    styleOptions: SunburstChartStyleOptions,
  ): SunburstChartDesignOptions => {
    return getSunburstChartDesignOptions(styleOptions);
  },

  getDefaultStyleOptions: (): SunburstChartStyleOptions => {
    return {
      seriesLabels: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
    };
  },

  translateLegacyStyleOptionsToModern: (
    styleOptions?: DeepPartial<SunburstChartStyleOptions>,
  ): DeepPartial<SunburstChartStyleOptions> => {
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
  ): styleOptions is SunburstChartStyleOptions => {
    return !(!styleOptions || typeof styleOptions !== 'object');
  },
};
