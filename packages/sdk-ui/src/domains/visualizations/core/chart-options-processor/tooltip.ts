/* eslint-disable sonarjs/no-nested-template-literals */
import { colorChineseSilver, colorWhite } from '../chart-data-options/coloring/consts';
import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../chart-data-options/types';
import { applyFormat, getCompleteNumberFormatConfig } from './translations/number-format-config.js';
import { spanSegment, tooltipSeparator, tooltipWrapper } from './translations/scatter-tooltip.js';
import {
  HighchartsDataPointContext,
  HighchartsDataPointContextNode,
  TooltipSettings,
} from './translations/tooltip-utils.js';

export type { TooltipSettings, HighchartsDataPointContext, HighchartsDataPointContextNode };

const formatTooltipContent = (
  highchartsDataPoint: HighchartsDataPointContext,
  showDecimals: boolean | undefined,
  chartDataOptions: ChartDataOptionsInternal,
): string => {
  // Calculate percentage for pie and funnel charts
  const formattedPercentage = highchartsDataPoint.percentage
    ? showDecimals
      ? highchartsDataPoint.percentage.toFixed(1)
      : `${Math.round(highchartsDataPoint.percentage)}`
    : undefined;

  const cartesianChartDataOptions = chartDataOptions as CartesianChartDataOptionsInternal;

  // Find number format configuration
  const getNumberFormatConfig = () => {
    const matchingY = cartesianChartDataOptions.y?.find(
      (y) => y.column.name === highchartsDataPoint.series.name,
    );

    if (matchingY?.numberFormatConfig) {
      return matchingY.numberFormatConfig;
    }

    if (cartesianChartDataOptions.breakBy.length > 0) {
      return cartesianChartDataOptions.y?.find((y) => y.enabled)?.numberFormatConfig;
    }

    return undefined;
  };

  const numberFormatConfig = getCompleteNumberFormatConfig(getNumberFormatConfig());
  const xValue = highchartsDataPoint.point?.custom?.xDisplayValue ?? highchartsDataPoint.x;
  const formattedValue =
    applyFormat(numberFormatConfig, highchartsDataPoint.y) +
    (formattedPercentage ? ` / ${formattedPercentage}%` : '');
  const color = highchartsDataPoint.point.color || highchartsDataPoint.series.color;

  const seriesName = highchartsDataPoint.series.name || '';
  const pointName = highchartsDataPoint.point.name || '';
  const separator = seriesName && pointName ? ' - ' : '';

  return tooltipWrapper(`
      ${seriesName}
      ${separator}
      ${pointName}
      <br />
      ${spanSegment(formattedValue, color)}
      ${xValue ? tooltipSeparator() + xValue : ''}
    `);
};

export const getCategoryTooltipSettings = (
  showDecimals: boolean | undefined,
  chartDataOptions: ChartDataOptionsInternal,
): TooltipSettings => {
  return {
    animation: false,
    backgroundColor: colorWhite,
    borderColor: colorChineseSilver,
    borderRadius: 10,
    borderWidth: 1,
    useHTML: true,
    formatter: function () {
      return formatTooltipContent(this, showDecimals, chartDataOptions);
    },
  };
};
