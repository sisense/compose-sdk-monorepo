/**
 * Rank (Top / Bottom N) catalogue and Filter ↔ draft mapping for FilterWidget.
 *
 * The control ranks the widget's attribute by a measure the dashboard designer fixed
 * (`FilterWidgetProps.rankBy`), so the user only picks a direction, a count and — on a datetime
 * attribute — a date level. Everything here is pure: the count text rules, the draft, the
 * `RankingFilter` it builds, and the sentence the trigger shows.
 * @internal
 */
import type { TFunction } from '@sisense/sdk-common';
import {
  type Attribute,
  type BaseFilterConfig,
  DateLevels,
  DimensionalLevelAttribute,
  type Filter,
  isLevelAttribute,
  isRankingFilter,
  type Measure,
  type RankingFilter,
  RankingOperators,
} from '@sisense/sdk-data';

import { getRankingMeasureDisplayName } from '@/domains/data-browser/add-measure-popover/measure-ranking-title';
import {
  CRITERIA_FILTER_MAP,
  FilterOption,
} from '@/domains/filters/components/criteria-filter-tile/criteria-filter-operations';
import {
  DEFAULT_DATETIME_RANKING_COUNT,
  DEFAULT_RANKING_COUNT,
} from '@/domains/filters/components/filter-editor-popover/sections/ranking-condition';
import { createLevelAttribute } from '@/shared/utils/create-level-attribute';

/**
 * Which end of the ranking the filter keeps.
 * @internal
 */
export type RankDirection = (typeof RankingOperators)[keyof typeof RankingOperators];

/**
 * What the Rank panel is editing. The count is text, so a half-typed value can stay in the field
 * until Apply decides what it means.
 * @internal
 */
export type RankDraft = {
  direction: RankDirection;
  /** Digits only; empty means "no ranking". */
  count: string;
  /** The date level the ranking runs at — set for a datetime attribute only. */
  level?: string;
};

/** Fifteen digits always fit a safe integer — `Number.MAX_SAFE_INTEGER` has sixteen. */
const MAX_COUNT_DIGITS = 15;

/**
 * Builds the draft a fresh panel opens on: `Top`, the default count, and — for a datetime
 * attribute — the default level. Shown, never published.
 * @param isDate - Whether the attribute is a datetime attribute.
 * @returns The default draft.
 * @internal
 */
export function emptyRankDraft(isDate: boolean): RankDraft {
  return {
    direction: RankingOperators.Top,
    count: String(isDate ? DEFAULT_DATETIME_RANKING_COUNT : DEFAULT_RANKING_COUNT),
    ...(isDate ? { level: DateLevels.Years } : {}),
  };
}

/**
 * Keeps a typed or pasted count to what can be a count: digits only and no leading zeroes at all,
 * so `0`, text and decimals never land and need no error message. What is left is either a whole
 * number of 1 or more, or empty. The length cap is a silent guard against unsafe integers, not a
 * product limit.
 * @param text - The raw text in the field.
 * @returns The text the field keeps.
 * @internal
 */
export function sanitiseRankCount(text: string): string {
  return text.replace(/\D/g, '').replace(/^0+/, '').slice(0, MAX_COUNT_DIGITS);
}

/**
 * Steps the count by one, never below 1. An empty field counts as 0, so up gives 1.
 * @param count - The current count text.
 * @param delta - `1` to step up, `-1` to step down.
 * @returns The stepped count text; unchanged when stepping up would overflow the digit cap.
 * @internal
 */
export function stepRankCount(count: string, delta: 1 | -1): string {
  const current = count === '' ? 0 : Number(count);
  const next = String(Math.max(1, current + delta));
  return next.length > MAX_COUNT_DIGITS ? count : next;
}

/**
 * Whether the draft can be published as a ranking.
 * @param draft - The panel draft.
 * @returns `true` when the draft carries a count.
 * @internal
 */
export function isRankDraftComplete(draft: RankDraft): boolean {
  return draft.count !== '';
}

/**
 * The attribute as a `DimensionalLevelAttribute`, when it sits at a date level.
 * @param attribute - The widget's attribute.
 * @returns The level attribute, or `undefined` for an attribute with no level.
 */
function attributeAsLevel(attribute: Attribute): DimensionalLevelAttribute | undefined {
  if (attribute instanceof DimensionalLevelAttribute) return attribute;
  // The data source rides along: `createLevelAttribute` carries it from this attribute to the
  // re-levelled one, and the published ranking has to stay bound to the source it was configured on.
  return isLevelAttribute(attribute)
    ? new DimensionalLevelAttribute(
        attribute.name,
        attribute.expression,
        attribute.granularity,
        undefined,
        undefined,
        undefined,
        attribute.dataSource,
      )
    : undefined;
}

