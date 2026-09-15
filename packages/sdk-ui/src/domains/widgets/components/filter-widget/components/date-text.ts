/**
 * Text ↔ Date for the date picker's typed entry, in the reader's own date format.
 *
 * The field is a single masked input: the caret walks a fixed template of digit cells and
 * separators, and the cells a reader has not filled yet show their format letters in grey.
 * The template is not fixed at `MM/DD/YYYY` — it is derived from the active locale, so a
 * German reader types `24.11.2009` and a Japanese one `2009/11/24`. Everything here is
 * therefore driven by a {@link DateMask}: the segment order, the separator and the widths
 * all come off it, and nothing in this module knows which locale is in play.
 *
 * What the mask governs is **presentation and parsing only**. A filter member stays one
 * canonical form whatever the reader typed — see `date-picker-members.ts`.
 * @internal
 */

/** The three parts of a numeric date, whatever order a locale puts them in. @internal */
export type DateUnit = 'month' | 'day' | 'year';

/** One part of the mask: which unit it holds, how wide, and the letters it shows unfilled. */
interface DateMaskSegment {
  unit: DateUnit;
  width: number;
  placeholder: string;
}

/**
 * A locale's date entry format, in the shape the mask machinery needs: the three segments in
 * the locale's own order, the separator between them, the rendered template, and the caret
 * index each segment starts at.
 * @internal
 */
export interface DateMask {
  segments: readonly [DateMaskSegment, DateMaskSegment, DateMaskSegment];
  separator: string;
  /** What an empty field spells out, and the ghost's whole run — `DD.MM.YYYY`. */
  template: string;
  /** The template index each segment starts at; the separators sit between them. */
  starts: readonly [number, number, number];
  /** The template's length in cells — always `2 + 2 + 4` plus two separators. */
  length: number;
}

/* Month and day are always two cells; the year is always four. A locale that asks for a
   two-digit year (`zh-CN` short is `yy-MM-dd`) is widened deliberately: a filter date has
   to name its century, and `26` cannot say whether it means 1926 or 2026. */
const UNIT_WIDTH: Record<DateUnit, number> = { month: 2, day: 2, year: 4 };
const UNIT_PLACEHOLDER: Record<DateUnit, string> = { month: 'MM', day: 'DD', year: 'YYYY' };

/** The date-fns pattern letter that introduces each unit. */
const PATTERN_UNIT: Record<string, DateUnit> = { M: 'month', d: 'day', y: 'year' };

/* How wide a unit's token may be and still be numeric. date-fns spells a textual month
   `MMM`/`MMMM` — same letter, quite another thing — so the width is what tells a numeric
   pattern from one carrying a month name, and only the numeric ones can be masked. */
const MAX_TOKEN_WIDTH: Record<DateUnit, number> = { month: 2, day: 2, year: 4 };

/** The three units a mask holds, in the locale's own order. */
type DateUnitOrder = readonly [DateUnit, DateUnit, DateUnit];

/** Describes one unit as a mask segment. */
function segmentFor(unit: DateUnit): DateMaskSegment {
  return { unit, width: UNIT_WIDTH[unit], placeholder: UNIT_PLACEHOLDER[unit] };
}

/**
 * Builds the derived fields — template, starts, length — for an ordered set of units. Takes
 * the order as a tuple so the segments and starts are built as tuples too, and the mask's
 * fixed-length contract holds without an assertion.
 */
function maskFromUnits(order: DateUnitOrder, separator: string): DateMask {
  const segments: DateMask['segments'] = [
    segmentFor(order[0]),
    segmentFor(order[1]),
    segmentFor(order[2]),
  ];

  const firstStart = 0;
  const secondStart = firstStart + segments[0].width + separator.length;
  const thirdStart = secondStart + segments[1].width + separator.length;

  return {
    segments,
    separator,
    template: segments.map((segment) => segment.placeholder).join(separator),
    starts: [firstStart, secondStart, thirdStart],
    length: thirdStart + segments[2].width,
  };
}

/** `MM/DD/YYYY` — what `en-US` reads, and the fallback for a pattern we cannot make sense of. */
export const DEFAULT_DATE_MASK: DateMask = maskFromUnits(['month', 'day', 'year'], '/');

