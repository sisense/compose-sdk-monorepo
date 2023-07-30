/* eslint-disable complexity */
/* eslint-disable sonarjs/no-nested-template-literals */
import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../chart-data-options/types';
import { colorChineseSilver, colorWhite } from './chart_options_service';
import { applyFormat, defaultConfig } from './translations/number_format_config';

export type TooltipSettings = {
  enabled?: boolean;
  animation?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  useHTML?: boolean;
  formatter?: () => string;
};

export type InternalSeries = {
  series: { name: string; color: string };
  x: string;
  y: number;
  point: {
    name: string;
    color: string;
    custom?: { number1?: number; string1?: string; xDisplayValue?: string };
  };
  percentage?: number;
};

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
      let numberFormatConfig = cartesianChartDataOptions.y?.find(
        (y) => y.name === that.series.name,
      )?.numberFormatConfig;
      if (!numberFormatConfig && cartesianChartDataOptions.breakBy.length > 0) {
        numberFormatConfig = cartesianChartDataOptions.y?.find(
          (y) => y.enabled,
        )?.numberFormatConfig;
      }
      if (!numberFormatConfig) {
        numberFormatConfig = defaultConfig;
      }
      const xValue = that.point?.custom?.xDisplayValue ?? that.x;
      return `<div
                   style="minWidth: 100px; color: #acacac; fontSize: 13px; lineHeight: 20px">
              ${that.point.name || that.series.name}
              <br />
              <span style="color: ${that.point.color || that.series.color}">
              ${applyFormat(numberFormatConfig, that.y)}
              ${percentage ? ` / ${percentage}%` : ''}
            </span>
            ${xValue ? `<hr style="margin: 5px 0px" />${xValue}` : ''}
            </div>`;
    },
  };
};
