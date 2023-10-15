/* eslint-disable max-lines */
/* eslint-disable sonarjs/no-duplicate-string */
import { Data } from '@sisense/sdk-data';
import { IndicatorDataOptions } from '../chart-data-options/types';
import { Chart } from '../chart';
import { IndicatorChart } from '../indicator-chart';
import { IndicatorStyleOptions, NumberFormatConfig } from '../types';
import { templateForComponent } from './template';
const template = templateForComponent(Chart);

export default {
  title: 'Charts/Indicator',
  component: IndicatorChart,
};

const indicatorData: Data = {
  columns: [
    {
      name: 'Total Cost',
      type: 'number',
    },
    {
      name: 'Total Revenue',
      type: 'number',
    },
    {
      name: 'min',
      type: 'number',
    },
    {
      name: 'max',
      type: 'number',
    },
  ],
  rows: [[107.27, 38.76, 0, 255]],
};

const indicatorDataOptions: IndicatorDataOptions = {
  value: [
    {
      name: 'Total Cost',
      aggregation: 'sum',
    },
  ],
  secondary: [
    {
      name: 'Total Revenue',
      aggregation: 'sum',
    },
  ],
  min: [{ name: 'min' }],
  max: [{ name: 'max' }],
};

const basicStyleOptions: Partial<IndicatorStyleOptions> = {
  indicatorComponents: {
    title: {
      shouldBeShown: true,
      text: 'Total Cost',
    },
    secondaryTitle: {
      text: 'Total Revenue',
    },
    ticks: {
      shouldBeShown: true,
    },
    labels: {
      shouldBeShown: true,
    },
  },
};

const indicatorProps = {
  dataSet: indicatorData,
  dataOptions: indicatorDataOptions,
  styleOptions: basicStyleOptions,
};

export const simpleVerticalNumericIndicator = template({
  chartType: 'indicator',
  ...indicatorProps,
  styleOptions: {
    ...basicStyleOptions,
    subtype: 'indicator/numeric',
    numericSubtype: 'numericSimple',
    skin: 'vertical',
  },
});

const customNumberFormat: NumberFormatConfig = {
  name: 'Percent',
  decimalScale: 3,
  trillion: true,
  billion: true,
  million: true,
  kilo: true,
  thousandSeparator: true,
  prefix: true,
  symbol: '',
};

export const simpleVerticalNumericIndicatorWithCustomNumberFormatting = template({
  chartType: 'indicator',
  ...indicatorProps,
  styleOptions: {
    ...basicStyleOptions,
    subtype: 'indicator/numeric',
    numericSubtype: 'numericSimple',
    skin: 'vertical',
  },
  dataOptions: {
    ...indicatorDataOptions,
    value: [
      {
        ...indicatorDataOptions.value![0],
        numberFormatConfig: customNumberFormat,
      },
    ],
  },
});

export const simpleHorizontalNumericIndicator = template({
  chartType: 'indicator',
  ...indicatorProps,
  styleOptions: {
    ...basicStyleOptions,
    subtype: 'indicator/numeric',
    numericSubtype: 'numericSimple',
    skin: 'horizontal',
  },
});

export const barNumericIndicator = template({
  chartType: 'indicator',
  ...indicatorProps,
  styleOptions: {
    ...basicStyleOptions,
    subtype: 'indicator/numeric',
    numericSubtype: 'numericBar',
  },
});

export const thinGaugeIndicator = template({
  chartType: 'indicator',
  ...indicatorProps,
  styleOptions: {
    ...basicStyleOptions,
    subtype: 'indicator/gauge',
    skin: 2,
  },
});

export const thickGaugeIndicator = template({
  chartType: 'indicator',
  ...indicatorProps,
  styleOptions: {
    ...basicStyleOptions,
    subtype: 'indicator/gauge',
    skin: 1,
  },
});

export const numericIndicatorWithStringColorOptions = template({
  chartType: 'indicator',
  ...indicatorProps,
  dataOptions: {
    ...indicatorProps.dataOptions,
    value: [{ ...indicatorProps.dataOptions.value![0], color: 'red' }],
  },
  styleOptions: {
    ...basicStyleOptions,
    subtype: 'indicator/numeric',
    numericSubtype: 'numericSimple',
    skin: 'vertical',
  },
});

export const numericIndicatorWithUniformColorOptions = template({
  chartType: 'indicator',
  ...indicatorProps,
  dataOptions: {
    ...indicatorProps.dataOptions,
    value: [{ ...indicatorProps.dataOptions.value![0], color: { type: 'uniform', color: 'blue' } }],
  },
  styleOptions: {
    ...basicStyleOptions,
    subtype: 'indicator/numeric',
    numericSubtype: 'numericSimple',
    skin: 'vertical',
  },
});

export const numericIndicatorWithConditionalColorOptions = template({
  chartType: 'indicator',
  ...indicatorProps,
  dataOptions: {
    ...indicatorProps.dataOptions,
    value: [
      {
        ...indicatorProps.dataOptions.value![0],
        color: {
          type: 'conditional',
          conditions: [
            {
              color: 'purple',
              expression: '50',
              operator: '>',
            },
          ],
          defaultColor: 'green',
        },
      },
    ],
  },
  styleOptions: {
    ...basicStyleOptions,
    subtype: 'indicator/numeric',
    numericSubtype: 'numericSimple',
    skin: 'vertical',
  },
});
