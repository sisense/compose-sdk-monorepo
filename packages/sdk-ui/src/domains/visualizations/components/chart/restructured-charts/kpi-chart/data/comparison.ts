/**
 * Computes a delta comparison (absolute and percent change) between `value` and `baseline`.
 * @internal
 */
export function calcDeltaComparison(value: number, baseline: number) {
  return {
    deltaValue: value - baseline,
    deltaPercent: baseline === 0 ? undefined : ((value - baseline) / Math.abs(baseline)) * 100,
  };
}

/**
 * Computes a target comparison (percent of goal and remaining amount) between `value` and `target`.
 * @internal
 */
export function calcTargetComparison(value: number, target: number) {
  return {
    percentOfTarget: target === 0 ? undefined : (value / target) * 100,
    toGo: target - value,
  };
}

/** Maps a `trend` column's date granularity to its `'previous-period'` translation key. @internal */
const GRANULARITY_TO_LABEL_KEY: Record<string, string> = {
  years: 'kpi.comparison.vsPriorYear',
  quarters: 'kpi.comparison.vsPriorQuarter',
  months: 'kpi.comparison.vsPriorMonth',
  weeks: 'kpi.comparison.vsPriorWeek',
  days: 'kpi.comparison.vsPriorDay',
};

/**
 * Resolves the `'previous-period'` comparison's translation key for the given `trend` granularity,
 * falling back to a granularity-agnostic key when `granularity` is missing or unrecognized.
 * @internal
 */
export function inferPeriodLabelKey(granularity: string | undefined): string {
  return (
    GRANULARITY_TO_LABEL_KEY[granularity?.toLowerCase() ?? ''] ?? 'kpi.comparison.vsPriorPeriod'
  );
}
