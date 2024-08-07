import { RangeChartDataOptionsInternal, Value } from '../../../chart-data-options/types';
import { colorChineseSilver, colorWhite } from '../../../chart-data-options/coloring/consts';
import {
  InternalSeries,
  TooltipSettings,
  formatTooltipValue,
  formatTooltipXValue,
  isTooltipPercentValueSupported,
} from '../tooltip-utils';
import { spanSegment, tooltipSeparator, tooltipWrapper } from '../scatter-tooltip';
import { TFunction } from '@sisense/sdk-common';
import { cartesianDataFormatter } from '../tooltip';

export const getRangeTooltipSettings = (
  showDecimals: boolean | undefined,
  chartDataOptions: RangeChartDataOptionsInternal,
  translate: TFunction,
): TooltipSettings => {
  return {
    animation: false,
    crosshairs: true,
    backgroundColor: colorWhite,
    borderColor: colorChineseSilver,
    borderRadius: 10,
    borderWidth: 1,
    useHTML: true,
    formatter: function () {
      const that: InternalSeries = this as InternalSeries;

      if (!that.point.low || !that.point.high) {
        return cartesianDataFormatter(that, showDecimals, chartDataOptions, translate);
      }

      // Applicable only to pie and funnel charts
      let percentage: string | undefined;
      if (that.percentage) {
        percentage = showDecimals ? that.percentage.toFixed(1) : `${Math.round(that.percentage)}`;
      }

      const rangeChartDataOptions: RangeChartDataOptionsInternal = chartDataOptions;

      const dataOptions = rangeChartDataOptions.rangeValues?.find(
        rangeChartDataOptions.breakBy.length > 0
          ? (y) => y[0].enabled
          : (y) => y[0].title === that.series.name,
      );

      // If dataOptions is defined, destructure it, otherwise set to a default value
      const [dataOptionY, dataOptionY2] = dataOptions ?? [undefined, undefined];

      const isPercentValueSupported = isTooltipPercentValueSupported(dataOptionY);

      const upperYValue = formatTooltipValue(dataOptionY as Value, that.point.high, '');
      const bottomYValue = formatTooltipValue(dataOptionY2 as Value, that.point.low, '');
      // const middle = formatTooltipValue(dataOptionY2 as Value, that.point.y, '');

      const maskedX = that.point?.custom?.xDisplayValue ?? that.x;
      const x1Value = rangeChartDataOptions.x
        ? formatTooltipXValue(rangeChartDataOptions.x[0], that.x, maskedX)
        : maskedX;

      const topValue =
        upperYValue + (isPercentValueSupported && percentage ? ` / ${percentage}%` : '');
      const bottomValue =
        bottomYValue + (isPercentValueSupported && percentage ? ` / ${percentage}%` : '');

      const color = that.point.color || that.series.color;
      const { upperPointName, lowerPointName } = that.point;
      return tooltipWrapper(`
      <div>${that.series.name}</div>
      <div class="csdk-range-tooltip-row">
        <span>${upperPointName || translate('arearange.tooltip.max')}</span>
        ${spanSegment(topValue, color)}
      </div>
      <div class="csdk-range-tooltip-row">
        <span>${lowerPointName || translate('arearange.tooltip.min')}</span>
        ${spanSegment(bottomValue, color)}
      </div>
      ${tooltipSeparator()}
      <div>${x1Value ? x1Value : ''}</div>
    `);
    },
  };
};
