import { KpiChartData, KpiComparisonData } from '../types.js';
import {
  buildTargetReadout,
  comparisonMeasureNumberFormatConfig,
  computeHeadlineMaxHeightPx,
  formatDelta,
  formatDeltaValue,
  formatKpiValue,
  formatPercentDiff,
  formatPercentOfTarget,
  interpolateTemplate,
  isMeaningfulPercentDiff,
  KpiTranslateFn,
  metricFor,
  resolveConditionalIcon,
  summarizeComparisonForAria,
  toComparisonDisplay,
  toKpiComparisonInfo,
  toKpiDataPoint,
  toKpiRenderOptions,
} from './helpers.js';

/** Builds a `t` stub over the given mini-dictionary: interpolates known keys, echoes unknown ones. */
const makeT =
  (dict: Record<string, string>): KpiTranslateFn =>
  (key, options) =>
    (dict[key] ?? key).replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
      options && name in options ? String(options[name]) : match,
    );

/** English-shaped templates, mirroring `resources/en.ts`. */
const t = makeT({
  'kpi.percentFormat': '{{sign}}{{value}}%',
  'kpi.target.ofGoal': '{{percent}} of goal',
  'kpi.target.toGo': '{{value}} to go',
});

/** Turkish-shaped templates: percent sign before the number, per `resources/__external__/tr-tr.ts`. */
const tTurkish = makeT({
  'kpi.percentFormat': '{{sign}}%{{value}}',
  'kpi.target.ofGoal': 'hedefe göre {{percent}}',
  'kpi.target.toGo': '{{value}} kaldı',
});

describe('formatKpiValue', () => {
  it('formats a plain number with default config', () => {
    expect(formatKpiValue(1000)).toBe('1K');
  });

  it('formats currency with a custom config', () => {
    expect(formatKpiValue(1500, { name: 'Currency', symbol: '$' })).toBe('$1.5K');
  });
});

describe('formatPercentOfTarget', () => {
  it('keeps fractional percents instead of rounding to an integer', () => {
    expect(formatPercentOfTarget(83.3333, t)).toBe('83.33%');
  });

  it('trims trailing zeros and keeps integers plain', () => {
    expect(formatPercentOfTarget(83.5, t)).toBe('83.5%');
    expect(formatPercentOfTarget(80, t)).toBe('80%');
  });

  it('never abbreviates an extreme percent to K/M notation', () => {
    // Thousand separators (locale ',' under the test runner) are fine; '500K%' is not.
    expect(formatPercentOfTarget(500000, t)).toBe('500,000%');
  });

  it('places the percent sign where the locale template puts it (Turkish prefix)', () => {
    expect(formatPercentOfTarget(82, tTurkish)).toBe('%82');
  });
});

describe('interpolateTemplate', () => {
  it('replaces {{name}} placeholders, tolerating inner whitespace', () => {
    expect(interpolateTemplate('{{percent}} of {{ goal }}', { percent: '82%', goal: 'Cost' })).toBe(
      '82% of Cost',
    );
  });

  it('leaves unknown placeholders untouched', () => {
    expect(interpolateTemplate('{{value}} to {{destination}}', { value: '5' })).toBe(
      '5 to {{destination}}',
    );
  });
});

describe('comparisonMeasureNumberFormatConfig', () => {
  const config = { decimalScale: 0 as const };
  const styled = (numberFormatConfig?: typeof config) => ({
    column: { name: 'Cost', aggregation: 'sum' },
    numberFormatConfig,
  });

  it("reads a 'delta' comparison measure's config", () => {
    expect(comparisonMeasureNumberFormatConfig({ type: 'delta', value: styled(config) })).toEqual(
      config,
    );
  });

  it("reads a measure-backed 'target' comparison's config", () => {
    expect(comparisonMeasureNumberFormatConfig({ type: 'target', target: styled(config) })).toEqual(
      config,
    );
  });

  it("returns undefined for fixed-number targets, 'previous-period', 'value', and no comparison", () => {
    expect(comparisonMeasureNumberFormatConfig({ type: 'target', target: 100 })).toBeUndefined();
    expect(comparisonMeasureNumberFormatConfig({ type: 'previous-period' })).toBeUndefined();
    expect(
      comparisonMeasureNumberFormatConfig({ type: 'value', value: styled(config) }),
    ).toBeUndefined();
    expect(comparisonMeasureNumberFormatConfig(undefined)).toBeUndefined();
  });

  it('returns undefined when the measure carries no config', () => {
    expect(
      comparisonMeasureNumberFormatConfig({ type: 'delta', value: styled(undefined) }),
    ).toBeUndefined();
  });

  it('returns undefined for a measure-backed target whose measure carries no config (symmetry with delta)', () => {
    expect(
      comparisonMeasureNumberFormatConfig({ type: 'target', target: styled(undefined) }),
    ).toBeUndefined();
  });
});

