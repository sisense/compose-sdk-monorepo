/* eslint-disable max-lines */
import { Chart } from '../chart';
import { templateForComponent } from './template';
import { NumberFormatConfig, StyleOptions } from '../types';
import { Data } from '@sisense/sdk-data';

const template = templateForComponent(Chart);

export default {
  title: 'Charts/Cartesian',
  component: Chart,
  argTypes: {
    chartType: { options: ['line', 'area', 'column', 'bar'] }, // prevents 'pie' from showing
  },
};

// WIDGET STYLES
const styleOptions: StyleOptions = {
  legend: {
    enabled: true,
    position: 'bottom',
  },
  navigator: {
    enabled: true,
  },
  markers: { enabled: true, fill: 'hollow', size: 'small' },
  xAxis: {
    enabled: true,
    gridLines: true,
    isIntervalEnabled: false,
    labels: {
      enabled: true,
    },
    logarithmic: false,
    title: {
      enabled: true,
      text: 'X Axis title',
    },
  },
  yAxis: {
    enabled: true,
    gridLines: true,
    isIntervalEnabled: false,
    labels: {
      enabled: true,
    },
    logarithmic: false,
    title: {
      enabled: true,
      text: 'Y Axis title',
    },
  },
};

const cat1 = {
  name: 'Years',
  type: 'date',
};
const cat2 = {
  name: 'Group',
  type: 'string',
};
const cat3 = {
  name: 'Units',
  type: 'number',
};
const meas1 = {
  column: { name: 'Quantity', aggregation: 'sum' },
  showOnRightAxis: false,
};
const meas2 = {
  column: { name: 'Units', aggregation: 'sum' },
  showOnRightAxis: true,
  color: '#0000FF',
};

