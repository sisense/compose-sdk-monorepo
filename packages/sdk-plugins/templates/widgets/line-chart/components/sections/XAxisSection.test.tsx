import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { XAxisSection } from './XAxisSection';

describe('XAxisSection', () => {
  it('renders X-Axis label', () => {
    render(<XAxisSection onClick={vi.fn()} />);
    expect(screen.getByText('X-Axis')).toBeInTheDocument();
  });

  it('does not show axis options when disabled', () => {
    render(<XAxisSection xAxis={{ enabled: false }} onClick={vi.fn()} />);
    expect(screen.queryByLabelText('Grid Lines')).not.toBeInTheDocument();
  });

  it('shows Grid Lines and Labels checkboxes when enabled', () => {
    render(<XAxisSection xAxis={{ enabled: true }} onClick={vi.fn()} />);
    expect(screen.getByLabelText('Grid Lines')).toBeInTheDocument();
    expect(screen.getByLabelText('Labels')).toBeInTheDocument();
  });

  it('calls onClick with enabled=true when switch is toggled on', () => {
    const onClick = vi.fn();
    render(<XAxisSection onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
  });

  it('calls onClick with enabled=false when switch is toggled off', () => {
    const onClick = vi.fn();
    render(<XAxisSection xAxis={{ enabled: true }} onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it('calls onClick with toggled gridLines when Grid Lines checkbox is clicked', () => {
    const onClick = vi.fn();
    render(<XAxisSection xAxis={{ enabled: true, gridLines: false }} onClick={onClick} />);
    fireEvent.click(screen.getByLabelText('Grid Lines'));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ gridLines: true }));
  });

  it('calls onClick with toggled labels.enabled when Labels checkbox is clicked', () => {
    const onClick = vi.fn();
    render(
      <XAxisSection xAxis={{ enabled: true, labels: { enabled: false } }} onClick={onClick} />,
    );
    fireEvent.click(screen.getByLabelText('Labels'));
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ labels: expect.objectContaining({ enabled: true }) }),
    );
  });

  it('reflects checked state of Grid Lines checkbox', () => {
    render(<XAxisSection xAxis={{ enabled: true, gridLines: true }} onClick={vi.fn()} />);
    expect(screen.getByLabelText('Grid Lines')).toBeChecked();
  });

  it('calls onClick with enabled=true and updated text when title input changes', () => {
    const onClick = vi.fn();
    render(
      <XAxisSection
        xAxis={{ enabled: true, title: { enabled: true, text: 'old' } }}
        onClick={onClick}
      />,
    );
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'new title' } });
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.objectContaining({ text: 'new title', enabled: true }),
      }),
    );
  });
});
