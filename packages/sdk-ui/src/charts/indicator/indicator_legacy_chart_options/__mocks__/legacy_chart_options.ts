import { NumericSimpleOptions } from '../../types';

export const numericSimpleLegacyChartOptionsWithDarkTheme: NumericSimpleOptions = {
  fontFamily: 'impact',
  title: {
    color: '#FFFFFF',
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
  backgroundColor: '#333333',
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
