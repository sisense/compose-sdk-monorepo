/** @vitest-environment jsdom */
import { createRef } from 'react';

import { render } from '@testing-library/react';

import { KpiComparison } from './kpi-comparison.js';

/** Reads `ref.current`, failing loudly (not with a silent `null`) if it isn't populated yet. */
function requireCurrent(ref: { current: HTMLDivElement | null }): HTMLDivElement {
  if (!ref.current) {
    throw new Error('Expected ref to be populated');
  }
  return ref.current;
}

// No i18next instance is set up in this isolated test -- `t()` is stubbed to return the raw key,
// same as react-i18next's own uninitialized fallback, just without the console warning.
vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return { ...mod, useTranslation: () => ({ t: (key: string) => key }) };
});

describe('KpiComparison', () => {
  const deltaComparison = {
    type: 'delta' as const,
    baseline: 100,
    deltaValue: 20,
    deltaPercent: 20,
    label: 'vs cost',
  };

  it('renders a fixed compact font size for the primary readout when scale is compact', () => {
    const { getByText } = render(
      <KpiComparison
        comparison={deltaComparison}
        display="percent"
        showIcon={false}
        scale="compact"
        compact={false}
        onColor={false}
      />,
    );
    expect(getByText('+20.00%')).toHaveStyle({ 'font-size': '0.9rem' });
  });

  it('skips the auto-fit ResizeObserver entirely at compact scale (result unused)', () => {
    vi.mocked(ResizeObserver).mockClear();
    render(
      <KpiComparison
        comparison={deltaComparison}
        display="percent"
        showIcon={false}
        scale="compact"
        compact={false}
        onColor={false}
      />,
    );
    expect(vi.mocked(ResizeObserver)).not.toHaveBeenCalled();
  });

  describe('target display modes', () => {
    const targetComparison = {
      type: 'target' as const,
      target: 1000000,
      percentOfTarget: 82,
      toGo: 250000,
      label: 'Total Cost',
    };
    // The file-level t() mock returns raw keys, so the two lines assert as their i18n keys.
    const PERCENT_LINE = 'kpi.target.ofGoal';
    const TO_GO_LINE = 'kpi.target.toGo';

    const renderTarget = (display: 'percent' | 'value' | 'both') =>
      render(
        <KpiComparison
          comparison={targetComparison}
          display={display}
          showIcon={false}
          scale="compact"
          compact={false}
          onColor={false}
        />,
      );

    it("renders only the percent-of-goal line for display: 'percent'", () => {
      const { getByText, queryByText } = renderTarget('percent');
      expect(getByText(PERCENT_LINE)).toBeTruthy();
      expect(queryByText(TO_GO_LINE)).toBeNull();
    });

    it("renders only the amount-to-go line, styled as the primary, for display: 'value'", () => {
      const { getByText, queryByText } = renderTarget('value');
      expect(queryByText(PERCENT_LINE)).toBeNull();
      const toGo = getByText(TO_GO_LINE);
      // Primary styling, not the secondary caption: the compact-scale primary is 0.9rem.
      expect(toGo).toHaveStyle({ 'font-size': '0.9rem' });
    });

    it("renders percent primary + amount-to-go secondary for display: 'both'", () => {
      const { getByText } = renderTarget('both');
      expect(getByText(PERCENT_LINE)).toHaveStyle({ 'font-size': '0.9rem' });
      expect(getByText(TO_GO_LINE)).toHaveStyle({ 'font-size': '0.7rem' });
    });

    it('falls back to the amount-to-go line as primary when the percent is unavailable', () => {
      const { getByText, queryByText } = render(
        <KpiComparison
          comparison={{ ...targetComparison, percentOfTarget: undefined }}
          display="percent"
          showIcon={false}
          scale="compact"
          compact={false}
          onColor={false}
        />,
      );
      expect(queryByText(PERCENT_LINE)).toBeNull();
      expect(getByText(TO_GO_LINE)).toHaveStyle({ 'font-size': '0.9rem' });
    });
  });

  it('always stacks the label on its own line at headline scale, even when the tier asks for compact', () => {
    // UAT round 2 Issue 3: at ~318px the sm tier sets compact=true; inline (row) layout would
    // make the label compete with the auto-fitted headline for width and ellipsize ("Total Q…").
    const { getByText, rerender } = render(
      <KpiComparison
        comparison={deltaComparison}
        display="percent"
        showIcon={false}
        scale="headline"
        compact={true}
        onColor={false}
      />,
    );
    const readCompStackDirection = () => {
      const root = getByText('vs cost').parentElement;
      if (!root) throw new Error('Expected the label to have a ComparisonRoot parent');
      return getComputedStyle(root).flexDirection;
    };
    expect(readCompStackDirection()).toBe('column');

    // Compact scale keeps the tier-driven single-line collapse.
    rerender(
      <KpiComparison
        comparison={deltaComparison}
        display="percent"
        showIcon={false}
        scale="compact"
        compact={true}
        onColor={false}
      />,
    );
    expect(readCompStackDirection()).toBe('row');
  });

  it('renders an auto-fit (pixel) font size for the primary readout when scale is headline', () => {
    // Issue 2: in the 'big-comparison' layout the comparison takes over the headline role and
    // must participate in auto-fit sizing exactly like the value does -- not the old fixed 2.2rem.
    const { getByText } = render(
      <KpiComparison
        comparison={deltaComparison}
        display="percent"
        showIcon={false}
        scale="headline"
        compact={false}
        onColor={false}
      />,
    );
    const style = getByText('+20.00%').style.fontSize;
    expect(style.endsWith('px')).toBe(true);
    expect(style).not.toBe('2.2rem');
  });

  it('respects maxHeightPx as the auto-fit height bound instead of self-measuring the container', () => {
    const areaRef = createRef<HTMLDivElement>();
    const { getByText, rerender } = render(
      <KpiComparison
        comparison={deltaComparison}
        display="percent"
        showIcon={false}
        scale="headline"
        compact={false}
        onColor={false}
        areaRef={areaRef}
      />,
    );
    const areaElement = requireCurrent(areaRef);
    Object.defineProperty(areaElement, 'clientWidth', { value: 1000, configurable: true });
    Object.defineProperty(areaElement, 'clientHeight', { value: 0, configurable: true });
    rerender(
      <KpiComparison
        comparison={{ ...deltaComparison, deltaPercent: 21 }}
        display="percent"
        showIcon={false}
        scale="headline"
        compact={false}
        onColor={false}
        areaRef={areaRef}
      />,
    );
    expect(parseFloat(getByText('+21.00%').style.fontSize)).toBe(16); // height bound is 0

    rerender(
      <KpiComparison
        comparison={{ ...deltaComparison, deltaPercent: 22 }}
        display="percent"
        showIcon={false}
        scale="headline"
        compact={false}
        onColor={false}
        maxHeightPx={1000}
        areaRef={areaRef}
      />,
    );
    expect(parseFloat(getByText('+22.00%').style.fontSize)).toBeGreaterThan(16);
  });

  it('forwards areaRef to ComparisonArea so the orchestrator can measure it externally', () => {
    const areaRef = createRef<HTMLDivElement>();
    render(
      <KpiComparison
        comparison={deltaComparison}
        display="percent"
        showIcon={false}
        scale="compact"
        compact={false}
        onColor={false}
        areaRef={areaRef}
      />,
    );
    expect(areaRef.current).not.toBeNull();
    expect(areaRef.current).toHaveAttribute('data-kpi-area', 'comparison');
  });

  it('measures the real rendered primary text per comparison type (target, headline scale)', () => {
    // Regression guard: the auto-fit hook is called unconditionally (rules of hooks) before the
    // type-specific branches, so it must measure whatever text actually renders for each type --
    // not a stand-in -- for every comparison.type, not just delta/previous-period.
    const { getByText } = render(
      <KpiComparison
        comparison={{ type: 'target', target: 100, percentOfTarget: 82, toGo: 18, label: 'Goal' }}
        display="percent"
        showIcon={false}
        scale="headline"
        compact={false}
        onColor={false}
      />,
    );
    // No i18next instance is set up in this isolated test, so `t()` returns the raw key rather
    // than the interpolated '82% of Goal' -- irrelevant here, since this test only cares that
    // *some* primary text got measured and sized in px (not the old fixed 2.2rem).
    expect(getByText('kpi.target.ofGoal').style.fontSize.endsWith('px')).toBe(true);
  });

  it('measures the real rendered primary text per comparison type (value, headline scale)', () => {
    const { getByText } = render(
      <KpiComparison
        comparison={{ type: 'value', value: 250000, label: 'Total Cost' }}
        display="percent"
        showIcon={false}
        scale="headline"
        compact={false}
        onColor={false}
      />,
    );
    expect(getByText('250K').style.fontSize.endsWith('px')).toBe(true);
  });
});
