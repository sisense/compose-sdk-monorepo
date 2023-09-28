/* eslint-disable max-lines */
import { Chart } from '../components/chart';
import { PieChartProps } from '../props';
import { NumberFormatConfig, PieStyleOptions } from '../types';
import { templateForComponent } from './template';

const template = templateForComponent(Chart);

export default {
  title: 'Charts/Categorical/Pie',
  component: Chart,
  argTypes: {
    chartType: { options: ['pie'] }, // prevents cartesian types from showing
  },
};

// WIDGET STYLES
const styleOptions: PieStyleOptions = {
  legend: {
    enabled: true,
    position: 'bottom',
  },
};

const group = {
  name: 'Group',
  type: 'string',
};
const quantity = {
  name: 'Quantity',
  aggregation: 'sum',
};
const units = {
  name: 'Units',
  aggregation: 'sum',
};

const returns = {
  name: 'Returns',
  agg: 'sum',
  title: 'Returns',
};

const defaultNumberFormat: NumberFormatConfig = {
  name: 'Numbers',
  decimalScale: 3,
  trillion: true,
  billion: true,
  million: true,
  kilo: true,
  thousandSeparator: true, // if true, show the thousand separator, e.g. 1,000 if false 1000
  // symbol and prefix are used together, if prefix is true,
  // append the symbol in front of the number, e.g. symbol is $ -> $1000
  // if prefix is false, append the symbol after the number, e.g. symbol is ¥ -> 1000¥
  prefix: true,
  symbol: '',
};

const dataSet = {
  columns: [
    { name: 'Years', type: 'date' },
    { name: 'Group', type: 'string' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
    { name: 'Returns', type: 'number' },
  ],
  rows: [
    ['2009', 'A', 6781, 1500, 3420],
    ['2011', 'B', 1812, 5000, 1234],
    ['2011', 'C', 1300, 9000, 5667],
  ],
};

const pieArgs: PieChartProps = {
  dataSet,
  dataOptions: {
    value: [
      {
        name: 'Units',
        aggregation: 'sum',
      },
    ],
    category: [
      {
        name: 'Group',
        type: 'string',
      },
    ],
  },
  styleOptions,
};

export const Pie = template({ ...pieArgs, chartType: 'pie' });

export const OrderedClockwise = template({
  ...pieArgs,
  chartType: 'pie',
  dataOptions: {
    value: [
      {
        column: units,
        sortType: 'sortAsc',
      },
    ],
    category: [group],
  },
});

export const OrderedCounterClockwise = template({
  ...pieArgs,
  chartType: 'pie',
  dataOptions: {
    value: [
      {
        column: units,
        sortType: 'sortDesc',
      },
    ],
    category: [group],
  },
});

export const BreakByConvolutionPercent = template({
  ...pieArgs,
  chartType: 'pie',
  dataOptions: {
    value: [
      {
        ...units,
        sortType: 'sortDesc',
      },
    ],
    category: [group],
  },
  styleOptions: {
    ...styleOptions,
    convolution: {
      enabled: true,
      selectedConvolutionType: 'byPercentage',
      minimalIndependentSlicePercentage: 12.5,
    },
  } as PieStyleOptions,
});

export const BreakByConvolutionCount = template({
  ...pieArgs,
  chartType: 'pie',
  dataOptions: {
    value: [
      {
        ...units,
        sortType: 'sortDesc',
      },
    ],
    category: [group],
  },
  styleOptions: {
    ...styleOptions,
    convolution: {
      enabled: true,
      selectedConvolutionType: 'bySlicesCount',
      independentSlicesCount: 1,
    },
  } as PieStyleOptions,
});

export const ValuesConvolutionCount = template({
  ...pieArgs,
  chartType: 'pie',
  dataOptions: {
    value: [units, returns, quantity],
    category: [],
  },
  styleOptions: {
    ...styleOptions,
    convolution: {
      enabled: true,
      selectedConvolutionType: 'bySlicesCount',
      independentSlicesCount: 2,
    },
  } as PieStyleOptions,
});

export const ValuesConvolutionPercent = template({
  ...pieArgs,
  chartType: 'pie',
  dataOptions: {
    value: [units, returns, quantity],
    category: [],
  },
  styleOptions: {
    ...styleOptions,
    convolution: {
      enabled: true,
      selectedConvolutionType: 'byPercentage',
      minimalIndependentSlicePercentage: 15,
    },
  } as PieStyleOptions,
});

export const CustomColorPerDataPoint = template({
  ...pieArgs,
  chartType: 'pie',
  dataSet: {
    columns: dataSet.columns,
    rows: [
      ['2009', 'A', 6781, { data: 1500, color: '#f00' }, 3420],
      ['2011', 'B', 1812, { data: 5000, color: '#0f0' }, 1234],
      ['2011', 'C', 1300, { data: 9000, color: '#00f' }, 5667],
    ],
  },
  styleOptions,
});

export const PieWithBreakByNumberFormat = template({
  ...pieArgs,
  chartType: 'pie',
  dataOptions: {
    value: [quantity],
    category: [
      {
        name: 'Units',
        type: 'number',
        numberFormatConfig: {
          ...defaultNumberFormat,
          decimalScale: 1,
        },
      },
    ],
  },
  styleOptions,
});

export const WithDataLimits = template({
  ...pieArgs,
  styleOptions: { ...styleOptions, dataLimits: { seriesCapacity: 2 } },
  chartType: 'pie',
});
