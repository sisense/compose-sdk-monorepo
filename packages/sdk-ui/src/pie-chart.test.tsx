import { render } from '@testing-library/react';
import { HighchartsOptions } from './chart-options-processor/chart-options-service';
import { PieStyleOptions } from './types';
import { PieChart } from './pie-chart';

// Mocks highcharts to prevent internal `sisense-charts` related error in testing environment
vi.mock('highcharts-react-official', async () => {
  const { MockedHighchartsReact }: typeof import('./__test-helpers__') = await vi.importActual(
    './__test-helpers__',
  );
  return {
    default: MockedHighchartsReact,
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

const meas1 = {
  column: { name: 'Quantity', aggregation: 'sum' },
  showOnRightAxis: false,
};

const cat1 = {
  name: 'Years',
  type: 'date',
};

describe('Pie chart types', () => {
  it('should prepare correct options for classic type', async () => {
    const styleOptions: PieStyleOptions = {
      subtype: 'pie/classic',
    };
    const { findByLabelText } = render(
      <PieChart
        dataSet={dataSet}
        dataOptions={{ value: [meas1], category: [cat1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options.plotOptions?.pie?.innerSize).toBe('0%');
          return options;
        }}
        styleOptions={styleOptions}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });

  it('should prepare correct options for donut type', async () => {
    const styleOptions: PieStyleOptions = {
      subtype: 'pie/donut',
    };
    const { findByLabelText } = render(
      <PieChart
        dataSet={dataSet}
        dataOptions={{ value: [meas1], category: [cat1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options.plotOptions?.pie?.innerSize).toBe('40%');
          return options;
        }}
        styleOptions={styleOptions}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });

  it('should prepare correct options for ring type', async () => {
    const styleOptions: PieStyleOptions = {
      subtype: 'pie/ring',
    };
    const { findByLabelText } = render(
      <PieChart
        dataSet={dataSet}
        dataOptions={{ value: [meas1], category: [cat1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options.plotOptions?.pie?.innerSize).toBe('80%');
          return options;
        }}
        styleOptions={styleOptions}
      />,
    );

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });
});