describe('computeHeadlineMaxHeightPx', () => {
  it('subtracts the compact sibling height and gap from the body height', () => {
    // The 539x120 repro: a short card leaves little room after title/comparison/sparkline --
    // the headline budget must reflect that, not the self-referential (content-driven) box.
    expect(computeHeadlineMaxHeightPx(43, 17, 2)).toBe(24);
  });

  it('returns the full body height when there is no compact sibling to share the row with', () => {
    expect(computeHeadlineMaxHeightPx(343, 0, 0)).toBe(343);
  });

  it('clamps to 0 rather than going negative when the sibling+gap exceed the body height', () => {
    // Can happen transiently mid-resize before BodyArea's own box catches up.
    expect(computeHeadlineMaxHeightPx(10, 15, 4)).toBe(0);
  });

  it('returns 0 when BodyArea has not been measured yet', () => {
    expect(computeHeadlineMaxHeightPx(0, 0, 4)).toBe(0);
  });
});

describe('isMeaningfulPercentDiff / formatPercentDiff', () => {
  it('treats a finite percent within the cap as meaningful', () => {
    expect(isMeaningfulPercentDiff(20)).toBe(true);
    expect(formatPercentDiff(20, t)).toBe('+20.00%');
  });

  it('treats undefined and out-of-range percents as not meaningful', () => {
    expect(isMeaningfulPercentDiff(undefined)).toBe(false);
    expect(isMeaningfulPercentDiff(Infinity)).toBe(false);
    expect(isMeaningfulPercentDiff(5000)).toBe(false);
  });

  it('caps the displayed percent at the max', () => {
    expect(formatPercentDiff(5000, t)).toBe('+999.99%');
    expect(formatPercentDiff(-5000, t)).toBe('-999.99%');
  });

  it('signs negative percents without a leading plus', () => {
    expect(formatPercentDiff(-5, t)).toBe('-5.00%');
  });

  it('keeps the sign outside a locale-prefixed percent sign (Turkish +%20, not %+20)', () => {
    expect(formatPercentDiff(20, tTurkish)).toBe('+%20.00');
    expect(formatPercentDiff(-5, tTurkish)).toBe('-%5.00');
  });
});

describe('formatDeltaValue', () => {
  it('signs a positive delta', () => {
    expect(formatDeltaValue(20)).toBe('+20');
  });

  it('signs a negative delta (no double sign)', () => {
    expect(formatDeltaValue(-20)).toBe('-20');
  });
});

describe('formatDelta', () => {
  const delta = { deltaValue: 20, deltaPercent: 20 };

  it('prefers percent for display="percent"', () => {
    expect(formatDelta(delta, 'percent', t)).toBe('+20.00%');
  });

  it('prefers value for display="value"', () => {
    expect(formatDelta(delta, 'value', t)).toBe('+20');
  });

  it('combines both for display="both"', () => {
    expect(formatDelta(delta, 'both', t)).toBe('+20.00% (+20)');
  });

  it('falls back to the value when percent is not meaningful', () => {
    expect(formatDelta({ deltaValue: 20, deltaPercent: undefined }, 'percent', t)).toBe('+20');
    expect(formatDelta({ deltaValue: 20, deltaPercent: undefined }, 'both', t)).toBe('+20');
  });
});

