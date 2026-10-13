/**
 * Calendar arithmetic for Time Frame — a spec (`{ tense, count, grain, withCurrent? }`)
 * plus a `today` becomes an `ExactRange` of whole calendar periods.
 *
 * Ported from the designer's `dateRanges.ts` (at commit past `9f4a789`, the "Last N
 * days fix" version). The rules:
 *
 * 1. **Every relative range resolves to whole calendar periods.** `This month` is
 *    the 1st through the last, not a rolling 30 days.
 * 2. **`Last N` / `Next N` are the N completed periods before / after the current
 *    one**, except when the frame carries `withCurrent` (the paired `This & last X`
 *    / `This & next X`, count 2).
 * 3. **`This X` ignores everything except its grain**, since a single period is
 *    not a window.
 * 4. **Day-grain rolling look-backs — `Last 7 / 30 / 90 days` — reach today**, not
 *    yesterday. That matches the platform convention and keeps
 *    `Last 7 days` and `Next 7 days` meeting around today with no gap.
 *
 * `Next N days` still starts tomorrow, so only `last` at the Day grain is pulled in
 * — the one-sided exception. See `time-frame-jaql.ts` for the JAQL mapping.
 *
 * Week-start / fiscal-year correctness is deferred; `weekStartsOn` stays at `0` here.
 */
import type { RangeGrain, RelativeSpec } from './time-frame-catalogue';

/** Inclusive-on-both-ends range of whole days. */
export interface ExactRange {
  start: Date;
  end: Date;
}

/**
 * Midnight starting the period that contains `date`.
 * @param date - The moment to align.
 * @param grain - The calendar level to align to.
 * @param weekStartsOn - 0 = Sunday, 1 = Monday. Ignored except for Week grain.
 * @returns The start-of-period date at midnight local time.
 * @internal
 */
export function startOfGrain(date: Date, grain: RangeGrain, weekStartsOn: 0 | 1 = 0): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  switch (grain) {
    case 'Day':
      return new Date(y, m, date.getDate());
    case 'Week': {
      const day = new Date(y, m, date.getDate());
      const back = (day.getDay() - weekStartsOn + 7) % 7;
      day.setDate(day.getDate() - back);
      return day;
    }
    case 'Month':
      return new Date(y, m, 1);
    case 'Quarter':
      return new Date(y, m - (m % 3), 1);
    case 'Year':
      return new Date(y, 0, 1);
  }
}

/**
 * The same aligned point `n` periods later; negative for earlier.
 * @param start - The aligned starting point.
 * @param grain - The step size — one whole period of this grain.
 * @param n - How many periods to advance (negative to reach back).
 * @returns The shifted date at the same alignment.
 * @internal
 */
export function addGrains(start: Date, grain: RangeGrain, n: number): Date {
  const y = start.getFullYear();
  const m = start.getMonth();
  const d = start.getDate();
  switch (grain) {
    case 'Day':
      return new Date(y, m, d + n);
    case 'Week':
      return new Date(y, m, d + n * 7);
    case 'Month':
      return new Date(y, m + n, 1);
    case 'Quarter':
      return new Date(y, m + n * 3, 1);
    case 'Year':
      return new Date(y + n, 0, 1);
  }
}

/**
 * The exact days a spec names given a `today`. Pure — no `Date.now()` — so a test
 * can freeze the clock. See file header for the rules.
 * @param spec - The frame to resolve.
 * @param today - The civil "now" the resolution counts from. Defaults to `new Date()`.
 * @param weekStartsOn - 0 = Sunday, 1 = Monday. Week-start correctness is deferred.
 * @returns Inclusive start and end dates.
 * @internal
 */
export function resolveRelative(
  spec: RelativeSpec,
  today: Date = new Date(),
  weekStartsOn: 0 | 1 = 0,
): ExactRange {
  const current = startOfGrain(today, spec.grain, weekStartsOn);
  // `this` is exactly one period; heal a bad count to one rather than resolving to nothing.
  const count = spec.tense === 'this' ? 1 : Math.max(1, Math.floor(spec.count) || 1);
  // The Day-grain rolling exception (rule 4). Only `last` at Day grain, count ≥ 2.
  const dayRollingLast = spec.grain === 'Day' && spec.tense === 'last' && count >= 2;
  // Only the paired frames (`This & last`, `This & next`) carry `withCurrent`, and a
  // single period is not a window — so the flag needs both the flag and count ≥ 2.
  const withCurrent = (spec.withCurrent === true && count >= 2) || dayRollingLast;

  let first: Date;
  switch (spec.tense) {
    case 'this':
      first = current;
      break;
    case 'last':
      first = addGrains(current, spec.grain, withCurrent ? -(count - 1) : -count);
      break;
    case 'next':
      first = addGrains(current, spec.grain, withCurrent ? 0 : 1);
      break;
  }
  const endExclusive = addGrains(first, spec.grain, count);
  // Inclusive end: the last day of the range's final period.
  const end = new Date(
    endExclusive.getFullYear(),
    endExclusive.getMonth(),
    endExclusive.getDate() - 1,
  );
  return { start: first, end };
}
