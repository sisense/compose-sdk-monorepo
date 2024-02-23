/* eslint-disable complexity */
/* eslint-disable sonarjs/no-nested-template-literals */
import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../chart-data-options/types';
import { applyFormat, getCompleteNumberFormatConfig } from './translations/number-format-config';
import { TooltipOptions } from '@sisense/sisense-charts';
import { spanSegment, tooltipSeparator, tooltipWrapper } from './translations/scatter-tooltip';
import { colorChineseSilver, colorWhite } from '../chart-data-options/coloring/consts';

export type TooltipSettings = TooltipOptions;

export type InternalSeriesNode = {
  val: number;
  name: string;
  parentNode?: InternalSeriesNode;
  color?: string;
};

export type InternalSeries = {
  series: { name: string; color: string };
  x: string;
  y: number;
  point: {
    name: string;
    color: string;
    custom?: { number1?: number; string1?: string; xDisplayValue?: string };
    node?: InternalSeriesNode;
  };
  percentage?: number;
  color?: string;
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
      let partialNumberFormatConfig = cartesianChartDataOptions.y?.find(
        (y) => y.name === that.series.name,
      )?.numberFormatConfig;
      if (!partialNumberFormatConfig && cartesianChartDataOptions.breakBy.length > 0) {
        partialNumberFormatConfig = cartesianChartDataOptions.y?.find(
          (y) => y.enabled,
        )?.numberFormatConfig;
      }
      const numberFormatConfig = getCompleteNumberFormatConfig(partialNumberFormatConfig);
      const xValue = that.point?.custom?.xDisplayValue ?? that.x;
      const value =
        applyFormat(numberFormatConfig, that.y) + (percentage ? ` / ${percentage}%` : '');
      const color = that.point.color || that.series.color;

      return tooltipWrapper(`
          ${that.series.name || ''}
          ${that.series.name && that.point.name ? ' - ' : ''}
          ${that.point.name || ''}
          <br />
          ${spanSegment(value, color)}
          ${xValue ? tooltipSeparator() + xValue : ''}
        `);
    },
  };
};
