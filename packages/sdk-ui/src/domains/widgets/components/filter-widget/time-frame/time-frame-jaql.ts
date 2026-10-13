/**
 * Bridge between a Time Frame `RelativeSpec` and the SDK filter it publishes.
 *
 * Every frame emits a `RelativeDateFilter`, whose JAQL is the bare
 * `{ [last | next]: { count, offset } }` clause — no `isNotCurrentPeriod`, which
 * the datasource JAQL endpoint rejects with HTTP 500.
 *
 * The `offset` rule:
 *
 * | Frame shape | Includes today / the current period? | Clause |
 * | --- | --- | --- |
 * | `This X` (`this`, count 1) | yes | `{ last: { count: 1, offset: 0 } }` |
 * | `This & last X` (`withCurrent`, count 2) | yes | `{ last: { count: 2, offset: 0 } }` |
 * | `This & next X` (`withCurrent`, count 2) | yes | `{ next: { count: 2, offset: 0 } }` |
 * | `Last N days` — **Day grain, count \> 1** | yes — the rolling exception | `{ last: { count: N, offset: 0 } }` |
 * | `Last N X` — every other grain, and `Last X`/`Yesterday` at count 1 | no | `{ last: { count: N, offset: 1 } }` |
 * | `Next N X` (no `withCurrent`) | no | `{ next: { count: N, offset: 1 } }` |
 *
 * `Next N days` is unaffected by the Day-grain exception (still `offset: 1`,
 * starting tomorrow), which is why the exception is one-sided.
 */
import type { TFunction } from '@sisense/sdk-common';
import type { Attribute, Filter, LevelAttribute, RelativeDateFilter } from '@sisense/sdk-data';
import {
  DateLevels,
  DateOperators,
  DimensionalLevelAttribute,
  filterFactory,
  isLevelAttribute,
  isRelativeDateFilter,
} from '@sisense/sdk-data';

import { createLevelAttribute } from '@/shared/utils/create-level-attribute';

import type { RangeGrain, RelativeSpec } from './time-frame-catalogue';
import { readTimeFramesInput, resolveTimeFrameKey, specKey } from './time-frame-catalogue';

/** The DateLevels string that goes on the emitted attribute for each grain. */
const GRAIN_TO_LEVEL: Record<RangeGrain, string> = {
  Day: DateLevels.Days,
  Week: DateLevels.Weeks,
  Month: DateLevels.Months,
  Quarter: DateLevels.Quarters,
  Year: DateLevels.Years,
};

/** The reverse map for reading a stored filter back to a grain. */
const LEVEL_TO_GRAIN = new Map<string, RangeGrain>([
  [DateLevels.Days, 'Day'],
  [DateLevels.Weeks, 'Week'],
  [DateLevels.Months, 'Month'],
  [DateLevels.Quarters, 'Quarter'],
  [DateLevels.Years, 'Year'],
]);

/**
 * The `offset` value a spec emits — 0 iff the window includes the current period.
 * See the file header for the full table.
 * @param spec - The frame.
 * @returns 0 when the window reaches the current period; 1 otherwise.
 * @internal
 */
export function offsetOf(spec: RelativeSpec): 0 | 1 {
  if (spec.tense === 'this') return 0;
  if (spec.withCurrent) return 0;
  // Day-grain rolling look-back: `Last N days` reaches today.
  if (spec.grain === 'Day' && spec.tense === 'last' && spec.count >= 2) return 0;
  return 1;
}

/**
 * The `count` value a spec emits, clamped to at least 1 the way the arithmetic
 * heals it. `this` is always 1.
 * @param spec - The frame.
 * @returns The emitted `count`.
 * @internal
 */
export function countOf(spec: RelativeSpec): number {
  if (spec.tense === 'this') return 1;
  return Math.max(1, Math.floor(spec.count) || 1);
}

/**
 * Builds the `RelativeDateFilter` the widget publishes for a picked frame.
 *
 * The emitted attribute is re-levelled to the frame's grain and named through the
 * house datetime naming (`Months in Date`, `Days in Date`), never the bare column —
 * a host syncing the filter-panel tile title from the JAQL title needs the grain.
 * @param spec - The frame to publish.
 * @param attribute - The widget's attribute, at whatever level it was given.
 * @param t - Optional translator for the published attribute's display name.
 * @returns A `RelativeDateFilter` whose JAQL is `{ last | next: { count, offset } }`.
 * @internal
 */
