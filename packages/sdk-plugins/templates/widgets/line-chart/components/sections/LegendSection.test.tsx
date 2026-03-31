import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LegendSection } from './LegendSection';

describe('LegendSection', () => {
  it('renders Legend label', () => {
    render(<LegendSection legend={{ enabled: false }} onClick={vi.fn()} />);
    expect(screen.getByText('Legend')).toBeInTheDocument();
  });

  it('does not show alignment options when legend is disabled', () => {
    render(<LegendSection legend={{ enabled: false }} onClick={vi.fn()} />);
    expect(screen.queryByText('Align')).not.toBeInTheDocument();
    expect(screen.queryByText('Vertical align')).not.toBeInTheDocument();
  });

  it('shows both alignment groups when legend is enabled', () => {
    render(<LegendSection legend={{ enabled: true }} onClick={vi.fn()} />);
    expect(screen.getByText('Align')).toBeInTheDocument();
    expect(screen.getByText('Vertical align')).toBeInTheDocument();
  });

  it('shows all horizontal align options when enabled', () => {
    render(<LegendSection legend={{ enabled: true }} onClick={vi.fn()} />);
    expect(screen.getByLabelText('Left')).toBeInTheDocument();
    expect(screen.getByLabelText('Center')).toBeInTheDocument();
    expect(screen.getByLabelText('Right')).toBeInTheDocument();
  });

  it('shows all vertical align options when enabled', () => {
    render(<LegendSection legend={{ enabled: true }} onClick={vi.fn()} />);
    expect(screen.getByLabelText('Top')).toBeInTheDocument();
    expect(screen.getByLabelText('Middle')).toBeInTheDocument();
    expect(screen.getByLabelText('Bottom')).toBeInTheDocument();
  });

  it('calls onClick with enabled=true when toggled on', () => {
    const onClick = vi.fn();
    render(<LegendSection legend={{ enabled: false }} onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledWith({ enabled: true });
  });

  it('calls onClick with enabled=false when toggled off', () => {
    const onClick = vi.fn();
    render(<LegendSection legend={{ enabled: true }} onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledWith({ enabled: false });
  });

  it('calls onClick with the selected align value', () => {
    const onClick = vi.fn();
    render(<LegendSection legend={{ enabled: true, align: 'center' }} onClick={onClick} />);
    fireEvent.click(screen.getByLabelText('Left'));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ align: 'left' }));
  });

  it('calls onClick with the selected verticalAlign value', () => {
    const onClick = vi.fn();
    render(<LegendSection legend={{ enabled: true, verticalAlign: 'top' }} onClick={onClick} />);
    fireEvent.click(screen.getByLabelText('Bottom'));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ verticalAlign: 'bottom' }));
  });

  it('marks the current align option as checked', () => {
    render(<LegendSection legend={{ enabled: true, align: 'right' }} onClick={vi.fn()} />);
    expect(screen.getByLabelText('Right')).toBeChecked();
    expect(screen.getByLabelText('Left')).not.toBeChecked();
  });

  it('marks the current verticalAlign option as checked', () => {
    render(<LegendSection legend={{ enabled: true, verticalAlign: 'middle' }} onClick={vi.fn()} />);
    expect(screen.getByLabelText('Middle')).toBeChecked();
    expect(screen.getByLabelText('Top')).not.toBeChecked();
  });
});
