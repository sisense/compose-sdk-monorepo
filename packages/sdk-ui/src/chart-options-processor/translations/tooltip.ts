import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../../chart-data-options/types';
import { colorChineseSilver, colorWhite } from '../../chart-data-options/coloring/consts';
import {
  InternalSeries,
  TooltipSettings,
  formatTooltipValue,
  formatTooltipXValue,
  isTooltipPercentValueSupported,
} from './tooltip-utils';
import { spanSegment, tooltipSeparator, tooltipWrapper } from './scatter-tooltip';
import { TFunction } from '@sisense/sdk-common';
import { isForecastSeries, isTrendSeries } from '../advanced-chart-options';

export const cartesianDataFormatter = function (
  that: InternalSeries,
  showDecimals: boolean | undefined,
  chartDataOptions: ChartDataOptionsInternal,
  translate?: TFunction,
) {
  // Applicable only to pie and funnel charts
  let percentage: string | undefined;
  if (that.percentage) {
    percentage = showDecimals ? that.percentage.toFixed(1) : `${Math.round(that.percentage)}`;
  }

  const cartesianChartDataOptions: CartesianChartDataOptionsInternal =
    chartDataOptions as CartesianChartDataOptionsInternal;

  const dataOptionY =
    cartesianChartDataOptions.breakBy.length > 0
      ? cartesianChartDataOptions.y?.find((y) => y.enabled)
      : cartesianChartDataOptions.y?.find((y) => y.title === that.series.name);

  const isPercentValueSupported = isTooltipPercentValueSupported(dataOptionY);
  const yValue = formatTooltipValue(dataOptionY, that.point.y, '');

  const maskedX = that.point?.custom?.xDisplayValue ?? that.x;
  const x1Value = cartesianChartDataOptions.x
    ? formatTooltipXValue(cartesianChartDataOptions.x[0], that.x, maskedX)
    : maskedX;

  let x2Value = undefined;
  if (
    that.point.custom?.xValue &&
    cartesianChartDataOptions?.x &&
    cartesianChartDataOptions.x.length === 2
  ) {
    const maskedX1 = `${that.point.custom.xValue[0]}`; // X2 is in position xValue[0]
    x2Value = formatTooltipXValue(cartesianChartDataOptions.x[1], maskedX1, maskedX1);
  }

  const value = yValue + (isPercentValueSupported && percentage ? ` / ${percentage}%` : '');
  const color = that.point.color || that.series.color;
  const isForecast = isForecastSeries(that.point.name || that.series.name);
  const isTrend = isTrendSeries(that.point.name || that.series.name);
  const yName =
    translate && isForecast
      ? `${translate('advanced.tooltip.forecast')} ${that.series.name.substring(10)}`
      : translate && isTrend
      ? `${translate('advanced.tooltip.trend')} ${that.series.name.substring(7)}`
      : that.series.name;
  const low = that.point?.low ? formatTooltipValue(dataOptionY, that.point?.low, '') : undefined;
  const high = that.point?.high ? formatTooltipValue(dataOptionY, that.point?.high, '') : undefined;

  const displayValue = (value: string | undefined, labelPrefix: string, color: string) => {
    if (!value) return '';
    if (!translate || !isForecast || !labelPrefix) return `<br /${spanSegment(value, color)}`;
    return `<br /><span>${translate(labelPrefix)} </span>${spanSegment(value, color)}`;
  };

  const extra = translate ? `(+${translate('advanced.tooltip.trend')})` : '';
  const labelPrefix = isForecast ? 'advanced.tooltip.forecastValue' : '';

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

export const getTooltipSettings = (
  showDecimals: boolean | undefined,
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
    formatter: function () {
      const that: InternalSeries = this as InternalSeries;
      return cartesianDataFormatter(that, showDecimals, chartDataOptions, translate);
    },
  };
};
