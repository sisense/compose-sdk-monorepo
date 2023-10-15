/* eslint-disable max-lines */
import { Chart } from '../chart';
import { TreemapChartProps } from '../props';
import { TreemapStyleOptions } from '../types';
import { templateForComponent } from './template';

const template = templateForComponent(Chart);

export default {
  title: 'Charts/Categorical/Treemap',
  component: Chart,
  argTypes: {
    chartType: { options: ['treemap'] }, // prevents cartesian types from showing
  },
};

// WIDGET STYLES
const styleOptions: TreemapStyleOptions = {
  labels: {
    category: [
      {
        enabled: true,
      },
      {
        enabled: true,
      },
      {
        enabled: true,
      },
    ],
  },
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

const treemapArgs: TreemapChartProps = {
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

export const SingleCategory = template({ ...treemapArgs, chartType: 'treemap' });

export const TwoCategories = template({
  ...treemapArgs,
  chartType: 'treemap',
  dataOptions: {
    value: [
      {
        column: units,
      },
    ],
    category: [group, years],
  },
});

export const ThreeCategories = template({
  ...treemapArgs,
  chartType: 'treemap',
  dataOptions: {
    value: [
      {
        column: units,
      },
    ],
    category: [gender, group, years],
  },
});

export const WithColoring = template({
  ...treemapArgs,
  chartType: 'treemap',
  dataOptions: {
    value: [
      {
        column: units,
      },
    ],
    category: [gender, { column: group, isColored: true }, years],
  },
});

export const WithDisabledLabels = template({
  ...treemapArgs,
  chartType: 'treemap',
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
      category: [{ enabled: false }, { enabled: false }, { enabled: false }],
    },
  },
});

export const WithTooltipContributionMode = template({
  ...treemapArgs,
  chartType: 'treemap',
  dataOptions: {
    value: [
      {
        column: units,
      },
    ],
    category: [gender, group, years],
  },
  styleOptions: {
    tooltip: {
      mode: 'contribution',
    },
  },
});