/**
 * Derives the mask from a date-fns short date pattern — `MM/dd/yyyy`, `dd.MM.y`, `y/MM/dd`,
 * the strings `Locale.formatLong.date({ width: 'short' })` returns.
 *
 * Only the three numeric units in a locale's own order are honoured, with one
 * single-character separator between them. Anything else falls back to
 * {@link DEFAULT_DATE_MASK} rather than rendering a template the caret machinery cannot
 * walk — a textual month (`d MMMM y`), a missing or repeated unit, two different
 * separators, or a pattern carrying literals such as Hungarian's `y. MM. dd.` with its
 * two-character separators and trailing dot. That fallback is deliberate: **no locale the
 * SDK maps to a date-fns locale needs those shapes**, so the mask stays a plain
 * three-segment template rather than growing a literal-aware renderer for a case that
 * cannot arise. A host passing such a locale explicitly reads `MM/DD/YYYY`.
 * @param pattern - A date-fns short date pattern
 * @returns The mask for that pattern, or the `en-US` mask when it is not a plain numeric one
 * @internal
 */
export function dateMaskFromPattern(pattern: string): DateMask {
  const tokens = pattern.match(/[Mdy]+|[^Mdy]+/g);
  if (!tokens || tokens.length !== 5) return DEFAULT_DATE_MASK;

  const unitTokens = [tokens[0], tokens[2], tokens[4]];
  const separators = [tokens[1], tokens[3]];
  const units = unitTokens.map((token) => PATTERN_UNIT[token[0]]);

  /* Narrows the three units to a tuple, which is what `maskFromUnits` takes — so a pattern
     that does not name exactly month, day and year cannot reach it. */
  const asOrder = (candidates: (DateUnit | undefined)[]): DateUnitOrder | null => {
    const [first, second, third] = candidates;
    if (!first || !second || !third) return null;
    return new Set([first, second, third]).size === 3 ? [first, second, third] : null;
  };

  const order = asOrder(units);
  if (!order) return DEFAULT_DATE_MASK;
  // A token wider than its unit allows is textual, not numeric — `MMMM` is a month name.
  if (order.some((unit, index) => unitTokens[index].length > MAX_TOKEN_WIDTH[unit])) {
    return DEFAULT_DATE_MASK;
  }
  /* One separator, the same on both sides: every locale sdk-ui carries is like this, and a
     mask with two different separators has no sensible "next segment" key to type. */
  if (separators[0] !== separators[1] || !/^[^\dMdy]$/.test(separators[0])) {
    return DEFAULT_DATE_MASK;
  }

  return maskFromUnits(order, separators[0]);
}

/** The mask's index for a unit, so a parsed group can be read back by name. */
function unitIndex(mask: DateMask, unit: DateUnit): number {
  return mask.segments.findIndex((segment) => segment.unit === unit);
}

