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

      return tooltipWrapper(`
                ${that.point.name || that.series.name}
              <br />
              ${spanSegment(value, color)}
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
    },
  };
};
