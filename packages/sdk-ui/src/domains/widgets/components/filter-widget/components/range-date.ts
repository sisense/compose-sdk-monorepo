/**
 * Date Range Filter ↔ draft mapping for FilterWidget.
 *
 * Two fields, From and To, sharing one calendar — either end optional (an open-ended
 * range), both empty clears. Inclusive `from`/`to` only via `filterFactory.dateRange` —
 * never the exclusive `fromNotEqual`/`toNotEqual` shape date Condition's Before/After
 * anchors use (`filterFactory.dateBefore`/`dateAfter`). Always published at Days level,
 * the same construction date Condition's own anchors already use (`levelAttributeAt`).
 * @internal
 */
import type { TFunction } from '@sisense/sdk-common';
import {
  type Attribute,
  DateLevels,
  DateOperators,
  type Filter,
  type FilterConfig,
  filterFactory,
  isDateRangeFilter,
} from '@sisense/sdk-data';

import { canonicalDay, levelAttributeAt, parseCanonicalDay } from './condition-date';
import { dayKey, formatDateInput, parseDateInput, validateDateInput } from './date-text';
import type { DateEntryProblem, DateMask } from './date-text';

/**
 * Which end of the pair.
 * @internal
 */
export type RangeEnd = 'from' | 'to';

/**
 * Per-end typed-entry rejection, plus the cross-end order fault.
 * @internal
 */
export type RangeEntryProblem = DateEntryProblem | 'inverted';

/**
 * The pair as masked text — what the two fields hold, however far typed.
 * @internal
 */
export type RangeDraft = {
  from: string;
  to: string;
};

/**
 * Builds the both-ends-blank starting draft.
 * @returns An empty `RangeDraft`.
 * @internal
 */
export function emptyRangeDraft(): RangeDraft {
  return { from: '', to: '' };
}

/**
 * Checks whether neither end holds any text.
 * @param draft - The pair as masked text.
 * @returns Whether both ends are blank.
 * @internal
 */
export function isRangeDraftEmpty(draft: RangeDraft): boolean {
  return draft.from.trim() === '' && draft.to.trim() === '';
}

/**
 * Returns a copy of the draft with one end replaced.
 * @param draft - The pair to copy from.
 * @param end - Which end to replace.
 * @param text - The end's new masked text.
 * @returns The updated draft.
 * @internal
 */
export function withRangeEnd(draft: RangeDraft, end: RangeEnd, text: string): RangeDraft {
  return end === 'from' ? { ...draft, from: text } : { ...draft, to: text };
}

/**
 * True once both ends parse and From lands after To. A pair in this shape from typing is
 * refused — only a calendar pick swaps the ends instead.
 * @param mask - The reader's date format.
 * @param draft - The pair as masked text.
 * @returns Whether both ends parse and From is later than To.
 * @internal
 */
export function isInvertedRangeDraft(mask: DateMask, draft: RangeDraft): boolean {
  const from = parseDateInput(mask, draft.from);
  const to = parseDateInput(mask, draft.to);
  return Boolean(from && to && dayKey(from) > dayKey(to));
}

/**
 * Judges one end's typed text in the context of the other: a per-end fault
 * (`malformed`/`nonexistent`) first, else `inverted` once both ends parse and disagree on
 * order. Empty text is never a problem — it means "this end is open".
 * @param mask - The reader's date format.
 * @param draft - The pair as masked text, before this edit.
 * @param end - Which end `text` was just typed into.
 * @param text - The end's new, already-masked text.
 * @returns The fault, or `null` if the entry is fine.
 * @internal
 */
export function judgeRangeEnd(
  mask: DateMask,
  draft: RangeDraft,
  end: RangeEnd,
  text: string,
): RangeEntryProblem | null {
  const { problem } = validateDateInput(mask, text);
  if (problem) return problem;
  if (text.trim() === '') return null;
  return isInvertedRangeDraft(mask, withRangeEnd(draft, end, text)) ? 'inverted' : null;
}

/**
 * Whether the pair can be committed: every non-empty end parses, and the pair is not
 * inverted. Both-empty is usable too — it clears the filter.
 * @param mask - The reader's date format.
 * @param draft - The pair as masked text.
 * @returns Whether the draft can be published or used to clear.
 * @internal
 */
export function isRangeDraftUsable(mask: DateMask, draft: RangeDraft): boolean {
  const fromProblem = draft.from.trim() === '' ? null : validateDateInput(mask, draft.from).problem;
  const toProblem = draft.to.trim() === '' ? null : validateDateInput(mask, draft.to).problem;
  if (fromProblem || toProblem) return false;
  return !isInvertedRangeDraft(mask, draft);
}

