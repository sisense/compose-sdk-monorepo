/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-lines */
import { NumericSimpleOptions, NumericBarOptions, GaugeOptions, TickerOptions } from '../types';

export const defaultNumericSimpleOptions: NumericSimpleOptions = {
  fontFamily: 'opensansregular, sans-serif',
  title: {
    color: 'rgb(68, 81, 102)',
    fontSizes: {
      big: 22,
      medium: 18,
      small: 15,
      micro: 12,
    },
  },
  value: {
    fontSizes: {
      big: 66,
      medium: 46,
      small: 32,
      micro: 23,
    },
  },
  secondaryTitle: {
    color: 'rgb(163, 163, 163)',
    fontSizes: {
      big: 20,
      medium: 14,
      small: 10,
      micro: 10,
    },
  },
  secondaryValue: {
    fontWeight: 800,
    color: 'rgb(163, 163, 163)',
    fontSizes: {
      big: 20,
      medium: 14,
      small: 10,
      micro: 10,
    },
  },
  textKeys: ['title', 'value', 'secondaryTitle', 'secondaryValue'],
  backgroundColor: 'rgb(255, 255, 255)',
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
};

export const defaultNumericBarOptions: NumericBarOptions = {
  fontFamily: 'opensansregular, sans-serif',
  title: {
    color: 'rgb(68, 81, 102)',
    fontSizes: { big: 22, medium: 18, small: 15, micro: 12 },
  },
  value: {
    color: 'rgb(255, 255, 255)',
    fontSizes: { big: 45, medium: 31, small: 22, micro: 15 },
  },
  secondaryTitle: {
    color: 'rgb(163, 163, 163)',
    fontSizes: { big: 20, medium: 14, small: 10, micro: 10 },
  },
  secondaryValue: {
    fontWeight: 800,
    color: 'rgb(163, 163, 163)',
    fontSizes: { big: 20, medium: 14, small: 10, micro: 10 },
  },
  textKeys: ['title', 'value', 'secondaryTitle', 'secondaryValue'],
  backgroundColor: 'rgb(255, 255, 255)',
  bracketColor: 'rgb(198, 198, 198)',
  bracketThickness: 1,
  relativeSizes: [
    { key: 'titleSectionHeight', value: 1, decimals: 0 },
    { key: 'titleHorizontalMargin', value: 0.16, decimals: 0 },
    { key: 'numericMinWidth', value: 4.69, decimals: 0 },
    { key: 'valueSectionHeight', value: 1, decimals: 0 },
    { key: 'secSectionHeight', value: 1, decimals: 0 },
    { key: 'secBottomMargin', value: 0.14, decimals: 0 },
    { key: 'secDividerWidth', value: 0.14, decimals: 0 },
    { key: 'secTitleMinWidth', value: 0.29, decimals: 0 },
    { key: 'bracketWidth', value: 0.21, decimals: 0 },
    { key: 'indicatorMargin', value: 0.64, decimals: 0 },
  ],
  measureKeys: [
    'indicatorMargin',
    'numericMinWidth',
    'bracketWidth',
    'titleSectionHeight',
    'secSectionHeight',
  ],
  sizes: [
    { size: 'big', value: 70, maxWidth: 1261, maxHeight: 665 },
    { size: 'medium', value: 49 },
    { size: 'small', value: 34 },
    { size: 'micro', value: 24 },
  ],
};

