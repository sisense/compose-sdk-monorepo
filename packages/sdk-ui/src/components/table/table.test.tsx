import { render } from '@testing-library/react';
import { Table } from './table';
import { DAYS, JAN, MON } from '../../query/date-formats/apply-date-format';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { getDefaultThemeSettings } from '../../chart-options-processor/theme-option-service';
import { getBaseDateFnsLocale } from '../../chart-data-processor/data-table-date-period';
import { ClientApplication } from '../../app/client-application';

vi.mock('../sisense-context/sisense-context', async () => {
  const actual: typeof import('../sisense-context/sisense-context') = await vi.importActual(
    '../sisense-context/sisense-context',
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

// Table tests
describe('Table', () => {
  const col1 = { name: 'AgeRange', type: 'string' };
  const col2 = { name: 'Cost', type: 'number' };
  const dataSet = {
    columns: [col1, col2],
    rows: [
      ['0-18', 1000],
      ['19-28', 19.123],
      ['29-35', 125],
    ],
  };

  it('should render Table', () => {
    const { container } = render(
      <Table dataSet={dataSet} dataOptions={{ columns: [col1, col2] }} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render Table with base props', () => {
    const table = render(
      <Table
        dataSet={dataSet}
        dataOptions={{
          columns: [col1],
        }}
      />,
    );

    const heading = table.queryByText('AgeRange');
    expect(heading).toBeTruthy();

    dataSet.rows.forEach(([value]) => {
      const cell = table.queryByText(value);
      expect(cell).toBeTruthy();
    });
  });

  it('should render with error when provided column missing in data', () => {
    const spy = vi.spyOn(console, 'error');
    let errorThrown = false;
    spy.mockImplementation(() => {
      errorThrown = true;
    });

    const table = render(
      <Table
        dataSet={dataSet}
        dataOptions={{
          columns: [{ name: 'NotExist', type: 'string' }],
        }}
      />,
    );

    const tableWrapper = table.container.querySelector('.tableWrapper');

    expect(tableWrapper).toBeFalsy();
    expect(errorThrown).toBeTruthy();

    spy.mockRestore();
  });

  it('should show No Results overlay in Table when data missing', () => {
    const container = render(
      <Table
        dataSet={{
          columns: dataSet.columns,
          rows: [],
        }}
        dataOptions={{
          columns: [col1],
        }}
      />,
    );
    const overlayTitle = container.queryByText('No Results');

    expect(overlayTitle).toBeTruthy();
  });
});
