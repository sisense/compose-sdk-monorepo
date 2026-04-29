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

  it('calls onClick with toggled title.enabled when title checkbox is changed', () => {
    const onClick = vi.fn();
    render(<XAxisSection xAxis={{ enabled: true, title: { enabled: false } }} onClick={onClick} />);
    // Checkboxes: 0=gridLines, 1=labels, 2=title, 3=x2Title
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[2]);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.objectContaining({ enabled: true }) }),
    );
  });

  it('calls onClick with toggled title.enabled when title button is clicked', () => {
    const onClick = vi.fn();
    render(<XAxisSection xAxis={{ enabled: true, title: { enabled: true } }} onClick={onClick} />);
    // Buttons: 0=title, 1=x2Title
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.objectContaining({ enabled: false }) }),
    );
  });

  it('calls onClick with enabled=true when title input is focused while disabled', () => {
    const onClick = vi.fn();
    render(<XAxisSection xAxis={{ enabled: true, title: { enabled: false } }} onClick={onClick} />);
    fireEvent.focus(screen.getAllByRole('textbox')[0]);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.objectContaining({ enabled: true }) }),
    );
  });

  it('does not call onClick when title input is focused while already enabled', () => {
    const onClick = vi.fn();
    render(<XAxisSection xAxis={{ enabled: true, title: { enabled: true } }} onClick={onClick} />);
    fireEvent.focus(screen.getAllByRole('textbox')[0]);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick with toggled x2Title.enabled when x2Title checkbox is changed', () => {
    const onClick = vi.fn();
    render(
      <XAxisSection xAxis={{ enabled: true, x2Title: { enabled: false } }} onClick={onClick} />,
    );
    // Checkboxes: 0=gridLines, 1=labels, 2=title, 3=x2Title
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[3]);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ x2Title: expect.objectContaining({ enabled: true }) }),
    );
  });

  it('calls onClick with enabled=true and text when x2Title input changes', () => {
    const onClick = vi.fn();
    render(
      <XAxisSection
        xAxis={{ enabled: true, x2Title: { enabled: true, text: 'old' } }}
        onClick={onClick}
      />,
    );
    // Textboxes: 0=title, 1=x2Title
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'new x2 title' } });
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        x2Title: expect.objectContaining({ text: 'new x2 title', enabled: true }),
      }),
    );
  });
});
