import type { NumberFormatConfig } from '@/types';
import { CartesianChartDataOptionsInternal } from '../../chart-data-options/types';
import { getTooltipSettings } from './tooltip';
import { InternalSeries } from './tooltip-utils';

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
    { name: 'x1', type: 'number', numberFormatConfig: format1 },
    { name: 'x2', type: 'number', numberFormatConfig: format2 },
  ],
  y: [{ title: 'v', name: 'v', numberFormatConfig: format3, enabled: true }],
  breakBy: [{ name: 'b', type: 'number' }],
};

it('should display cartesian tooltip for point', () => {
  const point: InternalSeries = {
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

  const seriesPoint = { ...point, ...getTooltipSettings(false, dataOptions) };
  const tooltip = seriesPoint.formatter ? seriesPoint.formatter() : null;
  expect(tooltip).toMatchSnapshot();
});

it('should display pie tooltip for point', () => {
  const point: InternalSeries = {
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
    ...getTooltipSettings(false, { ...dataOptions, breakBy: [dataOptions.x[0]] }),
  };
  const tooltip = seriesPoint.formatter ? seriesPoint.formatter() : null;
  expect(tooltip).toMatchSnapshot();
});
