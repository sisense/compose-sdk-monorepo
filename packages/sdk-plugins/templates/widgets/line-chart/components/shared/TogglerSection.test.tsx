import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TogglerSection } from './TogglerSection';

describe('TogglerSection', () => {
  it('renders the label text', () => {
    render(<TogglerSection label="My Section" checked={false} />);
    expect(screen.getByText('My Section')).toBeInTheDocument();
  });

  it('shows switch as active when checked=true', () => {
    render(<TogglerSection label="Test" checked={true} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('shows switch as inactive when checked=false', () => {
    render(<TogglerSection label="Test" checked={false} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onClick when the switch is clicked', () => {
    const onClick = vi.fn();
    render(<TogglerSection label="Test" checked={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
