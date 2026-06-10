/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import type { CustomVisualizationProps } from '@sisense/sdk-ui';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SimpleTable } from './Visualization.js';

// MUI components internally use @emotion/react which requires a React context
// that isn't available in the test environment. Mock the MUI modules to avoid
// this, using simple pass-through wrappers.
vi.mock('@mui/material/Box', () => ({
  // Destructure MUI system props so they are not forwarded to the DOM element.
  default: ({
    children,
    display: _display,
    justifyContent: _jc,
    alignItems: _ai,
    sx: _sx,
    ...rest
  }: any) => <div {...rest}>{children}</div>,
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

const TestSimpleTable = SimpleTable as unknown as React.ComponentType<Record<string, unknown>>;

const { mockUseExecuteQuery, mockExtractDimensionsAndMeasures, mockUseTheme, mockFormatDataSet } =
  vi.hoisted(() => ({
    mockUseExecuteQuery: vi.fn(),
    mockExtractDimensionsAndMeasures: vi.fn(() => ({ dimensions: [], measures: [] })),
    mockUseTheme: vi.fn(() => ({
      chart: { secondaryTextColor: '#1976d2', textColor: '#ffffff' },
    })),
    mockFormatDataSet: vi.fn<(data: any, opts?: any) => any>((data) => data),
  }));

vi.mock('@sisense/sdk-ui', () => ({
  useExecuteQuery: mockUseExecuteQuery,
  extractDimensionsAndMeasures: mockExtractDimensionsAndMeasures,
  useTheme: mockUseTheme,
  formatDataSet: mockFormatDataSet,
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
    mockExtractDimensionsAndMeasures.mockReturnValue({ dimensions: [], measures: [] });
    mockUseTheme.mockReturnValue({
      chart: { secondaryTextColor: '#1976d2', textColor: '#ffffff' },
    });
    mockFormatDataSet.mockImplementation((data) => data);
  });

  it('renders a loading spinner when isLoading is true', () => {
    mockUseExecuteQuery.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });
    render(<TestSimpleTable {...makeProps()} />);
    // CircularProgress renders an svg with role="progressbar"
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an error message when isError is true', () => {
    mockUseExecuteQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });
    render(<TestSimpleTable {...makeProps()} />);
    expect(screen.getByText('Error loading data')).toBeInTheDocument();
  });

  it('renders "No data available" when data has no rows', () => {
    mockUseExecuteQuery.mockReturnValue({
      data: { columns: [], rows: [] },
      isLoading: false,
      isError: false,
    });
    render(<TestSimpleTable {...makeProps()} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders column headers from data', () => {
    mockUseExecuteQuery.mockReturnValue({
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
    mockUseExecuteQuery.mockReturnValue({
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

  it('recomputes rendered rows when formatting data options change', () => {
    const rawData = {
      columns: [{ name: 'Revenue' }],
      rows: [[{ data: 2266128.425 }]],
    };
    mockUseExecuteQuery.mockReturnValue({
      data: rawData,
      isLoading: false,
      isError: false,
    });

    mockFormatDataSet.mockImplementation((data: any, opts: any) => {
      const cfg = opts?.value?.[0]?.numberFormatConfig;
      const text = cfg?.kilo ? '2266.13K' : '2,266,128.43';
      return {
        ...data,
        rows: data.rows.map((row: any[]) => row.map((c: any) => ({ ...c, text }))),
      };
    });

    const { rerender } = render(
      <TestSimpleTable
        {...makeProps({
          dataOptions: {
            value: [
              { column: { name: 'Revenue' }, numberFormatConfig: { thousandSeparator: true } },
            ],
          },
        })}
      />,
    );

    expect(screen.getByText('2,266,128.43')).toBeInTheDocument();

    rerender(
      <TestSimpleTable
        {...makeProps({
          dataOptions: {
            value: [{ column: { name: 'Revenue' }, numberFormatConfig: { kilo: true } }],
          },
        })}
      />,
    );

    expect(screen.getByText('2266.13K')).toBeInTheDocument();
  });

  it('falls back to cell.data when cell.text is absent', () => {
    mockUseExecuteQuery.mockReturnValue({
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

  it('applies default style options derived from the theme when styleOptions is not provided', () => {
    mockUseExecuteQuery.mockReturnValue({
      data: {
        columns: [{ name: 'Col' }],
        rows: [[{ text: 'val' }]],
      },
      isLoading: false,
      isError: false,
    });
    render(<TestSimpleTable {...makeProps({ styleOptions: undefined })} />);
    const header = screen.getByText('Col');
    // Default headerBackgroundColor comes from theme.chart.secondaryTextColor
    expect(header).toHaveStyle({ backgroundColor: '#1976d2' });
  });

  it('applies custom headerBackgroundColor from styleOptions', () => {
    mockUseExecuteQuery.mockReturnValue({
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

  it('renders empty string when cell has neither text nor data', () => {
    mockUseExecuteQuery.mockReturnValue({
      data: {
        columns: [{ name: 'Value' }],
        rows: [[{}]], // cell with neither text nor data
      },
      isLoading: false,
      isError: false,
    });
    render(<TestSimpleTable {...makeProps()} />);
    // getAllByRole('cell') returns <td> elements; index 0 = header, index 1 = body cell
    const cells = screen.getAllByRole('cell');
    expect(cells[1].textContent).toBe('');
  });

  it('renders "No data available" when data is null', () => {
    mockUseExecuteQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    });
    render(<TestSimpleTable {...makeProps()} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});
