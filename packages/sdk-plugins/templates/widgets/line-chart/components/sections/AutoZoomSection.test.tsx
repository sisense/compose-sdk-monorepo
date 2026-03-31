import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AutoZoomSection } from './AutoZoomSection';

describe('AutoZoomSection', () => {
  it('renders Auto Zoom label', () => {
    render(<AutoZoomSection onClick={vi.fn()} />);
    expect(screen.getByText('Auto Zoom')).toBeInTheDocument();
  });

  it('shows switch as inactive when navigator is undefined', () => {
    render(<AutoZoomSection onClick={vi.fn()} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('shows switch as active when navigator is enabled', () => {
    render(<AutoZoomSection navigator={{ enabled: true }} onClick={vi.fn()} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onClick with enabled=true when toggled on', () => {
    const onClick = vi.fn();
    render(<AutoZoomSection onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledWith({ enabled: true });
  });

  it('calls onClick with enabled=false when toggled off', () => {
    const onClick = vi.fn();
    render(<AutoZoomSection navigator={{ enabled: true }} onClick={onClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledWith({ enabled: false });
  });
});
