/** @vitest-environment jsdom */
import { createAttribute, measureFactory } from '@sisense/sdk-data';
import { fireEvent, render } from '@testing-library/react';

import { Table } from './table.js';

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

  it('should render Table', async () => {
    const tableDataOptions = {
      columns: [col1, col2],
    };
    const { findByTestId, findAllByRole } = render(
      <Table dataSet={dataSet} dataOptions={tableDataOptions} />,
    );
    const table = await findByTestId('table-root');
    expect(table).toBeTruthy();
    const columns = await findAllByRole('columnheader');
    expect(columns.length).toBe(tableDataOptions.columns.length);
    const rows = await findAllByRole('row');
    expect(rows.length).toBe(dataSet.rows.length + 1); // +1 for header row
  });

  it('should render Table with base props', async () => {
    const table = render(
      <Table
        dataSet={dataSet}
        dataOptions={{
          columns: [col1],
        }}
      />,
    );

    const heading = await table.findByText('AgeRange');
    expect(heading).toBeTruthy();

    dataSet.rows.forEach(([value]) => {
      const cell = table.queryByText(value);
      expect(cell).toBeTruthy();
    });
  });

  it('should render with error when provided column missing in data', async () => {
    const spy = vi.spyOn(console, 'error');
    let errorThrown = false;
    spy.mockImplementation(() => {
      errorThrown = true;
    });

    const { container, findByLabelText } = render(
      <Table
        dataSet={dataSet}
        dataOptions={{
          columns: [{ name: 'NotExist', type: 'string' }],
        }}
      />,
    );
    const errorBox = await findByLabelText('error-box');
    expect(errorBox).toBeTruthy();
    const tableWrapper = container.querySelector('.tableWrapper');
    expect(tableWrapper).toBeFalsy();
    expect(errorThrown).toBeTruthy();

    spy.mockRestore();
  });

  it('should show No Results overlay in Table when data missing', async () => {
    const { findByText } = render(
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
    const overlayTitle = await findByText('No Results');
    expect(overlayTitle).toBeTruthy();
  });

  it('should correctly react on data options change', async () => {
    const { findByText, rerender } = render(
      <Table
        dataSet={{
          ...dataSet,
          columns: [col1],
        }}
        dataOptions={{ columns: [col1] }}
      />,
    );

    const headerFromFirstRender = await findByText('AgeRange');
    expect(headerFromFirstRender).toBeTruthy();

    rerender(
      <Table
        dataSet={{
          ...dataSet,
          columns: [col2],
        }}
        dataOptions={{ columns: [col2] }}
      />,
    );

    const headerFromSecondRender = await findByText('Cost');
    expect(headerFromSecondRender).toBeTruthy();
  });

  it('should trigger onDataReady callback and render Table with modified data', async () => {
    const MODIFIED_VALUE = 'Modified Table Value';
    const onDataReadyMock = vi.fn().mockImplementation((data) => {
      expect(data).toEqual(dataSet);
      return {
        ...data,
        rows: [[MODIFIED_VALUE, 1]],
      };
    });

    const { findByText } = render(
      <Table
        dataSet={dataSet}
        dataOptions={{ columns: [col1, col2] }}
        onDataReady={onDataReadyMock}
      />,
    );

    const renderedModifiedValue = await findByText(MODIFIED_VALUE);
    expect(renderedModifiedValue).toBeTruthy();
    expect(onDataReadyMock).toHaveBeenCalledTimes(1);
  });

  it('renders the base measure, unexpanded, for a static dataSet with .trend set', async () => {
    // Trend/forecast synthesizes measures the backend computes from a live query. A static
    // in-memory dataSet has no such query, so it must not be expanded (previously crashed with
    // errors.dataOptions.measureNotFound since the synthesized column has no matching data).
    const monthsAttribute = createAttribute({
      name: 'Months',
      type: 'datelevel',
      expression: '[Commerce.Date (Month)]',
    });
    const revenueMeasure = measureFactory.sum(
      createAttribute({
        name: 'Revenue',
        type: 'numeric-attribute',
        expression: '[Commerce.Revenue]',
      }),
      'Revenue',
    );

    const { findByTestId, findAllByRole, queryByLabelText } = render(
      <Table
        dataSet={{
          columns: [
            { name: 'Months', type: 'string' },
            { name: 'Revenue', type: 'number' },
          ],
          rows: [
            ['2024-01', 100],
            ['2024-02', 200],
          ],
        }}
        dataOptions={{
          columns: [
            { column: monthsAttribute },
            { column: revenueMeasure, trend: { modelType: 'linear' } },
          ],
        }}
      />,
    );

    expect(await findByTestId('table-root')).toBeTruthy();
    const headers = await findAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual(['Months', 'Revenue']);
    expect(queryByLabelText('error-box')).toBeFalsy();
  });

  it('should trigger onDataReady callback and render error for incorrect callback return', async () => {
    const onDataReadyMock = vi.fn().mockImplementation(() => undefined);

    const { findByLabelText } = render(
      <Table
        dataSet={dataSet}
        dataOptions={{ columns: [col1, col2] }}
        onDataReady={onDataReadyMock}
      />,
    );

    const errorBoxContainer = await findByLabelText('error-box');
    expect(errorBoxContainer).toBeTruthy();
    expect(onDataReadyMock).toHaveBeenCalledTimes(2);
  });

  it('should show the current page row range next to the pagination control', async () => {
    const tableDataOptions = {
      columns: [col1, col2],
    };
    const { findByTestId, findByRole } = render(
      <Table dataSet={dataSet} dataOptions={tableDataOptions} styleOptions={{ rowsPerPage: 2 }} />,
    );

    const rowsRange = await findByTestId('table-pagination-rows-range');
    expect(rowsRange.textContent).toBe('Rows 1-2');

    const nextPageButton = await findByRole('button', { name: 'Go to page 2' });
    fireEvent.click(nextPageButton);

    const rowsRangeOnLastPage = await findByTestId('table-pagination-rows-range');
    expect(rowsRangeOnLastPage.textContent).toBe('Rows 3-3');
  });

  it('should show the row range on a single-page table, where the control is narrowest', async () => {
    // The pagination renders even with one page, so the range — which is the more useful of the
    // two — must render with it rather than be held to the width a multi-page range would need.
    const { findByTestId } = render(
      <Table
        dataSet={dataSet}
        dataOptions={{ columns: [col1, col2] }}
        styleOptions={{ width: 320 }}
      />,
    );

    expect((await findByTestId('table-pagination-rows-range')).textContent).toBe('Rows 1-3');
  });

  it('should hide the row range on a table too narrow to fit it beside the pagination', async () => {
    const tableDataOptions = {
      columns: [col1, col2],
    };

    const { findByTestId, queryByTestId } = render(
      <Table
        dataSet={dataSet}
        dataOptions={tableDataOptions}
        styleOptions={{ rowsPerPage: 2, width: 260 }}
      />,
    );

    // The label would otherwise wrap onto a second line and spill out of the fixed-height footer.
    await findByTestId('table-root');
    expect(queryByTestId('table-pagination-rows-range')).toBeNull();
  });

  it('should compact the pagination control rather than let it wrap on a narrow table', async () => {
    const manyPagesDataSet = {
      columns: [col1, col2],
      rows: Array.from({ length: 30 }, (_, i) => [`range-${i}`, i]),
    };
    const tableDataOptions = {
      columns: [col1, col2],
    };
    const renderAt = (width: number) =>
      render(
        <Table
          dataSet={manyPagesDataSet}
          dataOptions={tableDataOptions}
          styleOptions={{ rowsPerPage: 2, width }}
        />,
      );

    // 15 pages: a roomy table shows sibling links around the current page...
    const wide = renderAt(900);
    await wide.findByTestId('table-root');
    expect(await wide.findByRole('button', { name: 'Go to page 4' })).toBeTruthy();
    wide.unmount();

    // ...a narrow one drops them, keeping the control on the single row the footer has.
    const narrow = renderAt(300);
    await narrow.findByTestId('table-root');
    expect(narrow.queryByRole('button', { name: 'Go to page 4' })).toBeNull();
    expect(narrow.queryByRole('button', { name: 'Go to page 15' })).toBeTruthy();
  });

  it('should clamp the row range instead of inverting when data shrinks below the current page', async () => {
    const fourRowDataSet = {
      columns: [col1, col2],
      rows: [...dataSet.rows, ['36-45', 60]],
    };
    const twoRowDataSet = {
      columns: [col1, col2],
      rows: dataSet.rows.slice(0, 2),
    };
    const tableDataOptions = {
      columns: [col1, col2],
    };

    const { findByTestId, findByRole, rerender } = render(
      <Table
        dataSet={fourRowDataSet}
        dataOptions={tableDataOptions}
        styleOptions={{ rowsPerPage: 2 }}
      />,
    );

    const nextPageButton = await findByRole('button', { name: 'Go to page 2' });
    fireEvent.click(nextPageButton);
    expect((await findByTestId('table-pagination-rows-range')).textContent).toBe('Rows 3-4');

    // Simulates the data shrinking to fewer pages than the one currently selected (e.g. a live
    // cross-filter narrowing the result set) while page 2 is still selected.
    rerender(
      <Table
        dataSet={twoRowDataSet}
        dataOptions={tableDataOptions}
        styleOptions={{ rowsPerPage: 2 }}
      />,
    );

    const clampedRange = await findByTestId('table-pagination-rows-range');
    expect(clampedRange.textContent).toBe('Rows 1-2');
  });
});
