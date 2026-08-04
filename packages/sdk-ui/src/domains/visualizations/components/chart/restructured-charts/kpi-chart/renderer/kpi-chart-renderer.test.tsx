/** @vitest-environment jsdom */
import { measureFactory } from '@sisense/sdk-data';
import { fireEvent, render } from '@testing-library/react';
import get from 'lodash-es/get';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { translation } from '@/infra/translation/resources/en';
import type { KpiRenderOptions } from '@/types.js';

import { translateKpiChartDataOptions } from '../data-options/data-options.js';
import { translateKpiStyleOptionsToDesignOptions } from '../design-options/design-options.js';
import { KpiChartData } from '../types.js';
import { KpiChartRenderer } from './kpi-chart-renderer.js';

vi.mock('highcharts-react-official', () => ({
  default: () => <div>Mock Sparkline</div>,
}));

vi.mock('@/shared/hooks/useDateFormatter.js', () => ({
  useDateFormatter: () => (date: Date) => date.toISOString().slice(0, 7),
}));

// Resolves keys called WITH interpolation params against the real en dictionary (i18next-style
// `{{param}}` substitution), so tests assert the literally rendered text -- including unit signs
// that must be baked into the interpolated values (e.g. the `%` in '82% of goal'). Keys called
// without params pass through unchanged, keeping the established assert-on-key pattern for
// plain label keys.
const translateMock = vi.fn((key: string, params?: Record<string, unknown>) => {
  if (!params) {
    return key;
  }
  const template = get(translation, key) as string | undefined;
  if (typeof template !== 'string') {
    return key;
  }
  return Object.entries(params).reduce(
    (text, [name, value]) => text.split(`{{${name}}}`).join(String(value)),
    template,
  );
});

vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return {
    ...mod,
    useTranslation: () => ({ t: translateMock }),
  };
});

const revenue = measureFactory.sum(DM.Commerce.Revenue);

const dataOptionsWithDate = translateKpiChartDataOptions({
  value: revenue,
  category: DM.Commerce.Date.Months,
});
const dataOptionsPlain = translateKpiChartDataOptions({ value: revenue });

/** Reads `element`'s parent, failing loudly (not with a silent `null`) if it has none. */
function requireParent(element: Element | null): HTMLElement {
  const parent = element?.parentElement;
  if (!parent) {
    throw new Error('Expected element to have a parent');
  }
  return parent;
}

/** Reads the CSS `flex-direction` of `element`'s parent, failing loudly if it has none. */
function parentFlexDirection(element: HTMLElement): string {
  return getComputedStyle(requireParent(element)).flexDirection;
}

/** Builds a 'lg'-tier rect (per `use-size-tier.ts` thresholds) unless overridden. */
function mockCardSize(width = 600, height = 300) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width,
    height,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

