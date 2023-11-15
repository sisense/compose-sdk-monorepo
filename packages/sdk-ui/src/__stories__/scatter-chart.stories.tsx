/* eslint-disable max-lines */
import { filters, createAttribute } from '@sisense/sdk-data';
import { Chart } from '../chart';
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

const dataSetWithHighlights = {
  columns: [
    { name: 'AgeRange', type: 'text' },
    { name: 'Gender', type: 'text' },
    { name: 'Quantity', type: 'number' },
    { name: 'Cost', type: 'number' },
  ],
  rows: [
    [
      { data: '0-18', text: '0-18', blur: true },
      { data: 'Female', text: 'Female', blur: true },
      { data: 232, text: '232', blur: true },
      { data: 27495.804228067398, text: '27495.8042280674', blur: true },
    ],
    [
      { data: '0-18', text: '0-18', blur: false },
      { data: 'Male', text: 'Male', blur: false },
      { data: 782, text: '782', blur: false },
      { data: 106794.48240566254, text: '106794.482405663', blur: false },
    ],
    [
      { data: '0-18', text: '0-18', blur: true },
      { data: 'Unspecified', text: 'Unspecified', blur: true },
      { data: 2760, text: '2760', blur: true },
      { data: 422713.5982968807, text: '422713.598296881', blur: true },
    ],
    [
      { data: '19-24', text: '19-24', blur: true },
      { data: 'Female', text: 'Female', blur: true },
      { data: 455, text: '455', blur: true },
      { data: 62488.35704255104, text: '62488.357042551', blur: true },
    ],
    [
      { data: '19-24', text: '19-24', blur: true },
      { data: 'Male', text: 'Male', blur: true },
      { data: 1604, text: '1604', blur: true },
      { data: 254258.1622428391, text: '254258.162242839', blur: true },
    ],
    [
      { data: '19-24', text: '19-24', blur: true },
      { data: 'Unspecified', text: 'Unspecified', blur: true },
      { data: 5436, text: '5436', blur: true },
      { data: 837450.8899597526, text: '837450.889959753', blur: true },
    ],
    [
      { data: '65+', text: '65+', blur: false },
      { data: 'Male', text: 'Male', blur: false },
      { data: 3286, text: '3286', blur: false },
      { data: 499720.10396651924, text: '499720.103966519', blur: false },
    ],
    [
      { data: '65+', text: '65+', blur: true },
      { data: 'Unspecified', text: 'Unspecified', blur: true },
      { data: 10364, text: '10364', blur: true },
      { data: 1537689.6738053188, text: '1537689.67380532', blur: true },
    ],
  ],
};

const attrAgeRange = {
  name: 'AgeRange',
  type: 'string',
};

const attrGender = {
  name: 'Gender',
  type: 'string',
};

const measureQuantity = { name: 'Quantity', aggregation: 'sum' };
const measureCost = { name: 'Cost', aggregation: 'sum' };

const mockAttributeGender = createAttribute({
  name: 'Gender',
  type: 'text-attribute',
  expression: '[Commerce.Gender]',
});

const mockAttributeAgeRange = createAttribute({
  name: 'AgeRange',
  type: 'text-attribute',
  expression: '[Commerce.Age Range]',
});

export const WithHighlights = template({
  chartType: 'scatter',
  dataSet: dataSetWithHighlights,
  dataOptions: {
    x: attrAgeRange,
    y: measureQuantity,
    breakByPoint: attrGender,
    size: measureCost,
  },
  highlights: [
    filters.members(mockAttributeGender, ['Male']),
    filters.members(mockAttributeAgeRange, ['65+', '0-18']),
  ],
});
