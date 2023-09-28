import { render } from '@testing-library/react';
import { HighchartsOptions } from '../chart-options-processor/chart-options-service';
import { useSisenseContext } from './sisense-context/sisense-context';
import { DAYS, JAN, MON } from '../query/date-formats/apply-date-format';
import { getDefaultThemeSettings } from '../chart-options-processor/theme-option-service';
import { getBaseDateFnsLocale } from '../chart-data-processor/data-table-date-period';
import { ClientApplication } from '../app/client-application';
import { TreemapChart } from './treemap-chart';

vi.mock('./HighchartsWrapper', () => {
  return {
    HighchartsWrapper: ({ options }: { options: object }) => {
      return <div>{JSON.stringify(options)}</div>;
    },
  };
});

vi.mock('./sisense-context/sisense-context', async () => {
  const actual: typeof import('./sisense-context/sisense-context') = await vi.importActual(
    './sisense-context/sisense-context',
  );

  const useSisenseContextMock: typeof useSisenseContext = () => ({
    app: {
      settings: {
        dateConfig: {
          weekFirstDay: MON,
          isFiscalOn: false,
          fiscalMonth: JAN,
          selectedDateLevel: DAYS,
          timeZone: 'UTC',
        },
        serverThemeSettings: getDefaultThemeSettings(),
        locale: getBaseDateFnsLocale(),
      },
    } as ClientApplication,

    isInitialized: true,
    enableTracking: true,
  });

  return {
    ...actual,
    useSisenseContext: useSisenseContextMock,
  };
});

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

const cat3 = {
  name: 'Gender',
  type: 'string',
};

const meas1 = {
  column: { name: 'Quantity', aggregation: 'sum' },
  showOnRightAxis: false,
};

describe('Treemap Chart', () => {
  it('render a treemap with single category', () => {
    render(
      <TreemapChart
        dataSet={dataSet}
        dataOptions={{ category: [cat1], value: [meas1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );
  });

  it('render a treemap with two categories', () => {
    render(
      <TreemapChart
        dataSet={dataSet}
        dataOptions={{ category: [cat1, cat2], value: [meas1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );
  });

  it('render a treemap with three categories', () => {
    render(
      <TreemapChart
        dataSet={dataSet}
        dataOptions={{ category: [cat1, cat2, cat3], value: [meas1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );
  });

  it('render a treemap with coloring', () => {
    render(
      <TreemapChart
        dataSet={dataSet}
        dataOptions={{ category: [cat1, { column: cat2, isColored: true }, cat3], value: [meas1] }}
        onBeforeRender={(options: HighchartsOptions) => {
          expect(options).toMatchSnapshot();
          return options;
        }}
      />,
    );
  });
});
