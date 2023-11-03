/* eslint-disable max-lines */
import { Chart } from '../chart';
import { SunburstChartProps } from '../props';
import { SunburstStyleOptions } from '../types';
import { templateForComponent } from './template';

const template = templateForComponent(Chart);

export default {
  title: 'Charts/Categorical/Sunburst',
  component: Chart,
  argTypes: {
    chartType: { options: ['sunburst'] }, // prevents cartesian types from showing
  },
};

// WIDGET STYLES
const styleOptions: SunburstStyleOptions = {
  tooltip: {
    mode: 'value',
  },
};
const years = {
  name: 'Years',
  type: 'string',
};
const gender = {
  name: 'Gender',
  type: 'string',
};
const group = {
  name: 'Group',
  type: 'string',
};
const units = {
  name: 'Units',
  aggregation: 'sum',
};

const dataSet = {
  columns: [
    { name: 'Gender', type: 'string' },
    { name: 'Years', type: 'date' },
    { name: 'Group', type: 'string' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
    { name: 'Returns', type: 'number' },
  ],
  rows: [
    ['Male', '2009', 'A', 6781, 1500, 3420],
    ['Male', '2011', 'B', 1812, 5000, 1234],
    ['Male', '2011', 'C', 1812, 5000, 1234],
    ['Female', '2011', 'C', 1300, 9000, 5667],
  ],
};

const sunburstArgs: SunburstChartProps = {
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

export const SingleCategory = template({ ...sunburstArgs, chartType: 'sunburst' });

export const TwoCategories = template({
  ...sunburstArgs,
  chartType: 'sunburst',
  dataOptions: {
    value: [
      {
        column: units,
      },
    ],
    category: [group, years],
  },
});

export const WithoutLegend = template({
  ...sunburstArgs,
  chartType: 'sunburst',
  dataOptions: {
    value: [
      {
        column: units,
      },
    ],
    category: [gender, group, years],
  },
  styleOptions: {
    legend: {
      enabled: false,
    },
  },
});

export const WithLabels = template({
  ...sunburstArgs,
  chartType: 'sunburst',
  dataOptions: {
    value: [
      {
        column: units,
      },
    ],
    category: [gender, group, years],
  },
  styleOptions: {
    labels: {
      category: [{ enabled: true }, { enabled: false }, { enabled: true }],
    },
  },
});
