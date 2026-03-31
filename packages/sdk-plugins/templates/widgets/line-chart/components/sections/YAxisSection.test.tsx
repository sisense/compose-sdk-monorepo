import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { YAxisSection } from './YAxisSection';

const baseProps = {
  sectionTitle: 'Y-Axis',
  hasGridLine: false,
  hasRange: false,
  onClick: vi.fn(),
};

describe('YAxisSection', () => {
  it('renders the section title', () => {
    render(<YAxisSection {...baseProps} />);
    expect(screen.getByText('Y-Axis')).toBeInTheDocument();
  });

  it('does not show axis options when disabled', () => {
    render(<YAxisSection {...baseProps} />);
    expect(screen.queryByText('Labels')).not.toBeInTheDocument();
  });

  it('shows Labels row when enabled', () => {
    render(<YAxisSection {...baseProps} yAxis={{ enabled: true }} />);
    expect(screen.getByText('Labels')).toBeInTheDocument();
  });

  it('calls onClick with enabled=true when toggled on', () => {
    const onClick = vi.fn();
    render(<YAxisSection {...baseProps} onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
  });

  it('calls onClick with enabled=false when toggled off', () => {
    const onClick = vi.fn();
    render(<YAxisSection {...baseProps} onClick={onClick} yAxis={{ enabled: true }} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it('shows Grid Lines row when enabled and hasGridLine=true', () => {
    render(<YAxisSection {...baseProps} hasGridLine={true} yAxis={{ enabled: true }} />);
    expect(screen.getByText('Grid Lines')).toBeInTheDocument();
  });

  it('does not show Grid Lines row when hasGridLine=false', () => {
    render(<YAxisSection {...baseProps} hasGridLine={false} yAxis={{ enabled: true }} />);
    expect(screen.queryByText('Grid Lines')).not.toBeInTheDocument();
  });

  it('shows Logarithmic row when enabled and hasRange=true', () => {
    render(<YAxisSection {...baseProps} hasRange={true} yAxis={{ enabled: true }} />);
    expect(screen.getByText('Logarithmic')).toBeInTheDocument();
  });

  it('shows Min/Max inputs when enabled and hasRange=true', () => {
    render(<YAxisSection {...baseProps} hasRange={true} yAxis={{ enabled: true }} />);
    expect(screen.getByText('Min')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  it('calls onClick with toggled labels.enabled when Labels row is clicked', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection
        {...baseProps}
        onClick={onClick}
        yAxis={{ enabled: true, labels: { enabled: false } }}
      />,
    );
    fireEvent.click(screen.getByText('Labels').closest('tr') as HTMLTableRowElement);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ labels: expect.objectContaining({ enabled: true }) }),
    );
  });

  it('calls onClick with updated title text when title input changes', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection
        {...baseProps}
        onClick={onClick}
        yAxis={{ enabled: true, title: { enabled: true, text: 'old' } }}
      />,
    );
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'new title' } });
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.objectContaining({ text: 'new title' }),
      }),
    );
  });

  it('calls onClick with parsed min value when Min input changes', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection {...baseProps} hasRange={true} onClick={onClick} yAxis={{ enabled: true }} />,
    );
    const inputs = screen.getAllByRole('textbox');
    // inputs: [title, min, max, interval]
    fireEvent.change(inputs[1], { target: { value: '10' } });
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ min: 10 }));
  });
});
