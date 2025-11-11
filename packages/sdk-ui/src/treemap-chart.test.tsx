import type { Data } from '@sisense/sdk-data';
import { render } from '@testing-library/react';

import { HighchartsOptions } from './chart-options-processor/chart-options-service';
import { TreemapChart } from './treemap-chart';

// Mocks highcharts to prevent internal `sisense-charts` related error in testing environment
vi.mock('highcharts-react-official', async () => {
  const { MockedHighchartsReact }: typeof import('./__test-helpers__') = await vi.importActual(
    './__test-helpers__',
  );
  return {
    default: MockedHighchartsReact,
  };
});

const dataSet: Data = {
  columns: [
    { name: 'Gender', type: 'string' },
    { name: 'Years', type: 'date' },
    { name: 'Group', type: 'string' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
  ],
  rows: [
    ['Male', '2009', 'A', 6781, 10],
    ['Male', '2010', 'A', 4471, 70],
    ['Male', '2011', 'B', 1812, 50],
    ['Male', '2012', 'B', 5001, 60],
    ['Female', '2009', 'A', 1322, 10],
    ['Female', '2010', 'A', 2343, 70],
    ['Female', '2011', 'B', 1244, 50],
    ['Female', '2012', 'B', 3422, 60],
    ['Male', '2013', 'A', 2045, 40],
    ['Male', '2014', 'B', 3010, 90],
    ['Male', '2015', 'A', 5447, 80],
    ['Male', '2016', 'B', 4242, 70],
    ['Male', '2018', 'B', 936, 20],
  ],
};

const withBlurredRows = (data: Data, rowsIndexes: number[]) => ({
  ...data,
  rows: data.rows.map((row, rowIndex) =>
    row.map((cell) => (rowsIndexes.includes(rowIndex) ? { data: cell, blur: true } : cell)),
  ),
});

const cat1 = {
  name: 'Years',
  type: 'date',
};

const cat2 = {
  name: 'Group',
  type: 'string',
};

const cat3 = {
  name: 'Gender',
  type: 'string',
};

const meas1 = {
  column: { name: 'Quantity', aggregation: 'sum' },
  showOnRightAxis: false,
};

describe('Treemap Chart', () => {
  it('render a treemap with single category', async () => {
    let highchartsOptions: HighchartsOptions | undefined;
    const { findByLabelText } = render(
      <TreemapChart
        dataSet={dataSet}
        dataOptions={{ category: [cat1], value: [meas1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          highchartsOptions = options;
          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
    expect(highchartsOptions).toMatchSnapshot();
  });

  it('render a treemap with two categories', async () => {
    let highchartsOptions: HighchartsOptions | undefined;
    const { findByLabelText } = render(
      <TreemapChart
        dataSet={dataSet}
        dataOptions={{ category: [cat1, cat2], value: [meas1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          highchartsOptions = options;
          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
    expect(highchartsOptions).toMatchSnapshot();
  });

  it('render a treemap with three categories', async () => {
    let highchartsOptions: HighchartsOptions | undefined;
    const { findByLabelText } = render(
      <TreemapChart
        dataSet={dataSet}
        dataOptions={{ category: [cat1, cat2, cat3], value: [meas1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          highchartsOptions = options;
          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
    expect(highchartsOptions).toMatchSnapshot();
  });

  it('render a treemap with coloring', async () => {
    let highchartsOptions: HighchartsOptions | undefined;
    const { findByLabelText } = render(
      <TreemapChart
        dataSet={dataSet}
        dataOptions={{ category: [cat1, { column: cat2, isColored: true }, cat3], value: [meas1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          highchartsOptions = options;
          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
    expect(highchartsOptions).toMatchSnapshot();
  });
  it('render a treemap with highlights', async () => {
    let highchartsOptions: HighchartsOptions | undefined;
    const { findByLabelText } = render(
      <TreemapChart
        dataSet={withBlurredRows(dataSet, [0, 1, 2, 3, 4])}
        dataOptions={{ category: [cat1, { column: cat2 }, cat3], value: [meas1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          highchartsOptions = options;
          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
    expect(highchartsOptions).toMatchSnapshot();
  });
});
