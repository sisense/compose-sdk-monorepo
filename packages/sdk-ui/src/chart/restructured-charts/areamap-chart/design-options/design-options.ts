import { BaseDesignOptions } from '@/chart-options-processor/translations/base-design-options';
import { AreamapStyleOptions, ChartStyleOptions } from '@/types';

import { ChartBuilder } from '../../types';
import { AreamapChartDesignOptions } from '../types';

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
