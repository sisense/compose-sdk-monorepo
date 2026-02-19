import { TooltipFormatterContextObject } from '@sisense/sisense-charts';

import type { NumberFormatConfig } from '@/types';

import { ScatterChartDataOptionsInternal } from '../../chart-data-options/types';
import { getScatterTooltipSettings, tooltipFormatter } from './scatter-tooltip.js';
import { HighchartsDataPointContext } from './tooltip-utils.js';

describe('Scatter tooltip', () => {
  it('should be enabled', () => {
    const options = getScatterTooltipSettings({});
    expect(options.enabled).toBe(true);
  });

  it('When only x-axis', () => {
    const tooltipContext = {
      series: { name: 'test', color: '#FFF' },
      x: '1',
      y: 1,
      point: {
        name: 'test',
        color: '#FFF',
        custom: {
          maskedX: '10M',
          maskedY: '0',
        },
      },
    } as HighchartsDataPointContext;

    const dataOptions = {
      x: {
        column: {
          name: 'Total Costs',
        },
      },
    } as ScatterChartDataOptionsInternal;

    const tooltip = tooltipFormatter(tooltipContext, dataOptions);

    expect(tooltip).toMatchSnapshot();
  });

  it('When x-axis and y-axis (call through options)', () => {
    const tooltipContext = {
      series: { name: 'test', color: '#FFF' },
      x: '1',
      y: 1,
      point: {
        name: 'test',
        color: '#FFF',
        custom: {
          maskedX: '10M',
          maskedY: 'Apple',
        },
      },
    } as unknown as TooltipFormatterContextObject;

    const dataOptions = {
      x: {
        column: {
          name: 'Total Costs',
        },
      },
      y: {
        column: {
          name: 'Category',
        },
      },
    } as ScatterChartDataOptionsInternal;

    const options = getScatterTooltipSettings(dataOptions);
    const tooltip = options.formatter?.call(
      tooltipContext as unknown as HighchartsDataPointContext,
    );

    expect(tooltip).toMatchSnapshot();
  });

  it('When only y-axis', () => {
    const tooltipContext = {
      series: { name: 'test', color: '#FFF' },
      x: '1',
      y: 1,
      point: {
        name: 'test',
        color: '#FFF',
        custom: {
          maskedX: '0',
          maskedY: 'Apple',
        },
      },
    } as HighchartsDataPointContext;

    const dataOptions = {
      y: {
        column: { name: 'Category' },
      },
    } as ScatterChartDataOptionsInternal;
    const tooltip = tooltipFormatter(tooltipContext, dataOptions);

    expect(tooltip).toMatchSnapshot();
  });

  it('When x-axis, y-axis and break by / point', () => {
    const tooltipContext = {
      series: { name: 'test', color: '#FFF' },
      x: '1',
      y: 1,
      point: {
        name: 'test',
        color: '#FFF',
        custom: {
          maskedX: '10M',
          maskedY: 'Apple',
          maskedBreakByPoint: 'Sisense',
        },
      },
    } as HighchartsDataPointContext;

    const dataOptions = {
      x: {
        column: { name: 'Total Costs' },
      },
      y: {
        column: { name: 'Category' },
      },
      breakByPoint: {
        column: { name: 'Brand' },
      },
    } as ScatterChartDataOptionsInternal;
    const tooltip = tooltipFormatter(tooltipContext, dataOptions);

    expect(tooltip).toMatchSnapshot();
  });

  it('When x-axis, y-axis, break by / point and size', () => {
    const tooltipContext = {
      series: { name: 'test', color: '#FFF' },
      x: '1',
      y: 1,
      point: {
        name: 'test',
        color: '#FFF',
        custom: {
          maskedX: '10M',
          maskedY: 'Apple',
          maskedBreakByPoint: 'Sisense',
          maskedSize: '124',
        },
      },
    } as HighchartsDataPointContext;

    const dataOptions = {
      x: {
        column: { name: 'Total Costs' },
      },
      y: {
        column: { name: 'Category' },
      },
      breakByPoint: {
        column: { name: 'Brand' },
      },
      size: {
        column: { name: 'Total Costs' },
      },
    } as ScatterChartDataOptionsInternal;
    const tooltip = tooltipFormatter(tooltipContext, dataOptions);

    expect(tooltip).toMatchSnapshot();
  });

  it('When x-axis, y-axis, break by / point, color, and size', () => {
    const tooltipContext = {
      series: { name: 'test', color: '#FFF' },
      x: '1',
      y: 1,
      point: {
        name: 'test',
        color: '#FFF',
        custom: {
          maskedX: '10M',
          maskedY: 'Apple',
          maskedBreakByPoint: 'Sisense',
          maskedBreakByColor: 'Google',
          maskedSize: '124',
        },
      },
    } as HighchartsDataPointContext;

    const dataOptions: ScatterChartDataOptionsInternal = {
      x: {
        column: { name: 'Total Costs' },
      },
      y: {
        column: { name: 'Category' },
      },
      breakByPoint: {
        column: { name: 'Brand' },
      },
      breakByColor: {
        column: { name: 'Brand' },
      },
      size: {
        column: { name: 'Total Costs' },
      },
    } as ScatterChartDataOptionsInternal;
    const tooltip = tooltipFormatter(tooltipContext, dataOptions);

    expect(tooltip).toMatchSnapshot();
  });

  it('When only break by / point', () => {
    const tooltipContext = {
      series: { name: 'test', color: '#FFF' },
      x: '1',
      y: 1,
      point: {
        name: 'test',
        color: '#FFF',
        custom: {
          maskedX: '10M',
          maskedY: 'Apple',
          maskedBreakByPoint: 'Sisense',
        },
      },
    } as HighchartsDataPointContext;

    const dataOptions = {
      breakByPoint: {
        column: { name: 'Brand' },
      },
    } as ScatterChartDataOptionsInternal;
    const tooltip = tooltipFormatter(tooltipContext, dataOptions);

    expect(tooltip).toMatchSnapshot();
  });

  it('When only break by / color', () => {
    const tooltipContext = {
      series: { name: 'test', color: '#FFF' },
      x: '1',
      y: 1,
      point: {
        name: 'test',
        color: '#FFF',
        custom: {
          maskedX: '10M',
          maskedY: 'Apple',
          maskedBreakByColor: 'Sisense',
        },
      },
    } as HighchartsDataPointContext;

    const dataOptions = {
      breakByColor: {
        column: { name: 'Brand' },
      },
    } as ScatterChartDataOptionsInternal;
    const tooltip = tooltipFormatter(tooltipContext, dataOptions);

    expect(tooltip).toMatchSnapshot();
  });

  it('When only size', () => {
    const tooltipContext = {
      series: { name: 'test', color: '#FFF' },
      x: '1',
      y: 1,
      point: {
        name: 'test',
        color: '#FFF',
        custom: {
          maskedX: '10M',
          maskedY: 'Apple',
          maskedSize: '10M',
        },
      },
    } as HighchartsDataPointContext;

    const dataOptions = {
      size: {
        column: { name: 'Total Costs' },
      },
    } as ScatterChartDataOptionsInternal;
    const tooltip = tooltipFormatter(tooltipContext, dataOptions);

    expect(tooltip).toMatchSnapshot();
  });
});

