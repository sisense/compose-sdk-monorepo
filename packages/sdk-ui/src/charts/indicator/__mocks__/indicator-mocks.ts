import { IndicatorChartData } from '@/chart-data/types';
import { IndicatorChartDesignOptions } from '@/chart-options-processor/translations/design-options';
import { IndicatorLegacyChartOptions } from '@/indicator-canvas';
import { IndicatorChartDataOptions } from '@/types';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { measureFactory } from '@sisense/sdk-data';
import { IndicatorLegacyChartDataOptions } from '../indicator-legacy-chart-data-options';

export const chartData: IndicatorChartData = {
  type: 'indicator',
  value: 14479310.424909197,
  min: 0,
  max: 125000000,
};

export const chartDesignOptions: IndicatorChartDesignOptions = {
  lineType: 'straight',
  legend: {
    position: 'bottom',
    enabled: true,
  },
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

export const legacyChartDataOptions: IndicatorLegacyChartDataOptions = {
  color: '#00cee6',
  showSecondary: true,
  type: 'numericSimple',
  skin: 'vertical',
  title: {
    text: 'Total Revenue',
  },
  min: {
    data: 0,
    text: '0',
  },
  max: {
    data: 100,
    text: '100',
  },
  value: {
    data: 28732733.036079407,
    text: '28.73M',
  },
  secondary: {
    data: 3735080.7951049805,
    text: '3.74M',
  },
  secondaryTitle: {
    text: 'Total Cost',
  },
  showTitle: true,
  showLabels: false,
  showTicks: false,
};

export const legacyChartOptions: IndicatorLegacyChartOptions = {
  fontFamily: 'Open Sans',
  title: {
    color: '#5B6372',
    fontSizes: {
      big: 22,
      medium: 18,
      small: 15,
      micro: 12,
    },
  },
  value: {
    color: '#00cee6',
    fontSizes: {
      big: 66,
      medium: 46,
      small: 32,
      micro: 23,
    },
  },
  secondaryTitle: {
    color: '#9EA2AB',
    fontSizes: {
      big: 20,
      medium: 14,
      small: 10,
      micro: 10,
    },
  },
  secondaryValue: {
    fontWeight: 800,
    color: '#9EA2AB',
    fontSizes: {
      big: 20,
      medium: 14,
      small: 10,
      micro: 10,
    },
  },
  textKeys: ['title', 'value', 'secondaryTitle', 'secondaryValue'],
  backgroundColor: '#FFFFFF',
  borderColor: 'rgb(215, 215, 215)',
  borderWidth: 1,
  relativeSizes: [
    {
      key: 'titleSectionHeight',
      value: 0.5,
      decimals: 0,
    },
    {
      key: 'titleSectionMarginTop',
      value: 0.13,
      decimals: 0,
    },
    {
      key: 'titleSectionMinWidth',
      value: 0.29,
      decimals: 0,
    },
    {
      key: 'numericMinWidth',
      value: 4.69,
      decimals: 0,
    },
    {
      key: 'valueSectionHeight',
      value: 1,
      decimals: 0,
    },
    {
      key: 'valueSectionMarginRight',
      value: 0.14,
      decimals: 0,
    },
    {
      key: 'valueSectionMarginBottom',
      value: 0.07,
      decimals: 0,
    },
    {
      key: 'secSectionHeight',
      value: 0.34,
      decimals: 0,
    },
    {
      key: 'secSectionMarginTop',
      value: 0.14,
      decimals: 0,
    },
    {
      key: 'secDividerWidth',
      value: 0.14,
      decimals: 0,
    },
    {
      key: 'secTitleMinWidth',
      value: 0.29,
      decimals: 0,
    },
    {
      key: 'indicatorHorizontalMargin',
      value: 0.31,
      decimals: 0,
    },
    {
      key: 'indicatorVerticalMargin',
      value: 0.46,
      decimals: 0,
    },
  ],
  measureKeys: [
    'indicatorMargin',
    'numericMinWidth',
    'titleSectionHeight',
    'secSectionHeight',
    'valueSectionMarginBottom',
    'secSectionMarginTop',
    'indicatorHorizontalMargin',
    'indicatorVerticalMargin',
  ],
  sizes: [
    {
      size: 'big',
      value: 70,
    },
    {
      size: 'medium',
      value: 49,
    },
    {
      size: 'small',
      value: 34,
    },
    {
      size: 'micro',
      value: 24,
    },
  ],
  fitMeasures: [
    {
      key: 'fitTitleMeasure',
      prop: 'string',
      dataKey: 'title',
    },
    {
      key: 'fitValueMeasure',
      prop: 'string',
      dataKey: 'value',
    },
    {
      key: 'fitSecondaryMeasure',
      prop: 'titleString',
      dataKey: 'secondaryTitle',
    },
    {
      key: 'fitSecondaryMeasure',
      prop: 'valueString',
      dataKey: 'secondary',
    },
  ],
  forceTickerView: false,
};
