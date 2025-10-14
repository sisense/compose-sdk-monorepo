import type { NumberFormatConfig } from '@/types';

import { CartesianChartDataOptionsInternal } from '../../chart-data-options/types';
import { getCartesianTooltipSettings } from './tooltip';
import { HighchartsDataPointContext } from './tooltip-utils';

const format1: NumberFormatConfig = {
  name: 'Currency',
  symbol: '$',
  decimalScale: 2,
};
const format2: NumberFormatConfig = {
  name: 'Currency',
  symbol: '!',
  decimalScale: 3,
};
const format3: NumberFormatConfig = {
  name: 'Currency',
  symbol: '@',
  decimalScale: 4,
};

const dataOptions: CartesianChartDataOptionsInternal = {
  x: [
    { column: { name: 'x1', type: 'number' }, numberFormatConfig: format1 },
    { column: { name: 'x2', type: 'number' }, numberFormatConfig: format2 },
  ],
  y: [{ column: { title: 'v', name: 'v' }, numberFormatConfig: format3, enabled: true }],
  breakBy: [{ column: { name: 'b', type: 'number' } }],
};

it('should display cartesian tooltip for point', () => {
  const point: HighchartsDataPointContext = {
    series: { name: '3.14', color: 'red' },
    x: '1.25905',
    y: 42.0009,
    point: {
      x: 1,
      y: 42.0009,
      name: '3.14',
      color: 'red',
      custom: { xValue: [9.8765, 1.25905] },
    },
  };

  const seriesPoint = { ...point, ...getCartesianTooltipSettings(dataOptions) };
  const tooltip = seriesPoint.formatter ? seriesPoint.formatter() : null;
  expect(tooltip).toMatchSnapshot();
});

it('should display pie tooltip for point', () => {
  const point: HighchartsDataPointContext = {
    series: { name: '3.14', color: 'red' },
    x: '',
    y: 42.0009,
    percentage: 20,
    point: {
      y: 42.0009,
      name: '3.14',
      color: 'red',
      custom: {},
    },
  };

  const seriesPoint = {
    ...point,
    ...getCartesianTooltipSettings({ ...dataOptions, breakBy: [dataOptions.x[0]] }),
  };
  const tooltip = seriesPoint.formatter ? seriesPoint.formatter() : null;
  expect(tooltip).toMatchSnapshot();
});

it('should not contain percent for unsupported column', () => {
  const point: HighchartsDataPointContext = {
    series: { name: '3.14', color: 'red' },
    x: '',
    y: 42.0009,
    percentage: 20,
    point: {
      y: 42.0009,
      name: '3.14',
      color: 'red',
      custom: {},
    },
  };

  const seriesPoint = {
    ...point,
    ...getCartesianTooltipSettings({
      ...dataOptions,
      y: [{ ...dataOptions.y[0], chartType: 'line' }],
    }),
  };
  const tooltip = seriesPoint.formatter ? seriesPoint.formatter() : null;
  expect(tooltip).toMatchSnapshot();
});
