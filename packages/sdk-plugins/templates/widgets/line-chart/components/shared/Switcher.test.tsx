import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Switcher } from './Switcher';

describe('Switcher', () => {
  it('renders with aria-checked=true when active', () => {
    render(<Switcher active={true} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('renders with aria-checked=false when inactive', () => {
    render(<Switcher active={false} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Switcher active={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Switcher active={false} disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Switcher active={false} disabled onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
