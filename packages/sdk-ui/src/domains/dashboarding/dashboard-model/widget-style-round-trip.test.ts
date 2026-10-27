/**
 * Fixture-invariance tests for the Fusion `style` a widget gets back when the SDK rebuilds it
 * (e.g. on duplicate): DTO → widget model → DTO, with the dashboard-level partial DTO snapshot
 * re-attached the same way the add/duplicate write path does it.
 *
 * Each fixture is a style in the shape the SDK writes, carrying non-default values for the
 * fields the SDK does not model (axis `inactive` / `ticks` / `labels.rotation`, indicator
 * `components.*.inactive` and `secondaryTitle`, pie `navigator`). The round trip must give back
 * exactly the same style, and a value the SDK does model must still follow the current props.
 */
import cloneDeep from 'lodash-es/cloneDeep';
import { describe, expect, it } from 'vitest';

import type { BoxplotChartDataOptions } from '@/domains/visualizations/core/chart-data-options/types';
import type { WidgetDto, WidgetStyle } from '@/domains/widgets/components/widget-by-id/types';
import {
  fromWidgetDto,
  toWidgetDto,
} from '@/domains/widgets/widget-model/widget-model-translator/widget-model-translator.js';
import type { WidgetModel } from '@/domains/widgets/widget-model/widget-model.js';
import type {
  IndicatorStyleOptions,
  LineStyleOptions,
  PieStyleOptions,
  PolarStyleOptions,
  ScatterStyleOptions,
} from '@/types';

import { sampleEcommerceDashboard } from './__mocks__/sample-ecommerce-dashboard.js';
import {
  translateWidgetsOptions,
  withDashboardWidgetContext,
} from './translate-dashboard-utils.js';

const mockWidget = (index: number): WidgetDto => {
  const widget = sampleEcommerceDashboard.widgets?.[index];
  if (!widget) throw new Error(`No mock widget at index ${index}`);
  return cloneDeep(widget);
};

const withStyle = (widget: WidgetDto, style: unknown): WidgetDto => ({
  ...widget,
  style: style as WidgetStyle,
});

/**
 * Rebuilds a widget's DTO style the way the add/duplicate write path does: the model is
 * translated back to a DTO and the dashboard-level widget context (including the partial DTO
 * snapshot taken when the dashboard was loaded) is re-projected onto it.
 *
 * @param original - The widget DTO as loaded from Fusion
 * @param editModel - Optional edit applied to the widget model, standing in for changed props
 * @returns The rebuilt DTO style
 */
const rebuildStyle = (
  original: WidgetDto,
  editModel: (model: WidgetModel) => WidgetModel = (model) => model,
): WidgetStyle => {
  const options = translateWidgetsOptions([original])[original.oid];
  const model = editModel(fromWidgetDto(original));
  return withDashboardWidgetContext({ options })(toWidgetDto(model)).style;
};

const editStyleOptions =
  <T extends object>(edit: (styleOptions: T) => T) =>
  (model: WidgetModel): WidgetModel => ({
    ...model,
    styleOptions: edit(model.styleOptions as T),
  });

const lineStyle = {
  legend: { enabled: true, position: 'bottom' },
  navigator: { enabled: true },
  xAxis: {
    inactive: false,
    enabled: true,
    ticks: false,
    labels: { enabled: true, rotation: -45, stepInterval: 2 },
    title: { enabled: false, text: 'MONTH' },
    gridLines: false,
    isIntervalEnabled: false,
  },
  yAxis: {
    inactive: false,
    enabled: true,
    ticks: false,
    labels: { enabled: true, rotation: 0 },
    title: { enabled: true, text: 'SALES' },
    gridLines: true,
    isIntervalEnabled: false,
    logarithmic: true,
  },
  y2Axis: {
    inactive: true,
    enabled: true,
    ticks: false,
    labels: { enabled: true, rotation: 45, step: 3 },
    title: { enabled: true, text: 'QUANTITY' },
    gridLines: false,
    isIntervalEnabled: false,
    logarithmic: false,
  },
  lineWidth: { width: 'bold' },
  markers: { enabled: true, size: 'small', fill: 'hollow' },
  dataLimits: { seriesCapacity: 50, categoriesCapacity: 100000 },
  seriesLabels: { enabled: false, rotation: 0 },
};

const polarStyle = {
  legend: { enabled: true, position: 'bottom' },
  navigator: { enabled: false },
  categories: {
    inactive: true,
    enabled: true,
    ticks: false,
    labels: { enabled: true, rotation: 90 },
    title: { enabled: false, text: 'Country' },
    gridLines: true,
    isIntervalEnabled: false,
  },
  axis: {
    inactive: false,
    enabled: true,
    ticks: false,
    labels: { enabled: true, rotation: 0, stepInterval: 4 },
    title: { enabled: false },
    gridLines: true,
    isIntervalEnabled: true,
    logarithmic: false,
  },
  seriesLabels: { enabled: false, rotation: 0 },
  dataLimits: { seriesCapacity: 50, categoriesCapacity: 200 },
};

