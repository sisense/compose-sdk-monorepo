/* eslint-disable @typescript-eslint/no-use-before-define */

/* eslint-disable max-params */
import { RelativeColoringFunction } from '.';
import { RangeDataColorOptions } from '../../types';
import { hueDiff, toAvg, toGray, toRangeFn, toSteps } from '../../utils/color';
import { DEFAULT_COLOR } from './consts';

/**
 * Returns a relative coloring function based on the provided color options.
 *
 * @param colorOpts - The color options for range coloring.
 * @returns The relative coloring function.
 */
export function getRangeColoringFunction(
  colorOpts: RangeDataColorOptions,
): RelativeColoringFunction {
  return (allValuesForComparison: number[]) => {
    const { steps, minColor, maxColor } = colorOpts;

    const minValue = colorOpts.minValue ?? Math.min(...allValuesForComparison);
    const maxValue = colorOpts.maxValue ?? Math.max(...allValuesForComparison);
    const midValue =
      colorOpts.midValue ?? (minValue < 0 && maxValue > 0 ? 0 : (minValue + maxValue) / 2);

    const interpolate = getInterpolatorFn(
      minColor ?? DEFAULT_COLOR,
      maxColor ?? DEFAULT_COLOR,
      minValue,
      midValue,
      maxValue,
      steps,
    );
    return (value: number) => {
      return interpolate(value);
    };
  };
}

/**
 * Retrieves the interpolator function for range coloring.
 *
 * @param minColor - Color of the minimum.
 * @param maxColor - Color of the maximum.
 * @param minValue - The minimum value where minColor should be applied.
 * @param midValue - Value of the gradient center.
 * @param maxValue - The minimum value where maxColor should be applied.
 * @param steps - The number of interpolation steps.
 * @returns The interpolator function.
 */
export const getInterpolatorFn = (
  minColor: string,
  maxColor: string,
  minValue: number,
  midValue: number,
  maxValue: number,
  steps = 0,
) => {
  const getPercent = getValueToUnitIntervalFn(minValue, midValue, maxValue);

  const colors =
    hueDiff(minColor, maxColor) > 90
      ? [minColor, toGray(toAvg(minColor, maxColor)), maxColor]
      : [minColor, maxColor];

  return steps <= 0
    ? getSteplessInterpolatorFn(getPercent, colors)
    : getSteppedInterpolatorFn(getPercent, steps, colors);
};

const getSteplessInterpolatorFn = (getPercent: (value: number) => number, colors: string[]) => {
  const rangeFn = toRangeFn(...colors);
  return (value: number) => rangeFn(getPercent(value));
};

const getSteppedInterpolatorFn = (
  getPercent: (value: number) => number,
  steps: number,
  colors: string[],
) => {
  const colorSteps = toSteps(steps, ...colors);

  return (value: number) => {
    const colorIdx = Math.floor(getPercent(value) * steps);
    return colorSteps[Math.min(Math.max(colorIdx, 0), steps - 1)];
  };
};

const getValueToUnitIntervalFn =
  (minValue: number, midValue: number, maxValue: number) => (value: number) =>
    value == minValue && value == maxValue
      ? 0.5
      : value < midValue
      ? 0.5 * ((value - minValue) / (midValue - minValue))
      : 0.5 + (0.5 * (value - midValue)) / (maxValue - midValue);
