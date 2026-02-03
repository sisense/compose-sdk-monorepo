import { Data } from '@sisense/sdk-data';

import { withBlurredRows } from '../__test-helpers__';
import { Chart } from '../domains/visualizations/components/chart';
import { BoxplotChartProps } from '../props';
import { BoxplotStyleOptions } from '../types';
import { templateForComponent } from './template';

const template = templateForComponent(Chart);

export default {
  title: 'Charts/Boxplot',
  component: Chart,
  argTypes: {
    chartType: { options: ['boxplot'] },
  },
};

const styleOptions: BoxplotStyleOptions = {
  legend: {
    enabled: true,
    position: 'bottom',
  },
  navigator: {
    enabled: true,
  },
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
  seriesLabels: {
    enabled: true,
  },
};

const dataSet: Data = {
  columns: [
    {
      name: 'Category',
      type: 'text',
    },
    {
      name: 'Box Min',
      type: 'number',
    },
    {
      name: 'Box Median',
      type: 'number',
    },
    {
      name: 'Box Max',
      type: 'number',
    },
    {
      name: 'Whisker Min',
      type: 'number',
    },
    {
      name: 'Whisker Max',
      type: 'number',
    },
    {
      name: 'Outlier Count',
      type: 'number',
    },
    {
      name: 'Cost (Outliers)',
      type: 'number',
    },
  ],
  rows: [
    [
      'Apple Mac Desktops',
      168.3239288330078,
      335.3749694824219,
      577.9123840332031,
      -446.05875396728516,
      1192.295066833496,
      2,
      '1232.0960693359375,1408.0069580078125',
    ],
    [
      'Apple Mac Laptops',
      153.461296081543,
      281.7227478027344,
      559.2744293212891,
      -455.2584037780761,
      1167.9941291809082,
      3,
      '1181.6976318359375,1200,1222.219970703125',
    ],
  ],
};

const [
  category,
  boxMinValue,
  boxMedianValue,
  boxMaxValue,
  whiskerMinValue,
  whiskerMaxValue,
  outlierCount,
  outlierValue,
] = dataSet.columns;

const costValue = {
  name: 'Cost',
  type: 'number',
  // having mocked jaql method in order to allow generating iternal formulas
  jaql: () => ({}),
};

const boxplotArgs: BoxplotChartProps = {
  dataSet,
  dataOptions: {
    category: [category],
    value: [costValue],
    boxType: 'iqr',
  },
  styleOptions,
};

const customBoxplotArgs: BoxplotChartProps = {
  dataSet,
  dataOptions: {
    category: [category],
    value: [
      boxMinValue,
      boxMedianValue,
      boxMaxValue,
      whiskerMinValue,
      whiskerMaxValue,
      outlierCount,
    ],
    valueTitle: 'Cost',
  },
  styleOptions,
};

export const Boxplot = template({
  chartType: 'boxplot',
  ...boxplotArgs,
});

export const BoxplotWithCustomDataOptions = template({
  chartType: 'boxplot',
  ...customBoxplotArgs,
});

export const BoxplotWithOutliers = template({
  chartType: 'boxplot',
  ...boxplotArgs,
  dataOptions: {
    ...boxplotArgs.dataOptions,
    outliersEnabled: true,
  },
});

export const BoxplotWithCustomDataOptionsAndOutliers = template({
  chartType: 'boxplot',
  ...customBoxplotArgs,
  dataOptions: {
    ...boxplotArgs.dataOptions,
    outliers: [outlierValue],
  },
});

export const BoxplotTypeHollow = template({
  chartType: 'boxplot',
  ...boxplotArgs,
  styleOptions: {
    ...boxplotArgs.styleOptions,
    subtype: 'boxplot/hollow',
  },
});

export const BoxplotWithBlur = template({
  chartType: 'boxplot',
  ...boxplotArgs,
  dataSet: withBlurredRows(dataSet, [1]),
  dataOptions: {
    ...boxplotArgs.dataOptions,
    outliersEnabled: true,
  },
});