it('Format numbers when x-axis, y-axis, break by / point, color, and size', () => {
  const format1: NumberFormatConfig = {
    name: 'Currency',
    symbol: '$',
    decimalScale: 1,
  };
  const format2: NumberFormatConfig = {
    name: 'Currency',
    symbol: '!',
    decimalScale: 1,
  };
  const format3: NumberFormatConfig = {
    name: 'Currency',
    symbol: '@',
    decimalScale: 1,
  };

  const tooltipContext = {
    series: { name: '3.14', color: '#FFF' },
    x: '22.10009',
    y: 2.234567,
    point: {
      name: '3.14',
      color: '#FFF',
      x: '22.10009',
      y: 2.234567,
      z: 12.345678,
      custom: {
        maskedX: '10M',
        maskedY: 'Apple',
        maskedBreakByPoint: '13.57976',
        maskedBreakByColor: '3.1456',
        maskedSize: '12.345678',
      },
    },
  } as HighchartsDataPointContext;

  const dataOptions: ScatterChartDataOptionsInternal = {
    x: {
      column: {
        name: 'x',
        type: 'number',
      },
      numberFormatConfig: format1,
    },
    y: {
      column: { name: 'y' },
      numberFormatConfig: format2,
    },
    breakByPoint: {
      column: {
        name: 'p',
        type: 'number',
      },
      numberFormatConfig: format3,
    },
    breakByColor: {
      column: {
        name: 'c',
        type: 'number',
      },
      numberFormatConfig: format3,
    },
    size: {
      column: {
        name: 'x',
      },
      numberFormatConfig: format3,
    },
  } as ScatterChartDataOptionsInternal;
  const tooltip = tooltipFormatter(tooltipContext, dataOptions);

  expect(tooltip).toMatchSnapshot();
});
