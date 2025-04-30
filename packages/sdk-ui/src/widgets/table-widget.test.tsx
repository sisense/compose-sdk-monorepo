import { render } from '@testing-library/react';
import { TableWidget } from './table-widget';
import { Table } from '@/table';
import { filterFactory } from '@sisense/sdk-data';
import { TableDataOptions } from '..';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { Mock } from 'vitest';

vi.mock('@/sisense-context/sisense-context');
vi.mock('@/table', () => ({
  Table: vi.fn(() => <div>Mocked Table</div>),
}));

describe('TableWidget Component', () => {
  const mockDataOptions: TableDataOptions = { columns: [] };
  const mockStyleOptions = { width: 500, height: 300, header: { hidden: false } };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useSisenseContext to return the expected shape
    (useSisenseContext as Mock).mockReturnValue({
      isInitialized: true,
      app: {
        defaultDataSource: DM.DataSource,
      },
      errorBoundary: {
        showErrorBox: true,
      },
    });
  });

  it('renders Table with correct props', () => {
    const { getByText } = render(
      <TableWidget
        dataSource={DM.DataSource}
        dataOptions={mockDataOptions}
        styleOptions={mockStyleOptions}
        filters={[
          filterFactory.members(DM.Commerce.Condition, ['Used', 'Refurbished'], {
            guid: 'test-id',
          }),
        ]}
      />,
    );

    expect(getByText('Mocked Table')).toBeInTheDocument();
    const tableProps = (Table as Mock).mock.calls[0][0];
    expect(tableProps).toMatchSnapshot();
  });

  it('does not render Table when dataOptions are not provided', () => {
    const { queryByText } = render(
      <TableWidget
        styleOptions={mockStyleOptions}
        dataOptions={undefined as unknown as TableDataOptions}
      />,
    );
    expect(queryByText('Mocked Table')).not.toBeInTheDocument();
  });
});