describe('resolveConditionalIcon', () => {
  const conditions = [
    {
      icon: { type: 'text' as const, value: '✓', color: '#0a0' },
      expression: '100',
      operator: '>' as const,
    },
    {
      icon: { type: 'text' as const, value: '⚠', color: '#a00' },
      expression: '50',
      operator: '<=' as const,
    },
  ];

  it('returns the first matching condition', () => {
    expect(resolveConditionalIcon(conditions, 150)).toBe(conditions[0]);
    expect(resolveConditionalIcon(conditions, 30)).toBe(conditions[1]);
  });

  it('returns undefined when nothing matches or inputs are missing', () => {
    expect(resolveConditionalIcon(conditions, 75)).toBeUndefined();
    expect(resolveConditionalIcon(conditions, undefined)).toBeUndefined();
    expect(resolveConditionalIcon(undefined, 150)).toBeUndefined();
  });

  it('supports equality and inequality operators', () => {
    expect(
      resolveConditionalIcon(
        [{ icon: { type: 'text' as const, value: '=' }, expression: '42', operator: '=' }],
        42,
      )?.icon,
    ).toEqual({ type: 'text', value: '=' });
    expect(
      resolveConditionalIcon(
        [{ icon: { type: 'text' as const, value: '≠' }, expression: '42', operator: '!=' }],
        43,
      )?.icon,
    ).toEqual({ type: 'text', value: '≠' });
  });

  it('never matches a malformed (non-numeric) threshold expression, even for !=/≠ (NaN never equals anything)', () => {
    // Number('abc') is NaN, and `value !== NaN` is always true -- without a guard, a malformed
    // expression would make '!='/'≠' match every value instead of none.
    expect(
      resolveConditionalIcon(
        [{ icon: { type: 'text' as const, value: 'x' }, expression: 'abc', operator: '!=' }],
        42,
      ),
    ).toBeUndefined();
    expect(
      resolveConditionalIcon(
        [
          {
            icon: { type: 'text' as const, value: 'x' },
            expression: 'not-a-number',
            operator: '≠',
          },
        ],
        42,
      ),
    ).toBeUndefined();
    expect(
      resolveConditionalIcon(
        [{ icon: { type: 'text' as const, value: 'x' }, expression: 'abc', operator: '>' }],
        42,
      ),
    ).toBeUndefined();
  });
});

describe('metricFor', () => {
  it('uses deltaPercent for delta-shaped comparisons', () => {
    expect(metricFor({ type: 'delta', deltaPercent: 12, deltaValue: 5 })).toBe(12);
    expect(metricFor({ type: 'previous-period', deltaPercent: -8, deltaValue: -2 })).toBe(-8);
  });

  it('does NOT fall back to deltaValue for a zero-baseline delta (deltaPercent undefined)', () => {
    // A zero baseline leaves deltaPercent undefined -- an absolute deltaValue is not the same
    // unit as a user's percent condition, so there must be no metric to evaluate against.
    expect(metricFor({ type: 'delta', deltaValue: 150 })).toBeUndefined();
    expect(metricFor({ type: 'previous-period', deltaValue: -150 })).toBeUndefined();
  });

  it('uses percentOfTarget for target comparisons', () => {
    expect(metricFor({ type: 'target', percentOfTarget: 82 })).toBe(82);
  });

  it('has no applicable metric for value comparisons', () => {
    expect(metricFor({ type: 'value' })).toBeUndefined();
  });
});

describe('toKpiComparisonInfo', () => {
  it('translates a previous-period labelKey to a label via t()', () => {
    const comparison: KpiComparisonData = {
      type: 'previous-period',
      baseline: 100,
      deltaValue: 20,
      deltaPercent: 20,
      labelKey: 'kpi.comparison.vsPriorMonth',
    };
    expect(toKpiComparisonInfo(comparison, t)).toEqual({
      type: 'previous-period',
      baseline: 100,
      deltaValue: 20,
      deltaPercent: 20,
      label: 'kpi.comparison.vsPriorMonth',
    });
  });

  it('passes delta/target/value labels through unchanged and drops internal-only fields', () => {
    const delta: KpiComparisonData = {
      type: 'delta',
      baseline: 100,
      deltaValue: 20,
      deltaPercent: 20,
      label: 'Total Cost',
      color: '#ff0000',
    };
    expect(toKpiComparisonInfo(delta, t)).toEqual({
      type: 'delta',
      baseline: 100,
      deltaValue: 20,
      deltaPercent: 20,
      label: 'Total Cost',
    });

    const target: KpiComparisonData = {
      type: 'target',
      target: 100,
      percentOfTarget: 80,
      toGo: 20,
      label: 'Total Cost',
    };
    expect(toKpiComparisonInfo(target, t)).toEqual({
      type: 'target',
      target: 100,
      percentOfTarget: 80,
      toGo: 20,
      label: 'Total Cost',
    });

    const value: KpiComparisonData = {
      type: 'value',
      value: 42,
      label: 'Total Cost',
      color: '#00ff00',
      numberFormatConfig: { name: 'Percent' },
    };
    expect(toKpiComparisonInfo(value, t)).toEqual({
      type: 'value',
      value: 42,
      label: 'Total Cost',
    });
  });
});