/** Escapes a separator for use inside a regular expression. */
function escaped(separator: string): string {
  return separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * The complete shape for a mask — one or two digits for month and day, four for the year,
 * in the mask's order. Used both to parse and to tell a malformed entry from an impossible
 * one, so the two can never disagree about what "complete" means.
 */
function fullDateShape(mask: DateMask): RegExp {
  const groups = mask.segments.map((segment) =>
    segment.unit === 'year' ? '(\\d{4})' : '(\\d{1,2})',
  );
  return new RegExp(`^${groups.join(escaped(mask.separator))}$`);
}

/**
 * Splits a clean masked value (`09/15/2026`, `09//2026`, `09/1`, ``) into its three digit
 * groups, each already trimmed to its segment's width. Missing groups come back empty.
 * @param mask - The active date mask
 * @param masked - The clean masked value
 * @returns The three digit groups, in the mask's order
 * @internal
 */
export function dateSegments(mask: DateMask, masked: string): [string, string, string] {
  const parts = masked.split(mask.separator);
  return [0, 1, 2].map((index) => (parts[index] ?? '').slice(0, mask.segments[index].width)) as [
    string,
    string,
    string,
  ];
}

/**
 * Builds the clean masked value for a set of segments — `['09','','2026'] → '09//2026'`.
 * Trailing empty groups (and their separators) fall away, so a half-typed value stays short
 * while a cleared middle keeps its place.
 */
function segmentsToMasked(mask: DateMask, segments: readonly string[]): string {
  const parts = [segments[0] ?? '', segments[1] ?? '', segments[2] ?? ''];
  let last = 2;
  while (last >= 0 && parts[last] === '') last -= 1;
  return parts.slice(0, last + 1).join(mask.separator);
}

/**
 * One rendered cell of the template: a typed `digit`, an unfilled `placeholder` letter, or a
 * separator. `filled` is true for a real typed digit (drawn in ink) and false for the grey
 * placeholder letters and the separators that precede an unfilled part.
 * @internal
 */
export interface DateCell {
  text: string;
  kind: 'digit' | 'placeholder' | 'sep';
  filled: boolean;
}

/**
 * Renders the full template against a clean value: every part shows its typed digits
 * followed by the grey placeholder letters it has not filled yet, with the separators
 * between them. Always {@link DateMask.length} cells, so nothing reflows as the value fills.
 * @param mask - The active date mask
 * @param masked - The clean masked value
 * @returns One cell per template position
 * @internal
 */
export function dateTemplateCells(mask: DateMask, masked: string): DateCell[] {
  const segments = dateSegments(mask, masked);
  const cells: DateCell[] = [];
  mask.segments.forEach((segment, index) => {
    if (index > 0) {
      // A separator reads as filled ink once the part before it has a digit.
      cells.push({
        text: mask.separator,
        kind: 'sep',
        filled: segments[index - 1].length > 0,
      });
    }
    const digits = segments[index];
    for (let offset = 0; offset < segment.width; offset += 1) {
      cells.push(
        offset < digits.length
          ? { text: digits[offset], kind: 'digit', filled: true }
          : { text: segment.placeholder[offset], kind: 'placeholder', filled: false },
      );
    }
  });
  return cells;
}

/**
 * Renders the template as a plain string (`09/DD/2026`) — what the input element carries, so
 * its caret lines up cell-for-cell with what the ghost draws.
 * @param mask - The active date mask
 * @param masked - The clean masked value
 * @returns The template string, always {@link DateMask.length} characters
 * @internal
 */
export function dateTemplateString(mask: DateMask, masked: string): string {
  return dateTemplateCells(mask, masked)
    .map((cell) => cell.text)
    .join('');
}

/** The template index just past a segment's last cell — where its separator sits. */
function segmentEnd(mask: DateMask, segment: number): number {
  return mask.starts[segment] + mask.segments[segment].width;
}

/** Whether a template index falls on a separator rather than a digit cell. */
function onSeparator(mask: DateMask, index: number): boolean {
  return index === segmentEnd(mask, 0) || index === segmentEnd(mask, 1);
}

/**
 * Locates the part a caret index sits in, and the offset within that part. A caret on a
 * separator or past the end snaps to the nearest digit cell.
 */
function locateCaret(
  mask: DateMask,
  caret: number,
): { segment: 0 | 1 | 2; offset: number; atEnd: boolean } {
  let index = Math.max(0, Math.min(mask.length, caret));
  if (onSeparator(mask, index)) index += mask.separator.length;
  if (index >= mask.length) {
    return { segment: 2, offset: mask.segments[2].width, atEnd: true };
  }
  if (index < segmentEnd(mask, 0)) return { segment: 0, offset: index, atEnd: false };
  if (index < segmentEnd(mask, 1)) {
    return { segment: 1, offset: index - mask.starts[1], atEnd: false };
  }
  return { segment: 2, offset: index - mask.starts[2], atEnd: false };
}

/**
 * Resolves the caret index just before a part's cell, advancing over the separator into the
 * next part when the offset runs past the part's width, or to the very end after the last.
 */
function caretIndex(mask: DateMask, segment: 0 | 1 | 2, offset: number): number {
  if (offset < mask.segments[segment].width) return mask.starts[segment] + offset;
  return segment < 2 ? mask.starts[segment + 1] : mask.length;
}

/** Removes the digit at a part's offset, shifting the rest of that part left. */
function withoutDigitAt(segments: readonly string[], segment: number, offset: number): string[] {
  const next = [...segments];
  const part = next[segment];
  if (offset < part.length) next[segment] = part.slice(0, offset) + part.slice(offset + 1);
  return next;
}

/**
 * Resolves the caret's home when the field is entered by keyboard: the first cell with no
 * digit yet — where the next keystroke lands — or the very end once the date is full.
 * @param mask - The active date mask
 * @param masked - The clean masked value
 * @returns The caret index for the first unfilled cell
 * @internal
 */
export function firstEmptyCaret(mask: DateMask, masked: string): number {
  const segments = dateSegments(mask, masked);
  for (let index = 0; index < mask.segments.length; index += 1) {
    if (segments[index].length < mask.segments[index].width) {
      return mask.starts[index] + segments[index].length;
    }
  }
  return mask.length;
}

/**
 * Resolves the caret at the start of the part after the one it sits in — where a typed
 * separator jumps, so a single-digit month can be closed and the day begun without the month
 * padding out.
 * @param mask - The active date mask
 * @param caret - The current caret index
 * @returns The caret index at the start of the next part, or the very end
 * @internal
 */
export function nextSegmentCaret(mask: DateMask, caret: number): number {
  if (caret < segmentEnd(mask, 0)) return mask.starts[1];
  if (caret < segmentEnd(mask, 1)) return mask.starts[2];
  return mask.length;
}

/**
 * Types one digit at the caret, over the template mask. The digit lands in the part the
 * caret is in — overwriting the cell it is on, or extending the part — and the caret steps to
 * the next cell, hopping the separator into the next part when a part fills. A digit typed
 * past a full date is ignored.
 * @param mask - The active date mask
 * @param masked - The clean masked value
 * @param caret - The current caret index
 * @param digit - The digit typed
 * @returns The new value and where the caret should sit
 * @internal
 */
export function typeDigitAt(
  mask: DateMask,
  masked: string,
  caret: number,
  digit: string,
): { masked: string; caret: number } {
  const { segment, offset, atEnd } = locateCaret(mask, caret);
  const { width } = mask.segments[segment];
  const segments = dateSegments(mask, masked);
  const part = segments[segment];
  let writeOffset = atEnd ? part.length : offset;
  let nextPart: string;

  if (atEnd && part.length >= width) {
    // A complete date with the caret parked at the end — nothing left to fill.
    return { masked, caret };
  }
  if (writeOffset < part.length) {
    nextPart = part.slice(0, writeOffset) + digit + part.slice(writeOffset + 1);
  } else if (part.length < width) {
    nextPart = (part + digit).slice(0, width);
    writeOffset = nextPart.length - 1;
  } else {
    // The part is full and the caret sits on it — there is nothing past its width.
    return { masked, caret };
  }

  const next = [...segments];
  next[segment] = nextPart;
  return {
    masked: segmentsToMasked(mask, next),
    caret: caretIndex(mask, segment, writeOffset + 1),
  };
}

/**
 * Backspaces over the template mask: clears the digit in the cell before the caret (hopping
 * back over a separator), slides any later digits in that part left, and leaves the caret
 * where that digit was. Emptying a middle part is how `09/15/2026` becomes `09//2026`.
 * @param mask - The active date mask
 * @param masked - The clean masked value
 * @param caret - The current caret index
 * @returns The new value and where the caret should sit
 * @internal
 */
export function backspaceAt(
  mask: DateMask,
  masked: string,
  caret: number,
): { masked: string; caret: number } {
  let index = Math.min(mask.length, caret) - 1;
  while (index >= 0 && onSeparator(mask, index)) index -= 1;
  if (index < 0) return { masked, caret: 0 };
  const { segment, offset } = locateCaret(mask, index);
  return {
    masked: segmentsToMasked(mask, withoutDigitAt(dateSegments(mask, masked), segment, offset)),
    caret: mask.starts[segment] + offset,
  };
}

/**
 * Deletes the digit in the cell at the caret (hopping over a separator), sliding later digits
 * in that part left. The caret stays put.
 * @param mask - The active date mask
 * @param masked - The clean masked value
 * @param caret - The current caret index
 * @returns The new value and where the caret should sit
 * @internal
 */
export function deleteAt(
  mask: DateMask,
  masked: string,
  caret: number,
): { masked: string; caret: number } {
  let index = Math.max(0, caret);
  if (onSeparator(mask, index)) index += mask.separator.length;
  if (index >= mask.length) return { masked, caret };
  const { segment, offset } = locateCaret(mask, index);
  return {
    masked: segmentsToMasked(mask, withoutDigitAt(dateSegments(mask, masked), segment, offset)),
    caret: mask.starts[segment] + offset,
  };
}

/**
 * Formats a date in the mask's own order and separator, zero-padded — the form the mask
 * produces, so a formatted date can be typed back cell for cell.
 * @param mask - The active date mask
 * @param date - The day to format
 * @returns The masked text for that day
 * @internal
 */
export function formatDateInput(mask: DateMask, date: Date): string {
  const parts: Record<DateUnit, string> = {
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
    year: String(date.getFullYear()).padStart(4, '0'),
  };
  return mask.segments.map((segment) => parts[segment.unit]).join(mask.separator);
}

/**
 * Builds a local calendar day from its parts, or returns null when they name no such day —
 * `02/31/2026` and `02/29/2001` among them.
 *
 * The parts are set through `setFullYear` rather than the multi-argument `Date`
 * constructor, which maps years 0–99 onto 1900–1999: `new Date(1, 0, 1)` is 1901, so a
 * four-digit year of `0001` would silently become a different century. Every part is then
 * read back, which is what rejects a rolled-over day.
 * @param year - Full year, as written
 * @param month - Calendar month, 1–12
 * @param day - Day of the month
 * @returns The day, or null when the parts name none
 * @internal
 */
export function asCalendarDay(year: number, month: number, day: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

/**
 * Parses a masked date, or returns null when the text is not a real calendar date in this
 * mask's format. Rejects overflow such as `02/31/2026`, which `new Date` would silently roll
 * forward into March.
 * @param mask - The active date mask
 * @param text - The text to parse
 * @returns The day it names, or null
 * @internal
 */
export function parseDateInput(mask: DateMask, text: string): Date | null {
  const match = fullDateShape(mask).exec(text.trim());
  if (!match) return null;

  const groups = [match[1], match[2], match[3]];
  return asCalendarDay(
    Number(groups[unitIndex(mask, 'year')]),
    Number(groups[unitIndex(mask, 'month')]),
    Number(groups[unitIndex(mask, 'day')]),
  );
}

/** Builds a comparable stamp for a calendar day, with any time-of-day discarded. @internal */
export function dayKey(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Why an entry was rejected. A typed date fails for two quite different reasons and the
 * reader needs to be told which. The line between them is the **shape**, and nothing else:
 *
 * - `malformed` — not the shape of a date at all: incomplete, or the wrong separators or
 *   widths (`1/2/26`, `61/52/026`, `12/01/2`, `09152026`). The answer is to restate the
 *   locale's own form, so that is what the message says — interpolated, never baked in.
 * - `nonexistent` — the shape is right but no such day is on the calendar: `02/31/2026`,
 *   `04/31/2026` (April has 30 days), `02/29/2001` (a non-leap year has no Feb 29), and
 *   equally `33/33/3333`. A reader who typed a well-formed impossible date has already
 *   followed the format, so telling them to follow it is no help — the date is the fault.
 *
 * A day outside the dimension's covered span is deliberately not a fault: the data can be
 * queried past its current edges, so any real calendar day is accepted.
 * @internal
 */
export type DateEntryProblem = 'malformed' | 'nonexistent';

/**
 * The line shown under a field for a rejection: the translation key, and the values that
 * key interpolates.
 * @internal
 */
export interface DateProblemMessage {
  key: string;
  /** Present only for a message that takes a parameter. */
  values?: { format: string };
}

/**
 * Resolves the message for each rejection — one place, so every date field reads the same.
 *
 * `malformed` is **parameterised**, `Follow {{- format}} format`, and takes the reader's own
 * pattern: the pattern belongs to the locale, not to the translation, and a translation with
 * one baked in would be wrong in every locale that does not use it. `nonexistent` names no
 * pattern and so takes no values — which is why they are returned per problem rather than
 * passed to every message alike.
 * @param mask - The active date mask, whose template the format message names
 * @param problem - Why the entry was rejected
 * @returns The translation key and the values it interpolates
 * @internal
 */
export function dateProblemMessage(mask: DateMask, problem: DateEntryProblem): DateProblemMessage {
  return problem === 'malformed'
    ? { key: 'filterWidget.calendar.formatError', values: { format: mask.template } }
    : { key: 'filterWidget.calendar.nonexistent' };
}

/**
 * Classifies typed text. Empty text is not a problem — it means "no filter" — so it returns
 * no date and no complaint.
 *
 * `date` is returned only when the text names a real calendar day; `nonexistent` and
 * `malformed` never parse, so they return no date.
 * @param mask - The active date mask
 * @param text - The text to classify
 * @returns The day it names, and why it was refused when it names none
 * @internal
 */
export function validateDateInput(
  mask: DateMask,
  text: string,
): {
  date: Date | null;
  problem: DateEntryProblem | null;
} {
  const trimmed = text.trim();
  if (trimmed === '') return { date: null, problem: null };

  const date = parseDateInput(mask, trimmed);
  if (date) return { date, problem: null };

  /* The split is on the SHAPE alone: a complete date in this mask's format that names no
     real day is `nonexistent`, however far out of range its numbers are, and only text that
     is not that shape is `malformed`. Telling someone who typed `33/33/3333` to follow the
     format is unhelpful — they did; the date is what is wrong. */
  return {
    date: null,
    problem: fullDateShape(mask).test(trimmed) ? 'nonexistent' : 'malformed',
  };
}
