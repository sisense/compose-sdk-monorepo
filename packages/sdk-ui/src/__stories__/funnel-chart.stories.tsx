import { Chart } from '../chart';
import { FunnelStyleOptions } from '../types';
import { templateForComponent } from './template';

const template = templateForComponent(Chart);

export default {
  title: 'Charts/Categorical/Funnel',
  component: Chart,
  argTypes: {
    chartType: { options: ['funnel'] }, // prevents cartesian types from showing
  },
};

// WIDGET STYLES
const styleOptions: FunnelStyleOptions = {
  legend: {
    enabled: true,
    position: 'left',
  },
  seriesLabels: {
    showCategory: true,
    showPercentage: true,
    showPercentDecimals: true,
    enabled: true,
    showValue: true,
  },
  funnelDirection: 'regular',
};

const stage = {
  name: 'Stage',
  type: 'string',
};
const uniqueUsers = {
  name: 'Unique Users',
  aggregation: 'sum',
};

const dataSet = {
  columns: [
    { name: 'Stage', type: 'string' },
    { name: 'Unique Users', type: 'number' },
  ],
  rows: [
    ['Website visits', 15654],
    ['Downloads', 4064],
    ['Requested price list', 1987],
    ['Invoice sent', 976],
    ['Finalized', 846],
  ],
};

let funnelArgs = {
  chartType: 'funnel',
  dataSet,
  dataOptions: {
    value: [uniqueUsers],
    category: [stage],
  },
  styleOptions,
};

export const Regular = template({ ...funnelArgs, chartType: 'funnel' });

funnelArgs = {
  ...funnelArgs,
  styleOptions: {
    ...styleOptions,
    funnelType: 'pinched',
    funnelSize: 'narrow',
  },
};
export const NarrowSizePinchedType = template({
  ...funnelArgs,
  chartType: 'funnel',
});

funnelArgs = {
  ...funnelArgs,
  styleOptions: {
    ...styleOptions,
    funnelSize: 'wide',
    funnelDirection: 'inverted',
  },
};
export const WideSizeInvertedDirection = template({
  ...funnelArgs,
  chartType: 'funnel',
});

funnelArgs = {
  ...funnelArgs,
  styleOptions: {
    ...styleOptions,
    funnelDirection: 'regular',
    funnelType: 'pinched',
  },
};
export const PinchedType = template({
  ...funnelArgs,
  chartType: 'funnel',
});

export const WithDataLimits = template({
  ...funnelArgs,
  styleOptions: { ...styleOptions, dataLimits: { seriesCapacity: 3 } },
  chartType: 'funnel',
});
