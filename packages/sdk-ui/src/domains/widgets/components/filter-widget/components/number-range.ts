/**
 * The numeric Range's value, its validation, its slider steps and its Filter mapping — the pure
 * logic behind the `NumberRangeFilter` control. Ported from the designer's
 * `filter-widget-components` `numberRange.ts`, copied and adapted, not imported.
 *
 * A number range is a **Minimum / Maximum pair**: either end, or both. The ends are held as
 * **text**, not numbers, so a half-typed or non-numeric entry (`12`, `mkk`) survives a render
 * and can be shown and flagged; they are read as numbers only once they parse.
 *
 * The filter keeps an empty end open: both ends → `between` (`{ from, to }`), Minimum alone →
 * `≥` (`{ from }`), Maximum alone → `≤` (`{ to }`), neither → no filter. Those are the same
 * inclusive `NumericFilter`s numeric Condition's Between / ≥ / ≤ emit, built through the same
 * helper.
 * @internal
 */
import { type Attribute, type Filter, type FilterConfig, isNumericFilter } from '@sisense/sdk-data';

import { isNumericString } from '@/shared/utils/is-numeric-string.js';

import {
  defaultNumericConditionDraft,
  filterToNumericConditionDraft,
  isEditableNumericConditionFilter,
  numericConditionToFilter,
} from './condition-numeric.js';

/**
 * The two ends as typed text.
 * @internal
 */
export type NumberRangeValue = {
  /** Minimum — the lower bound, `≥`. */
  min: string;
  /** Maximum — the upper bound, `≤`. */
  max: string;
};

/**
 * Which end an edit touched — a field or a slider handle.
 * @internal
 */
export type NumberRangeEnd = 'min' | 'max';

/**
 * A pair with both ends empty — no filter.
 * @returns The empty pair.
 * @internal
 */
export function emptyNumberRange(): NumberRangeValue {
  return { min: '', max: '' };
}

/**
 * The pair with one end replaced.
 * @param value - The pair.
 * @param end - The end to replace.
 * @param text - The end's new text.
 * @returns A new pair.
 * @internal
 */
export function withNumberRangeEnd(
  value: NumberRangeValue,
  end: NumberRangeEnd,
  text: string,
): NumberRangeValue {
  return end === 'min' ? { ...value, min: text } : { ...value, max: text };
}

/**
 * Why one end cannot be committed.
 * @internal
 */
export type NumberRangeEndProblem = 'invalidNumber';

/**
 * The problems a pair carries; empty when it can be committed.
 * @internal
 */
export type NumberRangeErrors = {
  min?: NumberRangeEndProblem;
  max?: NumberRangeEndProblem;
  /** Both ends read as numbers but Maximum ≤ Minimum — reported once, both fields red. */
  order?: true;
};

/**
 * Whether one end's text reads as a number. Surrounding spaces are tolerated, the way the
 * numeric Condition reads its operands. A number too large to represent (`1e309` reads as
 * `Infinity`) does not count — a filter cannot carry it.
 * @param text - The end as typed.
 * @returns True when it parses to a finite number.
 * @internal
 */
export function isNumberRangeText(text: string): boolean {
  const trimmed = text.trim();
  return isNumericString(trimmed) && Number.isFinite(Number(trimmed));
}

/**
 * The numeric value of an end, or `null` when it is empty or not a number — what positions a
 * slider handle (a handle cannot sit on `mkk`).
 * @param text - The end as typed.
 * @returns The number, or `null`.
 * @internal
 */
export function endNumber(text: string): number | null {
  return isNumberRangeText(text) ? Number(text.trim()) : null;
}

/**
 * The errors for a pair, judged in this order:
 *
 * 1. **Not a number**, per end — a non-empty field that does not parse. An empty field is a
 *    legitimate open end, never flagged.
 * 2. **Order** — once both ends read as numbers, Maximum must be strictly above Minimum. Judged
 *    only when neither end has its own error.
 *
 * A number outside the column's current data is not an error: a range of interest may lie
 * beyond today's data, which can grow later. Its handle simply sits at the slider's edge.
 * @param value - The pair as typed.
 * @returns The problems found; an empty object when the pair can be committed.
 * @internal
 */
