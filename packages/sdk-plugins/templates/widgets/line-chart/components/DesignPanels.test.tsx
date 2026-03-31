import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { StyleOptions } from '../types.js';
import { DesignPanels } from './DesignPanels.js';

const { mockLineDesignPanel } = vi.hoisted(() => ({
  mockLineDesignPanel: vi.fn(
    ({ onChange }: { onChange: (name: string, value: unknown) => void }) => (
      <button
        data-testid="line-design-panel"
        onClick={() => onChange('legend', { enabled: false })}
      />
    ),
  ),
}));

vi.mock('./sections/LineDesignPanel.js', () => ({
  LineDesignPanel: mockLineDesignPanel,
}));

// Stub @emotion/styled so its runtime (useContext, ThemeContext) is never invoked
vi.mock('@emotion/styled', async () => {
  const { createElement } = await import('react');
  const makeTaggedTemplate =
    (tag: string) =>
    () =>
    ({ children }: { children?: React.ReactNode }) =>
      createElement(tag, {}, children);
  const styled: any = (tag: string) => makeTaggedTemplate(tag);
  ['div', 'span', 'section', 'article', 'main', 'aside', 'p'].forEach((tag) => {
    styled[tag] = makeTaggedTemplate(tag);
  });
  return { default: styled };
});

const baseStyleOptions = {
  legend: { enabled: true },
  subtype: 'line/basic',
} as unknown as StyleOptions;

describe('DesignPanels (line-chart template)', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without error', () => {
    expect(() =>
      render(<DesignPanels styleOptions={baseStyleOptions} onChange={mockOnChange} />),
    ).not.toThrow();
  });

  it('renders LineDesignPanel', () => {
    render(<DesignPanels styleOptions={baseStyleOptions} onChange={mockOnChange} />);
    expect(screen.getByTestId('line-design-panel')).toBeInTheDocument();
  });

  it('passes styleOptions to LineDesignPanel', () => {
    render(<DesignPanels styleOptions={baseStyleOptions} onChange={mockOnChange} />);
    expect(mockLineDesignPanel).toHaveBeenCalledWith(
      expect.objectContaining({ styleOptions: baseStyleOptions }),
      expect.anything(),
    );
  });

  it('calls onChange with merged styleOptions when LineDesignPanel triggers a change', () => {
    render(<DesignPanels styleOptions={baseStyleOptions} onChange={mockOnChange} />);
    fireEvent.click(screen.getByTestId('line-design-panel'));
    // LineDesignPanel calls onChange('legend', { enabled: false })
    // DesignPanels merges: { ...baseStyleOptions, legend: { enabled: false } }
    expect(mockOnChange).toHaveBeenCalledWith({
      ...baseStyleOptions,
      legend: { enabled: false },
    });
  });

  it('overwrites only the changed key while preserving the rest of styleOptions', () => {
    const styleOptions = {
      legend: { enabled: true },
      subtype: 'line/spline',
      markers: {},
    } as unknown as StyleOptions;
    render(<DesignPanels styleOptions={styleOptions} onChange={mockOnChange} />);
    fireEvent.click(screen.getByTestId('line-design-panel'));
    const result = mockOnChange.mock.calls[0][0];
    expect(result.subtype).toBe('line/spline');
    expect(result.markers).toEqual({});
    expect(result.legend).toEqual({ enabled: false });
  });
});
