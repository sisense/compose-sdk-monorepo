/**
 * The Time Frame catalogue — 47 relative-window specs across five grains — plus the
 * default set of 11 and the canonical ordering rule.
 *
 * A frame is a `{ tense, count, grain, withCurrent? }` triple; two frames are the same
 * iff their `specKey` strings match. Keys are ASCII, locale-independent and never
 * displayed; labels come from the i18n resources at render time.
 *
 * The catalogue order is a single rule the dropdown and the persisted set of curated
 * frames both obey: **levels in the order Days → Weeks → Months → Quarters → Years,
 * and within each level a fixed row order**. The default 11 rides that same rule with
 * one deliberate exception: `Last 6 months` sits at position 7 in the default so a
 * Month-level custom addition (for example `Last 3 months`) later sits next to the
 * other Month-level frames.
 */

/**
 * The five calendar grains a Time Frame can be counted in.
 * @sisenseInternal
 */
export const RANGE_GRAINS = ['Day', 'Week', 'Month', 'Quarter', 'Year'] as const;
/** @sisenseInternal */
export type RangeGrain = (typeof RANGE_GRAINS)[number];

/**
 * Whether a frame reaches back, sits on the current period, or reaches forward.
 * @sisenseInternal
 */
export const TENSES = ['last', 'this', 'next'] as const;
/** @sisenseInternal */
export type Tense = (typeof TENSES)[number];

/**
 * A single relative window in the catalogue.
 * @sisenseInternal
 */
export interface RelativeSpec {
  tense: Tense;
  /** Whole periods. `this` reads this as 1 whatever it says. */
  count: number;
  grain: RangeGrain;
  /**
   * Only the two paired frames — `This & last X` / `This & next X` — carry this. It
   * distinguishes them from plain `Last 2 X` / `Next 2 X`, which name the same
   * count but *exclude* the current period. Omitted everywhere else.
   */
  withCurrent?: boolean;
}

const spec = (
  tense: Tense,
  count: number,
  grain: RangeGrain,
  withCurrent?: boolean,
): RelativeSpec =>
  withCurrent ? { tense, count, grain, withCurrent: true } : { tense, count, grain };

/**
 * The 47-frame catalogue, grouped by grain. Row counts:
 * 9 Days · 9 Weeks · 11 Months · 9 Quarters · 9 Years.
 * @sisenseInternal
 */
export const LEVEL_FRAMES: Record<RangeGrain, RelativeSpec[]> = {
  Day: [
    spec('this', 1, 'Day'), // Today
    spec('last', 1, 'Day'), // Yesterday
    spec('next', 1, 'Day'), // Tomorrow
    spec('last', 7, 'Day'), // Last 7 days
    spec('last', 30, 'Day'), // Last 30 days
    spec('last', 90, 'Day'), // Last 90 days
    spec('next', 7, 'Day'), // Next 7 days
    spec('next', 30, 'Day'), // Next 30 days
    spec('next', 90, 'Day'), // Next 90 days
  ],
  Week: [
    spec('this', 1, 'Week'), // This week
    spec('last', 1, 'Week'), // Last week
    spec('next', 1, 'Week'), // Next week
    spec('last', 2, 'Week', true), // This & last week
    spec('last', 2, 'Week'), // Last 2 weeks
    spec('last', 4, 'Week'), // Last 4 weeks
    spec('next', 2, 'Week', true), // This & next week
    spec('next', 2, 'Week'), // Next 2 weeks
    spec('next', 4, 'Week'), // Next 4 weeks
  ],
  Month: [
    spec('this', 1, 'Month'), // This month
    spec('last', 1, 'Month'), // Last month
    spec('next', 1, 'Month'), // Next month
    spec('last', 2, 'Month', true), // This & last month
    spec('last', 2, 'Month'), // Last 2 months
    spec('last', 3, 'Month'), // Last 3 months
    spec('last', 6, 'Month'), // Last 6 months
    spec('next', 2, 'Month', true), // This & next month
    spec('next', 2, 'Month'), // Next 2 months
    spec('next', 3, 'Month'), // Next 3 months
    spec('next', 6, 'Month'), // Next 6 months
  ],
  Quarter: [
    spec('this', 1, 'Quarter'), // This quarter
    spec('last', 1, 'Quarter'), // Last quarter
    spec('next', 1, 'Quarter'), // Next quarter
    spec('last', 2, 'Quarter', true), // This & last quarter
    spec('last', 2, 'Quarter'), // Last 2 quarters
    spec('last', 4, 'Quarter'), // Last 4 quarters
    spec('next', 2, 'Quarter', true), // This & next quarter
    spec('next', 2, 'Quarter'), // Next 2 quarters
    spec('next', 4, 'Quarter'), // Next 4 quarters
  ],
  Year: [
    spec('this', 1, 'Year'), // This year
    spec('last', 1, 'Year'), // Last year
    spec('next', 1, 'Year'), // Next year
    spec('last', 2, 'Year', true), // This & last year
    spec('last', 2, 'Year'), // Last 2 years
    spec('last', 3, 'Year'), // Last 3 years
    spec('next', 2, 'Year', true), // This & next year
    spec('next', 2, 'Year'), // Next 2 years
    spec('next', 3, 'Year'), // Next 3 years
  ],
};

