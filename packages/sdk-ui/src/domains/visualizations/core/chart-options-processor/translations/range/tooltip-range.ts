import { TFunction } from '@sisense/sdk-common';

import { getDataOptionTitle } from '@/domains/visualizations/core/chart-data-options/utils';

import { colorChineseSilver, colorWhite } from '../../../chart-data-options/coloring/consts';
import { RangeChartDataOptionsInternal } from '../../../chart-data-options/types';
import { spanSegment, tooltipSeparator, tooltipWrapper } from '../scatter-tooltip.js';
import {
  formatTooltipValue,
  HighchartsDataPointContext,
  isTooltipPercentValueSupported,
  TooltipSettings,
} from '../tooltip-utils.js';
import { cartesianDataFormatter } from '../tooltip.js';

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
    formatter: function (this: HighchartsDataPointContext) {
      if (!this.point.low || !this.point.high) {
        return cartesianDataFormatter(this, chartDataOptions, translate);
      }

      // Applicable only to pie and funnel charts
      let percentage: string | undefined;
      if (this.percentage) {
        percentage = showDecimals ? this.percentage.toFixed(1) : `${Math.round(this.percentage)}`;
      }

      const rangeChartDataOptions: RangeChartDataOptionsInternal = chartDataOptions;

      const dataOptions = rangeChartDataOptions.rangeValues?.find(
        rangeChartDataOptions.breakBy.length > 0
          ? (y) => y[0].enabled
          : (y) => getDataOptionTitle(y[0]) === this.series.name,
      );

      // If dataOptions is defined, destructure it, otherwise set to a default value
      const [dataOptionY, dataOptionY2] = dataOptions ?? [undefined, undefined];

      const isPercentValueSupported = isTooltipPercentValueSupported(dataOptionY);

      const upperYValue = formatTooltipValue(dataOptionY, this.point.high, '');
      const bottomYValue = formatTooltipValue(dataOptionY2, this.point.low, '');

      const maskedX = this.point?.custom?.xDisplayValue ?? this.x;
      const x1Value = rangeChartDataOptions.x
        ? formatTooltipValue(rangeChartDataOptions.x[0], this.x, maskedX)
        : maskedX;

      const topValue =
        upperYValue + (isPercentValueSupported && percentage ? ` / ${percentage}%` : '');
      const bottomValue =
        bottomYValue + (isPercentValueSupported && percentage ? ` / ${percentage}%` : '');

      const color = this.point.color || this.series.color;
      const { upperPointName, lowerPointName } = this.point;
      return tooltipWrapper(`
      <div>${this.series.name}</div>
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
