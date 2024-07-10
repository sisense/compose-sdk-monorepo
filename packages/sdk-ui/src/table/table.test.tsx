/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { Table } from './table';

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
    const { container, findByLabelText } = render(
      <Table dataSet={dataSet} dataOptions={{ columns: [col1, col2] }} />,
    );
    const table = await findByLabelText('table-root');
    expect(table).toBeTruthy();
    expect(container).toMatchSnapshot();
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
});
