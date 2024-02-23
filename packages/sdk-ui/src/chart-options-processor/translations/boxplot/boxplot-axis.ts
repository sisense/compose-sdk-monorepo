import { isNumber } from 'lodash';
import { isNumber as isNumberType } from '@sisense/sdk-data';
import { BoxplotChartData } from '../../../chart-data/types';
import { Axis, AxisLabelsFormatterContextObject, AxisSettings } from '../axis-section';
import { fontStyleDefault } from '../../defaults/cartesian';
import { applyFormatPlainText, getCompleteNumberFormatConfig } from '../number-format-config';
import { isCategory, Value, type Category } from '../../../chart-data-options/types';

export const commonColor = '#d1d1d7';

export const calculateYAxisMinMax = (chartData: BoxplotChartData) => {
  return chartData.series[0].data.reduce(
    (axisMinMax, { low, high }) => {
      return {
        min: Math.min(axisMinMax.min, low),
        max: Math.max(axisMinMax.max, high),
      };
    },
    { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
  );
};

export const getBoxplotXAxisSettings = (
  axis: Axis,
  categories: string[],
  axisDataOption?: Category,
): AxisSettings[] => {
  return [
    {
      labels: {
        overflow: 'none',
        enabled: axis.enabled && axis.labels,
        autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
        style: fontStyleDefault,
        formatter(this: AxisLabelsFormatterContextObject) {
          const { value } = this;

          if (axisDataOption && isCategory(axisDataOption) && !isNumberType(axisDataOption.type)) {
            return `${value}`;
          }

          const numberValue = typeof value === 'number' ? value : parseFloat(value);

          if (isNaN(numberValue)) {
            return `${value}`;
          }

          return applyFormatPlainText(
            getCompleteNumberFormatConfig(axisDataOption?.numberFormatConfig),
            numberValue,
          );
        },
      },
      categories,
      title: {
        text: (axis.enabled && axis.titleEnabled && axis.title) || null,
        margin: 25,
      },
      tickmarkPlacement: 'on',
      gridLineWidth: axis.enabled && axis.gridLine ? 1 : 0,
      minorTickLength: 0,
      tickLength: 0,
      startOnTick: true,
      endOnTick: true,
      lineColor: commonColor,
      tickColor: commonColor,
      minorTickColor: commonColor,
      gridLineColor: commonColor,
      gridLineDashStyle: 'Dot',
      minorGridLineColor: commonColor,
      minorGridLineDashStyle: 'Dot',
      min: axis.enabled ? axis.min : null,
      max: axis.enabled ? axis.max : null,
    },
  ];
};

export const getBoxplotYAxisSettings = (
  axis: Axis,
  chartData: BoxplotChartData,
  axisDataOption?: Value,
): AxisSettings[] => {
  const axisAutoMinMax = calculateYAxisMinMax(chartData);
  return [
    {
      labels: {
        enabled: axis.enabled && axis.labels,
        autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
        style: fontStyleDefault,
        formatter(this: AxisLabelsFormatterContextObject) {
          return applyFormatPlainText(
            getCompleteNumberFormatConfig(axisDataOption?.numberFormatConfig),
            this.value as number,
          );
        },
      },
      tickmarkPlacement: 'on',
      title: {
        text: (axis.enabled && axis.titleEnabled && axis.title) || null,
        margin: 25,
        style: fontStyleDefault,
      },
      minorGridLineWidth: 0,
      lineColor: commonColor,
      lineWidth: 1,
      tickColor: commonColor,
      minorTickColor: commonColor,
      gridLineColor: commonColor,
      gridLineDashStyle: 'Dot',
      gridLineWidth: axis.enabled && axis.gridLine ? 1 : 0,
      minorGridLineColor: commonColor,
      minorGridLineDashStyle: 'Dot',
      min: axis.enabled && isNumber(axis.min) ? axis.min : axisAutoMinMax.min,
      max: axis.enabled && isNumber(axis.max) ? axis.max : axisAutoMinMax.max,
      tickInterval: axis.enabled ? axis.tickInterval : null,
    },
  ];
};
