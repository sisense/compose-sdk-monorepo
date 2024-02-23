import { getScatterTooltipSettings, tooltipFormatter } from './scatter-tooltip';
import { ScatterChartDataOptionsInternal } from '../../chart-data-options/types';
import { InternalSeries } from './tooltip-utils';
import { TooltipFormatterContextObject } from '@sisense/sisense-charts';
import type { NumberFormatConfig } from '@/types';

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
    } as InternalSeries;

    const dataOptions = {
      x: {
        name: 'Total Costs',
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
        name: 'Total Costs',
      },
      y: {
        name: 'Category',
      },
    } as ScatterChartDataOptionsInternal;

    const options = getScatterTooltipSettings(dataOptions);
    const tooltip = options.formatter?.call(tooltipContext);

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
    } as InternalSeries;

    const dataOptions = {
      y: {
        name: 'Category',
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
    } as InternalSeries;

    const dataOptions = {
      x: {
        name: 'Total Costs',
      },
      y: {
        name: 'Category',
      },
      breakByPoint: {
        name: 'Brand',
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
    } as InternalSeries;

    const dataOptions = {
      x: {
        name: 'Total Costs',
      },
      y: {
        name: 'Category',
      },
      breakByPoint: {
        name: 'Brand',
      },
      size: {
        name: 'Total Costs',
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
    } as InternalSeries;

    const dataOptions: ScatterChartDataOptionsInternal = {
      x: {
        name: 'Total Costs',
      },
      y: {
        name: 'Category',
      },
      breakByPoint: {
        name: 'Brand',
      },
      breakByColor: {
        name: 'Brand',
      },
      size: {
        name: 'Total Costs',
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
    } as InternalSeries;

    const dataOptions = {
      breakByPoint: {
        name: 'Brand',
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
    } as InternalSeries;

    const dataOptions = {
      breakByColor: {
        name: 'Brand',
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
    } as InternalSeries;

    const dataOptions = {
      size: {
        name: 'Total Costs',
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
  } as InternalSeries;

  const dataOptions: ScatterChartDataOptionsInternal = {
    x: {
      name: 'x',
      type: 'number',
      numberFormatConfig: format1,
    },
    y: {
      name: 'y',
      numberFormatConfig: format2,
    },
    breakByPoint: {
      name: 'p',
      type: 'number',
      numberFormatConfig: format3,
    },
    breakByColor: {
      name: 'c',
      type: 'number',
      numberFormatConfig: format3,
    },
    size: {
      name: 'x',
      numberFormatConfig: format3,
    },
  } as ScatterChartDataOptionsInternal;
  const tooltip = tooltipFormatter(tooltipContext, dataOptions);

  expect(tooltip).toMatchSnapshot();
});
