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

  it('calls onClick with undefined min when Min input is cleared', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection
        {...baseProps}
        hasRange={true}
        onClick={onClick}
        yAxis={{ enabled: true, min: 5 }}
      />,
    );
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[1], { target: { value: '' } });
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ min: undefined }));
  });

  it('preserves intervalJumps when logarithmic is toggled off', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection
        {...baseProps}
        hasRange={true}
        onClick={onClick}
        yAxis={{ enabled: true, logarithmic: true, intervalJumps: 10 }}
      />,
    );
    fireEvent.click(screen.getByText('Logarithmic').closest('tr') as HTMLTableRowElement);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ logarithmic: false, intervalJumps: 10 }),
    );
  });

  it('calls onClick with toggled gridLines when Grid Lines row is clicked', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection
        {...baseProps}
        hasGridLine={true}
        onClick={onClick}
        yAxis={{ enabled: true, gridLines: false }}
      />,
    );
    fireEvent.click(screen.getByText('Grid Lines').closest('tr') as HTMLTableRowElement);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ gridLines: true }));
  });

  it('calls onClick with toggled logarithmic when Logarithmic row is clicked', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection
        {...baseProps}
        hasRange={true}
        onClick={onClick}
        yAxis={{ enabled: true, logarithmic: false }}
      />,
    );
    fireEvent.click(screen.getByText('Logarithmic').closest('tr') as HTMLTableRowElement);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ logarithmic: true }));
  });

  it('calls onClick with toggled title.enabled when title checkbox cell is clicked', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection
        {...baseProps}
        onClick={onClick}
        yAxis={{ enabled: true, title: { enabled: false } }}
      />,
    );
    // The title row: find the "Title" label, navigate to its tr, click the first td (checkbox cell)
    const titleLabel = screen.getByText('Title');
    const titleRow = titleLabel.closest('tr');
    const checkboxCell = titleRow?.querySelector('td');
    fireEvent.click(checkboxCell!);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.objectContaining({ enabled: true }) }),
    );
  });

  it('calls onClick with toggled title.enabled when title label div is clicked', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection
        {...baseProps}
        onClick={onClick}
        yAxis={{ enabled: true, title: { enabled: true } }}
      />,
    );
    fireEvent.click(screen.getByText('Title'));
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.objectContaining({ enabled: false }) }),
    );
  });

  it('calls onClick with enabled=true when title input is focused while disabled', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection
        {...baseProps}
        onClick={onClick}
        yAxis={{ enabled: true, title: { enabled: false } }}
      />,
    );
    fireEvent.focus(screen.getAllByRole('textbox')[0]);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.objectContaining({ enabled: true }) }),
    );
  });

  it('does not call onClick when title input is focused while already enabled', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection
        {...baseProps}
        onClick={onClick}
        yAxis={{ enabled: true, title: { enabled: true } }}
      />,
    );
    fireEvent.focus(screen.getAllByRole('textbox')[0]);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick with parsed max value when Max input changes', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection {...baseProps} hasRange={true} onClick={onClick} yAxis={{ enabled: true }} />,
    );
    const inputs = screen.getAllByRole('textbox');
    // inputs: [title, min, max, interval]
    fireEvent.change(inputs[2], { target: { value: '100' } });
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ max: 100 }));
  });

  it('calls onClick with undefined max when Max input is cleared', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection
        {...baseProps}
        hasRange={true}
        onClick={onClick}
        yAxis={{ enabled: true, max: 50 }}
      />,
    );
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[2], { target: { value: '' } });
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ max: undefined }));
  });

  it('calls onClick with parsed intervalJumps when Interval input changes', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection {...baseProps} hasRange={true} onClick={onClick} yAxis={{ enabled: true }} />,
    );
    const inputs = screen.getAllByRole('textbox');
    // inputs: [title, min, max, interval]
    fireEvent.change(inputs[3], { target: { value: '5' } });
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ intervalJumps: 5, isIntervalEnabled: true }),
    );
  });

  it('calls onClick with undefined intervalJumps when Interval input is cleared', () => {
    const onClick = vi.fn();
    render(
      <YAxisSection
        {...baseProps}
        hasRange={true}
        onClick={onClick}
        yAxis={{ enabled: true, intervalJumps: 10 }}
      />,
    );
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[3], { target: { value: '' } });
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ intervalJumps: undefined, isIntervalEnabled: false }),
    );
  });

  it('hides the Interval row when yAxis.logarithmic is true', () => {
    render(
      <YAxisSection {...baseProps} hasRange={true} yAxis={{ enabled: true, logarithmic: true }} />,
    );
    expect(screen.queryByText('Interval')).not.toBeInTheDocument();
  });

  it('shows the Interval row when yAxis.logarithmic is false', () => {
    render(
      <YAxisSection {...baseProps} hasRange={true} yAxis={{ enabled: true, logarithmic: false }} />,
    );
    expect(screen.getByText('Interval')).toBeInTheDocument();
  });
});