const scatterStyle = {
  legend: { enabled: true, position: 'right' },
  navigator: { enabled: false },
  xAxis: {
    inactive: true,
    enabled: true,
    ticks: false,
    labels: { enabled: true, rotation: 30 },
    title: { enabled: false, text: 'SALES' },
    gridLines: false,
    isIntervalEnabled: false,
    logarithmic: true,
  },
  yAxis: {
    inactive: true,
    enabled: true,
    ticks: true,
    labels: { enabled: true, rotation: 0, step: 2 },
    title: { enabled: true, text: 'QUANTITY' },
    gridLines: true,
    isIntervalEnabled: false,
    logarithmic: true,
  },
  seriesLabels: { enabled: false, rotation: 0 },
  dataLimits: { seriesCapacity: 50, categoriesCapacityX: 500, categoriesCapacityY: 500 },
  markerSize: {
    defaultSize: 10,
    min: 12,
    max: 48,
    isRange: true,
    lowest: 10,
    highest: 60,
    step: 1,
  },
};

const boxplotStyle = {
  legend: { enabled: true, position: 'bottom' },
  navigator: { enabled: false },
  xAxis: {
    inactive: true,
    enabled: true,
    ticks: false,
    labels: { enabled: true, rotation: 45 },
    title: { enabled: false, text: 'Age Range' },
    gridLines: true,
    isIntervalEnabled: false,
  },
  yAxis: {
    inactive: false,
    enabled: true,
    ticks: false,
    labels: { enabled: true, rotation: -90 },
    title: { enabled: false, text: 'Cost' },
    gridLines: true,
    isIntervalEnabled: false,
  },
  seriesLabels: { enabled: false, rotation: 0 },
  whisker: { 'whisker/iqr': false, 'whisker/extremums': true, 'whisker/deviation': false },
  outliers: { enabled: true },
};

const indicatorStyle = {
  subtype: 'round',
  skin: '1',
  components: {
    ticks: { inactive: true, enabled: true },
    labels: { inactive: true, enabled: false },
    title: { inactive: true, enabled: false },
    secondaryTitle: { inactive: false, enabled: false },
  },
  'indicator/numeric': {
    subtype: 'simple',
    skin: '2',
    components: {
      title: { inactive: false, enabled: true },
      icon: { inactive: true, enabled: false },
      secondaryTitle: { inactive: false, enabled: true },
    },
  },
  'indicator/gauge': {
    subtype: 'round',
    skin: '1',
    components: {
      ticks: { inactive: true, enabled: true },
      labels: { inactive: true, enabled: false },
      title: { inactive: true, enabled: false },
      secondaryTitle: { inactive: false, enabled: false },
    },
  },
};

const pieStyle = {
  legend: { enabled: false, position: 'bottom' },
  navigator: { enabled: true },
  labels: {
    enabled: true,
    categories: true,
    percent: true,
    value: false,
    decimals: false,
    rotation: 0,
    customRotation: null,
    prefix: '',
    suffix: '',
    labelColor: null,
    fontSize: null,
    fontStyle: 'normal',
    fontFamily: 'Arial',
    backgroundColor: null,
    backgroundPadding: 2,
    borderColor: null,
    borderWidth: 1,
    borderRadius: 0,
    xOffset: 0,
    yOffset: 0,
  },
  dataLimits: { seriesCapacity: 100000 },
  convolution: {
    enabled: true,
    independentSlicesCount: 7,
    minimalIndependentSlicePercentage: 3,
    selectedConvolutionType: 'bySlicesCount',
  },
};

const boxplotWidget: WidgetDto = {
  oid: 'boxplot-oid',
  title: 'boxplot',
  desc: null,
  type: 'chart/boxplot',
  subtype: 'boxplot/full',
  datasource: {
    title: 'Sample ECommerce',
    id: 'localhost_aSampleIAAaECommerce',
    address: 'LocalHost',
    database: 'aSampleIAAaECommerce',
  },
  metadata: {
    panels: [
      {
        name: 'category',
        items: [
          {
            jaql: {
              table: 'Commerce',
              column: 'Age Range',
              dim: '[Commerce.Age Range]',
              datatype: 'text',
              merged: true,
              title: 'Age Range',
            },
          },
        ],
      },
      {
        name: 'value',
        items: [
          {
            jaql: {
              table: 'Commerce',
              column: 'Cost',
              dim: '[Commerce.Cost]',
              datatype: 'numeric',
              title: 'Cost',
            },
          },
        ],
      },
      { name: 'filters', items: [] },
    ],
  },
  style: boxplotStyle as unknown as WidgetStyle,
} as WidgetDto;

