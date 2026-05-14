import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { StyleOptions } from '../types.js';
import { DesignPanel } from './DesignPanel.js';

const baseStyleOptions: StyleOptions = {
  subtype: 'line/basic',
  line: { width: 2 },
  legend: { enabled: true },
};

describe('DesignPanel (line-chart template)', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it('renders the line type, line width and legend controls', () => {
    render(<DesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);

    expect(screen.getByLabelText('Line type')).toHaveValue('line/basic');
    expect(screen.getByLabelText('Line width')).toHaveValue(2);
    expect(screen.getByLabelText('Show legend')).toBeChecked();
  });

  it('emits a merged styleOptions when the line subtype changes', () => {
    render(<DesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Line type'), { target: { value: 'line/spline' } });

    expect(onChange).toHaveBeenCalledWith({ ...baseStyleOptions, subtype: 'line/spline' });
  });

  it('emits a merged styleOptions when the line width changes', () => {
    render(<DesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Line width'), { target: { value: '5' } });

    expect(onChange).toHaveBeenCalledWith({
      ...baseStyleOptions,
      line: { ...baseStyleOptions.line, width: 5 },
    });
  });

  it('ignores non-numeric width input', () => {
    render(<DesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Line width'), { target: { value: '' } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('emits a merged styleOptions when the legend toggle flips', () => {
    render(<DesignPanel styleOptions={baseStyleOptions} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Show legend'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseStyleOptions,
      legend: { ...baseStyleOptions.legend, enabled: false },
    });
  });

  it('falls back to defaults when styleOptions is empty', () => {
    render(<DesignPanel styleOptions={{}} onChange={onChange} />);

    expect(screen.getByLabelText('Line type')).toHaveValue('line/basic');
    expect(screen.getByLabelText('Line width')).toHaveValue(1);
    expect(screen.getByLabelText('Show legend')).not.toBeChecked();
  });
});
