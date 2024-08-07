/** @vitest-environment jsdom */
import { fireEvent, render } from '@testing-library/react';
import { Chart } from '.';
import { HighchartsOptions } from '../chart-options-processor/chart-options-service';
import { IndicatorStyleOptions } from '../types';
import { Table } from '../table';
import { ThemeProvider } from '../theme-provider';
import { DataPointEventHandler, DataPointsEventHandler } from '../props';
import { Data } from '@sisense/sdk-data';
import { setTimeout } from 'timers/promises';

const dataSet = {
  columns: [
    { name: 'Years', type: 'date' },
    { name: 'Group', type: 'string' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
  ],
  rows: [
    ['2009', 'A', 6781, 10],
    ['2010', 'A', 4471, 70],
    ['2011', 'B', 1812, 50],
    ['2012', 'B', 5001, 60],
    ['2013', 'A', 2045, 40],
    ['2014', 'B', 3010, 90],
    ['2015', 'A', 5447, 80],
    ['2016', 'B', 4242, 70],
    ['2018', 'B', 936, 20],
  ],
};

const rangeDataSet: Data = {
  columns: [
    { name: 'Years', type: 'date' },
    { name: 'Group', type: 'string' },
    { name: 'Cost Upper', type: 'number' },
    { name: 'Cost Lower', type: 'number' },
    { name: 'Qty Upper', type: 'number' },
    { name: 'Qty Lower', type: 'number' },
  ],
  rows: [
    ['2009', 'A', 9000, 15, 20000, 12000],
    ['2010', 'A', 8500, 65, 19000, 12000],
    ['2011', 'C', 1500, 55, 18000, 13000],
    ['2012', 'C', 5300, 70, 22000, 13000],
    ['2013', 'A', 2200, 45, 23000, 11000],
    ['2014', 'A', 3200, 95, 24000, 11000],
    ['2015', 'C', 5800, 85, 20000, 15000],
    ['2016', 'C', 4400, 75, 19000, 10000],
    ['2017', 'A', 2900, 50, 22000, 15000],
    ['2018', 'C', 1100, 25, 24000, 14000],
  ],
};

const cat1 = {
  name: 'Years',
  type: 'date',
};

const cat2 = {
  name: 'Group',
  type: 'string',
};

const meas1 = {
  column: { name: 'Quantity', aggregation: 'sum' },
  showOnRightAxis: false,
};

const meas2 = {
  column: { name: 'Units', aggregation: 'sum' },
  showOnRightAxis: false,
};

const rangeMeas1Upper = {
  column: { name: 'Cost Upper', aggregation: 'sum' },
};

const rangeMeas1Lower = {
  column: { name: 'Cost Lower', aggregation: 'sum' },
};

const rangeMeas2Upper = {
  column: { name: 'Qty Upper', aggregation: 'sum' },
};

const rangeMeas2Lower = {
  column: { name: 'Qty Lower', aggregation: 'sum' },
};

describe('Chart', () => {
  it('change theme of a chart', async () => {
    const { findByLabelText } = render(
      <ThemeProvider
        theme={{
          chart: {
            textColor: 'red',
            secondaryTextColor: 'green',
            backgroundColor: 'blue',
            panelBackgroundColor: '#F6F6F6',
          },
        }}
      >
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options).toMatchSnapshot();
            return options;
          }}
        />
      </ThemeProvider>,
    );
    const chart = await findByLabelText('chart-root');
    expect(chart).toBeTruthy();
  });

  it('add handlers to a chart', async () => {
    const { findByLabelText } = render(
      <Chart
        dataSet={dataSet}
        chartType={'line'}
        dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
        onDataPointClick={vi.fn() as DataPointEventHandler}
        onDataPointContextMenu={vi.fn() as DataPointEventHandler}
        onDataPointsSelected={vi.fn() as DataPointsEventHandler}
      />,
    );
    const chart = await findByLabelText('chart-root');
    expect(chart).toBeTruthy();
  });

  it('render a line chart', async () => {
    const { findByLabelText } = render(
      <Chart
        dataSet={dataSet}
        chartType={'line'}
        dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );
    const chart = await findByLabelText('chart-root');
    expect(chart).toBeTruthy();
  });

  it('render a column chart with breakBy', async () => {
    const { findByLabelText } = render(
      <Chart
        dataSet={dataSet}
        chartType={'column'}
        dataOptions={{ category: [cat1], value: [meas1], breakBy: [cat2] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );
    const chart = await findByLabelText('chart-root');
    expect(chart).toBeTruthy();
  });

  it('render a bar chart with breakBy and two x-axes', async () => {
    const { findByLabelText } = render(
      <Chart
        dataSet={dataSet}
        chartType={'bar'}
        dataOptions={{ category: [cat1, cat2], value: [meas1, meas2], breakBy: [] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );
    const chart = await findByLabelText('chart-root');
    expect(chart).toBeTruthy();
  });

  it('render a line chart that has errors', async () => {
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    const { findByLabelText, findByText } = render(
      <Chart
        dataSet={dataSet}
        chartType={'line'}
        dataOptions={{
          category: [{ ...cat1, name: 'foo' }],
          value: [{ ...meas1, name: 'bar' }],
          breakBy: [],
        }}
      />,
    );

    const errorBoxContainer = await findByLabelText('error-box');
    fireEvent.mouseEnter(errorBoxContainer);
    const errorBoxText = await findByText(/Error/);
    expect(errorBoxText).toBeTruthy();

    spy.mockRestore();
  });

  /**
   * we prevent actual render because SVGTextElement is used in
   * `@sisense/sisense-charts` for pie chart rendering.
   * https://github.com/jsdom/jsdom/issues/3310
   * It is currently impossible to render pie-chart in the test environment.
   */
  describe('pie chart', () => {
    it('render pie chart with cat and value', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'pie'}
          dataOptions={{ category: [cat1], value: [meas1] }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options).toMatchSnapshot();
            return {};
          }}
        />,
      );
      const chart = await findByLabelText('chart-root');
      expect(chart).toBeTruthy();
    });

    it('render pie chart with two values', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'pie'}
          dataOptions={{ category: [], value: [meas1, meas2] }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options).toMatchSnapshot();
            return {};
          }}
        />,
      );
      const chart = await findByLabelText('chart-root');
      expect(chart).toBeTruthy();
    });
  });

  it('render indicator chart', async () => {
    const { container, findByLabelText } = render(
      <Chart
        dataSet={dataSet}
        chartType={'indicator'}
        dataOptions={{ value: [meas1], secondary: [meas2] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );
    const indicator = await findByLabelText('indicator-root');
    setTimeout(100);
    const canvas = container.querySelector('canvas');
    expect(indicator).toBeTruthy();
    expect(canvas).toBeTruthy();
  });

  it('render indicator gauge chart', async () => {
    const styleOptions: IndicatorStyleOptions = {
      subtype: 'indicator/gauge',
      skin: 1,
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
    const { container, findByLabelText } = render(
      <Chart
        dataSet={dataSet}
        chartType={'indicator'}
        dataOptions={{ value: [meas1], secondary: [meas2] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
        styleOptions={styleOptions}
      />,
    );
    const indicator = await findByLabelText('indicator-root');
    const canvas = container.querySelector('canvas');
    expect(indicator).toBeTruthy();
    expect(canvas).toBeTruthy();
  });

  it('render indicator numericBar chart', async () => {
    const styleOptions: IndicatorStyleOptions = {
      subtype: 'indicator/numeric',
      numericSubtype: 'numericBar',
    };
    const { container, findByLabelText } = render(
      <Chart
        dataSet={dataSet}
        chartType={'indicator'}
        dataOptions={{ value: [meas2], secondary: [meas2] }}
        styleOptions={styleOptions}
      />,
    );
    const indicator = await findByLabelText('indicator-root');
    const canvas = container.querySelector('canvas');
    expect(indicator).toBeTruthy();
    expect(canvas).toBeTruthy();
  });

  it('render Table', async () => {
    const { container, findByLabelText } = render(
      <Table dataSet={dataSet} dataOptions={{ columns: [cat1, cat2] }} />,
    );
    const table = await findByLabelText('table-root');
    expect(table).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('should show No Results overlay in Chart when data missing', async () => {
    const container = render(
      <Chart
        dataSet={{
          columns: dataSet.columns,
          rows: [],
        }}
        chartType={'line'}
        dataOptions={{
          category: [cat1],
          value: [meas1],
          breakBy: [],
        }}
      />,
    );
    const overlayTitle = await container.findByText('No Results');
    expect(overlayTitle).toBeTruthy();
  });

  it('should show No Results overlay in Table when data missing', async () => {
    const container = render(
      <Table
        dataSet={{
          columns: dataSet.columns,
          rows: [],
        }}
        dataOptions={{
          columns: [cat1],
        }}
      />,
    );
    const overlayTitle = await container.findByText('No Results');
    expect(overlayTitle).toBeTruthy();
  });

  describe('range charts', () => {
    it('render a area range chart two y and two x', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={rangeDataSet}
          chartType={'arearange'}
          dataOptions={{
            category: [cat1, cat2],
            value: [
              {
                title: 'Revenue',
                upperBound: rangeMeas1Upper.column,
                lowerBound: rangeMeas1Lower.column,
              },
              {
                title: 'Cost',
                upperBound: rangeMeas2Upper.column,
                lowerBound: rangeMeas2Lower.column,
                showOnRightAxis: true,
              },
            ],
            breakBy: [],
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options).toMatchSnapshot();
            return options;
          }}
        />,
      );
      const chart = await findByLabelText('chart-root');
      expect(chart).toBeTruthy();
    });
    it('render a area range chart with break by', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={rangeDataSet}
          chartType={'arearange'}
          dataOptions={{
            category: [cat1],
            value: [
              {
                title: 'Revenue',
                upperBound: rangeMeas1Upper.column,
                lowerBound: rangeMeas1Lower.column,
              },
            ],
            breakBy: [cat2],
            seriesToColorMap: { A: 'red', B: 'blue', C: 'green' },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options).toMatchSnapshot();
            return options;
          }}
        />,
      );
      const chart = await findByLabelText('chart-root');
      expect(chart).toBeTruthy();
    });
  });
});
