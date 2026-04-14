import React from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SimpleTableDesignPanel } from './simple-table-design-panel.js';

// MUI components use @emotion/react internally which requires a React context
// unavailable in the test environment. Use minimal pass-through stubs instead.
vi.mock('@mui/material/Box', () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock('@mui/material/FormControl', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@mui/material/InputLabel', () => ({
  default: ({ children }: any) => <label>{children}</label>,
}));
vi.mock('@mui/material/TextField', () => ({
  default: ({ label, value, onChange, type, inputProps }: any) => (
    <label>
      {label}
      <input
        aria-label={label}
        type={type ?? 'text'}
        value={value}
        onChange={onChange}
        {...inputProps}
      />
    </label>
  ),
}));

const defaultStyleOptions = {
  headerBackgroundColor: '#1976d2',
  headerTextColor: '#ffffff',
  cellPadding: 4,
  fontSize: 14,
};

describe('SimpleTableDesignPanel', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without error', () => {
    expect(() =>
      render(<SimpleTableDesignPanel styleOptions={defaultStyleOptions} onChange={mockOnChange} />),
    ).not.toThrow();
  });

  it('renders the Cell Padding and Font Size inputs', () => {
    render(<SimpleTableDesignPanel styleOptions={defaultStyleOptions} onChange={mockOnChange} />);
    expect(screen.getByLabelText('Cell Padding (px)')).toBeInTheDocument();
    expect(screen.getByLabelText('Font Size (px)')).toBeInTheDocument();
  });

  it('calls onChange on mount with the merged initial style options', () => {
    render(<SimpleTableDesignPanel styleOptions={defaultStyleOptions} onChange={mockOnChange} />);
    vi.runAllTimers();
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining(defaultStyleOptions));
  });

  it('calls onChange with updated cellPadding when the input changes', () => {
    render(<SimpleTableDesignPanel styleOptions={defaultStyleOptions} onChange={mockOnChange} />);
    vi.runAllTimers();
    mockOnChange.mockClear();

    fireEvent.change(screen.getByLabelText('Cell Padding (px)'), { target: { value: '8' } });
    vi.runAllTimers();

    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ cellPadding: 8 }));
  });

  it('calls onChange with updated fontSize when the input changes', () => {
    render(<SimpleTableDesignPanel styleOptions={defaultStyleOptions} onChange={mockOnChange} />);
    vi.runAllTimers();
    mockOnChange.mockClear();

    fireEvent.change(screen.getByLabelText('Font Size (px)'), { target: { value: '18' } });
    vi.runAllTimers();

    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ fontSize: 18 }));
  });

  it('preserves other style options when a single field changes', () => {
    render(<SimpleTableDesignPanel styleOptions={defaultStyleOptions} onChange={mockOnChange} />);
    vi.runAllTimers();
    mockOnChange.mockClear();

    fireEvent.change(screen.getByLabelText('Cell Padding (px)'), { target: { value: '16' } });
    vi.runAllTimers();

    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCall.headerBackgroundColor).toBe(defaultStyleOptions.headerBackgroundColor);
    expect(lastCall.headerTextColor).toBe(defaultStyleOptions.headerTextColor);
    expect(lastCall.fontSize).toBe(defaultStyleOptions.fontSize);
    expect(lastCall.cellPadding).toBe(16);
  });

  it('falls back to 0 when cellPadding input is cleared', () => {
    render(<SimpleTableDesignPanel styleOptions={defaultStyleOptions} onChange={mockOnChange} />);
    vi.runAllTimers();
    mockOnChange.mockClear();

    fireEvent.change(screen.getByLabelText('Cell Padding (px)'), { target: { value: '' } });
    vi.runAllTimers();

    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ cellPadding: 0 }));
  });

  it('uses DEFAULT_STYLE_OPTIONS when styleOptions is empty', () => {
    render(<SimpleTableDesignPanel styleOptions={{}} onChange={mockOnChange} />);
    vi.runAllTimers();
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        headerBackgroundColor: '#1976d2',
        headerTextColor: '#ffffff',
        cellPadding: 4,
        fontSize: 14,
      }),
    );
  });

  describe('color inputs (debounced)', () => {
    it('does not call onChange immediately when a color input changes', () => {
      render(<SimpleTableDesignPanel styleOptions={defaultStyleOptions} onChange={mockOnChange} />);
      vi.runAllTimers();
      mockOnChange.mockClear();

      fireEvent.change(screen.getByLabelText('Header Background Color'), {
        target: { value: '#ff0000' },
      });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('calls onChange after the debounce delay with updated headerBackgroundColor', () => {
      render(<SimpleTableDesignPanel styleOptions={defaultStyleOptions} onChange={mockOnChange} />);
      vi.runAllTimers();
      mockOnChange.mockClear();

      fireEvent.change(screen.getByLabelText('Header Background Color'), {
        target: { value: '#ff0000' },
      });
      act(() => vi.advanceTimersByTime(300));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ headerBackgroundColor: '#ff0000' }),
      );
    });

    it('calls onChange after the debounce delay with updated headerTextColor', () => {
      render(<SimpleTableDesignPanel styleOptions={defaultStyleOptions} onChange={mockOnChange} />);
      vi.runAllTimers();
      mockOnChange.mockClear();

      fireEvent.change(screen.getByLabelText('Header Text Color'), {
        target: { value: '#000000' },
      });
      act(() => vi.advanceTimersByTime(300));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ headerTextColor: '#000000' }),
      );
    });

    it('debounces rapid color changes and only fires once for the last value', () => {
      render(<SimpleTableDesignPanel styleOptions={defaultStyleOptions} onChange={mockOnChange} />);
      vi.runAllTimers();
      mockOnChange.mockClear();

      const input = screen.getByLabelText('Header Background Color');
      fireEvent.change(input, { target: { value: '#aaaaaa' } });
      act(() => vi.advanceTimersByTime(100));
      fireEvent.change(input, { target: { value: '#bbbbbb' } });
      act(() => vi.advanceTimersByTime(100));
      fireEvent.change(input, { target: { value: '#cccccc' } });
      act(() => vi.advanceTimersByTime(300));

      const colorCalls = mockOnChange.mock.calls.filter((call) =>
        Object.prototype.hasOwnProperty.call(call[0], 'headerBackgroundColor'),
      );
      expect(colorCalls).toHaveLength(1);
      expect(colorCalls[0][0]).toMatchObject({ headerBackgroundColor: '#cccccc' });
    });
  });
});
