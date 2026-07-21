/** @vitest-environment jsdom */
import { createRef } from 'react';

import { render } from '@testing-library/react';

import { KpiValue } from './kpi-value.js';

/** Reads `ref.current`, failing loudly (not with a silent `null`) if it isn't populated yet. */
function requireCurrent(ref: { current: HTMLDivElement | null }): HTMLDivElement {
  if (!ref.current) {
    throw new Error('Expected ref to be populated');
  }
  return ref.current;
}

describe('KpiValue', () => {
  it('renders a fixed numeric textSize as that many px regardless of scale', () => {
    const { getByText, rerender } = render(
      <KpiValue text="42" textSize={35.2} onColor={false} scale="headline" />,
    );
    expect(getByText('42')).toHaveStyle({ 'font-size': '35.2px' });

    rerender(<KpiValue text="42" textSize={35.2} onColor={false} scale="compact" />);
    expect(getByText('42')).toHaveStyle({ 'font-size': '35.2px' });
  });

  it('renders a fixed compact font size (not auto-fit px) when scale is compact and textSize is auto', () => {
    // Issue 2: in the 'big-comparison' layout the value takes the small/compact role -- it must
    // render a fixed, small size, not participate in auto-fit sizing at all.
    const { getByText } = render(
      <KpiValue text="14.48M" textSize="auto" onColor={false} scale="compact" />,
    );
    expect(getByText('14.48M')).toHaveStyle({ 'font-size': '0.9rem' });
  });

  it('skips the auto-fit ResizeObserver entirely when the result is unused (compact scale / fixed textSize)', () => {
    vi.mocked(ResizeObserver).mockClear();
    const { rerender } = render(
      <KpiValue text="14.48M" textSize="auto" onColor={false} scale="compact" />,
    );
    rerender(<KpiValue text="14.48M" textSize={48} onColor={false} scale="headline" />);
    expect(vi.mocked(ResizeObserver)).not.toHaveBeenCalled();
  });

  it('renders an auto-fit (pixel) font size when scale is headline and textSize is auto', () => {
    const { getByText } = render(
      <KpiValue text="14.48M" textSize="auto" onColor={false} scale="headline" />,
    );
    const style = getByText('14.48M').style.fontSize;
    expect(style.endsWith('px')).toBe(true);
    // jsdom has no real layout, so the container measures 0x0 and the hook falls back to minPx.
    expect(style).toBe('16px');
  });

  it('respects maxHeightPx as the auto-fit height bound instead of self-measuring the container', () => {
    // A wide (mocked) container with NO maxHeightPx override self-measures clientHeight, which
    // jsdom reports as 0 -- clamping to minPx regardless of width. Supplying a generous
    // maxHeightPx must lift that clamp, proving it's actually used as the height bound.
    const areaRef = createRef<HTMLDivElement>();
    const { getByText, rerender } = render(
      <KpiValue text="1" textSize="auto" onColor={false} scale="headline" areaRef={areaRef} />,
    );
    const areaElement = requireCurrent(areaRef);
    Object.defineProperty(areaElement, 'clientWidth', { value: 1000, configurable: true });
    Object.defineProperty(areaElement, 'clientHeight', { value: 0, configurable: true });
    // Re-render (changing text) forces a re-fit against the newly mocked clientWidth -- the
    // ResizeObserver mock won't fire on its own in this environment.
    rerender(
      <KpiValue text="2" textSize="auto" onColor={false} scale="headline" areaRef={areaRef} />,
    );
    expect(getByText('2').style.fontSize).toBe('16px'); // clamped: height bound (0) is 0

    rerender(
      <KpiValue
        text="3"
        textSize="auto"
        onColor={false}
        scale="headline"
        maxHeightPx={1000}
        areaRef={areaRef}
      />,
    );
    const liftedFontSize = parseFloat(getByText('3').style.fontSize);
    expect(liftedFontSize).toBeGreaterThan(16);
  });

  it('forwards areaRef to ValueArea so the orchestrator can measure it externally', () => {
    const areaRef = createRef<HTMLDivElement>();
    render(
      <KpiValue text="42" textSize="auto" onColor={false} scale="compact" areaRef={areaRef} />,
    );
    expect(areaRef.current).not.toBeNull();
    expect(areaRef.current).toHaveAttribute('data-kpi-area', 'value');
  });

  it('renders a conditional icon alongside the text', () => {
    const { getByText } = render(
      <KpiValue
        text="150"
        textSize="auto"
        onColor={false}
        scale="headline"
        icon={{ icon: '✓', color: '#00aa00', expression: '100', operator: '>' }}
      />,
    );
    const icon = getByText('✓');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveStyle({ color: '#00aa00' });
  });
});