/**
 * Builds the `RankingFilter` for a draft — the one filter shape Rank ever publishes.
 *
 * On a datetime attribute the filter is built on the attribute at the draft's level, which the
 * host then follows with a `dateLevel/changed` event.
 * @param draft - The panel draft.
 * @param attribute - The widget's attribute.
 * @param measure - The measure to rank by.
 * @param t - Translation function (names the level attribute).
 * @param config - The config of the filter being replaced, so its identity carries over.
 * @returns The ranking filter, or `null` when there is no measure or no count.
 * @internal
 */
export function rankDraftToFilter(
  draft: RankDraft,
  attribute: Attribute,
  measure: Measure | undefined,
  t: TFunction,
  config?: BaseFilterConfig,
): Filter | null {
  if (!measure || !isRankDraftComplete(draft)) return null;
  /* Re-levelled the way date Condition and Time Frame do it: a level attribute the host built
     some other way is rebuilt as a DimensionalLevelAttribute first. An attribute with no level has
     nowhere to move to, so it is ranked as it is. */
  const levelBase = attributeAsLevel(attribute);
  const levelAttribute =
    draft.level && levelBase && draft.level !== levelBase.granularity
      ? createLevelAttribute(levelBase, draft.level, t)
      : undefined;
  const info =
    CRITERIA_FILTER_MAP[
      draft.direction === RankingOperators.Bottom ? FilterOption.BOTTOM : FilterOption.TOP
    ];
  return info.fn(levelAttribute ?? attribute, measure, Number(draft.count), config);
}

/**
 * Reads a published filter back into the panel's draft.
 * @param filter - The filter the host holds for this widget.
 * @param isDate - Whether the attribute is a datetime attribute.
 * @returns The draft, or `null` when the filter is not a ranking filter.
 * @internal
 */
export function readRankDraft(
  filter: Filter | null | undefined,
  isDate: boolean,
): RankDraft | null {
  if (!filter || !isRankingFilter(filter)) return null;
  const level = isLevelAttribute(filter.attribute)
    ? filter.attribute.granularity
    : DateLevels.Years;
  return {
    direction:
      filter.operator === RankingOperators.Bottom ? RankingOperators.Bottom : RankingOperators.Top,
    count: String(filter.count),
    ...(isDate ? { level } : {}),
  };
}

/**
 * The sentence for an applied ranking — `Top 10 By Revenue`. It names the measure the ranking
 * runs by, never the date level the filtered attribute sits at.
 * @param filter - The applied ranking filter.
 * @param t - Translation function.
 * @returns The trigger and hover text.
 * @internal
 */
export function summariseRank(filter: RankingFilter, t: TFunction): string {
  const info =
    CRITERIA_FILTER_MAP[
      filter.operator === RankingOperators.Bottom ? FilterOption.BOTTOM : FilterOption.TOP
    ];
  return t(info.message, {
    valA: filter.count,
    valB: getRankingMeasureDisplayName(filter.measure, t),
    interpolation: { escapeValue: false },
  });
}

/**
 * The text of a Rank control with nothing applied — `Ranked by Revenue`.
 * @param measure - The measure being ranked by.
 * @param t - Translation function.
 * @returns The trigger and hover text.
 * @internal
 */
export function rankEmptyLabel(measure: Measure, t: TFunction): string {
  return t('filterWidget.rank.rankedBy', {
    field: getRankingMeasureDisplayName(measure, t),
    interpolation: { escapeValue: false },
  });
}

/**
 * The hover of an applied ranking, as the two rows it is shown in — the rule, then the measure
 * under it: `Top 10 By:` / `# of unique Brand`.
 * @param filter - The applied ranking filter.
 * @param t - Translation function.
 * @returns The rule row and the measure row.
 * @internal
 */
export function summariseRankRows(filter: RankingFilter, t: TFunction): readonly [string, string] {
  return [
    t(
      filter.operator === RankingOperators.Bottom
        ? 'filterWidget.rank.bottomBy'
        : 'filterWidget.rank.topBy',
      {
        valA: filter.count,
        interpolation: { escapeValue: false },
      },
    ),
    getRankingMeasureDisplayName(filter.measure, t),
  ];
}

/**
 * The hover of a Rank control with nothing applied, as two rows — `Ranked by:` / the measure.
 * @param measure - The measure being ranked by.
 * @param t - Translation function.
 * @returns The label row and the measure row.
 * @internal
 */
export function rankEmptyRows(measure: Measure, t: TFunction): readonly [string, string] {
  return [t('filterWidget.rank.rankedByLabel'), getRankingMeasureDisplayName(measure, t)];
}
