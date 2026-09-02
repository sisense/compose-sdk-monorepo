/** @vitest-environment jsdom */
import { fireEvent, render, waitFor } from '@testing-library/react';

import { setupI18nMock } from '@/__test-helpers__';
import {
  executeQueryMock,
  executeQueryWithRowCountMock,
} from '@/domains/query-execution/core/__mocks__/execute-query';
import { type ClientApplication } from '@/infra/app/types';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';
import { SisenseContextPayload } from '@/infra/contexts/sisense-context/sisense-context';

import { Table } from './table';
import { DEFAULT_TABLE_ROWS_PER_PAGE, PAGES_BATCH_SIZE } from './table-component';

setupI18nMock();

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');

const col1 = { name: 'AgeRange', type: 'string' };
const col2 = { name: 'Cost', type: 'number' };
const dataOptions = { columns: [col1, col2] };

const makeRows = (count: number, offset: number) =>
  Array.from({ length: count }, (_, i) => [{ data: `row-${offset + i}` }, { data: offset + i }]);

const TOTAL_ROW_COUNT = 3200;
const TOTAL_PAGES = Math.ceil(TOTAL_ROW_COUNT / DEFAULT_TABLE_ROWS_PER_PAGE); // 128
const LAST_PAGE_OFFSET =
  Math.floor((TOTAL_PAGES - 1) / PAGES_BATCH_SIZE) * PAGES_BATCH_SIZE * DEFAULT_TABLE_ROWS_PER_PAGE; // 3000

describe('Table with includeTotalRows', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const contextMock: SisenseContextPayload = {
      app: {
        httpClient: {},
        settings: {
          queryLimit: 20000,
          queryCacheConfig: { enabled: false },
        },
      } as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: false,
        packageName: 'sdk-ui',
      },
      errorBoundary: {
        showErrorBox: true,
      },
    };
    useSisenseContextMock.mockReturnValue(contextMock);

    const buildQueryResult = (queryDescription: { offset: number; count: number }) => {
      const { offset, count } = queryDescription;
      const remaining = Math.max(0, TOTAL_ROW_COUNT - offset);
      const rows = makeRows(Math.min(count, remaining), offset);
      return { columns: [col1, col2], rows };
    };

    executeQueryMock.mockImplementation(
      async (queryDescription: { offset: number; count: number }) =>
        buildQueryResult(queryDescription),
    );
    executeQueryWithRowCountMock.mockImplementation(
      async (queryDescription: { offset: number; count: number }) => ({
        data: buildQueryResult(queryDescription),
        rowCount: TOTAL_ROW_COUNT,
      }),
    );
  });

  it('shows the locale-formatted total row count next to the pagination control', async () => {
    const { findByTestId } = render(
      <Table dataSet="Sample ECommerce" dataOptions={dataOptions} includeTotalRows />,
    );

    const totalRowsLabel = await findByTestId('table-total-rows');
    expect(totalRowsLabel.textContent).toBe('Total: 3,200 rows');
  });

  it('does not show the total-rows label when includeTotalRows is not set', async () => {
    const { findByTestId, queryByTestId } = render(
      <Table dataSet="Sample ECommerce" dataOptions={dataOptions} />,
    );

    await findByTestId('table-root');
    expect(executeQueryWithRowCountMock).not.toHaveBeenCalled();
    expect(queryByTestId('table-total-rows')).toBeNull();
  });

  it('renders a direct link to the last page and jumps to it correctly', async () => {
    const { findByTestId, findByRole } = render(
      <Table dataSet="Sample ECommerce" dataOptions={dataOptions} includeTotalRows />,
    );

    await findByTestId('table-total-rows');

    // The boundary link for the last page should be present.
    const lastPageButton = await findByRole('button', {
      name: (name) => name.toLowerCase() === `go to page ${TOTAL_PAGES}`,
    });

    fireEvent.click(lastPageButton);

    await waitFor(() => {
      expect(executeQueryWithRowCountMock).toHaveBeenCalledTimes(2);
    });

    const secondCallArgs = executeQueryWithRowCountMock.mock.calls[1][0] as { offset: number };
    // batch-aligned offset covering the last page
    expect(secondCallArgs.offset).toBe(LAST_PAGE_OFFSET);

    // MUI drops the "Go to" prefix once a page is selected.
    const selectedPageButton = await findByRole('button', {
      name: (name) => name.toLowerCase() === `page ${TOTAL_PAGES}`,
    });
    expect(selectedPageButton.getAttribute('aria-current')).toBe('page');

    await waitFor(() => {
      expect(executeQueryMock).not.toHaveBeenCalled();
    });
  });
});
