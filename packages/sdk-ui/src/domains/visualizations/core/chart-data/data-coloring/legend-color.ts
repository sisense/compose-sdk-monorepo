import { DEFAULT_COLOR } from '../../chart-data-options/coloring/consts.js';
import { getUniformColorOptionsFromString } from '../../chart-data-options/coloring/uniform-coloring.js';
import { DataColorOptions } from './types.js';

export const legendColor = (colorOpts?: DataColorOptions) => {
  if (colorOpts === undefined) {
    return undefined;
  }

  if (typeof colorOpts === 'string') {
    return getUniformColorOptionsFromString(colorOpts).color;
  }

  if (colorOpts.type === 'uniform') {
    return colorOpts.color;
  }

  return DEFAULT_COLOR;
};
