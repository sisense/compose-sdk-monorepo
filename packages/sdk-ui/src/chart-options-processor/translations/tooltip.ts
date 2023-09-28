/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../../chart-data-options/types';
import { colorChineseSilver, colorWhite } from '../chart-options-service';
import {
  InternalSeries,
  TooltipSettings,
  formatTooltipValue,
  formatTooltipXValue,
} from './tooltip-utils';

export const getTooltipSettings = (
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
      const that: InternalSeries = this as InternalSeries;

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

      return `<div
                   style="minWidth: 100px; color: #acacac; fontSize: 13px; lineHeight: 20px">
              ${that.point.name || that.series.name}
              <br />
              <span style="color: ${that.point.color || that.series.color}">
              ${yValue}
              ${percentage ? ` / ${percentage}%` : ''}
            </span>
            ${x2Value ? `<hr style="margin: 5px 0px" />${x2Value}` : ''}
            ${x1Value ? `<hr style="margin: 5px 0px" />${x1Value}` : ''}
            </div>`;
    },
  };
};