const dataSet: Data = {
  columns: [
    { name: 'Years', type: 'date' },
    { name: 'Group', type: 'string' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
  ],
  rows: [
    ['2009', 'A', 6781, 10],
    ['2010', 'A', 4471, 70],
    ['2011', 'B', 1812, 50],
    ['2012', 'B', 5001, 60],
    ['2013', 'A', 2045, 40],
    ['2014', 'B', 3010, 90],
    ['2015', 'A', 5447, 80],
    ['2016', 'B', 4242, 70],
    ['2017', 'B', 936, 20],
  ],
};

const withBlurredRows = (dataSet: Data, rowsIndexes: number[]) => ({
  ...dataSet,
  rows: dataSet.rows.map((row, rowIndex) =>
    row.map((cell) => (rowsIndexes.includes(rowIndex) ? { data: cell, blur: true } : cell)),
  ),
});

const defaultNumberFormat: NumberFormatConfig = {
  name: 'Numbers',
  decimalScale: 3,
  trillion: true,
  billion: true,
  million: true,
  kilo: true,
  thousandSeparator: true,
  prefix: true,
  symbol: '',
};

const cartesianArgs = {
  dataSet,
  dataOptions: {
    category: [cat1],
    value: [meas1],
    breakBy: [],
  },
  styleOptions,
};

const cartesian2XArgs = {
  dataSet,
  dataOptions: {
    category: [cat1, cat3],
    value: [meas1],
    breakBy: [],
  },
  styleOptions,
};

const cartesianMultipleBreakByArgs = {
  dataSet,
  dataOptions: {
    category: [cat1],
    value: [meas1],
    breakBy: [cat2, cat3],
  },
  styleOptions,
};

export const Line = template({
  ...cartesianArgs,
  chartType: 'line',
});

export const LineWithBlur = template({
  ...cartesianArgs,
  dataSet: withBlurredRows(dataSet, [0, 1, 5, 6, 7, 8]),
  chartType: 'line',
});

export const Area = template({
  ...cartesianArgs,
  chartType: 'area',
});

export const AreaWithBlur = template({
  ...cartesianArgs,
  dataSet: withBlurredRows(dataSet, [0, 1, 5, 6, 7, 8]),
  chartType: 'area',
});

export const Column = template({
  ...cartesianArgs,
  chartType: 'column',
});

export const Column2X = template({
  ...cartesian2XArgs,
  onBeforeRender: (o) => {
    console.log('DEBUG', o);
    return o;
  },
  chartType: 'column',
});

export const PolarLine = template({
  ...cartesianArgs,
  chartType: 'polar',
  styleOptions: {
    ...styleOptions,
    subtype: 'polar/line',
  },
});

export const PolarArea = template({
  ...cartesianArgs,
  chartType: 'polar',
  styleOptions: {
    ...styleOptions,
    subtype: 'polar/area',
  },
});

export const PolarColumn = template({
  ...cartesianArgs,
  chartType: 'polar',
  styleOptions: {
    ...styleOptions,
    subtype: 'polar/column',
  },
});

export const Bar = template({
  ...cartesianArgs,
  chartType: 'bar',
});

export const StackedBar = template({
  ...cartesianArgs,
  styleOptions: { ...styleOptions, subtype: 'bar/stacked' },
  dataOptions: { ...cartesianArgs.dataOptions, value: [meas2, meas1] },
  chartType: 'bar',
});

export const ColumnMultipleBreakBy = template({
  ...cartesianMultipleBreakByArgs,
  chartType: 'column',
});

export const CustomColorPerDataPoint = template({
  ...cartesianArgs,
  chartType: 'bar',
  dataSet: {
    columns: dataSet.columns,
    rows: [
      ['2009', 'A', { data: 6781, color: '#0ff' }, 10],
      ['2010', 'A', { data: 4471, color: '#f0f' }, 70],
      ['2011', 'B', { data: 1812, color: '#ff0' }, 50],
      ['2012', 'B', { data: 5001, color: '#000' }, 60],
    ],
  },
  dataOptions: {
    category: [cat1],
    value: [{ ...meas1, treatNullDataAsZeros: true }],
    breakBy: [],
  },
});

export const TreatNullDataAsZeros = template({
  ...cartesianArgs,
  chartType: 'line',
  dataSet: {
    columns: [
      { name: 'Years', type: 'date' },
      { name: 'Group', type: 'string' },
      { name: 'Quantity', type: 'number' },
      { name: 'Units', type: 'number' },
    ],
    rows: [
      ['2009', 'A', 6781, 10],
      ['2010', 'A', '', 70],
      ['2011', 'B', '', 50],
      ['2012', 'B', 5001, 60],
    ],
  },
  dataOptions: {
    category: [cat1],
    value: [{ ...meas1, treatNullDataAsZeros: true }],
    breakBy: [],
  },
});

export const WithBlurredData = template({
  ...cartesianArgs,
  chartType: 'column',
  dataSet: {
    columns: [
      { name: 'Years', type: 'date' },
      { name: 'Group', type: 'string' },
      { name: 'Quantity', type: 'number' },
      { name: 'Units', type: 'number' },
    ],
    rows: [
      ['2009', 'A', 6781, 10],
      [
        { data: '2010', blur: true },
        { data: 'A', blur: true },
        { data: 4471, blur: true },
        { data: 70, blur: true },
      ],
      ['2011', 'B', 1812, 50],
      ['2012', 'B', 5001, 60],
    ],
  },
});

export const FormatXAxisNumber = template({
  ...cartesianArgs,
  chartType: 'line',
  dataSet: {
    columns: [
      { name: 'Years', type: 'date' },
      { name: 'Quantity', type: 'number' },
      { name: 'Id', type: 'number' },
    ],
    rows: [
      ['2009', 6781, 70.21],
      ['2010', 686, 70.21],
      ['2009', 134, 50.01],
      ['2010', 5001, 50.01],
    ],
  },
  dataOptions: {
    category: [
      {
        name: 'Id',
        type: 'number',
        numberFormatConfig: {
          ...defaultNumberFormat,
          decimalScale: 1,
        },
      },
    ],
    value: [{ ...meas1, treatNullDataAsZeros: true }],
    breakBy: [],
  },
});

export const FormatBreakByNumber = template({
  ...cartesianArgs,
  chartType: 'line',
  dataSet: {
    columns: [
      { name: 'Years', type: 'date' },
      { name: 'Quantity', type: 'number' },
      { name: 'Id', type: 'number' },
    ],
    rows: [
      ['2009', 6781, 70.21],
      ['2010', 686, 70.21],
      ['2009', 134, 50.01],
      ['2010', 5001, 50.01],
    ],
  },
  dataOptions: {
    category: [cat1],
    value: [meas1],
    breakBy: [
      {
        name: 'Id',
        type: 'number',
        numberFormatConfig: {
          ...defaultNumberFormat,
          decimalScale: 1,
        },
      },
    ],
  },
});

export const SeriesColorUniformString = template({
  ...cartesianArgs,
  chartType: 'column',
  dataOptions: {
    category: [cat1],
    value: [
      {
        ...meas1,
        color: 'aquamarine',
      },
    ],
    breakBy: [],
  },
});

export const SeriesColorUniformObject = template({
  ...cartesianArgs,
  chartType: 'column',
  dataOptions: {
    category: [cat1],
    value: [
      {
        ...meas1,
        color: {
          type: 'uniform',
          color: 'lightblue',
        },
      },
    ],
    breakBy: [],
  },
});

export const RangeDataColorOptions = template({
  ...cartesianArgs,
  chartType: 'column',
  dataOptions: {
    category: [cat1],
    value: [
      {
        ...meas1,
        color: {
          type: 'range',
          minColor: 'red',
          maxColor: 'yellow',
          minValue: 0,
          midValue: 2000,
          maxValue: 8000,
        },
      },
    ],
    breakBy: [],
  },
});

export const ConditionalDataColorOptions = template({
  ...cartesianArgs,
  chartType: 'column',
  dataOptions: {
    category: [cat1],
    value: [
      {
        ...meas1,
        color: {
          type: 'conditional',
          conditions: [
            { expression: '2045', operator: '=', color: 'pink' },
            { expression: '5000', operator: '>', color: 'steelblue' },
            { expression: '2000', operator: '<', color: 'purple' },
          ],
          defaultColor: 'slategray',
        },
      },
    ],
    breakBy: [],
  },
});

export const ContinuousYearDatetimeAxis = template({
  ...cartesianArgs,
  dataSet: { ...dataSet, rows: dataSet.rows.filter((r) => r[0] !== '2011' && r[0] !== '2012') },
  chartType: 'line',
  dataOptions: {
    category: [{ column: cat1, continuous: true }],
    value: [meas1],
    breakBy: [],
  },
});

const monthRows = [
  ['2020-01', 'A', 6781, 10],
  ['2020-02', 'A', 4471, 70],
  ['2020-03', 'B', 1812, 50],
  ['2020-05', 'B', '', 60],
  ['2020-06', 'B', 5001, 60],
  ['2020-07', 'A', 2045, 40],
  ['2020-08', 'B', 3010, 90],
  ['2020-09', 'A', 5447, 80],
  ['2020-10', 'B', 4242, 70],
  ['2020-11', 'B', 936, 20],
];

export const ContinuousMonthDatetimeAxis = template({
  ...cartesianArgs,
  dataSet: { ...dataSet, rows: monthRows },
  chartType: 'line',
  dataOptions: {
    category: [{ column: cat1, continuous: true, dateFormat: 'Y/MM' }],
    value: [meas1],
    breakBy: [],
  },
});

export const ContinuousDatetimeAxisWithTwoMeas = template({
  ...cartesianArgs,
  dataSet: { ...dataSet, rows: monthRows },
  chartType: 'line',
  dataOptions: {
    category: [{ column: cat1, continuous: true, dateFormat: 'Y/MM' }],
    value: [meas1, meas2],
    breakBy: [],
  },
});

export const WithDataLimits = template({
  ...cartesianArgs,
  styleOptions: {
    ...styleOptions,
    subtype: 'bar/stacked',
    dataLimits: { categoriesCapacity: 3, seriesCapacity: 1 },
  },
  dataOptions: { ...cartesianArgs.dataOptions, value: [meas2, meas1] },
  chartType: 'bar',
});

export const WithNoY = template({
  dataSet,
  chartType: 'line',
  dataOptions: {
    category: [cat1],
    value: [],
    breakBy: [cat2],
  },
});

export const WithZeroValuesForY = template({
  dataSet: {
    ...dataSet,
    rows: [
      ['2009', 'A', 0, 10],
      ['2010', 'A', 0, 70],
      ['2011', 'B', 0, 50],
      ['2012', 'B', 0, 60],
    ],
  },
  chartType: 'column',
  dataOptions: {
    category: [cat1],
    value: [meas1],
    breakBy: [],
  },
});
