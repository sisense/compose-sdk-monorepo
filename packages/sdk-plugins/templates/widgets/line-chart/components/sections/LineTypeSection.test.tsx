import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LineTypeSection } from './LineTypeSection';

describe('LineTypeSection', () => {
  it('renders section title', () => {
    render(<LineTypeSection onClick={vi.fn()} />);
    expect(screen.getByText('Line Type')).toBeInTheDocument();
  });

  it('renders both Straight and Smooth options', () => {
    render(<LineTypeSection onClick={vi.fn()} />);
    expect(screen.getByText('Straight')).toBeInTheDocument();
    expect(screen.getByText('Smooth')).toBeInTheDocument();
  });

  it('marks Straight button as pressed when lineType is line/basic', () => {
    render(<LineTypeSection lineType="line/basic" onClick={vi.fn()} />);
    expect(screen.getByText('Straight').closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Smooth').closest('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('marks Smooth button as pressed when lineType is line/spline', () => {
    render(<LineTypeSection lineType="line/spline" onClick={vi.fn()} />);
    expect(screen.getByText('Smooth').closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Straight').closest('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onClick with line/basic when Straight button is clicked', () => {
    const onClick = vi.fn();
    render(<LineTypeSection lineType="line/spline" onClick={onClick} />);
    fireEvent.click(screen.getByText('Straight').closest('button')!);
    expect(onClick).toHaveBeenCalledWith('line/basic');
  });

  it('calls onClick with line/spline when Smooth button is clicked', () => {
    const onClick = vi.fn();
    render(<LineTypeSection lineType="line/basic" onClick={onClick} />);
    fireEvent.click(screen.getByText('Smooth').closest('button')!);
    expect(onClick).toHaveBeenCalledWith('line/spline');
  });
});
