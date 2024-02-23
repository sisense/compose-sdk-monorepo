/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable complexity */
import { ScatterCategories } from '../../chart-data/types';
import {
  ScatterChartDataOptionsInternal,
  isCategory,
  Category,
  Value,
} from './../../chart-data-options/types';
import { Axis, AxisSettings } from './axis-section';
import { fontStyleDefault } from '../defaults/cartesian';
import { isNumber } from '@sisense/sdk-data';
import { applyFormatPlainText, getCompleteNumberFormatConfig } from './number-format-config';

export const commonColor = '#d1d1d7';

export function scatterFormatter(
  axisAttribute: Category | Value | undefined,
  value: string | number,
  categories: (string | number)[] | undefined,
): string {
  if (categories && categories.length && !categories.includes(value)) {
    // don't show labels for extra ticks added to keep bubbles unclipped
    // those labels will be just index of the tick
    return '';
  }

  const numberValue = typeof value === 'number' ? value : parseFloat(value);

  if (isNaN(numberValue)) {
    return `${value}`;
  }

  if (axisAttribute && isCategory(axisAttribute) && !isNumber(axisAttribute.type)) {
    return `${value}`;
  }

  return applyFormatPlainText(
    getCompleteNumberFormatConfig(axisAttribute?.numberFormatConfig),
    numberValue,
  );
}

export const getScatterXAxisSettings = (
  xAxis: Axis,
  categories: ScatterCategories,
  scatterDataOptions: ScatterChartDataOptionsInternal,
): AxisSettings[] => {
  const options: AxisSettings = {
    type: xAxis.type,
    startOnTick: false,
    endOnTick: !(xAxis.max || categories),
    labels: {
      overflow: 'justify',
      enabled: xAxis.enabled && xAxis.labels,
      autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
      style: fontStyleDefault,
      formatter: function () {
        return scatterFormatter(scatterDataOptions?.x, this.value, this.axis.categories);
      },
    },
    categories: categories || undefined,
    gridLineWidth: xAxis.enabled && xAxis.gridLine ? 1 : 0,
    gridLineColor: commonColor,
    gridLineDashStyle: 'Dot',
    title: {
      enabled: xAxis.enabled && xAxis.titleEnabled,
      margin: 25,
      text: xAxis.title || null,
    },
    lineColor: commonColor,
    lineWidth: 1,
    minorTickColor: commonColor,
    minorGridLineColor: commonColor,
    minorGridLineDashStyle: 'Dot',
    minorTickLength: 0,
    tickLength: 0,
    tickColor: commonColor,
    tickmarkPlacement: 'on',
    tickInterval: xAxis.enabled ? xAxis.tickInterval : null,
    min: xAxis.enabled ? xAxis.min : null,
    max: xAxis.enabled ? xAxis.max : null,
  };

  return [options];
};

export const getScatterYAxisSettings = (
  yAxis: Axis,
  categories: ScatterCategories,
  scatterDataOptions: ScatterChartDataOptionsInternal,
): AxisSettings[] => {
  const options: AxisSettings = {
    type: yAxis.type,
    startOnTick: false,
    endOnTick: !(yAxis.max || categories),
    title: {
      enabled: yAxis.enabled && yAxis.titleEnabled,
      text: yAxis.title || null,
    },
    labels: {
      enabled: yAxis.labels,
      autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
      style: fontStyleDefault,
      formatter: function () {
        return scatterFormatter(scatterDataOptions?.y, this.value, this.axis.categories);
      },
    },
    categories: categories || undefined,
    gridLineColor: commonColor,
    gridLineDashStyle: 'Dot',
    gridLineWidth: 1,
    lineColor: commonColor,
    lineWidth: 1,
    maxPadding: 0.025,
    minPadding: 0.025,
    minorGridLineColor: commonColor,
    minorGridLineDashStyle: 'Dot',
    minorGridLineWidth: 0,
    minorTickColor: commonColor,
    minorTickWidth: 0,
    opposite: false,
    tickColor: commonColor,
    tickWidth: 0,
    tickmarkPlacement: 'on',
    tickInterval: yAxis.enabled ? yAxis.tickInterval : null,
    min: yAxis.enabled ? yAxis.min : null,
    max: yAxis.enabled ? yAxis.max : null,
  };

  return [options];
};
