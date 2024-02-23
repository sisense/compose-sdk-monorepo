import { DesignOptions } from './types';
import { DefaultPieType, DefaultPieLabels } from './pie-plot-options';
import {
  DefaultFunnelType,
  DefaultFunnelSize,
  DefaultFunnelDirection,
  DefaultFunnelLabels,
} from './funnel-plot-options';
import { Merge } from '../../utils/utility-types';

export const SERIES_CAPACITY = 50;
export const SCATTER_CATEGORIES_CAPACITY = 500;
export const CATEGORIES_CAPACITY = 100000;

export const BaseDesignOptions: Merge<DesignOptions> = {
  lineType: 'straight',
  stackType: 'classic',
  legend: 'bottom',
  lineWidth: 2,
  valueLabel: {},
  marker: { enabled: false, size: 'small', fill: 'full' },
  xAxis: {
    type: 'linear',
    enabled: true,
    titleEnabled: true,
    title: 'X Axis title',
    gridLine: true,
    labels: true,
    min: null,
    max: null,
    tickInterval: null,
  },
  yAxis: {
    type: 'linear',
    enabled: true,
    titleEnabled: true,
    title: 'Y Axis title',
    gridLine: true,
    labels: true,
    min: null,
    max: null,
    tickInterval: null,
  },
  autoZoom: true,
  pieType: DefaultPieType,
  pieLabels: DefaultPieLabels,
  funnelType: DefaultFunnelType,
  funnelSize: DefaultFunnelSize,
  funnelDirection: DefaultFunnelDirection,
  funnelLabels: DefaultFunnelLabels,
  indicatorType: 'numeric',
  numericSubtype: 'numericSimple',
  skin: 'vertical',
  indicatorComponents: {
    title: {
      shouldBeShown: false,
      text: '',
    },
    secondaryTitle: {
      text: '',
    },
    ticks: {
      shouldBeShown: true,
    },
    labels: {
      shouldBeShown: true,
    },
  },
  dataLimits: {
    seriesCapacity: SERIES_CAPACITY,
    categoriesCapacity: CATEGORIES_CAPACITY,
  },
};

export const BaseDesignOptionsMultipleAxis: DesignOptions = {
  ...BaseDesignOptions,
  x2Axis: {
    type: 'linear',
    enabled: true,
    titleEnabled: true,
    title: 'X2 Axis title',
    gridLine: true,
    labels: true,
    min: null,
    max: null,
    tickInterval: null,
  },
  y2Axis: {
    type: 'linear',
    enabled: true,
    titleEnabled: true,
    title: 'Y2 Axis title',
    gridLine: true,
    labels: true,
    min: null,
    max: null,
    tickInterval: null,
  },
};
