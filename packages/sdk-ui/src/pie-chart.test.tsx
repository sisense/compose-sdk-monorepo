import { render } from '@testing-library/react';
import { HighchartsOptions } from './chart-options-processor/chart-options-service';
import { DAYS, JAN, MON } from './query/date-formats/apply-date-format';
import { PieStyleOptions } from './types';
import type { useSisenseContext } from './sisense-context/sisense-context';
import { getDefaultThemeSettings } from './chart-options-processor/theme-option-service';
import { getBaseDateFnsLocale } from './chart-data-processor/data-table-date-period';
import type { ClientApplication } from './app/client-application';
import { PieChart } from './pie-chart';

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
    enableTracking: false,
  });

  return {
    ...actual,
    useSisenseContext: useSisenseContextMock,
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
  it('should prepare correct options for classic type', () => {
    const styleOptions: PieStyleOptions = {
      subtype: 'pie/classic',
    };
    render(
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
  });

  it('should prepare correct options for donut type', () => {
    const styleOptions: PieStyleOptions = {
      subtype: 'pie/donut',
    };
    render(
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
  });

  it('should prepare correct options for ring type', () => {
    const styleOptions: PieStyleOptions = {
      subtype: 'pie/ring',
    };
    render(
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
  });
});
