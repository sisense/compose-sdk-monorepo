/** @vitest-environment jsdom */
import { QueryResultData } from '@sisense/sdk-data';
import { fireEvent, render, waitFor } from '@testing-library/react';

import {
  executeQueryMock,
  executeQueryWithRowCountMock,
} from '@/domains/query-execution/core/__mocks__/execute-query';
import { type ClientApplication } from '@/infra/app/types';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';
import { SisenseContextPayload } from '@/infra/contexts/sisense-context/sisense-context';

import { calcTableContentHeight } from './calc-table-height';
import { PAGES_BATCH_SIZE } from './table-component';
import { TableComponent } from './table-component';

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');

describe('Table auto height', () => {
  const ROWS_PER_PAGE = 5;
  const col1 = { name: 'AgeRange', type: 'string' };
  const col2 = { name: 'Cost', type: 'number' };
  const dataOptions = { columns: [col1, col2] };

  const makeResult = (rowsCount: number): QueryResultData => ({
    columns: [col1, col2],
    rows: Array.from({ length: rowsCount }, (_, i) => [{ data: `${i}` }, { data: i }]),
  });

  const fullPageHeight = calcTableContentHeight({ rowsToFit: ROWS_PER_PAGE });

  beforeEach(() => {
    vi.clearAllMocks();
    useSisenseContextMock.mockReturnValue({
      app: {
        httpClient: {},
        settings: { queryLimit: 20000, queryCacheConfig: { enabled: false } },
      } as ClientApplication,
      isInitialized: true,
      tracking: { enabled: false, packageName: 'sdk-ui' },
      errorBoundary: { showErrorBox: true },
    } as SisenseContextPayload);
  });

  const renderAutoHeightTable = (
    onHeightChange: (height: number) => void,
    includeTotalRows?: boolean,
  ) =>
    render(
      <TableComponent
        dataSet="Sample ECommerce"
        dataOptions={dataOptions}
        styleOptions={{ isAutoHeight: true, rowsPerPage: ROWS_PER_PAGE }}
        onHeightChange={onHeightChange}
        {...(includeTotalRows ? { includeTotalRows } : {})}
      />,
    );

  it('reports a full-page height while the first query is still in flight', () => {
    executeQueryMock.mockReturnValue(new Promise(() => {}));
    const onHeightChange = vi.fn();

    renderAutoHeightTable(onHeightChange);

    expect(onHeightChange).toHaveBeenCalledWith(fullPageHeight);
  });

  it('keeps the last measured height while a not-yet-loaded page is loading', async () => {
    // The pager only knows about pages beyond the loaded batch when it knows the total row
    // count, since otherwise pagesCount is capped at what's already loaded (which the smarter,
    // loadedRowRange-aware pager never re-fetches). So this uses includeTotalRows to put a
    // genuinely not-yet-loaded page on screen to click into.
    const batchRowsCount = ROWS_PER_PAGE * PAGES_BATCH_SIZE;
    const totalRowCount = batchRowsCount + ROWS_PER_PAGE * 2;
    const notYetLoadedPage = batchRowsCount / ROWS_PER_PAGE + 1;
    executeQueryWithRowCountMock.mockImplementation(
      async ({ offset, count }: { offset: number; count: number }) => ({
        data: makeResult(Math.min(count, Math.max(0, totalRowCount - offset))),
        rowCount: totalRowCount,
      }),
    );
    const onHeightChange = vi.fn();

    const { container, findByTestId, findByLabelText } = renderAutoHeightTable(
      onHeightChange,
      true,
    );
    await findByTestId('table-root');
    await waitFor(() => expect(onHeightChange).toHaveBeenCalledWith(fullPageHeight));

    executeQueryWithRowCountMock.mockReturnValue(new Promise(() => {}));
    onHeightChange.mockClear();
    fireEvent.click(await findByLabelText(new RegExp(`page ${notYetLoadedPage}`, 'i')));

    // The query for the next batch never settles, so the table stays in its loading state — the
    // height must not be dropped, or the container collapses into a parent that has no height.
    await waitFor(() => expect(executeQueryWithRowCountMock).toHaveBeenCalledTimes(2));
    await findByTestId('csdk-loading-overlay');
    expect((container.firstElementChild as HTMLElement).style.height).toBe(`${fullPageHeight}px`);
    onHeightChange.mock.calls.forEach(([height]) => expect(height).toBe(fullPageHeight));
  });

  it('keeps the measured height of a dataset shorter than one page while reloading', async () => {
    const shortRowsCount = 2;
    executeQueryMock.mockResolvedValue(makeResult(shortRowsCount));
    const onHeightChange = vi.fn();
    const shortHeight = calcTableContentHeight({ rowsToFit: shortRowsCount });

    const { container, findByTestId, rerender } = renderAutoHeightTable(onHeightChange);
    await findByTestId('table-root');
    await waitFor(() => expect(onHeightChange).toHaveBeenCalledWith(shortHeight));

    // Reload (e.g. a filter change) puts the table back into its loading state. The height must
    // stay at the measured short height rather than stretching to the full-page estimate.
    executeQueryMock.mockReturnValue(new Promise(() => {}));
    onHeightChange.mockClear();
    rerender(
      <TableComponent
        dataSet="Sample ECommerce"
        dataOptions={{ columns: [col1] }}
        styleOptions={{ isAutoHeight: true, rowsPerPage: ROWS_PER_PAGE }}
        onHeightChange={onHeightChange}
      />,
    );

    await waitFor(() => expect(executeQueryMock).toHaveBeenCalledTimes(2));
    await findByTestId('csdk-loading-overlay');
    expect((container.firstElementChild as HTMLElement).style.height).toBe(`${shortHeight}px`);
    onHeightChange.mock.calls.forEach(([height]) => expect(height).toBe(shortHeight));
  });

  it('never renders the container without an explicit height', async () => {
    executeQueryMock.mockReturnValue(new Promise(() => {}));

    const { container } = renderAutoHeightTable(vi.fn());

    const sizeContainer = container.firstElementChild as HTMLElement;
    expect(sizeContainer.style.height).toBe(`${fullPageHeight}px`);
  });
});
