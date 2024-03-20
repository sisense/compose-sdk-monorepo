import { isNumber } from '@sisense/sdk-data';
import { Category, Value, isValue } from '../../chart-data-options/types.js';
import { applyFormat, getCompleteNumberFormatConfig } from './number-format-config.js';
import type { SeriesChartType } from '@/types';

export const isXValueNumeric = (dataOptionX: Value | Category | undefined) =>
  dataOptionX ? isValue(dataOptionX) || (dataOptionX.type && isNumber(dataOptionX.type)) : false;

export const formatTooltipValue = (
  dataOption: Value | Category | undefined,
  value: number | undefined,
  displayValue: string,
) => {
  if (!dataOption || value === undefined || isNaN(value)) return displayValue;

  const numberFormatConfig = getCompleteNumberFormatConfig(dataOption.numberFormatConfig);
  return applyFormat(numberFormatConfig, value);
};

export const formatTooltipXValue = (
  dataOption: Value | Category | undefined,
  value: number | string | undefined,
  displayValue: string,
) => {
  const isNumeric = isXValueNumeric(dataOption);

  return isNumeric
    ? formatTooltipValue(dataOption, parseFloat(`${value}`), displayValue)
    : displayValue;
};

const percentSupportedSubChartTypes: SeriesChartType[] = [
  'auto',
  'column',
  'area',
  'areaspline',
  'bar',
  'scatter',
];
export function isTooltipPercentValueSupported(options: Value | undefined) {
  if (options?.chartType) {
    return percentSupportedSubChartTypes.includes(options.chartType);
  }
  return true;
}

export type TooltipSettings = {
  enabled?: boolean;
  animation?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  useHTML?: boolean;
  formatter?: () => string;
  style?: {
    fontFamily?: string;
  };
};

export type InternalSeries = {
  series: { name: string; color: string };
  x: string;
  y: number;
  point: {
    x?: number | string;
    y?: number;
    z?: number;
    high?: number;
    low?: number;
    q1?: number;
    q3?: number;
    median?: number;
    name: string;
    color: string;
    custom?: {
      number1?: number;
      string1?: string;
      xDisplayValue?: string;
      xValue?: (number | string)[];
    };
  };
  percentage?: number;
};