export const defaultGaugeOptions: GaugeOptions = {
  fontFamily: 'opensansregular, sans-serif',
  title: {
    color: 'rgb(68, 81, 102)',
    fontSizes: { big: 22, medium: 18, small: 15, micro: 12 },
  },
  value: {
    color: 'rgb(255, 255, 255)',
    fontSizes: { big: 45, medium: 31, small: 22, micro: 15 },
  },
  secondaryTitle: {
    color: 'rgb(163, 163, 163)',
    fontSizes: { big: 20, medium: 14, small: 10, micro: 10 },
  },
  secondaryValue: {
    fontWeight: 800,
    color: 'rgb(163, 163, 163)',
    fontSizes: { big: 20, medium: 14, small: 10, micro: 10 },
  },
  label: {
    color: 'rgb(68, 81, 102)',
    fontSizes: { big: 18, medium: 13, small: 9, micro: 9 },
  },
  textKeys: ['title', 'value', 'secondaryTitle', 'secondaryValue', 'label'],
  backgroundColor: 'rgb(255, 255, 255)',
  tickColor: 'rgb(0, 0, 0)',
  needleColor: 'rgb(43, 51, 66)',
  bracketColor: 'rgb(198, 198, 198)',
  defaultDialColor: 'rgb(179, 179, 179)',
  gaugeOpacity: 0.5,
  startAngle: 20,
  endAngle: 160,
  overDegrees: 5,
  tickDegreesIncrement: 10,
  bracketThickness: 1,
  relativeSizes: [
    { key: 'titleSectionHeight', value: 0.26, decimals: 0 },
    { key: 'titleHorizontalMargin', value: 0.08, decimals: 0 },
    { key: 'titleBottomMargin', value: 0.1, decimals: 0 },
    { key: 'gaugeWidth', value: 1.33, decimals: 0 },
    { key: 'gaugeBottomMargin', value: 0.19, decimals: 0 },
    { key: 'outerArcRadius', value: 0.63, decimals: 0 },
    {
      key: 'innerArcRadius',
      dataKey: 'skin',
      values: { '1': 0.24, '2': 0.51 },
      decimals: 0,
    },
    { key: 'lengthToTick', value: 0.7, decimals: 0 },
    { key: 'tickRadius', value: 0.01, decimals: 1 },
    {
      key: 'needleLength',
      dataKey: 'skin',
      values: { '1': 0.52, '2': 0.58 },
      decimals: 0,
    },
    { key: 'needleBaseRadius', value: 0.04, decimals: 0 },
    { key: 'labelMargin', value: 0.26, decimals: 0 },
    { key: 'valueSectionHeight', value: 0.36, decimals: 0 },
    { key: 'secSectionHeight', value: 0.36, decimals: 0 },
    { key: 'secBottomMargin', value: 0.05, decimals: 0 },
    { key: 'secDividerWidth', value: 0.05, decimals: 0 },
    { key: 'secTitleMinWidth', value: 0.1, decimals: 0 },
    { key: 'bracketWidth', value: 0.08, decimals: 0 },
    { key: 'indicatorMargin', value: 0.14, decimals: 0 },
  ],
  gaugeHeights: [
    { size: 'big', value: 192, maxWidth: 1297, maxHeight: 1075 },
    { size: 'medium', value: 134 },
    { size: 'small', value: 94 },
    { size: 'micro', value: 66 },
  ],
  measureKeys: [
    'indicatorMargin',
    'gaugeWidth',
    'bracketWidth',
    'titleSectionHeight',
    'valueSectionHeight',
    'secSectionHeight',
  ],
};

export const defaultTickerOptions: TickerOptions = {
  fontFamily: 'Open Sans',
  fontSize: 15,
  title: {
    color: 'rgb(68, 81, 102)',
  },
  value: {
    fontWeight: 800,
  },
  secondaryTitle: {
    color: 'rgb(163, 163, 163)',
  },
  secondaryValue: {
    color: 'rgb(163, 163, 163)',
  },
  textKeys: ['title', 'value', 'secondaryTitle', 'secondaryValue'],
  backgroundColor: 'transparent',
  dividerColor: 'rgb(39, 42, 52)',
  barHandleColor: 'rgb(43, 51, 66)',
  height: 35,
  horizontalMargin: 15,
  barWidth: 100,
  barHeight: 11,
  barOpacity: 0.5,
  tickerBarWidth: 2,
  tickerBarHeight: 13,
  horizontalPadding: 9,
  textPadding: 6,
  sectionMinWidth: 20,
  dividerWidth: 1,
  dividerHeight: 13,
};
