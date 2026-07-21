import { KpiChartData, KpiComparisonData } from '../types.js';
import {
  computeHeadlineMaxHeightPx,
  formatDelta,
  formatDeltaValue,
  formatKpiValue,
  formatPercentDiff,
  isMeaningfulPercentDiff,
  metricFor,
  resolveConditionalIcon,
  summarizeComparisonForAria,
  toComparisonDisplay,
  toKpiComparisonInfo,
  toKpiDataPoint,
  toKpiRenderOptions,
} from './helpers.js';

const t = (key: string) => key;

describe('formatKpiValue', () => {
  it('formats a plain number with default config', () => {
    expect(formatKpiValue(1000)).toBe('1K');
  });

  it('formats currency with a custom config', () => {
    expect(formatKpiValue(1500, { name: 'Currency', symbol: '$' })).toBe('$1.5K');
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
    expect(formatPercentDiff(20)).toBe('+20.00%');
  });

  it('treats undefined and out-of-range percents as not meaningful', () => {
    expect(isMeaningfulPercentDiff(undefined)).toBe(false);
    expect(isMeaningfulPercentDiff(Infinity)).toBe(false);
    expect(isMeaningfulPercentDiff(5000)).toBe(false);
  });

  it('caps the displayed percent at the max', () => {
    expect(formatPercentDiff(5000)).toBe('+999.99%');
    expect(formatPercentDiff(-5000)).toBe('-999.99%');
  });

  it('signs negative percents without a leading plus', () => {
    expect(formatPercentDiff(-5)).toBe('-5.00%');
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
    expect(formatDelta(delta, 'percent')).toBe('+20.00%');
  });

  it('prefers value for display="value"', () => {
    expect(formatDelta(delta, 'value')).toBe('+20');
  });

  it('combines both for display="both"', () => {
    expect(formatDelta(delta, 'both')).toBe('+20.00% (+20)');
  });

  it('falls back to the value when percent is not meaningful', () => {
    expect(formatDelta({ deltaValue: 20, deltaPercent: undefined }, 'percent')).toBe('+20');
    expect(formatDelta({ deltaValue: 20, deltaPercent: undefined }, 'both')).toBe('+20');
  });
});

describe('resolveConditionalIcon', () => {
  const conditions = [
    { icon: '✓', color: '#0a0', expression: '100', operator: '>' as const },
    { icon: '⚠', color: '#a00', expression: '50', operator: '<=' as const },
  ];

  it('returns the first matching condition', () => {
    expect(resolveConditionalIcon(conditions, 150)?.icon).toBe('✓');
    expect(resolveConditionalIcon(conditions, 30)?.icon).toBe('⚠');
  });

  it('returns undefined when nothing matches or inputs are missing', () => {
    expect(resolveConditionalIcon(conditions, 75)).toBeUndefined();
    expect(resolveConditionalIcon(conditions, undefined)).toBeUndefined();
    expect(resolveConditionalIcon(undefined, 150)).toBeUndefined();
  });

  it('supports equality and inequality operators', () => {
    expect(resolveConditionalIcon([{ icon: '=', expression: '42', operator: '=' }], 42)?.icon).toBe(
      '=',
    );
    expect(
      resolveConditionalIcon([{ icon: '≠', expression: '42', operator: '!=' }], 43)?.icon,
    ).toBe('≠');
  });

  it('never matches a malformed (non-numeric) threshold expression, even for !=/≠ (NaN never equals anything)', () => {
    // Number('abc') is NaN, and `value !== NaN` is always true -- without a guard, a malformed
    // expression would make '!='/'≠' match every value instead of none.
    expect(
      resolveConditionalIcon([{ icon: 'x', expression: 'abc', operator: '!=' }], 42),
    ).toBeUndefined();
    expect(
      resolveConditionalIcon([{ icon: 'x', expression: 'not-a-number', operator: '≠' }], 42),
    ).toBeUndefined();
    expect(
      resolveConditionalIcon([{ icon: 'x', expression: 'abc', operator: '>' }], 42),
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

describe('summarizeComparisonForAria', () => {
  it('summarizes a delta-shaped comparison', () => {
    expect(
      summarizeComparisonForAria(
        { type: 'delta', baseline: 100, deltaValue: 20, deltaPercent: 20, label: 'vs prior month' },
        undefined,
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
    expect(summarizeComparisonForAria(delta, undefined, 'value')).toBe('+20 vs prior month');
    expect(summarizeComparisonForAria(delta, undefined, 'both')).toBe(
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
    // The summary must follow the same display semantics as the visible readout, so assistive
    // tech never hears content that isn't shown.
    expect(summarizeComparisonForAria(target, undefined)).toBe('82% of Total Cost');
    expect(summarizeComparisonForAria(target, undefined, 'percent')).toBe('82% of Total Cost');
    expect(summarizeComparisonForAria(target, undefined, 'value')).toBe('18 to go');
    expect(summarizeComparisonForAria(target, undefined, 'both')).toBe(
      '82% of Total Cost, 18 to go',
    );
  });

  it('falls back to the amount-to-go summary when the target percent is unavailable', () => {
    expect(
      summarizeComparisonForAria(
        { type: 'target', target: 100, percentOfTarget: undefined, toGo: 18, label: 'Total Cost' },
        undefined,
        'percent',
      ),
    ).toBe('18 to go');
  });

  it('summarizes a value comparison', () => {
    expect(
      summarizeComparisonForAria({ type: 'value', value: 100, label: 'Total Cost' }, undefined),
    ).toBe('Total Cost 100');
  });
});
