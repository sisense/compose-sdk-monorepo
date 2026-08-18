import { TFunction } from '@sisense/sdk-common';
import { DimensionalCalculatedMeasure } from '@sisense/sdk-data';

import { colorChineseSilver, colorWhite } from '../../chart-data-options/coloring/consts';
import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
  StyledMeasureColumn,
} from '../../chart-data-options/types';
import { getDataOptionTitle } from '../../chart-data-options/utils.js';
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

const TREND_MODEL_TYPE_REGEX = /modelType=([^"]+)/;
const FORECAST_CONFIDENCE_REGEX = /confidenceInterval=([^"]+)/;

/** Separator between dual X-axis values when both are present (comma + space). */
const DUAL_X_AXIS_VALUES_SEPARATOR = ', ';

function getRoundedPercentageString(percentage: number | undefined): string | undefined {
  return percentage !== undefined ? `${Math.round(percentage)}` : undefined;
}

/**
 * Matches the hovered series back to its Y data option.
 *
 * Compares against {@link getDataOptionTitle}, the same resolution the series name itself is built
 * from, so a styled column's optional `name` override still resolves. Matching `column.title`
 * instead would miss such a series, leaving the value unformatted and dropped from the tooltip.
 */
function resolveCartesianYDataOption(
  cartesian: CartesianChartDataOptionsInternal,
  seriesName: string,
): StyledMeasureColumn | undefined {
  return cartesian.breakBy.length > 0
    ? cartesian.y?.find((y) => y.enabled)
    : cartesian.y?.find((y) => getDataOptionTitle(y) === seriesName);
}

function buildCartesianAxisDisplayValues(
  ctx: HighchartsDataPointContext,
  cartesian: CartesianChartDataOptionsInternal,
): { x1Value: string; x2Value: string | undefined } {
  const custom = ctx.point?.custom;
  const xDisplay = custom?.xDisplayValue;
  const xValueArr = custom?.xValue;

  /** Dual x-axis: x[0] = top/plot band, x[1] = bottom category (see plot-bands.ts). */
  if (cartesian.x?.length === 2 && xValueArr) {
    const maskedTop =
      Array.isArray(xDisplay) && xDisplay[0] != null
        ? String(xDisplay[0])
        : String(xValueArr[0] ?? '');
    const maskedBottom =
      Array.isArray(xDisplay) && xDisplay[1] != null ? String(xDisplay[1]) : ctx.x;

    return {
      x1Value: String(formatTooltipValue(cartesian.x[1], ctx.x, maskedBottom)),
      x2Value: String(formatTooltipValue(cartesian.x[0], xValueArr[0], maskedTop)),
    };
  }

  const maskedX = Array.isArray(xDisplay) ? xDisplay[0] ?? ctx.x : xDisplay ?? ctx.x;
  const x1Raw = cartesian.x
    ? formatTooltipValue(
        cartesian.x[0],
        ctx.x,
        typeof maskedX === 'string' ? maskedX : String(maskedX),
      )
    : maskedX;

  return { x1Value: String(x1Raw), x2Value: undefined };
}

function buildFormattedYValueWithPercentSuffix(
  dataOptionY: StyledMeasureColumn | undefined,
  y: number | undefined,
  percentageLabel: string | undefined,
): string {
  const isPercentValueSupported = isTooltipPercentValueSupported(dataOptionY);
  const yValue = formatTooltipValue(dataOptionY, y, '');
  return yValue + (isPercentValueSupported && percentageLabel ? ` / ${percentageLabel}%` : '');
}

function resolveCartesianSeriesLabel(
  ctx: HighchartsDataPointContext,
  translate: TFunction | undefined,
): string {
  const seriesName = ctx.point.name || ctx.series.name;
  if (translate && isForecastSeries(seriesName)) {
    return ctx.series.name.substring(10);
  }
  if (translate && isTrendSeries(seriesName)) {
    return ctx.series.name.substring(7);
  }
  return ctx.series.name;
}

function formatTooltipRangeLowHigh(
  dataOptionY: StyledMeasureColumn | undefined,
  point: HighchartsDataPointContext['point'],
): { low: string; high: string } {
  return {
    low: point?.low ? formatTooltipValue(dataOptionY, point.low, '') : '',
    high: point?.high ? formatTooltipValue(dataOptionY, point.high, '') : '',
  };
}

function parseTrendModelTypeFromExpression(expression: string | undefined): string | null {
  return expression?.match(TREND_MODEL_TYPE_REGEX)?.[1] ?? null;
}

function parseForecastConfidencePercentLabel(expression: string | undefined): string {
  const match = expression?.match(FORECAST_CONFIDENCE_REGEX);
  const confidenceValue = match ? match[1] : '0.8';
  return `${(parseFloat(confidenceValue) * 100).toFixed(0)}%`;
}

/**
 * One line of tooltip body: optional translated label prefix and a colored value span.
 */
function buildCartesianTooltipValueRowHtml(
  value: string | undefined,
  labelPrefix: string,
  color: string,
  translate: TFunction | undefined,
  isForecastSeriesPoint: boolean,
  isTrendSeriesPoint: boolean,
): string {
  if (!value || value === '') return '';
  if (!translate || (!isForecastSeriesPoint && !isTrendSeriesPoint) || !labelPrefix) {
    return `<br />${spanSegment(value, color)}`;
  }
  return `<br /><span>${translate(labelPrefix)} </span>${spanSegment(value, color)}`;
}

function buildTrendCartesianTooltip(
  ctx: HighchartsDataPointContext,
  dataOptionY: StyledMeasureColumn | undefined,
  params: {
    yName: string;
    value: string;
    x1Value: string;
    x2Value: string | undefined;
    translate: TFunction | undefined;
  },
): string {
  const expression = (dataOptionY?.column as DimensionalCalculatedMeasure | undefined)?.expression;
  const modelType = parseTrendModelTypeFromExpression(expression) ?? '';
  const trendStats = ctx.point.trend;
  if (!trendStats) {
    return '';
  }
  const { min, max, median, average } = trendStats;

  return renderTrendTooltipString({
    title: params.yName,
    modelType,
    trendData: {
      min: formatTooltipValue(dataOptionY, min, ''),
      max: formatTooltipValue(dataOptionY, max, ''),
      median: formatTooltipValue(dataOptionY, median, ''),
      average: formatTooltipValue(dataOptionY, average, ''),
    },
    localValue: params.value,
    x1Value: params.x1Value,
    x2Value: params.x2Value,
    translate: params.translate,
  });
}

function buildForecastCartesianTooltip(
  dataOptionY: StyledMeasureColumn | undefined,
  params: {
    yName: string;
    value: string;
    x1Value: string;
    x2Value: string | undefined;
    translate: TFunction | undefined;
    upperValue: string;
    lowerValue: string;
  },
): string {
  const expression = (dataOptionY?.column as DimensionalCalculatedMeasure | undefined)?.expression;
  const confidencePercentage = parseForecastConfidencePercentLabel(expression);

  return renderForecastTooltipString({
    title: params.yName,
    confidenceValue: confidencePercentage,
    forecastValue: params.value,
    x1Value: params.x1Value,
    x2Value: params.x2Value,
    translate: params.translate,
    upperValue: params.upperValue,
    lowerValue: params.lowerValue,
  });
}

function buildStandardCartesianTooltipHtml(params: {
  yName: string;
  trendMarkerSuffix: string;
  labelPrefix: string;
  value: string;
  high: string;
  low: string;
  x1Value: string;
  x2Value: string | undefined;
  color: string;
  translate: TFunction | undefined;
  isForecastSeriesPoint: boolean;
  isTrendSeriesPoint: boolean;
}): string {
  const {
    yName,
    trendMarkerSuffix,
    labelPrefix,
    value,
    high,
    low,
    x1Value,
    x2Value,
    color,
    translate,
    isForecastSeriesPoint,
    isTrendSeriesPoint,
  } = params;

  const valueRow = buildCartesianTooltipValueRowHtml(
    value,
    labelPrefix,
    color,
    translate,
    isForecastSeriesPoint,
    isTrendSeriesPoint,
  );
  const highRow = buildCartesianTooltipValueRowHtml(
    high,
    'advanced.tooltip.max',
    color,
    translate,
    isForecastSeriesPoint,
    isTrendSeriesPoint,
  );
  const lowRow = buildCartesianTooltipValueRowHtml(
    low,
    'advanced.tooltip.min',
    color,
    translate,
    isForecastSeriesPoint,
    isTrendSeriesPoint,
  );

  const dualXAxisFooter =
    x2Value || x1Value
      ? `${tooltipSeparator()}${x2Value ?? ''}${
          x2Value && x1Value ? DUAL_X_AXIS_VALUES_SEPARATOR : ''
        }${x1Value ?? ''}`
      : '';

  return tooltipWrapper(`
    ${yName.replace(trendMarkerSuffix, '')}
    ${valueRow}
    ${highRow}
    ${lowRow}
    ${dualXAxisFooter}
 `);
}

export const cartesianDataFormatter = function (
  highchartsDataPoint: HighchartsDataPointContext,
  chartDataOptions: ChartDataOptionsInternal,
  translate?: TFunction,
) {
  const cartesianChartDataOptions = chartDataOptions as CartesianChartDataOptionsInternal;
  const percentageLabel = getRoundedPercentageString(highchartsDataPoint.percentage);

  const dataOptionY = resolveCartesianYDataOption(
    cartesianChartDataOptions,
    highchartsDataPoint.series.name,
  );

  const { x1Value, x2Value } = buildCartesianAxisDisplayValues(
    highchartsDataPoint,
    cartesianChartDataOptions,
  );

  const value = buildFormattedYValueWithPercentSuffix(
    dataOptionY,
    highchartsDataPoint.point.y,
    percentageLabel,
  );

  const color = highchartsDataPoint.point.color || highchartsDataPoint.series.color;
  const seriesName = highchartsDataPoint.point.name || highchartsDataPoint.series.name;
  const isForecast = isForecastSeries(seriesName);
  const isTrend = isTrendSeries(seriesName);

  const yName = resolveCartesianSeriesLabel(highchartsDataPoint, translate);
  const { low, high } = formatTooltipRangeLowHigh(dataOptionY, highchartsDataPoint.point);

  const trendMarkerSuffix = translate ? `(+${translate('advanced.tooltip.trend')})` : '';
  const forecastValueLabelKey = isForecast ? 'advanced.tooltip.forecastValue' : '';

  if (isTrend) {
    return buildTrendCartesianTooltip(highchartsDataPoint, dataOptionY, {
      yName,
      value,
      x1Value,
      x2Value,
      translate,
    });
  }

  if (isForecast) {
    return buildForecastCartesianTooltip(dataOptionY, {
      yName,
      value,
      x1Value,
      x2Value,
      translate,
      upperValue: high,
      lowerValue: low,
    });
  }

  return buildStandardCartesianTooltipHtml({
    yName,
    trendMarkerSuffix,
    labelPrefix: forecastValueLabelKey,
    value,
    high,
    low,
    x1Value,
    x2Value,
    color,
    translate,
    isForecastSeriesPoint: isForecast,
    isTrendSeriesPoint: isTrend,
  });
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