const fixtures: ReadonlyArray<readonly [family: string, widget: WidgetDto]> = [
  ['cartesian (line)', withStyle(mockWidget(7), lineStyle)],
  ['polar', withStyle(mockWidget(10), polarStyle)],
  ['scatter', withStyle(mockWidget(6), scatterStyle)],
  ['boxplot', boxplotWidget],
  ['indicator (gauge)', withStyle(mockWidget(0), indicatorStyle)],
  ['pie', withStyle(mockWidget(2), pieStyle)],
];

describe('widget style round trip (DTO → model → DTO)', () => {
  it.each(fixtures)('keeps the original Fusion style values for %s', (_family, original) => {
    expect(rebuildStyle(original)).toEqual(original.style);
  });

  it('keeps a hidden y2 axis hidden', () => {
    const original = withStyle(mockWidget(7), lineStyle);
    expect(rebuildStyle(original)).toHaveProperty('y2Axis.inactive', true);
  });

  describe('a value the SDK models follows the current props, not the snapshot', () => {
    it('cartesian axes', () => {
      const original = withStyle(mockWidget(7), lineStyle);
      const rebuilt = rebuildStyle(
        original,
        editStyleOptions<LineStyleOptions>((styleOptions) => ({
          ...styleOptions,
          y2Axis: { ...styleOptions.y2Axis, enabled: false, gridLines: true },
          xAxis: { ...styleOptions.xAxis, labels: { enabled: false } },
        })),
      );
      expect(rebuilt).toEqual({
        ...lineStyle,
        xAxis: { ...lineStyle.xAxis, labels: { ...lineStyle.xAxis.labels, enabled: false } },
        y2Axis: { ...lineStyle.y2Axis, enabled: false, gridLines: true },
      });
    });

    it('polar axes', () => {
      const original = withStyle(mockWidget(10), polarStyle);
      const rebuilt = rebuildStyle(
        original,
        editStyleOptions<PolarStyleOptions>((styleOptions) => ({
          ...styleOptions,
          xAxis: { ...styleOptions.xAxis, gridLines: false },
        })),
      );
      expect(rebuilt).toEqual({
        ...polarStyle,
        categories: { ...polarStyle.categories, gridLines: false },
      });
    });

    it('scatter axes', () => {
      const original = withStyle(mockWidget(6), scatterStyle);
      const rebuilt = rebuildStyle(
        original,
        editStyleOptions<ScatterStyleOptions>((styleOptions) => ({
          ...styleOptions,
          yAxis: { ...styleOptions.yAxis, enabled: false },
        })),
      );
      expect(rebuilt).toEqual({
        ...scatterStyle,
        yAxis: { ...scatterStyle.yAxis, enabled: false },
      });
    });

    it('boxplot whisker and outliers', () => {
      const rebuilt = rebuildStyle(boxplotWidget, (model) => ({
        ...model,
        dataOptions: {
          ...(model.dataOptions as BoxplotChartDataOptions),
          boxType: 'iqr',
          outliersEnabled: false,
        },
      }));
      expect(rebuilt).toEqual({
        ...boxplotStyle,
        whisker: { 'whisker/iqr': true, 'whisker/extremums': false, 'whisker/deviation': false },
        outliers: { enabled: false },
      });
    });

    it('indicator components', () => {
      const original = withStyle(mockWidget(0), indicatorStyle);
      const rebuilt = rebuildStyle(
        original,
        editStyleOptions<IndicatorStyleOptions>((styleOptions) => ({
          ...styleOptions,
          indicatorComponents: {
            ...styleOptions.indicatorComponents,
            title: { ...styleOptions.indicatorComponents?.title, shouldBeShown: true },
            labels: { shouldBeShown: true },
          },
        })),
      );
      expect(rebuilt).toEqual({
        ...indicatorStyle,
        components: {
          ...indicatorStyle.components,
          title: { inactive: true, enabled: true },
          labels: { inactive: true, enabled: true },
        },
      });
    });

    it('pie legend', () => {
      const original = withStyle(mockWidget(2), pieStyle);
      const rebuilt = rebuildStyle(
        original,
        editStyleOptions<PieStyleOptions>((styleOptions) => ({
          ...styleOptions,
          legend: { ...styleOptions.legend, enabled: true },
        })),
      );
      expect(rebuilt).toEqual({ ...pieStyle, legend: { enabled: true, position: 'bottom' } });
    });
  });
});