describe('KpiChartRenderer', () => {
  beforeEach(() => {
    translateMock.mockClear();
    // Default to a roomy card so tier-driven degradation doesn't interfere with unrelated
    // assertions; the tier-degradation tests below override this per case.
    mockCardSize();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the title and formatted headline value', () => {
    const chartData: KpiChartData = {
      type: 'kpi',
      hasRows: true,
      value: 1500,
      valueTitle: 'Total Revenue',
    };
    const { getByText } = render(
      <KpiChartRenderer
        chartData={chartData}
        dataOptions={dataOptionsPlain}
        designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsPlain)}
      />,
    );
    expect(getByText('Total Revenue')).toBeTruthy();
    expect(getByText('1.5K')).toBeTruthy();
  });

  it('defaults the value color to the first theme palette color (indicator parity)', () => {
    const chartData: KpiChartData = {
      type: 'kpi',
      hasRows: true,
      value: 1500,
      valueTitle: 'Total Revenue',
    };
    const { getByText } = render(
      <KpiChartRenderer
        chartData={chartData}
        dataOptions={dataOptionsPlain}
        designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsPlain)}
      />,
    );
    // Default theme variantColors[0].
    expect(getByText('1.5K')).toHaveStyle({ color: '#00cee6' });
  });

  it('applies title toggles, a fixed px text size, and the measure-resolved value color', () => {
    const chartData: KpiChartData = {
      type: 'kpi',
      hasRows: true,
      value: 42,
      valueTitle: 'Total Revenue',
      // The measure-resolved color (resolveValueColor over dataOptions.value.color) -- the
      // only static-coloring mechanism after KpiValueStyleOptions.color was dropped.
      valueColor: '#ff0000',
    };
    const { getByText, queryByText, rerender } = render(
      <KpiChartRenderer
        chartData={chartData}
        dataOptions={dataOptionsPlain}
        designOptions={translateKpiStyleOptionsToDesignOptions(
          { value: { textSize: 24 }, title: { text: 'Custom Title' } },
          dataOptionsPlain,
        )}
      />,
    );
    expect(getByText('Custom Title')).toBeTruthy();
    expect(getByText('42')).toHaveStyle({ 'font-size': '24px', color: '#ff0000' });

    rerender(
      <KpiChartRenderer
        chartData={chartData}
        dataOptions={dataOptionsPlain}
        designOptions={translateKpiStyleOptionsToDesignOptions(
          { title: { enabled: false } },
          dataOptionsPlain,
        )}
      />,
    );
    expect(queryByText('Total Revenue')).toBeNull();
  });

  it('resolves title-section visibility from enabled and the showValueTitle/showCategoryTitle parts', () => {
    const chartData: KpiChartData = {
      type: 'kpi',
      hasRows: true,
      value: 1500,
      valueTitle: 'Total Revenue',
      valuePeriodMs: Date.UTC(2020, 5, 15),
    };
    const { getByText, queryByText, rerender } = render(
      <KpiChartRenderer
        chartData={chartData}
        dataOptions={dataOptionsWithDate}
        designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsWithDate)}
      />,
    );
    // Default: both parts render.
    expect(getByText('Total Revenue')).toBeTruthy();
    expect(getByText('2020-06')).toBeTruthy();

    // showCategoryTitle: false hides only the caption.
    rerender(
      <KpiChartRenderer
        chartData={chartData}
        dataOptions={dataOptionsWithDate}
        designOptions={translateKpiStyleOptionsToDesignOptions(
          { title: { showCategoryTitle: false } },
          dataOptionsWithDate,
        )}
      />,
    );
    expect(queryByText('2020-06')).toBeNull();
    expect(getByText('Total Revenue')).toBeTruthy();

    // showValueTitle: false hides only the title text; the caption alone still renders.
    rerender(
      <KpiChartRenderer
        chartData={chartData}
        dataOptions={dataOptionsWithDate}
        designOptions={translateKpiStyleOptionsToDesignOptions(
          { title: { showValueTitle: false } },
          dataOptionsWithDate,
        )}
      />,
    );
    expect(getByText('2020-06')).toBeTruthy();
    expect(queryByText('Total Revenue')).toBeNull();

    // Both parts opted out: the whole title area disappears (KpiTitle renders null).
    rerender(
      <KpiChartRenderer
        chartData={chartData}
        dataOptions={dataOptionsWithDate}
        designOptions={translateKpiStyleOptionsToDesignOptions(
          { title: { showValueTitle: false, showCategoryTitle: false } },
          dataOptionsWithDate,
        )}
      />,
    );
    expect(document.querySelector('[data-kpi-area="title"]')).toBeNull();

    // enabled: false switches the whole section off even though both parts default to visible.
    rerender(
      <KpiChartRenderer
        chartData={chartData}
        dataOptions={dataOptionsWithDate}
        designOptions={translateKpiStyleOptionsToDesignOptions(
          { title: { enabled: false } },
          dataOptionsWithDate,
        )}
      />,
    );
    expect(document.querySelector('[data-kpi-area="title"]')).toBeNull();
  });

  it('renders a conditional icon next to the value', () => {
    const chartData: KpiChartData = {
      type: 'kpi',
      hasRows: true,
      value: 150,
      valueTitle: 'Total Revenue',
    };
    const { getByText } = render(
      <KpiChartRenderer
        chartData={chartData}
        dataOptions={dataOptionsPlain}
        designOptions={translateKpiStyleOptionsToDesignOptions(
          {
            value: {
              conditionalIcons: [
                {
                  icon: { type: 'text', value: '✓', color: '#00aa00' },
                  expression: '100',
                  operator: '>',
                },
              ],
            },
          },
          dataOptionsPlain,
        )}
      />,
    );
    const icon = getByText('✓');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveStyle({ color: '#00aa00' });
  });

  describe('card background contrast (onColor)', () => {
    const chartData: KpiChartData = {
      type: 'kpi',
      hasRows: true,
      value: 42,
      valueTitle: 'Total Revenue',
    };

    it('does not force white value/title text on a light or white custom card background', () => {
      const { getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            { card: { backgroundColor: '#ffffff' } },
            dataOptionsPlain,
          )}
        />,
      );
      expect(getByText('42')).toHaveStyle({ color: '#00cee6' });
      expect(getByText('Total Revenue')).not.toHaveStyle({ color: '#ffffff' });
    });

    it('keeps the palette value color and forces only the title white on a dark custom card background', () => {
      const { getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            { card: { backgroundColor: '#000000' } },
            dataOptionsPlain,
          )}
        />,
      );
      // Indicator parity: the value keeps the palette color even on a dark background;
      // only the title follows the onColor white-switch.
      expect(getByText('42')).toHaveStyle({ color: '#00cee6' });
      expect(getByText('Total Revenue')).toHaveStyle({ color: '#ffffff' });
    });
  });

  describe('comparison variants', () => {
    it('renders a previous-period delta with an arrow, percent, and translated label', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 120,
        valueTitle: 'Total Revenue',
        comparison: {
          type: 'previous-period',
          baseline: 100,
          deltaValue: 20,
          deltaPercent: 20,
          labelKey: 'kpi.comparison.vsPriorMonth',
        },
      };
      const { getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsWithDate)}
        />,
      );
      expect(getByText('▲')).toBeTruthy();
      expect(getByText('+20.00%')).toBeTruthy();
      expect(translateMock).toHaveBeenCalledWith('kpi.comparison.vsPriorMonth');
      expect(getByText('kpi.comparison.vsPriorMonth')).toBeTruthy();
    });

    it("formats a delta readout with the comparison measure's own numberFormatConfig", () => {
      const cost = measureFactory.sum(DM.Commerce.Cost);
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: {
          type: 'delta',
          value: { column: cost, numberFormatConfig: { decimalScale: 0 } },
        },
      });
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 112.345,
        valueTitle: 'Total Revenue',
        comparison: {
          type: 'delta',
          baseline: 100,
          deltaValue: 12.345,
          deltaPercent: 12.345,
          label: 'Total Cost',
        },
      };
      const { getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptions}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            { comparison: { display: 'value' } },
            dataOptions,
          )}
        />,
      );
      // decimalScale 0 from the comparison measure — not the headline's default 'auto' (12.35).
      expect(getByText('+12')).toBeTruthy();
    });

    it("falls back to the headline's numberFormatConfig when onBeforeRender swaps the comparison type away from the original measure's", () => {
      // Same dataOptions/chartData fixture as the delta test above -- dataOptions.comparison is a
      // 'delta' measure with decimalScale: 0. onBeforeRender then swaps the *displayed*
      // comparison to a 'target' shape entirely. The type-match guard must notice the mismatch
      // ('target' !== 'delta') and refuse to honor the original delta measure's config against
      // the swapped-in target readout -- falling back to the headline's own ('auto') config
      // instead, not silently misapplying the delta measure's decimalScale: 0.
      const cost = measureFactory.sum(DM.Commerce.Cost);
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: {
          type: 'delta',
          value: { column: cost, numberFormatConfig: { decimalScale: 0 } },
        },
      });
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 112.345,
        valueTitle: 'Total Revenue',
        comparison: {
          type: 'delta',
          baseline: 100,
          deltaValue: 12.345,
          deltaPercent: 12.345,
          label: 'Total Cost',
        },
      };
      const { getByText, queryByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptions}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            { comparison: { display: 'both' } },
            dataOptions,
          )}
          onBeforeRender={(renderOptions: KpiRenderOptions) => ({
            ...renderOptions,
            comparison: {
              type: 'target' as const,
              target: 120,
              percentOfTarget: 83.3333,
              toGo: 12.345,
              label: 'Goal',
            },
          })}
        />,
      );
      // 'auto' decimalScale (the headline's default, no config on this fixture) -- NOT the delta
      // measure's decimalScale: 0 (which would render '12 to go').
      expect(getByText('12.35 to go')).toBeTruthy();
      expect(queryByText('12 to go')).toBeNull();
    });

    it('colors a delta comparison via resolveComparisonColor and can hide its icon', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 80,
        valueTitle: 'Churn',
        comparison: {
          type: 'delta',
          baseline: 100,
          deltaValue: -20,
          deltaPercent: -20,
          label: 'vs cost budget',
        },
      };
      const { getByText, queryByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            { comparison: { showIcon: false, color: { type: 'uniform', color: '#222222' } } },
            dataOptionsPlain,
          )}
        />,
      );
      expect(queryByText('▼')).toBeNull();
      expect(getByText('-20.00%')).toHaveStyle({ color: '#222222' });
    });

    it('falls back to the default text color for a zero-baseline delta (no conditional match, no sign-based color)', () => {
      // deltaPercent is undefined (zero baseline) -- metricFor must not fall back to the
      // absolute deltaValue (150) for coloring, which would otherwise both sign-color it green
      // (no color options) and match a `> 100` condition.
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 250,
        valueTitle: 'Total Revenue',
        comparison: {
          type: 'delta',
          baseline: 0,
          deltaValue: 150,
          deltaPercent: undefined,
          label: 'vs cost budget',
        },
      };
      const { getByText, queryByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            {
              comparison: {
                conditionalIcons: [
                  { icon: { type: 'text', value: '✓' }, expression: '100', operator: '>' },
                ],
              },
            },
            dataOptionsPlain,
          )}
        />,
      );
      const deltaText = getByText('+150');
      expect(deltaText).not.toHaveStyle({ color: '#4CAF50' });
      expect(deltaText).not.toHaveStyle({ color: '#E53935' });
      expect(queryByText('✓')).toBeNull();
    });

    it('renders the target readout per comparison.display (percent by default, value, both)', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 750000,
        valueTitle: 'Total Cost',
        numberFormatConfig: { name: 'Currency', symbol: '$' },
        comparison: {
          type: 'target',
          target: 1000000,
          percentOfTarget: 82,
          toGo: 250000,
          label: 'Total Cost',
        },
      };
      const { getByText, queryByText, rerender } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsPlain)}
        />,
      );
      // Default display is 'percent': ONLY the percent-of-goal line (user-approved mapping --
      // this consciously changed the default target appearance from two lines to one). The
      // literal rendered text must carry the percent sign -- the en template is
      // '{{percent}} of goal', so the sign must be baked into the interpolated value.
      expect(getByText('82% of goal')).toBeTruthy();
      expect(queryByText('$250K to go')).toBeNull();
      expect(translateMock).toHaveBeenCalledWith('kpi.target.ofGoal', {
        percent: '82%',
        goal: 'Total Cost',
      });

      rerender(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            { comparison: { display: 'value' } },
            dataOptionsPlain,
          )}
        />,
      );
      // 'value': ONLY the amount-to-go line, promoted to the primary readout.
      expect(queryByText('82% of goal')).toBeNull();
      expect(getByText('$250K to go')).toBeTruthy();
      expect(translateMock).toHaveBeenCalledWith('kpi.target.toGo', { value: '$250K' });

      rerender(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            { comparison: { display: 'both' } },
            dataOptionsPlain,
          )}
        />,
      );
      // 'both': percent primary + amount-to-go secondary (the pre-change look).
      expect(getByText('82% of goal')).toBeTruthy();
      expect(getByText('$250K to go')).toBeTruthy();
    });

    it('renders consumer ofGoalText/toGoText override templates in the readout AND the aria-label', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 750000,
        valueTitle: 'Total Cost',
        numberFormatConfig: { name: 'Currency', symbol: '$' },
        comparison: {
          type: 'target',
          target: 1000000,
          percentOfTarget: 82,
          toGo: 250000,
          label: 'Total Cost',
        },
      };
      const { getByRole, getByText, queryByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            {
              comparison: {
                display: 'both',
                ofGoalText: '{{percent}} of {{goal}} target',
                toGoText: '{{value}} remaining',
              },
            },
            dataOptionsPlain,
          )}
        />,
      );
      expect(getByText('82% of Total Cost target')).toBeTruthy();
      expect(getByText('$250K remaining')).toBeTruthy();
      expect(queryByText('82% of goal')).toBeNull();
      expect(queryByText('$250K to go')).toBeNull();
      // The aria summary voices the same overridden strings the card shows.
      expect(getByRole('figure')).toHaveAttribute(
        'aria-label',
        'Total Cost, $750K, 82% of Total Cost target, $250K remaining',
      );
    });

    it('renders a fractional percent-of-goal without integer rounding', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 100,
        valueTitle: 'Total Revenue',
        comparison: {
          type: 'target',
          target: 120,
          percentOfTarget: 83.3333,
          toGo: 20,
          label: 'Goal',
        },
      };
      const { getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsPlain)}
        />,
      );
      expect(getByText('83.33% of goal')).toBeTruthy();
      expect(translateMock).toHaveBeenCalledWith('kpi.target.ofGoal', {
        percent: '83.33%',
        goal: 'Goal',
      });
    });

    it('renders a value comparison as a label plus its own formatted number', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 150,
        valueTitle: 'Total Revenue',
        comparison: {
          type: 'value',
          value: 250000,
          label: 'Total Cost',
          color: '#00aa00',
          numberFormatConfig: { name: 'Currency', symbol: '$' },
        },
      };
      const { getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsPlain)}
        />,
      );
      expect(getByText('$250K')).toHaveStyle({ color: '#00aa00' });
      expect(getByText('Total Cost')).toBeTruthy();
    });

    it('honors designOptions.comparison.label as an override of the data-driven label', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 120,
        valueTitle: 'Total Revenue',
        comparison: {
          type: 'delta',
          baseline: 100,
          deltaValue: 20,
          deltaPercent: 20,
          label: 'data-driven label',
        },
      };
      const { getByText, queryByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            { comparison: { label: 'style override label' } },
            dataOptionsPlain,
          )}
        />,
      );
      expect(getByText('style override label')).toBeTruthy();
      expect(queryByText('data-driven label')).toBeNull();
    });
  });

  describe('comparison conditional icons', () => {
    const previousPeriodData = (deltaPercent: number): KpiChartData => ({
      type: 'kpi',
      hasRows: true,
      value: 120,
      valueTitle: 'Total Revenue',
      comparison: {
        type: 'previous-period',
        baseline: 100,
        deltaValue: deltaPercent,
        deltaPercent,
        labelKey: 'kpi.comparison.vsPriorMonth',
      },
    });

    it('shows the first matching icon for a previous-period comparison, evaluated against deltaPercent', () => {
      const { getByText } = render(
        <KpiChartRenderer
          chartData={previousPeriodData(20)}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            {
              comparison: {
                conditionalIcons: [
                  // Both match deltaPercent=20 -- the first must win.
                  {
                    icon: { type: 'text', value: '🔥', color: '#aa5500' },
                    expression: '10',
                    operator: '>',
                  },
                  {
                    icon: { type: 'text', value: '✓', color: '#00aa00' },
                    expression: '0',
                    operator: '>',
                  },
                ],
              },
            },
            dataOptionsWithDate,
          )}
        />,
      );
      const icon = getByText('🔥');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveStyle({ color: '#aa5500' });
    });

    it('evaluates target comparison icon conditions against percentOfTarget', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 82,
        valueTitle: 'Total Revenue',
        comparison: {
          type: 'target',
          target: 100,
          percentOfTarget: 82,
          toGo: 18,
          label: 'Goal',
        },
      };
      const { getByText, rerender, queryByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            {
              comparison: {
                // Matches percentOfTarget=82 but NOT deltaValue/toGo -- proves the metric used.
                conditionalIcons: [
                  { icon: { type: 'text', value: '⚑' }, expression: '80', operator: '>' },
                ],
              },
            },
            dataOptionsPlain,
          )}
        />,
      );
      expect(getByText('⚑')).toHaveAttribute('aria-hidden', 'true');

      rerender(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            {
              comparison: {
                conditionalIcons: [
                  { icon: { type: 'text', value: '⚑' }, expression: '90', operator: '>' },
                ],
              },
            },
            dataOptionsPlain,
          )}
        />,
      );
      expect(queryByText('⚑')).toBeNull();
    });

    it('renders no icon when no condition matches', () => {
      const { queryByText } = render(
        <KpiChartRenderer
          chartData={previousPeriodData(-5)}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            {
              comparison: {
                conditionalIcons: [
                  { icon: { type: 'text', value: '✓' }, expression: '0', operator: '>' },
                ],
              },
            },
            dataOptionsWithDate,
          )}
        />,
      );
      expect(queryByText('✓')).toBeNull();
    });

    it('never renders an icon for a value-type comparison (conditions not applicable)', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 150,
        valueTitle: 'Total Revenue',
        comparison: { type: 'value', value: 999, label: 'Total Cost' },
      };
      const { queryByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            {
              comparison: {
                // Would match value=999 if it were (incorrectly) evaluated.
                conditionalIcons: [
                  { icon: { type: 'text', value: '✓' }, expression: '0', operator: '>' },
                ],
              },
            },
            dataOptionsPlain,
          )}
        />,
      );
      expect(queryByText('✓')).toBeNull();
    });
  });

  describe('layouts', () => {
    const chartData: KpiChartData = {
      type: 'kpi',
      hasRows: true,
      value: 90,
      valueTitle: 'Total Revenue',
      comparison: {
        type: 'delta',
        baseline: 100,
        deltaValue: -10,
        deltaPercent: -10,
        label: 'vs cost',
      },
    };

    // The grid template (columns/rows/areas) is now identical across layouts -- 'standard' and
    // 'comparison-first' only differ in the CSS `order` of the BodySlot wrapping value/comparison
    // (see kpi-card.tsx's valueOrderFor/comparisonOrderFor), not in the CardRoot grid itself.
    it('uses the shared single-column grid template and keeps subcomponent DOM order in the standard layout', () => {
      const { container, getByRole } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsPlain)}
        />,
      );
      const figure = getByRole('figure');
      expect(figure).toHaveAttribute('data-kpi-layout', 'standard');
      expect(getComputedStyle(figure).gridTemplateColumns).toBe('1fr');

      const areas = Array.from(container.querySelectorAll('[data-kpi-area]')).map((el) =>
        el.getAttribute('data-kpi-area'),
      );
      expect(areas).toEqual(['title', 'body', 'value', 'comparison']);

      // Value reads first (order 0), comparison second (order 1) -- matches DOM order, so no
      // visual reordering happens in the standard layout.
      const valueSlot = requireParent(container.querySelector('[data-kpi-area="value"]'));
      const comparisonSlot = requireParent(container.querySelector('[data-kpi-area="comparison"]'));
      expect(getComputedStyle(valueSlot).order).toBe('0');
      expect(getComputedStyle(comparisonSlot).order).toBe('1');
    });

    it('keeps the shared grid template and DOM order in the comparison-first layout, but visually swaps value/comparison via CSS order', () => {
      const { container, getByRole } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            { layout: 'comparison-first' },
            dataOptionsPlain,
          )}
        />,
      );
      const figure = getByRole('figure');
      expect(figure).toHaveAttribute('data-kpi-layout', 'comparison-first');
      expect(getComputedStyle(figure).gridTemplateColumns).toBe('1fr');

      const areas = Array.from(container.querySelectorAll('[data-kpi-area]')).map((el) =>
        el.getAttribute('data-kpi-area'),
      );
      // DOM order is unaffected by the layout swap -- only the CSS `order` below changes -- so
      // tab/reading order stays consistent regardless of which one currently reads as "headline".
      expect(areas).toEqual(['title', 'body', 'value', 'comparison']);

      // Comparison now reads first (order 0, the headline position), value second (order 1).
      const valueSlot = requireParent(container.querySelector('[data-kpi-area="value"]'));
      const comparisonSlot = requireParent(container.querySelector('[data-kpi-area="comparison"]'));
      expect(getComputedStyle(valueSlot).order).toBe('1');
      expect(getComputedStyle(comparisonSlot).order).toBe('0');
    });
  });

  describe('size-tier degradation', () => {
    const chartData: KpiChartData = {
      type: 'kpi',
      hasRows: true,
      value: 90,
      valueTitle: 'Total Revenue',
      comparison: {
        type: 'delta',
        baseline: 100,
        deltaValue: -10,
        deltaPercent: -10,
        label: 'vs cost',
      },
      sparklinePoints: [
        { x: 1, y: 100 },
        { x: 2, y: 90 },
      ],
    };

    it('hides the sparkline and collapses the comparison to one line at the xs tier', () => {
      mockCardSize(150, 90); // < 200x120 -> xs
      const { getByRole, queryByText, getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsWithDate)}
        />,
      );
      expect(getByRole('figure')).toHaveAttribute('data-kpi-tier', 'xs');
      expect(queryByText('Mock Sparkline')).toBeNull();
      expect(parentFlexDirection(getByText('-10.00%').parentElement!)).toBe('row');
    });

    it('shows the sparkline but still collapses the comparison to one line at the sm tier', () => {
      mockCardSize(250, 150); // >= 200x120, < 320x180 -> sm
      const { getByRole, getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsWithDate)}
        />,
      );
      expect(getByRole('figure')).toHaveAttribute('data-kpi-tier', 'sm');
      expect(getByText('Mock Sparkline')).toBeTruthy();
      expect(parentFlexDirection(getByText('-10.00%').parentElement!)).toBe('row');
    });

    it('shows the sparkline and a two-line comparison at the lg tier', () => {
      mockCardSize(600, 300); // >= 520x280 -> lg
      const { getByRole, getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsWithDate)}
        />,
      );
      expect(getByRole('figure')).toHaveAttribute('data-kpi-tier', 'lg');
      expect(getByText('Mock Sparkline')).toBeTruthy();
      expect(parentFlexDirection(getByText('-10.00%').parentElement!)).toBe('column');
    });
  });

  describe('no data', () => {
    it('shows the generic no-results overlay for a null value without noDataText configured', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: undefined,
        valueTitle: 'Total Revenue',
      };
      const { queryByText, queryByRole } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsPlain)}
        />,
      );
      expect(queryByRole('figure')).toBeNull();
      expect(queryByText('Total Revenue')).toBeNull();
    });

    it('keeps the card shell and shows noDataText for a null value when configured', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: undefined,
        valueTitle: 'Total Revenue',
      };
      const { getByText, getByRole } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            { value: { noDataText: 'N/A' } },
            dataOptionsPlain,
          )}
        />,
      );
      expect(getByText('Total Revenue')).toBeTruthy();
      expect(getByText('N/A')).toBeTruthy();
      expect(getByRole('figure')).toBeTruthy();
    });

    it('shows the no-results overlay when the query returned no rows at all', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: false,
        valueTitle: 'Total Revenue',
      };
      const { queryByRole } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsPlain)}
        />,
      );
      expect(queryByRole('figure')).toBeNull();
    });

    it('keeps the card shell and shows noDataText when the query returned no rows at all', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: false,
        valueTitle: 'Total Revenue',
      };
      const { getByText, getByRole } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            { value: { noDataText: 'N/A' } },
            dataOptionsPlain,
          )}
        />,
      );
      expect(getByText('Total Revenue')).toBeTruthy();
      expect(getByText('N/A')).toBeTruthy();
      expect(getByRole('figure')).toBeTruthy();
    });

    it('renders the noDataText placeholder in the neutral theme text color, not the accent color', () => {
      // Issue: the value slot's accent color must only apply to a real, formatted value -- the
      // no-data placeholder occupies the same slot but isn't "the value", so it must fall back to
      // ValueText's neutral onColor/theme-text styling instead of picking up the palette accent
      // (which is asserted elsewhere, e.g. '#00cee6', as the real-value default).
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: false,
        valueTitle: 'Total Revenue',
      };
      const { getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions(
            { value: { noDataText: 'N/A' } },
            dataOptionsPlain,
          )}
        />,
      );
      const placeholder = getByText('N/A');
      expect(placeholder).not.toHaveStyle({ color: '#00cee6' });
      // Default (light) theme's chart.textColor, applied via ValueText's `$onColor ? '#ffffff' :
      // theme.chart.textColor` fallback -- stable here since no custom card background is set.
      expect(placeholder).toHaveStyle({ color: '#000000' });
    });
  });

  describe('onBeforeRender', () => {
    it('renders from the object onBeforeRender returns', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 42,
        valueTitle: 'Total Revenue',
      };
      const { getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsPlain)}
          onBeforeRender={(renderOptions: KpiRenderOptions) => ({
            ...renderOptions,
            value: 100,
            valueTitle: 'Adjusted',
          })}
        />,
      );
      expect(getByText('Adjusted')).toBeTruthy();
      expect(getByText('100')).toBeTruthy();
    });

    it('preserves comparison color/format metadata through an unmodified passthrough', () => {
      const chartData: KpiChartData = {
        type: 'kpi',
        hasRows: true,
        value: 150,
        valueTitle: 'Total Revenue',
        comparison: {
          type: 'value',
          value: 250000,
          label: 'Total Cost',
          color: '#00aa00',
          numberFormatConfig: { name: 'Currency', symbol: '$' },
        },
      };
      const { getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsPlain}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsPlain)}
          onBeforeRender={(renderOptions: KpiRenderOptions) => renderOptions}
        />,
      );
      expect(getByText('$250K')).toHaveStyle({ color: '#00aa00' });
    });
  });

  describe('accessibility and events', () => {
    const chartData: KpiChartData = {
      type: 'kpi',
      hasRows: true,
      value: 90,
      valueTitle: 'Total Revenue',
      valuePeriodMs: 1000,
      comparison: {
        type: 'previous-period',
        baseline: 100,
        deltaValue: -10,
        deltaPercent: -10,
        labelKey: 'kpi.comparison.vsPriorMonth',
      },
      sparklinePoints: [
        { x: 1, y: 100 },
        { x: 2, y: 90 },
      ],
    };

    it('exposes an accessible figure with a composed aria-label and hides decorative elements', () => {
      const { getByRole, getByText } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsWithDate)}
        />,
      );
      expect(getByRole('figure')).toHaveAttribute(
        'aria-label',
        'Total Revenue, 90, -10.00% kpi.comparison.vsPriorMonth',
      );
      expect(getByText('▼')).toHaveAttribute('aria-hidden', 'true');
      expect(getByText('Mock Sparkline').closest('[data-kpi-area="sparkline"]')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    });

    it('is not focusable and has no click cursor when no click handler is provided', () => {
      const { getByRole } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsWithDate)}
        />,
      );
      const figure = getByRole('figure');
      expect(figure).not.toHaveAttribute('tabIndex');
      expect(figure).toHaveStyle({ cursor: 'default' });
    });

    it('is keyboard-focusable and pointer-interactive when only onDataPointContextMenu is provided', () => {
      // A context-menu-only card still needs to be reachable by keyboard (Tab focus), even though
      // there's no Enter/Space gesture for a context menu -- see the fix for the accessibility gap
      // where such a card was never focusable at all.
      const onDataPointContextMenu = vi.fn();
      const { getByRole } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsWithDate)}
          onDataPointContextMenu={onDataPointContextMenu}
        />,
      );
      const figure = getByRole('figure');
      expect(figure).toHaveAttribute('tabIndex', '0');
      expect(figure).toHaveStyle({ cursor: 'pointer' });

      fireEvent.contextMenu(figure);
      expect(onDataPointContextMenu).toHaveBeenCalledTimes(1);
    });

    it('fires onDataPointClick with a typed KpiDataPoint on click', () => {
      const onDataPointClick = vi.fn();
      const { getByRole } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsWithDate)}
          onDataPointClick={onDataPointClick}
        />,
      );
      fireEvent.click(getByRole('figure'));
      expect(onDataPointClick).toHaveBeenCalledWith(
        {
          value: 90,
          date: 1000,
          comparison: {
            type: 'previous-period',
            baseline: 100,
            deltaValue: -10,
            deltaPercent: -10,
            label: 'kpi.comparison.vsPriorMonth',
          },
        },
        expect.any(MouseEvent),
      );
    });

    it('fires onDataPointClick on Enter and Space keyboard activation', () => {
      const onDataPointClick = vi.fn();
      const { getByRole } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsWithDate)}
          onDataPointClick={onDataPointClick}
        />,
      );
      const figure = getByRole('figure');
      expect(figure).toHaveAttribute('tabIndex', '0');

      fireEvent.keyDown(figure, { key: 'Enter' });
      expect(onDataPointClick).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(figure, { key: ' ' });
      expect(onDataPointClick).toHaveBeenCalledTimes(2);
    });

    it('fires onDataPointContextMenu with a typed KpiDataPoint', () => {
      const onDataPointContextMenu = vi.fn();
      const { getByRole } = render(
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsWithDate)}
          onDataPointContextMenu={onDataPointContextMenu}
        />,
      );
      fireEvent.contextMenu(getByRole('figure'));
      expect(onDataPointContextMenu).toHaveBeenCalledTimes(1);
    });
  });

  it('renders in RTL context without breaking', () => {
    const chartData: KpiChartData = {
      type: 'kpi',
      hasRows: true,
      value: 90,
      valueTitle: 'Total Revenue',
      comparison: {
        type: 'delta',
        baseline: 100,
        deltaValue: -10,
        deltaPercent: -10,
        label: 'vs cost',
      },
      sparklinePoints: [
        { x: 1, y: 100 },
        { x: 2, y: 90 },
      ],
    };
    const { container, getByText } = render(
      <div dir="rtl">
        <KpiChartRenderer
          chartData={chartData}
          dataOptions={dataOptionsWithDate}
          designOptions={translateKpiStyleOptionsToDesignOptions({}, dataOptionsWithDate)}
        />
      </div>,
    );
    expect(container).not.toBeEmptyDOMElement();
    expect(getByText('Total Revenue')).toBeTruthy();
    expect(getByText('90')).toBeTruthy();
  });
});
