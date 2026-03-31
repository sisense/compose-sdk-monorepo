import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MarkerSection } from './MarkerSection';

describe('MarkerSection', () => {
  it('renders Markers label', () => {
    render(<MarkerSection onClick={vi.fn()} />);
    expect(screen.getByText('Markers')).toBeInTheDocument();
  });

  it('does not show fill/size options when disabled', () => {
    render(<MarkerSection onClick={vi.fn()} />);
    expect(screen.queryByText('Filled')).not.toBeInTheDocument();
  });

  it('shows current fill label when enabled', () => {
    render(
      <MarkerSection marker={{ enabled: true, fill: 'filled', size: 'small' }} onClick={vi.fn()} />,
    );
    expect(screen.getByText('Filled')).toBeInTheDocument();
  });

  it('shows current size label when enabled', () => {
    render(
      <MarkerSection marker={{ enabled: true, fill: 'filled', size: 'large' }} onClick={vi.fn()} />,
    );
    expect(screen.getByText('Large')).toBeInTheDocument();
  });

  it('calls onClick with enabled=true when toggled on', () => {
    const onClick = vi.fn();
    render(<MarkerSection onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
  });

  it('calls onClick with fill=hollow when hollow cell is clicked', () => {
    const onClick = vi.fn();
    render(
      <MarkerSection marker={{ enabled: true, fill: 'filled', size: 'small' }} onClick={onClick} />,
    );
    // Table 1, row 1: cells[0]=filled icon, cells[1]=hollow icon
    const cells = screen.getAllByRole('cell');
    fireEvent.click(cells[1]);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ fill: 'hollow' }));
  });

  it('calls onClick with fill=filled when filled cell is clicked', () => {
    const onClick = vi.fn();
    render(
      <MarkerSection marker={{ enabled: true, fill: 'hollow', size: 'small' }} onClick={onClick} />,
    );
    const cells = screen.getAllByRole('cell');
    fireEvent.click(cells[0]);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ fill: 'filled' }));
  });

  it('calls onClick with size=large when large cell is clicked', () => {
    const onClick = vi.fn();
    render(
      <MarkerSection marker={{ enabled: true, fill: 'filled', size: 'small' }} onClick={onClick} />,
    );
    // Table 1: cells[0,1]=icons, cells[2]=text. Table 2: cells[3]=small, cells[4]=large
    const cells = screen.getAllByRole('cell');
    fireEvent.click(cells[4]);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ size: 'large' }));
  });

  it('calls onClick with size=small when small cell is clicked', () => {
    const onClick = vi.fn();
    render(
      <MarkerSection marker={{ enabled: true, fill: 'filled', size: 'large' }} onClick={onClick} />,
    );
    const cells = screen.getAllByRole('cell');
    fireEvent.click(cells[3]);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ size: 'small' }));
  });
});
