import { BaseDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/base-design-options.js';
import { AreamapStyleOptions, ChartStyleOptions } from '@/types';

import { ChartBuilder } from '../../types.js';
import { AreamapChartDesignOptions } from '../types.js';

export const areamapDesignOptionsTranslators: ChartBuilder<'areamap'>['designOptions'] = {
  translateStyleOptionsToDesignOptions: function (
    styleOptions: AreamapStyleOptions,
  ): AreamapChartDesignOptions {
    return {
      // TODO: refactor and remove need of BaseDesignOptions here
      ...BaseDesignOptions,
      mapType: styleOptions.mapType || 'world',
    };
  },

  isCorrectStyleOptions: function (
    styleOptions: ChartStyleOptions,
  ): styleOptions is AreamapStyleOptions {
    // all style options are optional so we just need to check if it's an object
    return typeof styleOptions === 'object' && styleOptions !== null;
  },
};
