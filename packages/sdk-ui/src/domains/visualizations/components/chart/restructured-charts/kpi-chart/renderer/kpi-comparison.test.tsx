/** @vitest-environment jsdom */
import { createRef } from 'react';

import { render } from '@testing-library/react';

import { KPI_COMPARISON_TEXT_STYLE_DEFAULTS } from '../design-options/design-options.js';
import { KpiComparison } from './kpi-comparison.js';

const COMPARISON_TEXT_STYLE = KPI_COMPARISON_TEXT_STYLE_DEFAULTS;

/** Reads `ref.current`, failing loudly (not with a silent `null`) if it isn't populated yet. */
function requireCurrent(ref: { current: HTMLDivElement | null }): HTMLDivElement {
  if (!ref.current) {
    throw new Error('Expected ref to be populated');
  }
  return ref.current;
}

// No i18next instance is set up in this isolated test -- `t()` is stubbed with the English
// templates the component's formatting depends on (interpolated by hand), echoing raw keys for
// everything else, same as react-i18next's own uninitialized fallback minus the console warning.
const T_DICT: Record<string, string> = {
  'kpi.percentFormat': '{{sign}}{{value}}%',
  'kpi.target.ofGoal': '{{percent}} of goal ({{goalValue}})',
  'kpi.target.toGo': '{{value}} to go',
  'kpi.comparison.vsBaseline': 'vs {{label}}',
  'kpi.comparison.withBaseline': '{{label}} ({{baseline}})',
};
vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return {
    ...mod,
    useTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) =>
        (T_DICT[key] ?? key).replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
          options && name in options ? String(options[name]) : match,
        ),
    }),
  };
});