export function numberRangeErrors(value: NumberRangeValue): NumberRangeErrors {
  const errors: NumberRangeErrors = {};
  const notNumber = (text: string) => text.trim() !== '' && !isNumberRangeText(text);
  if (notNumber(value.min)) errors.min = 'invalidNumber';
  if (notNumber(value.max)) errors.max = 'invalidNumber';
  if (errors.min || errors.max) return errors;

  const min = endNumber(value.min);
  const max = endNumber(value.max);
  if (min !== null && max !== null && max <= min) errors.order = true;
  return errors;
}

/**
 * Whether a pair has any problem.
 * @param errors - The problems found.
 * @returns True when the pair cannot be committed.
 * @internal
 */
export function hasNumberRangeErrors(errors: NumberRangeErrors): boolean {
  return Boolean(errors.min || errors.max || errors.order);
}

/**
 * Whether the column's bounds can carry a slider: both known, and spanning more than one value.
 * Otherwise the slider is disabled and the fields stay live.
 * @param dataMin - The column's low edge, when known.
 * @param dataMax - The column's high edge, when known.
 * @returns True when the slider has a span to move across.
 * @internal
 */
export function hasSliderSpan(dataMin: number | undefined, dataMax: number | undefined): boolean {
  return (
    dataMin !== undefined &&
    dataMax !== undefined &&
    Number.isFinite(dataMin) &&
    Number.isFinite(dataMax) &&
    dataMax > dataMin
  );
}

/**
 * A drag rounds to four significant digits of the value, so the step scales with the value's
 * length (12 500 000 → 10 000, 950 000 → 100, 0.4567 → 0.0001) and never falls below the
 * slider's step (see `sliderStep`). A fine drag (Shift) rounds to five and moves a tenth as fast.
 * Typed values are never rounded.
 * @internal
 */
export const DRAG_SIGNIFICANT_DIGITS = 4;
/**
 * Significant digits of a fine (Shift) drag.
 * @internal
 */
export const FINE_SIGNIFICANT_DIGITS = 5;
/**
 * How much slower a fine (Shift) drag moves.
 * @internal
 */
export const FINE_DRAG_FACTOR = 10;
/**
 * About how many positions a fractional column's slider offers across its span.
 * @internal
 */
export const SLIDER_POSITIONS = 1000;

/**
 * The smallest move the slider makes — what a drag never rounds below. A whole-number column
 * moves in whole steps, so a 1–5 rating never lands on 3.217. A fractional column steps by a
 * power of ten that fits about a thousand positions into its span (0.12–0.87 → 0.001), so a
 * column of small numbers stays draggable. The column counts as whole-number when both edges
 * are whole and its distinct values fit between them as whole numbers — 0 and 1 edges with a
 * few hundred distinct values in between are fractions.
 * @param dataMin - The column's low edge.
 * @param dataMax - The column's high edge, above `dataMin`.
 * @param distinct - How many distinct values the column holds, when known.
 * @returns The step: `1` for whole numbers, a power of ten no larger than `1` otherwise.
 * @internal
 */
export function sliderStep(dataMin: number, dataMax: number, distinct?: number): number {
  const span = dataMax - dataMin;
  const wholeEdges = Number.isInteger(dataMin) && Number.isInteger(dataMax);
  const fitsWhole = distinct === undefined || distinct <= span + 1;
  if (wholeEdges && fitsWhole) return 1;
  return Math.min(1, 10 ** Math.round(Math.log10(span / SLIDER_POSITIONS)));
}

/**
 * Drops binary floating-point noise (0.1 + 0.2 → 0.3) from a value the slider computed.
 * @param value - A computed value.
 * @returns The value at twelve significant digits.
 * @internal
 */
export function cleanNumber(value: number): number {
  return Number(value.toPrecision(12));
}

