import { DataColorOptions } from '../../types.js';
import { getConditionalColoringFunction } from './conditional-coloring.js';
import { getRangeColoringFunction } from './range-coloring.js';
import {
  getUniformColorOptionsFromString,
  getUniformColoringFunction,
} from './uniform-coloring.js';

/**
 * Type representing the coloring types.
 * Static - all values have the same color independent of the value.
 * Absolute - each value has a color based on the value.
 * Relative - each value has a color based on the value and the other values.
 */
export type ColoringType = 'Static' | 'Absolute' | 'Relative';
export type StaticColoringFunction = () => string | undefined;
export type AbsoluteColoringFunction = (value: number) => string | undefined;
export type RelativeColoringFunction = (
  allValuesForComparison: number[],
) => (value: number) => string | undefined;

export type ColoringService<Type extends ColoringType = ColoringType> = {
  type: Type;
  getColor: Type extends 'Static'
    ? StaticColoringFunction
    : Type extends 'Absolute'
    ? AbsoluteColoringFunction
    : Type extends 'Relative'
    ? RelativeColoringFunction
    : never;
};

/**
 * Retrieves the coloring service based on the provided color options.
 *
 * @param colorOptions - The color options to determine the coloring service.
 * @returns The coloring service.
 */
export function getColoringServiceByColorOptions(colorOptions: DataColorOptions): ColoringService {
  let colorOpts: Exclude<DataColorOptions, string>;
  if (typeof colorOptions === 'string') {
    colorOpts = getUniformColorOptionsFromString(colorOptions);
  } else {
    colorOpts = colorOptions;
  }

  switch (colorOpts.type) {
    case 'uniform':
      return {
        type: 'Static',
        getColor: getUniformColoringFunction(colorOpts),
      };
    case 'conditional':
      return {
        type: 'Absolute',
        getColor: getConditionalColoringFunction(colorOpts),
      };
    case 'range':
      return {
        type: 'Relative',
        getColor: getRangeColoringFunction(colorOpts),
      };
  }
}
