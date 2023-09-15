import { getScatterTooltipSettings, tooltipFormatter } from './scatter-tooltip';
import { ScatterChartDataOptionsInternal } from '../../chart-data-options/types';
import { InternalSeries } from '../tooltip';

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

    const expected = `Total Costs<br /><span style="fill:#FFF">10M</span><br /><br /><span style="fill:#FFF">0</span>`;

    expect(tooltip).toEqual(expected);
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
    } as InternalSeries;

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

    const expected = `Total Costs<br /><span style="fill:#FFF">10M</span><br />Category<br /><span style="fill:#FFF">Apple</span>`;

    expect(tooltip).toEqual(expected);
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

    const expected = `<br /><span style="fill:#FFF">0</span><br />Category<br /><span style="fill:#FFF">Apple</span>`;

    expect(tooltip).toEqual(expected);
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

    const expected = `Total Costs<br /><span style="fill:#FFF">10M</span><br />Category<br /><span style="fill:#FFF">Apple</span><br />Brand<br /><span style="fill:#FFF">Sisense</span>`;

    expect(tooltip).toEqual(expected);
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

    const expected = `Total Costs<br /><span style="fill:#FFF">10M</span><br />Category<br /><span style="fill:#FFF">Apple</span><br />Brand<br /><span style="fill:#FFF">Sisense</span><br />Total Costs<br /><span style="fill:#FFF">124</span>`;

    expect(tooltip).toEqual(expected);
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

    const expected = `Total Costs<br /><span style="fill:#FFF">10M</span><br />Category<br /><span style="fill:#FFF">Apple</span><br />Brand<br /><span style="fill:#FFF">Sisense</span><br />Brand<br /><span style="fill:#FFF">Google</span><br />Total Costs<br /><span style="fill:#FFF">124</span>`;

    expect(tooltip).toEqual(expected);
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

    const expected = `<br /><span style="fill:#FFF">10M</span><br /><br /><span style="fill:#FFF">Apple</span><br />Brand<br /><span style="fill:#FFF">Sisense</span>`;

    expect(tooltip).toEqual(expected);
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

    const expected = `<br /><span style="fill:#FFF">10M</span><br /><br /><span style="fill:#FFF">Apple</span><br />Brand<br /><span style="fill:#FFF">Sisense</span>`;

    expect(tooltip).toEqual(expected);
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

    const expected = `<br /><span style="fill:#FFF">10M</span><br /><br /><span style="fill:#FFF">Apple</span><br />Total Costs<br /><span style="fill:#FFF">10M</span>`;

    expect(tooltip).toEqual(expected);
  });
});
