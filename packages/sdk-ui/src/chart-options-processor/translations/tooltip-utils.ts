import { isNumber } from '@sisense/sdk-data';
import { StyledMeasureColumn, StyledColumn } from '../../chart-data-options/types.js';
import { applyFormat, getCompleteNumberFormatConfig } from './number-format-config.js';
import type { SeriesChartType } from '@/types';
import { isMeasureColumn } from '@/chart-data-options/utils.js';
import { TooltipFormatterContextObject } from '@sisense/sisense-charts';

export const isValueNumeric = (value: StyledMeasureColumn | StyledColumn | undefined) =>
  value ? isMeasureColumn(value) || (value.column.type && isNumber(value.column.type)) : false;

const formatNumericTooltipValue = (
  dataOption: StyledMeasureColumn | StyledColumn | undefined,
  value: number | undefined,
  displayValue: string,
) => {
  if (!dataOption || value === undefined || isNaN(value)) return displayValue;

  const numberFormatConfig = getCompleteNumberFormatConfig(dataOption.numberFormatConfig);
  return applyFormat(numberFormatConfig, value);
};

export const formatTooltipValue = (
  dataOption: StyledMeasureColumn | StyledColumn | undefined,
  value: number | string | undefined,
  displayValue: string,
) => {
  const isNumeric = isValueNumeric(dataOption);

  return isNumeric
    ? formatNumericTooltipValue(dataOption, parseFloat(`${value}`), displayValue)
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
  formatter?: (this: HighchartsDataPointContext) => string | false;
  style?: {
    fontFamily?: string;
  };
  padding?: number;
  outside?: boolean;
};

export type HighchartsDataPointContextNode = {
  val: number;
  name: string;
  parentNode?: HighchartsDataPointContextNode;
  color?: string;
};

/**
 * Context of a hovered data point in a Highcharts chart for the tooltip formatter function.
 */
export type HighchartsDataPointContext = {
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
    options?: TooltipFormatterContextObject['point']['options'];
    node?: HighchartsDataPointContextNode;
  };
  percentage?: number;
  color?: string;
};
