/* eslint-disable max-lines */
import { Chart } from '../chart';
import { ChartStyleOptions } from '../types';
import { templateForComponent } from './template';

const template = templateForComponent(Chart);

export default {
  title: 'Charts/Scattermap',
  component: Chart,
  argTypes: {
    chartType: { options: ['scattermap'] },
  },
};

const styleOptions: ChartStyleOptions = {
  markers: {
    fill: 'filled',
    size: {
      defaultSize: 10,
      minSize: 5,
      maxSize: 15,
    },
  },
};

const cat1 = {
  name: 'Country',
  type: 'string',
};

const cat2 = {
  name: 'Lat',
  type: 'number',
};

const cat3 = {
  name: 'Lng',
  type: 'number',
};

const meas1 = { name: 'Quantity', aggregation: 'sum' };

const meas3 = { name: 'Amount', aggregation: 'sum' };

const dataSet = {
  columns: [
    { name: 'Country', type: 'string' },
    { name: 'Lat', type: 'number' },
    { name: 'Lng', type: 'number' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
    { name: 'Amount', type: 'number' },
  ],
  rows: [
    ['Canada', 55.5859012851966, -105.750595856519, 6781, 10, 200],
    ['USA', 37.201902, -113.187854, 4012, 15, 250],
    ['Albania', 40.641089555859, 20.1566908111252, 4471, 70, 300],
    ['Algeria', 28.1632395923063, 2.63238813336793, 1812, 50, 150],
    ['Argentina', -36.252002, -63.954193, 5001, 60, 250],
    ['Bermuda', 32.3179203152518, -64.7370103996652, 4001, 65, 255],
    ['Kyrgyzstan', 41.465053955426, 74.5555962804371, 4242, 70, 20],
    ['Ukraine', 49.3227937844972, 31.3202829593814, 936, 20, 30],
  ],
};

const scattermapArgs = {
  dataSet,
  dataOptions: {
    geo: [cat1],
    size: meas1,
  },
  styleOptions,
};

export const ScattermapBaseSetup = template({
  ...scattermapArgs,
  chartType: 'scattermap',
});

export const ScattermapWithRangeColor = template({
  ...scattermapArgs,
  dataOptions: {
    ...scattermapArgs.dataOptions,
    colorBy: {
      column: meas3,
      color: {
        type: 'range',
        minColor: 'green',
        maxColor: 'red',
      },
    },
  },
  chartType: 'scattermap',
});

export const ScattermapWithLatLngCategories = template({
  ...scattermapArgs,
  dataOptions: {
    ...scattermapArgs.dataOptions,
    geo: [cat2, cat3],
  },
  chartType: 'scattermap',
});
