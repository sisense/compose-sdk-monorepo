import { isNumber } from '@sisense/sdk-data';
import { StyledMeasureColumn, StyledColumn } from '../../chart-data-options/types.js';
import { applyFormat, getCompleteNumberFormatConfig } from './number-format-config.js';
import type { SeriesChartType } from '@/types';
import { isMeasureColumn } from '@/chart-data-options/utils.js';

export const isXValueNumeric = (dataOptionX: StyledMeasureColumn | StyledColumn | undefined) =>
  dataOptionX
    ? isMeasureColumn(dataOptionX) || (dataOptionX.column.type && isNumber(dataOptionX.column.type))
    : false;

export const formatTooltipValue = (
  dataOption: StyledMeasureColumn | StyledColumn | undefined,
  value: number | undefined,
  displayValue: string,
) => {
  if (!dataOption || value === undefined || isNaN(value)) return displayValue;

  const numberFormatConfig = getCompleteNumberFormatConfig(dataOption.numberFormatConfig);
  return applyFormat(numberFormatConfig, value);
};

export const formatTooltipXValue = (
  dataOption: StyledMeasureColumn | StyledColumn | undefined,
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
  'arearange',
];
export function isTooltipPercentValueSupported(options: StyledMeasureColumn | undefined) {
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
  crosshairs?: boolean;
  shared?: boolean;
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
    yBottom?: number;
    z?: number;
    high?: number;
    low?: number;
    q1?: number;
    q3?: number;
    index?: number;
    median?: number;
    name: string;
    color: string;
    custom?: {
      number1?: number;
      string1?: string;
      xDisplayValue?: string;
      xValue?: (number | string)[];
    };
    upperPointName?: string;
    lowerPointName?: string;
    trend?: {
      min: number;
      max: number;
      median: number;
      average: number;
    };
  };
  percentage?: number;
};