describe('KpiComparison', () => {
  const deltaComparison = {
    type: 'delta' as const,
    baseline: 100,
    deltaValue: 20,
    deltaPercent: 20,
    label: 'cost',
  };

  it('renders a fixed compact font size for the primary readout when scale is compact', () => {
    const { getByText } = render(
      <KpiComparison
        textStyle={COMPARISON_TEXT_STYLE}
        comparison={deltaComparison}
        display="percent"
        showIcon={false}
        scale="compact"
        compact={false}
        onColor={false}
      />,
    );
    expect(getByText('+20.00%').parentElement).toHaveStyle({ 'font-size': '0.9rem' });
  });

  it('skips the auto-fit ResizeObserver entirely at compact scale (result unused)', () => {
    vi.mocked(ResizeObserver).mockClear();
    render(
      <KpiComparison
        textStyle={COMPARISON_TEXT_STYLE}
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
    // Rendered through the file-level t() mock's English templates.
    const PERCENT_LINE = '82% of goal (1M)';
    const TO_GO_LINE = '250K to go';

    const renderTarget = (display: 'percent' | 'value' | 'both') =>
      render(
        <KpiComparison
          textStyle={COMPARISON_TEXT_STYLE}
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
      expect(toGo.parentElement).toHaveStyle({ 'font-size': '0.9rem' });
    });

    it("renders percent primary + amount-to-go secondary for display: 'both'", () => {
      const { getByText } = renderTarget('both');
      expect(getByText(PERCENT_LINE).parentElement).toHaveStyle({ 'font-size': '0.9rem' });
      expect(getByText(TO_GO_LINE)).toHaveStyle({ 'font-size': '0.7rem' });
    });

    it('falls back to the amount-to-go line as primary when the percent is unavailable', () => {
      const { getByText, queryByText } = render(
        <KpiComparison
          textStyle={COMPARISON_TEXT_STYLE}
          comparison={{ ...targetComparison, percentOfTarget: undefined }}
          display="percent"
          showIcon={false}
          scale="compact"
          compact={false}
          onColor={false}
        />,
      );
      expect(queryByText(PERCENT_LINE)).toBeNull();
      expect(getByText(TO_GO_LINE).parentElement).toHaveStyle({ 'font-size': '0.9rem' });
    });

    it('renders consumer targetTextOverrides templates instead of the localized strings', () => {
      const { getByText, queryByText } = render(
        <KpiComparison
          textStyle={COMPARISON_TEXT_STYLE}
          comparison={targetComparison}
          display="both"
          showIcon={false}
          scale="compact"
          compact={false}
          onColor={false}
          targetTextOverrides={{
            ofGoalText: '{{percent}} of {{goal}}',
            toGoText: '{{value}} remaining',
          }}
        />,
      );
      expect(getByText('82% of Total Cost')).toBeTruthy();
      expect(getByText('250K remaining')).toBeTruthy();
      expect(queryByText(PERCENT_LINE)).toBeNull();
      expect(queryByText(TO_GO_LINE)).toBeNull();
    });

    it('feeds a labelOverride into the override template’s {{goal}} placeholder', () => {
      const { getByText } = render(
        <KpiComparison
          textStyle={COMPARISON_TEXT_STYLE}
          comparison={targetComparison}
          display="percent"
          showIcon={false}
          scale="compact"
          compact={false}
          onColor={false}
          labelOverride="Q4 quota"
          targetTextOverrides={{ ofGoalText: '{{percent}} of {{goal}}' }}
        />,
      );
      expect(getByText('82% of Q4 quota')).toBeTruthy();
    });
  });

  it('always stacks the label on its own line at headline scale, even when the tier asks for compact', () => {
    // UAT round 2 Issue 3: at ~318px the sm tier sets compact=true; inline (row) layout would
    // make the label compete with the auto-fitted headline for width and ellipsize ("Total Q…").
    const { getByText, rerender } = render(
      <KpiComparison
        textStyle={COMPARISON_TEXT_STYLE}
        comparison={deltaComparison}
        display="percent"
        showIcon={false}
        scale="headline"
        compact={true}
        onColor={false}
      />,
    );
    const readCompStackDirection = () => {
      const root = getByText('vs cost (100)').parentElement;
      if (!root) throw new Error('Expected the label to have a ComparisonRoot parent');
      return getComputedStyle(root).flexDirection;
    };
    expect(readCompStackDirection()).toBe('column');

    // Compact scale keeps the tier-driven single-line collapse.
    rerender(
      <KpiComparison
        textStyle={COMPARISON_TEXT_STYLE}
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
    // Issue 2: in the 'comparison-first' layout the comparison takes over the headline role and
    // must participate in auto-fit sizing exactly like the value does -- not the old fixed 2.2rem.
    const { getByText } = render(
      <KpiComparison
        textStyle={COMPARISON_TEXT_STYLE}
        comparison={deltaComparison}
        display="percent"
        showIcon={false}
        scale="headline"
        compact={false}
        onColor={false}
      />,
    );
    const style = getByText('+20.00%').parentElement!.style.fontSize;
    expect(style.endsWith('px')).toBe(true);
    expect(style).not.toBe('2.2rem');
  });

  it('respects maxHeightPx as the auto-fit height bound instead of self-measuring the container', () => {
    const areaRef = createRef<HTMLDivElement>();
    const { getByText, rerender } = render(
      <KpiComparison
        textStyle={COMPARISON_TEXT_STYLE}
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
        textStyle={COMPARISON_TEXT_STYLE}
        comparison={{ ...deltaComparison, deltaPercent: 21 }}
        display="percent"
        showIcon={false}
        scale="headline"
        compact={false}
        onColor={false}
        areaRef={areaRef}
      />,
    );
    expect(parseFloat(getByText('+21.00%').parentElement!.style.fontSize)).toBe(16); // height bound is 0

    rerender(
      <KpiComparison
        textStyle={COMPARISON_TEXT_STYLE}
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
    expect(parseFloat(getByText('+22.00%').parentElement!.style.fontSize)).toBeGreaterThan(16);
  });

  it('forwards areaRef to ComparisonArea so the orchestrator can measure it externally', () => {
    const areaRef = createRef<HTMLDivElement>();
    render(
      <KpiComparison
        textStyle={COMPARISON_TEXT_STYLE}
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
        textStyle={COMPARISON_TEXT_STYLE}
        comparison={{ type: 'target', target: 100, percentOfTarget: 82, toGo: 18, label: 'Goal' }}
        display="percent"
        showIcon={false}
        scale="headline"
        compact={false}
        onColor={false}
      />,
    );
    // This test only cares that the *rendered* primary text got measured and sized in px (not
    // the old fixed 2.2rem).
    expect(getByText('82% of goal (100)').parentElement!.style.fontSize.endsWith('px')).toBe(true);
  });

  it('measures the real rendered primary text per comparison type (value, headline scale)', () => {
    const { getByText } = render(
      <KpiComparison
        textStyle={COMPARISON_TEXT_STYLE}
        comparison={{ type: 'value', value: 250000, label: 'Total Cost' }}
        display="percent"
        showIcon={false}
        scale="headline"
        compact={false}
        onColor={false}
      />,
    );
    expect(getByText('250K').parentElement!.style.fontSize.endsWith('px')).toBe(true);
  });

  it("renders no label line for a 'value' comparison whose label was dropped as a bare number", () => {
    // The data layer empties the label of a fixed-number comparison measure so the card stops
    // printing the same number twice -- the readout must then be the only line.
    const { container } = render(
      <KpiComparison
        textStyle={COMPARISON_TEXT_STYLE}
        comparison={{ type: 'value', value: 250000, label: '' }}
        display="percent"
        showIcon={false}
        scale="compact"
        compact={false}
        onColor={false}
      />,
    );
    expect(container.textContent).toBe('250K');
  });

  describe('delta-shaped caption', () => {
    const renderDelta = (
      comparison: Parameters<typeof KpiComparison>[0]['comparison'],
      props: Partial<Omit<Parameters<typeof KpiComparison>[0], 'textStyle'>> = {},
    ) =>
      render(
        <KpiComparison
          comparison={comparison}
          textStyle={COMPARISON_TEXT_STYLE}
          display="percent"
          showIcon={false}
          scale="compact"
          compact={false}
          onColor={false}
          {...props}
        />,
      );

    it("names the baseline measure with the localized relation and its value for type 'delta'", () => {
      const { getByText } = renderDelta(deltaComparison);
      expect(getByText('vs cost (100)')).toHaveStyle({ 'font-size': '0.7rem' });
    });

    it("appends the prior value to the already-relational label for type 'previous-period'", () => {
      const { getByText } = renderDelta({
        ...deltaComparison,
        type: 'previous-period',
        label: 'vs prior month',
      });
      expect(getByText('vs prior month (100)')).toBeTruthy();
    });

    it("keeps the caption for display: 'value', so a bare delta never reads as the baseline's own value", () => {
      const { getByText } = renderDelta(deltaComparison, { display: 'value' });
      expect(getByText('+20')).toBeTruthy();
      expect(getByText('vs cost (100)')).toBeTruthy();
    });

    it('formats the baseline with the comparison number format config', () => {
      const { getByText } = renderDelta(deltaComparison, {
        numberFormatConfig: { name: 'Currency', symbol: '$' },
      });
      expect(getByText('vs cost ($100)')).toBeTruthy();
    });

    it('renders a labelOverride verbatim, with no baseline appended', () => {
      const { getByText, queryByText } = renderDelta(deltaComparison, {
        labelOverride: 'vs budget',
      });
      expect(getByText('vs budget')).toBeTruthy();
      expect(queryByText(/\(100\)/)).toBeNull();
    });

    it('renders no caption line for an empty labelOverride', () => {
      const { container } = renderDelta(deltaComparison, { labelOverride: '' });
      expect(container.textContent).toBe('+20.00%');
    });

    it('falls back to the relation against the value alone when the data-driven label is empty', () => {
      const { getByText } = renderDelta({ ...deltaComparison, label: '' });
      expect(getByText('vs 100')).toBeTruthy();
    });
  });

  describe('native tooltips for clipped text', () => {
    // The readout clips with `text-overflow: ellipsis` at narrow cards, so every line carries its
    // own full text as a `title` -- the only way a user can recover what was cut off. Asserted per
    // comparison type because each branch wires `title` on its own elements.
    it("exposes the full primary and secondary text as titles for type 'delta'", () => {
      const { getByText } = render(
        <KpiComparison
          textStyle={COMPARISON_TEXT_STYLE}
          comparison={deltaComparison}
          display="percent"
          showIcon={false}
          scale="compact"
          compact={false}
          onColor={false}
        />,
      );
      expect(getByText('+20.00%')).toHaveAttribute('title', '+20.00%');
      expect(getByText('vs cost (100)')).toHaveAttribute('title', 'vs cost (100)');
    });

    it("exposes the full primary and secondary text as titles for type 'target'", () => {
      const { getByText } = render(
        <KpiComparison
          textStyle={COMPARISON_TEXT_STYLE}
          comparison={{
            type: 'target',
            target: 1000000,
            percentOfTarget: 82,
            toGo: 250000,
            label: 'Total Cost',
          }}
          display="both"
          showIcon={false}
          scale="compact"
          compact={false}
          onColor={false}
        />,
      );
      expect(getByText('82% of goal (1M)')).toHaveAttribute('title', '82% of goal (1M)');
      expect(getByText('250K to go')).toHaveAttribute('title', '250K to go');
    });

    it("exposes the full primary and secondary text as titles for type 'value'", () => {
      const { getByText } = render(
        <KpiComparison
          textStyle={COMPARISON_TEXT_STYLE}
          comparison={{ type: 'value', value: 250000, label: 'Total Cost' }}
          display="percent"
          showIcon={false}
          scale="compact"
          compact={false}
          onColor={false}
        />,
      );
      expect(getByText('250K')).toHaveAttribute('title', '250K');
      expect(getByText('Total Cost')).toHaveAttribute('title', 'Total Cost');
    });
  });

  it('renders the default primary line semibold and upright', () => {
    const { getByText } = render(
      <KpiComparison
        textStyle={COMPARISON_TEXT_STYLE}
        comparison={deltaComparison}
        display="percent"
        showIcon={false}
        scale="compact"
        compact={false}
        onColor={false}
      />,
    );
    expect(getByText('+20.00%').parentElement).toHaveStyle({
      'font-weight': '600',
      'font-style': 'normal',
      'text-transform': 'none',
    });
  });

  it('applies an overridden text style to the primary line but not to the label', () => {
    const { getByText } = render(
      <KpiComparison
        textStyle={{ fontWeight: '800', fontStyle: 'italic', textTransform: 'uppercase' }}
        comparison={deltaComparison}
        display="percent"
        showIcon={false}
        scale="compact"
        compact={false}
        onColor={false}
      />,
    );
    expect(getByText('+20.00%').parentElement).toHaveStyle({
      'font-weight': '800',
      'font-style': 'italic',
      'text-transform': 'uppercase',
    });
    expect(getByText('vs cost (100)')).not.toHaveStyle({ 'font-weight': '800' });
    expect(getByText('vs cost (100)')).not.toHaveStyle({ 'text-transform': 'uppercase' });
  });
});