/**
 * The rounding unit for `value` at `digits` significant digits, never below `step`.
 * @param value - The value being rounded.
 * @param step - The smallest unit.
 * @param digits - Significant digits to keep.
 * @returns The unit.
 * @internal
 */
export function magnitudeUnit(value: number, step: number, digits: number): number {
  if (value === 0) return step;
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  return Math.max(step, 10 ** (exponent - digits + 1));
}

/**
 * Where a drag lands: the raw value rounded to its own magnitude.
 * @param raw - The value under the pointer.
 * @param step - The smallest unit.
 * @param digits - Significant digits to keep.
 * @returns The rounded value.
 * @internal
 */
export function snapDrag(raw: number, step: number, digits = DRAG_SIGNIFICANT_DIGITS): number {
  const unit = magnitudeUnit(raw, step, digits);
  return cleanNumber(Math.round(raw / unit) * unit);
}

/**
 * An arrow key's move: one unit of the value's fourth significant digit, never below `step`.
 * @param here - The handle's current value.
 * @param step - The smallest unit.
 * @returns The distance one key press moves.
 * @internal
 */
export function keyStep(here: number, step: number): number {
  return magnitudeUnit(here, step, DRAG_SIGNIFICANT_DIGITS);
}

/**
 * Whether a filter is one a numeric Range can show: a single inclusive `NumericFilter` — `between`,
 * `≥` or `≤`. Not an AND / OR chain, not the exclusive `<` / `>`, not `=` / `≠` — those only
 * numeric Condition can show.
 * @param filter - The linked filter.
 * @returns True when Range can show and republish it.
 * @internal
 */
export function isEditableNumberRangeFilter(filter: Filter | null | undefined): filter is Filter {
  if (!filter || !isNumericFilter(filter) || !isEditableNumericConditionFilter(filter)) {
    return false;
  }
  const { op, extra } = filterToNumericConditionDraft(filter);
  return extra.length === 0 && (op === 'between' || op === 'gte' || op === 'lte');
}

/**
 * The pair a stored filter carries. An end the filter does not carry reads back empty.
 * @param filter - The linked filter.
 * @returns The pair, or an empty pair for anything Range cannot show.
 * @internal
 */
export function filterToNumberRange(filter: Filter | null | undefined): NumberRangeValue {
  if (!isEditableNumberRangeFilter(filter)) return emptyNumberRange();
  const draft = filterToNumericConditionDraft(filter);
  if (draft.op === 'between') return { min: draft.min, max: draft.max };
  if (draft.op === 'gte') return { min: draft.number, max: '' };
  return { min: '', max: draft.number };
}

/**
 * The filter a committed pair publishes. The caller commits only a pair without
 * errors, so each non-empty end parses.
 * @param attribute - The widget's numeric attribute.
 * @param value - The pair to publish.
 * @param config - The linked filter's config, so its guid survives.
 * @returns `between`, `≥` or `≤`; `null` when both ends are empty (include-all).
 * @internal
 */
export function numberRangeToFilter(
  attribute: Attribute,
  value: NumberRangeValue,
  config?: FilterConfig,
): Filter | null {
  const hasMin = value.min.trim() !== '';
  const hasMax = value.max.trim() !== '';
  if (!hasMin && !hasMax) return null;
  const base = defaultNumericConditionDraft();
  if (hasMin && hasMax) {
    return numericConditionToFilter(
      attribute,
      { ...base, op: 'between', min: value.min, max: value.max },
      config,
    );
  }
  return hasMin
    ? numericConditionToFilter(attribute, { ...base, op: 'gte', number: value.min }, config)
    : numericConditionToFilter(attribute, { ...base, op: 'lte', number: value.max }, config);
}

/**
 * Whether two pairs show the same ends.
 * @param a - One pair.
 * @param b - The other pair.
 * @returns True when both ends match.
 * @internal
 */
export function isSameNumberRange(a: NumberRangeValue, b: NumberRangeValue): boolean {
  return a.min.trim() === b.min.trim() && a.max.trim() === b.max.trim();
}
