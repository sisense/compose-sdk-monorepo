import { TFunction } from '@sisense/sdk-common';
import { DimensionalCalculatedMeasure } from '@sisense/sdk-data';

import { colorChineseSilver, colorWhite } from '../../chart-data-options/coloring/consts';
import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../../chart-data-options/types';
import { renderForecastTooltipString } from '../advanced-analytics/tooltips/forecast-tooltip.js';
import { renderTrendTooltipString } from '../advanced-analytics/tooltips/trend-tooltip.js';
import { isForecastSeries, isTrendSeries } from '../advanced-chart-options.js';
import { spanSegment, tooltipSeparator, tooltipWrapper } from './scatter-tooltip.js';
import {
  formatTooltipValue,
  HighchartsDataPointContext,
  isTooltipPercentValueSupported,
  TooltipSettings,
} from './tooltip-utils.js';

export const cartesianDataFormatter = function (
  highchartsDataPoint: HighchartsDataPointContext,
  chartDataOptions: ChartDataOptionsInternal,
  translate?: TFunction,
) {
  const percentage = highchartsDataPoint.percentage
    ? `${Math.round(highchartsDataPoint.percentage)}`
    : undefined;

  const cartesianChartDataOptions: CartesianChartDataOptionsInternal =
    chartDataOptions as CartesianChartDataOptionsInternal;

  const dataOptionY =
    cartesianChartDataOptions.breakBy.length > 0
      ? cartesianChartDataOptions.y?.find((y) => y.enabled)
      : cartesianChartDataOptions.y?.find(
          (y) => y.column.title === highchartsDataPoint.series.name,
        );

  const isPercentValueSupported = isTooltipPercentValueSupported(dataOptionY);
  const yValue = formatTooltipValue(dataOptionY, highchartsDataPoint.point.y, '');

  const maskedX = highchartsDataPoint.point?.custom?.xDisplayValue ?? highchartsDataPoint.x;
  const x1Value = cartesianChartDataOptions.x
    ? formatTooltipValue(cartesianChartDataOptions.x[0], highchartsDataPoint.x, maskedX)
    : maskedX;

  let x2Value = undefined;
  if (
    highchartsDataPoint.point.custom?.xValue &&
    cartesianChartDataOptions?.x &&
    cartesianChartDataOptions.x.length === 2
  ) {
    const maskedX1 = `${highchartsDataPoint.point.custom.xValue[0]}`; // X2 is in position xValue[0]
    x2Value = formatTooltipValue(cartesianChartDataOptions.x[1], maskedX1, maskedX1);
  }

  const value = yValue + (isPercentValueSupported && percentage ? ` / ${percentage}%` : '');
  const color = highchartsDataPoint.point.color || highchartsDataPoint.series.color;
  const isForecast = isForecastSeries(
    highchartsDataPoint.point.name || highchartsDataPoint.series.name,
  );
  const isTrend = isTrendSeries(highchartsDataPoint.point.name || highchartsDataPoint.series.name);
  const yName =
    translate && isForecast
      ? `${highchartsDataPoint.series.name.substring(10)}`
      : translate && isTrend
      ? `${highchartsDataPoint.series.name.substring(7)}`
      : highchartsDataPoint.series.name;
  const low = highchartsDataPoint.point?.low
    ? formatTooltipValue(dataOptionY, highchartsDataPoint.point?.low, '')
    : '';
  const high = highchartsDataPoint.point?.high
    ? formatTooltipValue(dataOptionY, highchartsDataPoint.point?.high, '')
    : '';

  const displayValue = (value: string | undefined, labelPrefix: string, color: string) => {
    if (!value || value === '') return '';
    if (!translate || (!isForecast && !isTrend) || !labelPrefix)
      return `<br /${spanSegment(value, color)}`;
    return `<br /><span>${translate(labelPrefix)} </span>${spanSegment(value, color)}`;
  };

  const extra = translate ? `(+${translate('advanced.tooltip.trend')})` : '';
  const labelPrefix = isForecast ? 'advanced.tooltip.forecastValue' : '';

  if (isTrend) {
    const modelTypeFromExpressionRegex = /modelType=([^"]+)/;
    const match = (dataOptionY?.column as DimensionalCalculatedMeasure)?.expression.match(
      modelTypeFromExpressionRegex,
    );
    const modelTypeValue = match ? match[1] : null;

    const { min, max, median, average } = highchartsDataPoint.point.trend!;
    const formattedMin = formatTooltipValue(dataOptionY, min, '');
    const formattedMax = formatTooltipValue(dataOptionY, max, '');
    const formattedMedian = formatTooltipValue(dataOptionY, median, '');
    const formattedAverage = formatTooltipValue(dataOptionY, average, '');
    const modelType = modelTypeValue!;

    return renderTrendTooltipString({
      title: yName,
      modelType,
      trendData: {
        min: formattedMin,
        max: formattedMax,
        median: formattedMedian,
        average: formattedAverage,
      },
      localValue: value,
      x1Value,
      x2Value,
      translate,
    });
  }

  if (isForecast) {
    const confidenceIntervalFromExpressionRegex = /confidenceInterval=([^"]+)/;
    const match = (dataOptionY?.column as DimensionalCalculatedMeasure)?.expression.match(
      confidenceIntervalFromExpressionRegex,
    );
    const confidenceValue = match ? match[1] : '0.8';
    const confidencePercentage = (parseFloat(confidenceValue) * 100).toFixed(0) + '%';

    return renderForecastTooltipString({
      title: yName,
      confidenceValue: confidencePercentage,
      forecastValue: value,
      x1Value,
      x2Value,
      translate,
      upperValue: high,
      lowerValue: low,
    });
  }
  return tooltipWrapper(`
    ${yName.replace(extra, '')}
    ${displayValue(value, labelPrefix, color)}
    ${displayValue(high, 'advanced.tooltip.max', color)}
    ${displayValue(low, 'advanced.tooltip.min', color)}
    ${x2Value || x1Value ? tooltipSeparator() : ''}
    ${x2Value ? x2Value : ''}
    ${
      x2Value && x1Value
        ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="18" viewBox="0 0 24 24" style="display: inline-block">
        <path
         fill="#5B6372"
         fillRule="nonzero"
          d="M6.84 8.5l-2.72-3.175a.5.5 0 1 1 .76-.65l2.998 3.5a.5.5 0 0 1 0 .65l-2.998 3.5a.5.5 0 1 1-.76-.65l2.72-3.175z"
        />
        </svg>
        `
        : ''
    }
    ${x1Value ? x1Value : ''}
 `);
};

export const getCartesianTooltipSettings = (
  chartDataOptions: ChartDataOptionsInternal,
  translate?: TFunction,
): TooltipSettings => {
  return {
    animation: false,
    backgroundColor: colorWhite,
    borderColor: colorChineseSilver,
    borderRadius: 10,
    borderWidth: 1,
    useHTML: true,
    formatter: function (this: HighchartsDataPointContext) {
      return cartesianDataFormatter(this, chartDataOptions, translate);
    },
  };
};
