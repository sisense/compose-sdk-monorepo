/**
 * Time Frame — the fifth filterWidget type for datetime dimensions. A curated set
 * of relative windows (`Today`, `Last 7 days`, `This month`, `This year`, …)
 * behind a single-select dropdown.
 * @internal
 */

export type { RangeGrain, RelativeSpec, Tense } from './time-frame-catalogue';
export {
  CATALOGUE_ORDER,
  DEFAULT_TIME_FRAME_KEYS,
  LEVEL_FRAMES,
  RANGE_GRAINS,
  TENSES,
  readTimeFramesInput,
  resolveTimeFrameKey,
  specKey,
} from './time-frame-catalogue';

export type { ExactRange } from './time-frame-arithmetic';
export { addGrains, resolveRelative, startOfGrain } from './time-frame-arithmetic';

export {
  DEFAULT_OFFERED_FRAMES,
  countOf,
  filterToTimeFrame,
  offsetOf,
  timeFrameToFilter,
} from './time-frame-jaql';

export { useDataSpanLabel, useTimeFrameLabel, useTimeFrameRangeLabel } from './time-frame-labels';

export { TimeFrameFilter } from './time-frame-filter';
export type { TimeFrameFilterProps } from './time-frame-filter';
