import { AreamapStyleOptions } from '../../types.js';
import { BaseDesignOptions } from '../translations/base-design-options.js';
import { AreamapChartDesignOptions } from '../translations/design-options.js';

export const getAreamapChartDesignOptions = (
  styleOptions: AreamapStyleOptions,
): AreamapChartDesignOptions => {
  return { ...BaseDesignOptions, mapType: styleOptions.mapType || 'world' };
};
