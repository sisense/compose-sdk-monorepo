/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CONDITIONAL_ICON_EM, CONDITIONAL_ICON_GAP_PX } from './kpi-card-styles.js';
import { KpiConditionalIcon, toIconAffix } from './kpi-conditional-icon.js';

describe('KpiConditionalIcon', () => {
  // Exception-safe spy cleanup: a failing assertion must not leak a mocked console.warn
  // into later tests.
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a text icon as the em-scaled glyph span', () => {
    const { getByText } = render(
      <KpiConditionalIcon icon={{ type: 'text', value: '⚠', color: '#a00' }} />,
    );
    const icon = getByText('⚠');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveStyle({ color: '#a00' });
  });

  it('renders a built-in icon as an svg inside a span colored by the icon color', () => {
    const { container } = render(
      <KpiConditionalIcon icon={{ type: 'built-in', name: 'check', color: '#0a0' }} />,
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.closest('span')).toHaveAttribute('aria-hidden', 'true');
    expect(svg?.closest('span')).toHaveStyle({ color: '#0a0' });
  });

  it('falls back to the host color when the icon carries none of its own', () => {
    // Locks the `icon.color ?? color` contract for SVG variants -- mirrors the existing
    // text-icon fallback covered in kpi-value.test.tsx.
    const { container } = render(
      <KpiConditionalIcon icon={{ type: 'built-in', name: 'star' }} color="#123456" />,
    );
    expect(container.querySelector('svg')?.closest('span')).toHaveStyle({ color: '#123456' });
  });

  it('renders an svg-path icon on the default 24-grid', () => {
    const { container } = render(
      <KpiConditionalIcon icon={{ type: 'svg-path', d: 'M0 0H24V24Z' }} />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg?.querySelector('path')).toHaveAttribute('d', 'M0 0H24V24Z');
  });

  it('honors an explicit svg-path viewBox for icons on another grid', () => {
    const { container } = render(
      <KpiConditionalIcon
        icon={{ type: 'svg-path', d: 'M0 0H512V512Z', viewBox: '0 0 512 512' }}
      />,
    );
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 512 512');
  });

  it('warns and renders nothing for an unknown built-in name (plain-JS escape hatch)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(
      <KpiConditionalIcon
        // @ts-expect-error -- deliberately bypasses KpiIconName to model an untyped JS consumer
        icon={{ type: 'built-in', name: 'no-such-icon' }}
      />,
    );
    expect(container.querySelector('svg')).toBeNull();
    expect(container.querySelector('span')).toBeNull();
    expect(warn).toHaveBeenCalledOnce();
  });

  it('warns and renders nothing for an unknown icon shape (plain-JS escape hatch)', () => {
    // Locks the runtime side of the exhaustiveness guard: the never-typed fence is erased in
    // plain JS, so an out-of-union shape must fail closed instead of reaching React.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(
      <KpiConditionalIcon
        // @ts-expect-error -- deliberately bypasses the KpiIcon union to model an untyped JS consumer
        icon={{ type: 'image', url: 'https://example.com/icon.svg' }}
      />,
    );
    expect(container.querySelector('svg')).toBeNull();
    expect(container.querySelector('span')).toBeNull();
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe('toIconAffix', () => {
  it('budgets a text icon as a canvas-measured em-scaled affix', () => {
    expect(toIconAffix({ type: 'text', value: '⚠' })).toEqual({
      text: '⚠',
      emScale: CONDITIONAL_ICON_EM,
      gapPx: CONDITIONAL_ICON_GAP_PX,
    });
  });

  it('budgets svg variants as a fixed em-square and folds in the extra flex gap', () => {
    expect(toIconAffix({ type: 'built-in', name: 'check' }, 4)).toEqual({
      widthEm: CONDITIONAL_ICON_EM,
      gapPx: CONDITIONAL_ICON_GAP_PX + 4,
    });
    expect(toIconAffix({ type: 'svg-path', d: 'M0 0' })).toEqual({
      widthEm: CONDITIONAL_ICON_EM,
      gapPx: CONDITIONAL_ICON_GAP_PX,
    });
  });
});