/**
 * The whole 47-frame catalogue flattened in canonical order: Days → Weeks → Months
 * → Quarters → Years, and within each grain a fixed row order. Every use that talks
 * about "catalogue order" (the dropdown, the persisted set, the read guard) walks
 * this array — never a grain's `LEVEL_FRAMES` slice independently.
 * @sisenseInternal
 */
export const CATALOGUE_ORDER: readonly RelativeSpec[] = RANGE_GRAINS.flatMap(
  (grain) => LEVEL_FRAMES[grain],
);

/**
 * The 11 frames the filter offers when `customizeTimeFrames` is off. Same shape as any
 * other offered set: an ordered array of catalogue specs. Derived from constants below
 * so the keys and their catalogue lookups cannot drift apart.
 *
 * The set: `Today` · `Yesterday` · `This week` · `Last week` · `This month` ·
 * `Last month` · `Last 6 months` · `This quarter` · `Last quarter` · `This year` ·
 * `Last year`. `Last 6 months` sits at position 7 so it groups with the other
 * Month-level frames rather than between Quarters and Years.
 * @sisenseInternal
 */
const DEFAULT_FRAMES: readonly RelativeSpec[] = [
  spec('this', 1, 'Day'), // Today
  spec('last', 1, 'Day'), // Yesterday
  spec('this', 1, 'Week'), // This week
  spec('last', 1, 'Week'), // Last week
  spec('this', 1, 'Month'), // This month
  spec('last', 1, 'Month'), // Last month
  spec('last', 6, 'Month'), // Last 6 months — position 7, with the other Month-level frames
  spec('this', 1, 'Quarter'), // This quarter
  spec('last', 1, 'Quarter'), // Last quarter
  spec('this', 1, 'Year'), // This year
  spec('last', 1, 'Year'), // Last year
];

/**
 * The canonical keys of the default 11, kept as an exported constant so tests and the
 * public prop's `@example` can name them directly.
 * @sisenseInternal
 */
export const DEFAULT_TIME_FRAME_KEYS: readonly string[] = DEFAULT_FRAMES.map(specKey);

/**
 * Row identity for the catalogue: `tense:count:grain[:c]`. `withCurrent` is appended
 * only when set, so the plain `Last 2 months` (`last:2:Month`) and the paired
 * `This & last month` (`last:2:Month:c`) stay distinct while every other key stays
 * short. Never a display string.
 * @param value - The frame to encode.
 * @returns The canonical key string.
 * @sisenseInternal
 */
export function specKey(value: RelativeSpec): string {
  const count = value.tense === 'this' ? 1 : Math.max(1, Math.floor(value.count) || 1);
  return `${value.tense}:${count}:${value.grain}${value.withCurrent ? ':c' : ''}`;
}

/** Index the catalogue by key once; `resolveTimeFrameKey` and the read guard both walk it. */
const CATALOGUE_BY_KEY = new Map<string, RelativeSpec>(
  CATALOGUE_ORDER.map((frame) => [specKey(frame), frame] as const),
);

/**
 * The frame the given key names, or `undefined` if the key is not in the catalogue.
 * @param key - A `specKey` string, canonical form.
 * @returns The matching `RelativeSpec`, or `undefined`.
 * @sisenseInternal
 */
export function resolveTimeFrameKey(key: string): RelativeSpec | undefined {
  return CATALOGUE_BY_KEY.get(key);
}

/**
 * The defensive read guard for a persisted or caller-supplied set of frame keys.
 *
 * The rules, applied in order:
 * 1. Unknown keys (not in `CATALOGUE_ORDER`) are dropped rather than rendered.
 * 2. Duplicates are folded to one.
 * 3. The surviving frames are re-ordered by `CATALOGUE_ORDER`, not the caller's order.
 * 4. If fewer than two valid frames remain, the whole thing falls back to the
 *    default 11.
 *
 * The rules cover three real paths: (a) the public `@beta` `timeFrames?` prop an
 * SDK consumer passes without a design UI, (b) a stored set whose keys were valid
 * at save time but later removed from the catalogue, (c) dashboard imports or DTO
 * edits outside the UI. In every case the render stays sane. A design-UI writer
 * is expected to enforce the minimum of two on save separately.
 * @param input - The caller's set of keys, or `undefined` for the default.
 * @returns The canonical set to render, always ≥ 2 keys.
 * @sisenseInternal
 */
export function readTimeFramesInput(input: readonly string[] | undefined): readonly RelativeSpec[] {
  if (!input || input.length === 0) {
    return DEFAULT_FRAMES;
  }
  const seen = new Set<string>();
  for (const key of input) {
    if (CATALOGUE_BY_KEY.has(key)) seen.add(key);
  }
  if (seen.size < 2) {
    return DEFAULT_FRAMES;
  }
  // Re-order by catalogue, not caller order — the persisted array's order is not authoritative.
  return CATALOGUE_ORDER.filter((frame) => seen.has(specKey(frame)));
}