describe('toKpiRenderOptions / toKpiDataPoint', () => {
  it('builds render options and a data point from chart data', () => {
    const chartData: KpiChartData = {
      type: 'kpi',
      hasRows: true,
      value: 120,
      valueTitle: 'Total Revenue',
      valueColor: '#00aa00',
      valuePeriodMs: 1000,
      comparison: {
        type: 'previous-period',
        baseline: 100,
        deltaValue: 20,
        deltaPercent: 20,
        labelKey: 'kpi.comparison.vsPriorMonth',
      },
      sparklinePoints: [{ x: 1, y: 100 }],
    };

    const renderOptions = toKpiRenderOptions(chartData, t);
    expect(renderOptions).toEqual({
      value: 120,
      valueTitle: 'Total Revenue',
      valueColor: '#00aa00',
      valuePeriodMs: 1000,
      comparison: {
        type: 'previous-period',
        baseline: 100,
        deltaValue: 20,
        deltaPercent: 20,
        label: 'kpi.comparison.vsPriorMonth',
      },
      sparklinePoints: [{ x: 1, y: 100 }],
    });

    expect(toKpiDataPoint(renderOptions)).toEqual({
      value: 120,
      date: 1000,
      comparison: renderOptions.comparison,
    });
  });
});

describe('toComparisonDisplay', () => {
  it('carries over color/numberFormatConfig when the type is unchanged', () => {
    const original: KpiComparisonData = {
      type: 'value',
      value: 42,
      label: 'Total Cost',
      color: '#00ff00',
      numberFormatConfig: { name: 'Percent' },
    };
    const publicInfo = { type: 'value' as const, value: 100, label: 'Adjusted' };
    expect(toComparisonDisplay(original, publicInfo)).toEqual({
      type: 'value',
      value: 100,
      label: 'Adjusted',
      color: '#00ff00',
      numberFormatConfig: { name: 'Percent' },
    });
  });

  it('has no color/format metadata when there is no matching original', () => {
    const publicInfo = { type: 'value' as const, value: 100, label: 'Adjusted' };
    expect(toComparisonDisplay(undefined, publicInfo)).toEqual({
      type: 'value',
      value: 100,
      label: 'Adjusted',
      color: undefined,
      numberFormatConfig: undefined,
    });
  });

  it('does not carry over metadata when the comparison type changed', () => {
    const original: KpiComparisonData = {
      type: 'delta',
      baseline: 100,
      deltaValue: 20,
      deltaPercent: 20,
      label: 'vs cost',
      color: '#ff0000',
    };
    const publicInfo = {
      type: 'target' as const,
      target: 100,
      percentOfTarget: 80,
      toGo: 20,
      label: 'goal',
    };
    expect(toComparisonDisplay(original, publicInfo)).toEqual({
      type: 'target',
      target: 100,
      percentOfTarget: 80,
      toGo: 20,
      label: 'goal',
      color: undefined,
    });
  });
});

