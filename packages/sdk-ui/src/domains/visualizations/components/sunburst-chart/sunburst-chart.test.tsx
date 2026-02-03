import { render } from '@testing-library/react';

import { HighchartsOptions } from '../../core/chart-options-processor/chart-options-service';
import { HighchartsSeriesValues } from '../../core/chart-options-processor/translations/translations-to-highcharts';
import { SunburstChart } from './sunburst-chart';

const dataSet = {
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

describe('Sunburst Chart', () => {
  it('render a sunburst with single category', async () => {
    const { findByLabelText } = render(
      <SunburstChart
        dataSet={dataSet}
        dataOptions={{ category: [cat1], value: [meas1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });

  it('render a sunburst with two categories', async () => {
    const { findByLabelText } = render(
      <SunburstChart
        dataSet={dataSet}
        dataOptions={{ category: [cat1, cat2], value: [meas1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });

  it('render a sunburst with two categories and legend', async () => {
    const { findByLabelText } = render(
      <SunburstChart
        dataSet={dataSet}
        dataOptions={{ category: [cat1, cat2], value: [meas1] }}
        styleOptions={{
          legend: {
            enabled: true,
            position: 'bottom',
          },
        }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });

  it('render a sunburst with series coloring', async () => {
    const { findByLabelText } = render(
      <SunburstChart
        dataSet={dataSet}
        dataOptions={{
          category: [cat1, cat2],
          value: [meas1],
          seriesToColorMap: {
            Years: {
              '2009': 'red',
            },
            Group: {
              B: 'green',
            },
          },
        }}
        onBeforeRender={(options: HighchartsOptions) => {
          const items2009 = (options.series?.[0] as HighchartsSeriesValues).data.filter(
            (item: any) => item.name === '2009',
          );
          const itemsB = (options.series?.[0] as HighchartsSeriesValues).data.filter(
            (item: any) => item.name === 'B',
          );

          expect(items2009.length > 0).toBeTruthy();
          expect(itemsB.length > 0).toBeTruthy();

          items2009.forEach((item2009: any) => {
            expect(item2009.color).toBe('red');
          });

          itemsB.forEach((itemB: any) => {
            expect(itemB.color).toBe('green');
          });

          return options;
        }}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });
});
