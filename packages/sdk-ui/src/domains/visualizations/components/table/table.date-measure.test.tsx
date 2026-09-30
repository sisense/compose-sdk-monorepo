/** @vitest-environment jsdom */
import {
  type Attribute,
  createAttribute,
  createDateDimension,
  type Measure,
  measureFactory,
} from '@sisense/sdk-data';
import { render } from '@testing-library/react';

import { setupI18nMock } from '@/__test-helpers__';
import { executeQueryMock } from '@/domains/query-execution/core/__mocks__/execute-query';
import { type ClientApplication } from '@/infra/app/types';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';
import { SisenseContextPayload } from '@/infra/contexts/sisense-context/sisense-context';

import { Table } from './table';

setupI18nMock();

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');

const dateDimension = createDateDimension({
  name: 'Date',
  expression: '[Commerce.Date (Calendar)]',
});
const revenueAttribute = createAttribute({
  name: 'Revenue',
  type: 'numeric-attribute',
  expression: '[Commerce.Revenue]',
});

type QueryDescription = { dimensions: Attribute[]; measures: Measure[] };

describe('Table with a date measure', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const contextMock: SisenseContextPayload = {
      app: {
        httpClient: {},
        settings: { queryLimit: 20000, queryCacheConfig: { enabled: false } },
      } as ClientApplication,
      isInitialized: true,
      tracking: { enabled: false, packageName: 'sdk-ui' },
      errorBoundary: { showErrorBox: true },
    };
    useSisenseContextMock.mockReturnValue(contextMock);

    // Echoes back the dimensions and measures actually requested, so the column names match the
    // aliases `withUniqueMeasureNames` assigns. The date measure arrives typed `datetime`, which
    // is what the query client resolves for a min/max over a date, carrying the raw engine text.
    executeQueryMock.mockImplementation(async ({ dimensions, measures }: QueryDescription) => ({
      columns: [
        { name: dimensions[0].name, type: 'datetime' },
        { name: measures[0].name, type: 'datetime' },
        { name: measures[1].name, type: 'number' },
      ],
      rows: [
        [
          // a different year from the measure, so the two date cells never share a rendered text
          { data: '2009-01-01T00:00:00', text: '2009' },
          { data: '2010-12-31T00:00:00', text: '31/12/2010 00:00:00 AM' },
          { data: 42, text: '42' },
        ],
      ],
    }));
  });

  it('renders the max of a date column as a date, not as the leading digits of the engine text', async () => {
    const { findByText } = render(
      <Table
        dataSet="Sample ECommerce"
        dataOptions={{
          columns: [
            { column: dateDimension.Years, dateFormat: 'yyyy' },
            measureFactory.max(dateDimension.Days, 'Max Date'),
            measureFactory.sum(revenueAttribute, 'Total Revenue'),
          ],
        }}
      />,
    );

    expect(await findByText('2010-12-31')).toBeTruthy();
    // date dimension control, unchanged by this story
    expect(await findByText('2009')).toBeTruthy();
    // numeric measure control, unchanged by this story
    expect(await findByText('42')).toBeTruthy();
  });

  it('follows a granularity switch on a mounted Table, without a remount', async () => {
    const tableWith = (measure: Measure) => (
      <Table
        dataSet="Sample ECommerce"
        dataOptions={{
          columns: [
            { column: dateDimension.Years, dateFormat: 'yyyy' },
            measure,
            measureFactory.sum(revenueAttribute, 'Total Revenue'),
          ],
        }}
      />
    );

    const { findByText, rerender, queryByText } = render(
      tableWith(measureFactory.max(dateDimension.Years, 'Max Date')),
    );
    expect(await findByText('2010')).toBeTruthy();

    rerender(tableWith(measureFactory.max(dateDimension.Days, 'Max Date')));

    expect(await findByText('2010-12-31')).toBeTruthy();
    // the years mask is gone, so the switch replaced it rather than leaving both
    expect(queryByText('2010')).toBeNull();
    expect(queryByText('31/12/2010 00:00:00 AM')).toBeNull();
  });

  it('renders an explicit dateFormat on a date measure instead of the level default', async () => {
    const { findByText } = render(
      <Table
        dataSet="Sample ECommerce"
        dataOptions={{
          columns: [
            { column: dateDimension.Years, dateFormat: 'yyyy' },
            { column: measureFactory.max(dateDimension.Days, 'Max Date'), dateFormat: 'MM/yyyy' },
            measureFactory.sum(revenueAttribute, 'Total Revenue'),
          ],
        }}
      />,
    );

    expect(await findByText('12/2010')).toBeTruthy();
  });
});