describe('buildTargetReadout', () => {
  const target = { percentOfTarget: 82, toGo: 250000, label: 'Total Cost' };

  it('builds both lines from the localized templates by default', () => {
    expect(buildTargetReadout(target, undefined, t)).toEqual({
      ofGoalText: '82% of goal',
      toGoText: '250K to go',
    });
  });

  it('omits the percent line when the percent is not computable (zero target)', () => {
    expect(buildTargetReadout({ ...target, percentOfTarget: undefined }, undefined, t)).toEqual({
      ofGoalText: undefined,
      toGoText: '250K to go',
    });
  });

  it('renders consumer override templates instead, interpolating percent/goal/value', () => {
    expect(
      buildTargetReadout(target, undefined, t, {
        ofGoalText: '{{percent}} of {{goal}} target',
        toGoText: '{{value}} remaining',
      }),
    ).toEqual({
      ofGoalText: '82% of Total Cost target',
      toGoText: '250K remaining',
    });
  });

  it('overrides independently: one line overridden, the other stays localized', () => {
    expect(buildTargetReadout(target, undefined, t, { toGoText: '{{value}} left' })).toEqual({
      ofGoalText: '82% of goal',
      toGoText: '250K left',
    });
  });

  it('formats the amount-to-go with the given number format config', () => {
    expect(buildTargetReadout(target, { name: 'Currency', symbol: '$' }, t).toGoText).toBe(
      '$250K to go',
    );
  });

  it('localizes both lines through the locale templates (Turkish)', () => {
    expect(buildTargetReadout(target, undefined, tTurkish)).toEqual({
      ofGoalText: 'hedefe göre %82',
      toGoText: '250K kaldı',
    });
  });
});

describe('summarizeComparisonForAria', () => {
  it('summarizes a delta-shaped comparison', () => {
    expect(
      summarizeComparisonForAria(
        { type: 'delta', baseline: 100, deltaValue: 20, deltaPercent: 20, label: 'vs prior month' },
        undefined,
        t,
      ),
    ).toBe('+20.00% vs prior month');
  });

  it('follows the display mode for delta-shaped comparisons, matching the visible readout', () => {
    const delta = {
      type: 'delta' as const,
      baseline: 100,
      deltaValue: 20,
      deltaPercent: 20,
      label: 'vs prior month',
    };
    expect(summarizeComparisonForAria(delta, undefined, t, 'value')).toBe('+20 vs prior month');
    expect(summarizeComparisonForAria(delta, undefined, t, 'both')).toBe(
      '+20.00% (+20) vs prior month',
    );
  });

  it('summarizes a target comparison per display: percent (default), value, and both', () => {
    const target = {
      type: 'target' as const,
      target: 100,
      percentOfTarget: 82,
      toGo: 18,
      label: 'Total Cost',
    };
    // The summary must voice the exact strings the visible readout renders (localized
    // `kpi.target.*` templates) and follow the same display semantics, so assistive tech never
    // hears content that isn't shown.
    expect(summarizeComparisonForAria(target, undefined, t)).toBe('82% of goal');
    expect(summarizeComparisonForAria(target, undefined, t, 'percent')).toBe('82% of goal');
    expect(summarizeComparisonForAria(target, undefined, t, 'value')).toBe('18 to go');
    expect(summarizeComparisonForAria(target, undefined, t, 'both')).toBe('82% of goal, 18 to go');
  });

  it('voices consumer target-string overrides, same as the visible readout', () => {
    expect(
      summarizeComparisonForAria(
        { type: 'target', target: 100, percentOfTarget: 82, toGo: 18, label: 'Total Cost' },
        undefined,
        t,
        'both',
        { ofGoalText: '{{percent}} of {{goal}}', toGoText: '{{value}} remaining' },
      ),
    ).toBe('82% of Total Cost, 18 remaining');
  });

  it('formats a fractional percent-of-target without integer rounding', () => {
    expect(
      summarizeComparisonForAria(
        { type: 'target', target: 120, percentOfTarget: 83.3333, toGo: 20, label: 'Total Cost' },
        undefined,
        t,
        'percent',
      ),
    ).toBe('83.33% of goal');
  });

  it('falls back to the amount-to-go summary when the target percent is unavailable', () => {
    expect(
      summarizeComparisonForAria(
        { type: 'target', target: 100, percentOfTarget: undefined, toGo: 18, label: 'Total Cost' },
        undefined,
        t,
        'percent',
      ),
    ).toBe('18 to go');
  });

  it('summarizes a value comparison', () => {
    expect(
      summarizeComparisonForAria({ type: 'value', value: 100, label: 'Total Cost' }, undefined, t),
    ).toBe('Total Cost 100');
  });
});
