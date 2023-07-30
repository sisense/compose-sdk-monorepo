import { Chart } from '../components/Chart';
import { StyleOptions } from '../types';
import { templateForComponent } from './template';

const template = templateForComponent(Chart);

export default {
  title: 'Charts/Scatter',
  component: Chart,
  argTypes: {
    chartType: { options: ['scatter'] },
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
  name: 'Group',
  type: 'string',
};

const cat2 = {
  name: 'Category',
  type: 'string',
};

const meas1 = { name: 'Quantity', aggregation: 'sum' };

const meas2 = { name: 'Units', aggregation: 'sum' };

const meas3 = { name: 'Amount', aggregation: 'sum' };

const dataSet = {
  columns: [
    { name: 'Years', type: 'date' },
    { name: 'Group', type: 'string' },
    { name: 'Category', type: 'string' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
    { name: 'Amount', type: 'number' },
  ],
  rows: [
    ['2009', 'G1', { data: 'C1', color: '#0ff' }, 6781, 10, 200],
    ['2009', 'G1', { data: 'C2', color: '#f0f' }, 4012, 15, 250],
    ['2010', 'G1', { data: 'C1', color: '#0ff' }, 4471, 70, 300],
    ['2011', 'G2', { data: 'C2', color: '#f0f' }, 1812, 50, 150],
    ['2012', 'G2', { data: 'C2', color: '#f0f' }, 5001, 60, 250],
    ['2012', 'G2', { data: 'C1', color: '#0ff' }, 4001, 65, 255],
    ['2013', 'G1', { data: 'C1', color: '#0ff' }, 2045, 40, 400],
    ['2014', 'G2', { data: 'C2', color: '#f0f' }, 3010, 90, 900],
    ['2015', 'G1', { data: 'C1', color: '#0ff' }, 5447, 80, 50],
    ['2016', 'G2', { data: 'C2', color: '#f0f' }, 4242, 70, 20],
    ['2017', 'G2', { data: 'C2', color: '#f0f' }, 936, 20, 30],
  ],
};

const scatterArgs = {
  dataSet,
  dataOptions: {
    x: meas1,
    y: meas2,
    breakByPoint: cat1,
    breakByColor: cat2,
    size: meas3,
  },
  styleOptions,
};

export const ScatterXNumericYNumeric = template({
  ...scatterArgs,
  chartType: 'scatter',
});

export const ScatterXCategoryYCategory = template({
  ...scatterArgs,
  dataOptions: {
    x: cat1,
    y: cat2,
  },
  chartType: 'scatter',
});

export const WithSeriesDataLimit = template({
  ...scatterArgs,
  styleOptions: {
    ...styleOptions,
    dataLimits: {
      seriesCapacity: 1,
    },
  },
  chartType: 'scatter',
});

export const WithCategoriesDataLimit = template({
  ...scatterArgs,
  dataOptions: {
    x: cat1,
    y: cat2,
  },
  styleOptions: {
    ...styleOptions,
    dataLimits: {
      categoriesCapacity: 1,
    },
  },
  chartType: 'scatter',
});
