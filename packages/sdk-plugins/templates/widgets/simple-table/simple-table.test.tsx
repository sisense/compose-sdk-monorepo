import React from 'react';

import type { CustomVisualizationProps } from '@sisense/sdk-ui';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SimpleTable } from './simple-table.js';

// MUI components internally use @emotion/react which requires a React context
// that isn't available in the test environment. Mock the MUI modules to avoid
// this, using simple pass-through wrappers.
vi.mock('@mui/material/Box', () => ({
  default: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
}));
vi.mock('@mui/material/CircularProgress', () => ({ default: () => <div role="progressbar" /> }));
vi.mock('@mui/material/Table', () => ({
  default: ({ children }: any) => <table>{children}</table>,
}));
vi.mock('@mui/material/TableBody', () => ({
  default: ({ children }: any) => <tbody>{children}</tbody>,
}));
vi.mock('@mui/material/TableCell', () => ({
  default: ({ children, sx, ...rest }: any) => (
    <td style={sx} {...rest}>
      {children}
    </td>
  ),
}));
vi.mock('@mui/material/TableContainer', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@mui/material/TableHead', () => ({
  default: ({ children }: any) => <thead>{children}</thead>,
}));
vi.mock('@mui/material/TableRow', () => ({ default: ({ children }: any) => <tr>{children}</tr> }));
vi.mock('@mui/material/Typography', () => ({
  default: ({ children }: any) => <span>{children}</span>,
}));

const TestSimpleTable = SimpleTable as React.ComponentType<any>;

const { mockUseExecuteCustomWidgetQuery } = vi.hoisted(() => ({
  mockUseExecuteCustomWidgetQuery: vi.fn(),
}));

vi.mock('@sisense/sdk-ui', () => ({
  useExecuteCustomWidgetQuery: mockUseExecuteCustomWidgetQuery,
}));

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    dataSource: 'SampleECommerce',
    dataOptions: {},
    filters: [],
    styleOptions: {},
    ...overrides,
  } as unknown as CustomVisualizationProps;
}

describe('SimpleTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a loading spinner when isLoading is true', () => {
    mockUseExecuteCustomWidgetQuery.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });
    render(<TestSimpleTable {...makeProps()} />);
    // CircularProgress renders an svg with role="progressbar"
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an error message when isError is true', () => {
    mockUseExecuteCustomWidgetQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });
    render(<TestSimpleTable {...makeProps()} />);
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
  });

  it('renders "No data available" when data has no rows', () => {
    mockUseExecuteCustomWidgetQuery.mockReturnValue({
      data: { columns: [], rows: [] },
      isLoading: false,
      isError: false,
    });
    render(<TestSimpleTable {...makeProps()} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders column headers from data', () => {
    mockUseExecuteCustomWidgetQuery.mockReturnValue({
      data: {
        columns: [{ name: 'Category' }, { name: 'Revenue' }],
        rows: [[{ text: 'Electronics' }, { text: '1000' }]],
      },
      isLoading: false,
      isError: false,
    });
    render(<TestSimpleTable {...makeProps()} />);
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('renders row cell values', () => {
    mockUseExecuteCustomWidgetQuery.mockReturnValue({
      data: {
        columns: [{ name: 'Category' }, { name: 'Revenue' }],
        rows: [
          [{ text: 'Electronics' }, { text: '1000' }],
          [{ text: 'Clothing' }, { text: '500' }],
        ],
      },
      isLoading: false,
      isError: false,
    });
    render(<TestSimpleTable {...makeProps()} />);
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('falls back to cell.data when cell.text is absent', () => {
    mockUseExecuteCustomWidgetQuery.mockReturnValue({
      data: {
        columns: [{ name: 'Value' }],
        rows: [[{ data: 42 }]],
      },
      isLoading: false,
      isError: false,
    });
    render(<TestSimpleTable {...makeProps()} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('applies default style options when styleOptions is not provided', () => {
    mockUseExecuteCustomWidgetQuery.mockReturnValue({
      data: {
        columns: [{ name: 'Col' }],
        rows: [[{ text: 'val' }]],
      },
      isLoading: false,
      isError: false,
    });
    render(<TestSimpleTable {...makeProps({ styleOptions: undefined })} />);
    const header = screen.getByText('Col');
    // Default headerBackgroundColor is #1976d2
    expect(header).toHaveStyle({ backgroundColor: '#1976d2' });
  });

  it('applies custom headerBackgroundColor from styleOptions', () => {
    mockUseExecuteCustomWidgetQuery.mockReturnValue({
      data: {
        columns: [{ name: 'Col' }],
        rows: [[{ text: 'val' }]],
      },
      isLoading: false,
      isError: false,
    });
    render(
      <TestSimpleTable {...makeProps({ styleOptions: { headerBackgroundColor: '#ff0000' } })} />,
    );
    expect(screen.getByText('Col')).toHaveStyle({ backgroundColor: '#ff0000' });
  });
});