export function timeFrameToFilter(
  spec: RelativeSpec,
  attribute: Attribute,
  t?: TFunction,
): RelativeDateFilter {
  const level = levelAttributeAt(attribute, spec.grain, t);
  const offset = offsetOf(spec);
  const count = countOf(spec);
  // `dateRelativeTo` sets the Last operator; `dateRelativeFrom` sets Next. Both
  // return a RelativeDateFilter, whose `filterJaql` emits the bare
  // `{ [operator]: { count, offset } }` — no `isNotCurrentPeriod`, no anchor. The
  // factory return type is the base `Filter`; cast to the concrete class so callers
  // can read `.level` / `.operator` / `.filterJaql()` without asserting each time.
  const filter =
    spec.tense === 'next'
      ? filterFactory.dateRelativeFrom(level, offset, count)
      : filterFactory.dateRelativeTo(level, offset, count);
  return filter as RelativeDateFilter;
}

/**
 * Reads a linked filter back to a frame in the offered set — or `undefined` if
 * the filter is not a `RelativeDateFilter` or matches no offered frame. A clause
 * that matches no offered frame should render as nothing-selected rather than as
 * an invented row.
 * @param filter - The linked filter, if any.
 * @param offered - The frames the widget currently offers, ≥ 2.
 * @returns The matching frame from `offered`, or `undefined`.
 * @internal
 */
export function filterToTimeFrame(
  filter: Filter | null | undefined,
  offered: readonly RelativeSpec[],
): RelativeSpec | undefined {
  if (!filter || !isRelativeDateFilter(filter)) return undefined;
  const grain = LEVEL_TO_GRAIN.get(filter.level.granularity);
  if (!grain) return undefined;

  const tense: 'last' | 'next' = filter.operator === DateOperators.Next ? 'next' : 'last';
  const count = filter.count;
  const offset = filter.offset;

  // Reverse of `offsetOf`: find the frame in the offered set whose (tense, count,
  // grain, withCurrent) all agree, including the Day-grain rolling exception.
  const offeredKeys = new Set(offered.map(specKey));

  const candidates: RelativeSpec[] = [];
  // `This X` iff last/count=1/offset=0.
  if (tense === 'last' && count === 1 && offset === 0) {
    candidates.push({ tense: 'this', count: 1, grain });
  }
  // `This & last X` / `This & next X` iff count=2/offset=0.
  if (count === 2 && offset === 0) {
    candidates.push({ tense, count: 2, grain, withCurrent: true });
  }
  // The plain shape — tense/count/grain, offset as-emitted. Excludes `This X`
  // because that only matches the first branch.
  if (!(tense === 'last' && count === 1 && offset === 0)) {
    candidates.push({ tense, count, grain });
  }

  for (const candidate of candidates) {
    const key = specKey(candidate);
    if (offeredKeys.has(key) && offsetOf(candidate) === offset) {
      return resolveTimeFrameKey(key);
    }
  }
  return undefined;
}

/**
 * Ensures the outgoing attribute sits at the frame's grain, with the tile-title-friendly name.
 * @param attribute - The widget's attribute, at whatever level it was given.
 * @param grain - The frame's grain, which the outgoing attribute is re-levelled to.
 * @param t - Optional translator so the display name follows the house `Months in Date` shape.
 * @returns The re-levelled level attribute.
 * @internal
 */
function levelAttributeAt(attribute: Attribute, grain: RangeGrain, t?: TFunction): LevelAttribute {
  const granularity = GRAIN_TO_LEVEL[grain];
  if (attribute instanceof DimensionalLevelAttribute) {
    return createLevelAttribute(attribute, granularity, t);
  }
  if (isLevelAttribute(attribute)) {
    // A LevelAttribute that is not a DimensionalLevelAttribute: rebuild it as one so
    // `createLevelAttribute` can rename it with the house naming; without this the
    // filter-panel tile keeps the previous level's name after re-level (a bug the
    // condition-date branch already fixes the same way).
    return createLevelAttribute(
      new DimensionalLevelAttribute(attribute.name, attribute.expression, attribute.granularity),
      granularity,
      t,
    );
  }
  throw new Error('Time Frame requires a datetime level attribute');
}

/**
 * The default catalogue as offered specs, always ≥ 2 — used as the fallback set.
 *
 * Derived from the read guard's no-input branch so the default stays single-sourced:
 * `readTimeFramesInput(undefined)` returns the same 11 default frames the renderer
 * falls back to when no curated set is persisted.
 * @internal
 */
export const DEFAULT_OFFERED_FRAMES: readonly RelativeSpec[] = readTimeFramesInput(undefined);
