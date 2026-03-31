import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ValueLabelSection } from './ValueLabelSection';

describe('ValueLabelSection', () => {
  it('renders Value Labels label', () => {
    render(<ValueLabelSection onClick={vi.fn()} />);
    expect(screen.getByText('Value Labels')).toBeInTheDocument();
  });

  it('does not show alignment options when disabled', () => {
    render(<ValueLabelSection valueLabel={{ enabled: false }} onClick={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Horizontal' })).not.toBeInTheDocument();
  });

  it('shows all alignment options when enabled', () => {
    render(<ValueLabelSection valueLabel={{ enabled: true }} onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Horizontal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Diagonal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vertical' })).toBeInTheDocument();
  });

  it('calls onClick with enabled=true when toggled on', () => {
    const onClick = vi.fn();
    render(<ValueLabelSection valueLabel={{ enabled: false }} onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
  });

  it('calls onClick with enabled=false when toggled off', () => {
    const onClick = vi.fn();
    render(<ValueLabelSection valueLabel={{ enabled: true }} onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it('calls onClick with rotation=0 when Horizontal is clicked', () => {
    const onClick = vi.fn();
    render(<ValueLabelSection valueLabel={{ enabled: true, rotation: -45 }} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Horizontal' }));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ rotation: 0 }));
  });

  it('calls onClick with rotation=-45 when Diagonal is clicked', () => {
    const onClick = vi.fn();
    render(<ValueLabelSection valueLabel={{ enabled: true, rotation: 0 }} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Diagonal' }));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ rotation: -45 }));
  });

  it('calls onClick with rotation=-90 when Vertical is clicked', () => {
    const onClick = vi.fn();
    render(<ValueLabelSection valueLabel={{ enabled: true, rotation: 0 }} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Vertical' }));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ rotation: -90 }));
  });

  it('marks the current alignment as aria-pressed=true', () => {
    render(<ValueLabelSection valueLabel={{ enabled: true, rotation: 0 }} onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Horizontal' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Diagonal' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
