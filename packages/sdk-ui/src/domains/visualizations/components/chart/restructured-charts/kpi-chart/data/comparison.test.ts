import { DateLevels } from '@sisense/sdk-data';

import { calcDeltaComparison, calcTargetComparison, inferPeriodLabelKey } from './comparison';

describe('calcDeltaComparison', () => {
  it('computes delta and percent', () =>
    expect(calcDeltaComparison(120, 100)).toEqual({ deltaValue: 20, deltaPercent: 20 }));
  it('uses abs(baseline) for percent with negative baseline', () =>
    expect(calcDeltaComparison(-80, -100)).toEqual({ deltaValue: 20, deltaPercent: 20 }));
  it('omits percent when baseline is 0 (spec null-rule 4)', () =>
    expect(calcDeltaComparison(50, 0)).toEqual({ deltaValue: 50, deltaPercent: undefined }));
});

describe('calcTargetComparison', () => {
  it('computes percentOfTarget and toGo', () =>
    expect(calcTargetComparison(82, 100)).toEqual({ percentOfTarget: 82, toGo: 18 }));
  it('omits percentOfTarget when target is 0', () =>
    expect(calcTargetComparison(50, 0)).toEqual({ percentOfTarget: undefined, toGo: -50 }));
  it('clamps nothing above 100%', () =>
    expect(calcTargetComparison(150, 100)).toEqual({ percentOfTarget: 150, toGo: -50 }));
});

describe('inferPeriodLabelKey', () => {
  it.each([
    [DateLevels.Years, 'kpi.comparison.vsPriorYear'],
    [DateLevels.Quarters, 'kpi.comparison.vsPriorQuarter'],
    [DateLevels.Months, 'kpi.comparison.vsPriorMonth'],
    [DateLevels.Weeks, 'kpi.comparison.vsPriorWeek'],
    [DateLevels.Days, 'kpi.comparison.vsPriorDay'],
    [undefined, 'kpi.comparison.vsPriorPeriod'],
    [DateLevels.Minutes, 'kpi.comparison.vsPriorPeriod'],
  ])('%s → %s', (granularity, key) => expect(inferPeriodLabelKey(granularity)).toBe(key));
});
