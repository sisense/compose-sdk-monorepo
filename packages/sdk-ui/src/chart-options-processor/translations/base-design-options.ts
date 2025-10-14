import { Merge } from '../../utils/utility-types';
import {
  DefaultFunnelDirection,
  DefaultFunnelLabels,
  DefaultFunnelSize,
  DefaultFunnelType,
} from './funnel-plot-options';
import { DefaultPieLabels, DefaultPieType } from './pie-plot-options';
import { DesignOptions } from './types';

export const SERIES_CAPACITY = 50;
export const PIE_SERIES_CAPACITY = 1000;
export const SCATTER_CATEGORIES_CAPACITY = 500;
export const CATEGORIES_CAPACITY = 100000;

export const BaseDesignOptions: Merge<DesignOptions> = {
  lineType: 'straight',
  stackType: 'classic',
  legend: {
    enabled: true,
    position: 'bottom',
  },
  lineWidth: 2,
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
  autoZoom: {
    enabled: true,
  },
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
