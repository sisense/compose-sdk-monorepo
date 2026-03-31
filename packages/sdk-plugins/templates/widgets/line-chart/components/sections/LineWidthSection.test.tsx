import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LineWidthSection } from './LineWidthSection';

describe('LineWidthSection', () => {
  it('renders section title', () => {
    render(<LineWidthSection onClick={vi.fn()} />);
    expect(screen.getByText('Line Width')).toBeInTheDocument();
  });

  it('renders all three width options', () => {
    render(<LineWidthSection onClick={vi.fn()} />);
    expect(screen.getByText('Thin')).toBeInTheDocument();
    expect(screen.getByText('Bold')).toBeInTheDocument();
    expect(screen.getByText('Thick')).toBeInTheDocument();
  });

  it('calls onClick with 1 when Thin row is clicked', () => {
    const onClick = vi.fn();
    render(<LineWidthSection onClick={onClick} />);
    fireEvent.click(screen.getByText('Thin').closest('tr')!);
    expect(onClick).toHaveBeenCalledWith(1);
  });

  it('calls onClick with 3 when Bold row is clicked', () => {
    const onClick = vi.fn();
    render(<LineWidthSection onClick={onClick} />);
    fireEvent.click(screen.getByText('Bold').closest('tr')!);
    expect(onClick).toHaveBeenCalledWith(3);
  });

  it('calls onClick with 5 when Thick row is clicked', () => {
    const onClick = vi.fn();
    render(<LineWidthSection onClick={onClick} />);
    fireEvent.click(screen.getByText('Thick').closest('tr')!);
    expect(onClick).toHaveBeenCalledWith(5);
  });
});
