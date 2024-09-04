import { IndicatorChartData } from '@/chart-data/types';
import { IndicatorChartDesignOptions } from '@/chart-options-processor/translations/design-options';
import { IndicatorChartDataOptions } from '@/types';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { measureFactory } from '@sisense/sdk-data';

export const chartData: IndicatorChartData = {
  type: 'indicator',
  value: 14479310.424909197,
  min: 0,
  max: 125000000,
};

export const chartDesignOptions: IndicatorChartDesignOptions = {
  lineType: 'straight',
  legend: 'bottom',
  lineWidth: 2,
  valueLabel: {},
  marker: {
    enabled: false,
    size: 'small',
    fill: 'full',
  },
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

  indicatorType: 'gauge',
  skin: 1,
  indicatorComponents: {
    title: {
      shouldBeShown: true,
      text: 'Total Revenue',
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
    seriesCapacity: 50,
    categoriesCapacity: 100000,
  },
  forceTickerView: false,
};

export const chartDataOptions: IndicatorChartDataOptions = {
  value: [measureFactory.sum(DM.Commerce.Revenue)],
  secondary: [],
  min: [measureFactory.constant(0)],
  max: [measureFactory.constant(125000000)],
};
