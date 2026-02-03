/* eslint-disable max-params */
import {
  ConditionalDataColorOptions,
  DataColorOptions,
  IndicatorChartDataOptions,
  UniformDataColorOptions,
} from '../../../../../../../types';
import {
  ColoringService,
  getColoringServiceByColorOptions,
} from '../../../../../core/chart-data-options/coloring';
import { LegacyIndicatorChartOptions } from '../types';

/**
 * Type that represents allowed color options for an indicator.
 */
export type AllowedIndicatorColorOptions =
  | string
  | UniformDataColorOptions
  | ConditionalDataColorOptions;
/**
 * Type that represents allowed coloring types for an indicator.
 */
export type AllowedIndicatorColoringTypes = 'Static' | 'Absolute';

/**
 * Returns the color options from the indicator data options.
 *
 * @param dataOptions - The indicator data options to extract the color options from.
 * @returns The color options from the indicator data options.
 */
export function getValueColorOptions(dataOptions: IndicatorChartDataOptions) {
  const value = dataOptions.value?.[0];
  if (value && 'color' in value) {
    return value.color;
  }
  return undefined;
}

/**
 * Overrides the value color in the legacy indicator chart options with the specified color.
 *
 * @param colorOptions - The color options for the indicator.
 * @param value - The value to determine the color.
 * @param legacyChartOptions - The legacy indicator chart options to modify.
 * @param typeOptions - Describe indicator type and subtype.
 * @returns The modified legacy indicator chart options.
 */
export function overrideWithValueColor(
  colorOptions: DataColorOptions,
  value: number,
  legacyChartOptions: LegacyIndicatorChartOptions,
): LegacyIndicatorChartOptions {
  if (!isAllowedIndicatorColorOptions(colorOptions)) {
    return legacyChartOptions;
  }
  const coloringService = getColoringServiceByColorOptions(
    colorOptions,
  ) as ColoringService<AllowedIndicatorColoringTypes>;

  const color = coloringService.getColor(value);

  if (!color) {
    return legacyChartOptions;
  }

  return {
    ...legacyChartOptions,
    value: {
      ...legacyChartOptions.value,
      color,
    },
  };
}

/**
 * Checks if the color options are allowed for an indicator.
 *
 * @param colorOptions - The color options to check.
 * @returns True if the color options are allowed, false otherwise.
 */
export function isAllowedIndicatorColorOptions(
  colorOptions: DataColorOptions,
): colorOptions is AllowedIndicatorColorOptions {
  return (
    typeof colorOptions === 'string' ||
    colorOptions.type === 'uniform' ||
    colorOptions.type === 'conditional'
  );
}