/**
 * I18n key for the cross-end order fault — parameterless, unlike the per-end messages.
 * @param end - Which end the message is attached to.
 * @returns The translation key for that end's inversion message.
 * @internal
 */
export function rangeInversionMessageKey(end: RangeEnd): string {
  return end === 'from'
    ? 'filterWidget.dateRange.invertedFrom'
    : 'filterWidget.dateRange.invertedTo';
}

/**
 * Whether a `DateRangeFilter`'s bounds are the inclusive shape Range itself publishes
 * (`filterFactory.dateRange`/`dateFrom`/`dateTo` — operators `from`/`to`, or unset for an
 * open-ended end). `DateRangeFilter.from`/`.to` return the raw stored value regardless of
 * operator, so a filter built by date Condition's exclusive Before/After anchors
 * (`filterFactory.dateBefore`/`dateAfter` — `fromNotEqual`/`toNotEqual`) also passes
 * `isDateRangeFilter` and would otherwise read as an inclusive bound one day off from what
 * it actually excludes. Range must reject that shape rather than silently reinterpret it.
 * @param filter - The candidate filter, if any.
 * @returns Whether it is a `DateRangeFilter` in Range's own inclusive shape.
 * @internal
 */
export function isInclusiveDateRangeFilter(filter: Filter | null | undefined): boolean {
  if (!filter || !isDateRangeFilter(filter)) return false;
  return (
    (filter.operatorA === undefined || filter.operatorA === DateOperators.From) &&
    (filter.operatorB === undefined || filter.operatorB === DateOperators.To)
  );
}

/**
 * Checks whether the linked filter is a Range this control can edit: an inclusive
 * `DateRangeFilter` (see {@link isInclusiveDateRangeFilter}) with at least one bound
 * parseable — either end alone (open-ended) or both. Unlike date Condition's anchors
 * (`isEditableAnchor`, which requires exactly one bound), Range accepts both being set at
 * once.
 * @param filter - The candidate filter, if any.
 * @returns Whether Range can read and edit this filter.
 * @internal
 */
export function isEditableRangeFilter(filter: Filter | null | undefined): filter is Filter {
  if (!filter || !isDateRangeFilter(filter) || !isInclusiveDateRangeFilter(filter)) return false;
  const hasFrom = Boolean(filter.from) && parseCanonicalDay(filter.from) !== null;
  const hasTo = Boolean(filter.to) && parseCanonicalDay(filter.to) !== null;
  return hasFrom || hasTo;
}

/**
 * Reads a Range `DateRangeFilter` into masked draft text, in the reader's own format.
 * Anything else (including a non-editable shape) reads as the empty draft.
 * @param filter - The linked filter, if any.
 * @param mask - The reader's date format.
 * @returns The filter's bounds as masked draft text.
 * @internal
 */
export function filterToRangeDraft(filter: Filter | null | undefined, mask: DateMask): RangeDraft {
  // Re-checked (not just `isEditableRangeFilter`) so TypeScript narrows `filter` to
  // `DateRangeFilter` here — same double-check `condition-date.ts` uses for the same reason.
  if (!isEditableRangeFilter(filter) || !isDateRangeFilter(filter)) return emptyRangeDraft();
  const from = parseCanonicalDay(filter.from);
  const to = parseCanonicalDay(filter.to);
  return {
    from: from ? formatDateInput(mask, from) : '',
    to: to ? formatDateInput(mask, to) : '',
  };
}

/**
 * Builds a `DateRangeFilter` from a usable draft — inclusive `from`/`to`, either or both
 * set, always at Days level. Returns null for a both-empty draft; the caller treats that as
 * a clear, not a filter to publish.
 * @param attribute - The linked date attribute, at whatever level it was given.
 * @param draft - The pair as masked text.
 * @param mask - The reader's date format.
 * @param config - Forwarded to `filterFactory.dateRange` unchanged.
 * @param t - Forwarded to {@link levelAttributeAt} for its own level-name lookups.
 * @returns The inclusive `DateRangeFilter`, or `null` for a both-empty draft.
 * @internal
 */
export function rangeDraftToFilter(
  attribute: Attribute,
  draft: RangeDraft,
  mask: DateMask,
  config?: FilterConfig,
  t?: TFunction,
): Filter | null {
  const from = parseDateInput(mask, draft.from);
  const to = parseDateInput(mask, draft.to);
  if (!from && !to) return null;
  const level = levelAttributeAt(attribute, DateLevels.Days, t);
  return filterFactory.dateRange(
    level,
    from ? canonicalDay(from) : undefined,
    to ? canonicalDay(to) : undefined,
    config,
  );
}
