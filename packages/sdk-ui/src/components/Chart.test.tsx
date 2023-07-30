/* eslint-disable jest/expect-expect */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { fireEvent, render } from '@testing-library/react';
import { Chart } from './Chart';
import { HighchartsOptions } from '../chart-options-processor/chart_options_service';
import { DAYS, JAN, MON } from '../query/date-formats/apply_date_format';
import { IndicatorStyleOptions } from '../types';
import { Table } from './Table';
import { ThemeProvider } from './ThemeProvider';

jest.mock('./HighchartsWrapper', () => {
  return {
    HighchartsWrapper: ({ options }: { options: object }) => {
      return <div>{JSON.stringify(options)}</div>;
    },
  };
});

jest.mock('./SisenseContextProvider', () => {
  return {
    useSisenseContext: () => ({
      app: {
        appConfig: {
          dateConfig: {
            weekFirstDay: MON,
            isFiscalOn: false,
            fiscalMonth: JAN,
            selectedDateLevel: DAYS,
            timeZone: 'UTC',
          },
          local: 'en-US',
        },
      },
    }),
  };
});

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

it('change theme of a chart', () => {
  render(
    <ThemeProvider
      theme={{
        chart: {
          textColor: 'red',
          secondaryTextColor: 'green',
          backgroundColor: 'blue',
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
});

it('add handlers to a chart', () => {
  render(
    <Chart
      dataSet={dataSet}
      chartType={'line'}
      dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
      onBeforeRender={(options: HighchartsOptions) => {
        expect(options).toMatchSnapshot();
        return options;
      }}
      onDataPointClick={jest.fn()}
      onDataPointContextMenu={jest.fn()}
      onDataPointsSelected={jest.fn()}
    />,
  );
});

it('render a line chart', () => {
  render(
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
});

it('render a columm chart with breakBy', () => {
  render(
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
});

it('render a bar chart with breakBy and two x-axes', () => {
  render(
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
});

it('render a line chart that has errors', () => {
  const spy = jest.spyOn(console, 'error');
  spy.mockImplementation(() => {});

  const { container } = render(
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
  const errorBoxContainer = container.querySelector('.container') || container;
  fireEvent.mouseEnter(errorBoxContainer);
  expect(errorBoxContainer).toMatchSnapshot();

  spy.mockRestore();
});

it('render pie chart', () => {
  render(
    <Chart
      dataSet={dataSet}
      chartType={'pie'}
      dataOptions={{ category: [cat1], value: [meas1] }}
      onBeforeRender={(options: HighchartsOptions) => {
        expect(options).toMatchSnapshot();
        return options;
      }}
    />,
  );
});

it('render indicator chart', () => {
  const { container } = render(
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
  expect(container).toMatchSnapshot();
});

it('render indicator gauge chart', () => {
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
  const { container } = render(
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
  expect(container).toMatchSnapshot();
});

it('render indicator numericBar chart', () => {
  const styleOptions: IndicatorStyleOptions = {
    subtype: 'indicator/numeric',
    numericSubtype: 'numericBar',
  };
  const { container } = render(
    <Chart
      dataSet={dataSet}
      chartType={'indicator'}
      dataOptions={{ value: [meas2], secondary: [meas2] }}
      styleOptions={styleOptions}
    />,
  );
  expect(container).toMatchSnapshot();
});

it('render Table', () => {
  const { container } = render(<Table dataSet={dataSet} dataOptions={{ columns: [cat1, cat2] }} />);
  expect(container).toMatchSnapshot();
});
