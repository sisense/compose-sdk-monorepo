/**
 * Date Condition catalogue and Filter ↔ draft mapping for FilterWidget.
 *
 * Operators: Last / This / Next and Before / On or before / After / On or after.
 * No chaining, On, Shift, From–To, or ranking. Last/This/Next publish period JAQL;
 * anchors publish Day-level `{ from }` / `{ to }` (On or before / On or after, inclusive) or
 * `{ fromNotEqual }` / `{ toNotEqual }` (Before / After, exclusive) via `filterFactory.dateBefore`
 * / `dateAfter` — no day-shifting, so the operator round-trips through JAQL unambiguously.
 * @internal
 */
import type { TFunction } from '@sisense/sdk-common';
import {
  type Attribute,
  DateLevels,
  DateOperators,
  DimensionalLevelAttribute,
  type Filter,
  type FilterConfig,
  filterFactory,
  isCustomFilter,
  isDateRangeFilter,
  isLevelAttribute,
  isRelativeDateFilter,
  type LevelAttribute,
} from '@sisense/sdk-data';

import { createLevelAttribute } from '@/shared/utils/create-level-attribute';

import { asCalendarDay, formatDateInput, parseDateInput } from './date-text';
import type { DateMask } from './date-text';

/**
 * Identifies a date condition operator.
 * @internal
 */
export type DateConditionOp =
  | 'last'
  | 'this'
  | 'next'
  | 'before'
  | 'on-before'
  | 'after'
  | 'on-after';

/**
 * Value-field shape for a {@link DateConditionOp}.
 * @internal
 */
export type DateConditionShape = 'relative' | 'current' | 'date';

/**
 * Calendar grains a relative / This condition may count in.
 * @internal
 */
export type DateConditionGrain =
  | typeof DateLevels.Years
  | typeof DateLevels.Quarters
  | typeof DateLevels.Months
  | typeof DateLevels.Weeks
  | typeof DateLevels.Days;

/**
 * Catalogue entry for one date condition operator.
 * @internal
 */
export type DateConditionOperator = {
  id: DateConditionOp;
  labelKey: string;
  shape: DateConditionShape;
};

/**
 * Product order — relative band, then anchor comparisons.
 * @internal
 */
export const DATE_CONDITION_OPERATORS: readonly DateConditionOperator[] = [
  { id: 'last', labelKey: 'filterEditor.relativeTypes.last', shape: 'relative' },
  { id: 'this', labelKey: 'filterEditor.relativeTypes.this', shape: 'current' },
  { id: 'next', labelKey: 'filterEditor.relativeTypes.next', shape: 'relative' },
  { id: 'before', labelKey: 'filterEditor.datetimePositions.before', shape: 'date' },
  { id: 'on-before', labelKey: 'filterWidget.dateCondition.onOrBefore', shape: 'date' },
  { id: 'after', labelKey: 'filterEditor.datetimePositions.after', shape: 'date' },
  { id: 'on-after', labelKey: 'filterWidget.dateCondition.onOrAfter', shape: 'date' },
] as const;

/**
 * Lists calendar grains a Last / This / Next condition may count in.
 * @internal
 */
export const DATE_CONDITION_GRAINS: readonly DateConditionGrain[] = [
  DateLevels.Years,
  DateLevels.Quarters,
  DateLevels.Months,
  DateLevels.Weeks,
  DateLevels.Days,
];

const GRAIN_SET = new Set<string>(DATE_CONDITION_GRAINS);

/**
 * I18n keys under `filterEditor.datetimeLevels.*`. One base key per grain — callers pass
 * `{ count }` and i18next resolves the CLDR plural form (`_one` / `_few` / `_many` / `_other`)
 * from the locale's own resource file, e.g. Russian's `день` / `дня` / `дней`. The bare
 * (unsuffixed) key stays the plain singular for the level-selector's non-counted usage.
 * @internal
 */
export const DATE_CONDITION_GRAIN_LABEL_KEYS: Record<DateConditionGrain, string> = {
  [DateLevels.Years]: 'filterEditor.datetimeLevels.year',
  [DateLevels.Quarters]: 'filterEditor.datetimeLevels.quarter',
  [DateLevels.Months]: 'filterEditor.datetimeLevels.month',
  [DateLevels.Weeks]: 'filterEditor.datetimeLevels.week',
  [DateLevels.Days]: 'filterEditor.datetimeLevels.day',
};

/**
 * In-memory edit state for a date Condition filter before Apply publishes it.
 *
 * `connector` / `extra` exist so the condition-filter panel hook can drive the chrome;
 * date conditions never chain.
 * @internal
 */
export type DateConditionDraft = {
  op: DateConditionOp;
  /** Last / Next count as typed text — integers ≥ 1 when complete. */
  count: string;
  /** `undefined` only when every catalogue grain is excluded (a defensive case). */
  grain?: DateConditionGrain;
  includingCurrent: boolean;
  /** Anchor date as masked text in the reader's format. */
  anchor: string;
  connector: 'AND';
  extra: readonly { id: string; op: DateConditionOp }[];
};

/**
 * First calendar grain not claimed by another filter on the same dim.
 * `undefined` when every grain is busy — a defensive host/API case; do not
 * invent Years, since Years being taken is exactly why this returns nothing.
 * @param excludedDateLevels - Grains already claimed by another filter on the same dimension.
 * @returns The first free grain, or `undefined` when every grain is claimed.
 * @internal
 */
export function firstAvailableDateConditionGrain(
  excludedDateLevels?: readonly string[],
): DateConditionGrain | undefined {
  const excluded = new Set(excludedDateLevels ?? []);
  return DATE_CONDITION_GRAINS.find((grain) => !excluded.has(grain));
}

/**
 * Creates the default date condition draft: Last 1 of the first free grain,
 * including current off. Pass `excludedDateLevels` so a fresh Condition does not
 * open on a level List/Calendar already owns.
 * @param excludedDateLevels - Grains already claimed by another filter on the same dimension.
 * @returns The fresh draft.
 * @internal
 */
export function defaultDateConditionDraft(
  excludedDateLevels?: readonly string[],
): DateConditionDraft {
  return {
    op: 'last',
    count: '1',
    grain: firstAvailableDateConditionGrain(excludedDateLevels),
    includingCurrent: false,
    anchor: '',
    connector: 'AND',
    extra: [],
  };
}

function cloneDateConditionDraft(draft: DateConditionDraft): DateConditionDraft {
  return { ...draft, extra: [...draft.extra] };
}

const INCOMPLETE_DRAFT_STORAGE_PREFIX = 'csdk.filterWidget.dateCondition.incomplete:';

const DATE_CONDITION_OP_IDS = new Set<string>(DATE_CONDITION_OPERATORS.map((entry) => entry.id));

/**
 * Survives FilterWidget remount and same-tab refresh after empty-anchor Apply
 * (`onFilterUpdate(null)`). `key` is opaque here — the caller (`condition-filter-date.tsx`)
 * composes attribute expression + linked-filter guid, so two widgets on the same date
 * attribute don't share a draft. SessionStorage (not memory) so a browser refresh or a
 * trip to the widget editor keeps Before without a date, rather than resetting to Last 1 Year.
 * @param key - Opaque draft key; see {@link rememberIncompleteDateDraft}.
 * @returns The sessionStorage key that key maps to.
 */
function incompleteDateDraftStorageKey(key: string): string {
  return `${INCOMPLETE_DRAFT_STORAGE_PREFIX}${key}`;
}

function isStoredDateConditionDraft(value: unknown): value is DateConditionDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.op === 'string' &&
    DATE_CONDITION_OP_IDS.has(draft.op) &&
    typeof draft.count === 'string' &&
    (draft.grain === undefined ||
      (typeof draft.grain === 'string' && GRAIN_SET.has(draft.grain))) &&
    typeof draft.includingCurrent === 'boolean' &&
    typeof draft.anchor === 'string' &&
    draft.connector === 'AND' &&
    Array.isArray(draft.extra)
  );
}

function readSessionStorage(expression: string): DateConditionDraft | undefined {
  try {
    if (typeof sessionStorage === 'undefined') return undefined;
    const raw = sessionStorage.getItem(incompleteDateDraftStorageKey(expression));
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    return isStoredDateConditionDraft(parsed) ? cloneDateConditionDraft(parsed) : undefined;
  } catch {
    return undefined;
  }
}

function writeSessionStorage(expression: string, draft: DateConditionDraft): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(
      incompleteDateDraftStorageKey(expression),
      JSON.stringify(cloneDateConditionDraft(draft)),
    );
  } catch {
    /* Private mode / quota — in-memory Map below still covers remount in-session. */
  }
}

function removeSessionStorage(expression: string): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(incompleteDateDraftStorageKey(expression));
  } catch {
    /* ignore */
  }
}

function clearSessionStorageDrafts(): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    const keys: string[] = [];
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(INCOMPLETE_DRAFT_STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    /* ignore */
  }
}

/** In-memory mirror so remount works even when sessionStorage is unavailable. */
const incompleteDateDraftByExpression = new Map<string, DateConditionDraft>();

/**
 * Stores an unfinished date-condition draft.
 * @param expression - Opaque draft key; the caller (`condition-filter-date.tsx`) composes
 * attribute expression + linked-filter guid so widgets on the same dim don't collide.
 * @param draft - The unfinished draft to remember.
 * @internal
 */
export function rememberIncompleteDateDraft(expression: string, draft: DateConditionDraft): void {
  const next = cloneDateConditionDraft(draft);
  incompleteDateDraftByExpression.set(expression, next);
  writeSessionStorage(expression, next);
}

/**
 * Reads the unfinished date-condition draft for the given key (see `rememberIncompleteDateDraft`).
 * @param expression - Opaque draft key; see {@link rememberIncompleteDateDraft}.
 * @returns The remembered draft, or `undefined` if none is stored.
 * @internal
 */
export function readIncompleteDateDraft(expression: string): DateConditionDraft | undefined {
  const memory = incompleteDateDraftByExpression.get(expression);
  if (memory) return cloneDateConditionDraft(memory);
  const stored = readSessionStorage(expression);
  if (stored) {
    incompleteDateDraftByExpression.set(expression, stored);
    return cloneDateConditionDraft(stored);
  }
  return undefined;
}

/**
 * Drops the unfinished date-condition draft for the given key (see `rememberIncompleteDateDraft`).
 * @param expression - Opaque draft key; see {@link rememberIncompleteDateDraft}.
 * @internal
 */
export function forgetIncompleteDateDraft(expression: string): void {
  incompleteDateDraftByExpression.delete(expression);
  removeSessionStorage(expression);
}

/**
 * Clears every stored unfinished date-condition draft.
 * @internal
 */
export function forgetAllIncompleteDateDrafts(): void {
  incompleteDateDraftByExpression.clear();
  clearSessionStorageDrafts();
}

/**
 * Resolves the catalogue entry for an operator id.
 * @param op - The operator id to resolve.
 * @returns Its catalogue entry.
 * @internal
 */
export function dateOperatorOf(op: DateConditionOp): DateConditionOperator {
  return DATE_CONDITION_OPERATORS.find((entry) => entry.id === op) ?? DATE_CONDITION_OPERATORS[0];
}

/**
 * Parses a Last / Next count as a whole integer ≥ 1.
 * Empty, 0, negative, and fractional counts are incomplete.
 * @param value - The typed count text.
 * @returns The parsed integer, or `null` if incomplete.
 * @internal
 */
export function parseDateConditionCount(value: string): number | null {
  const trimmed = value.trim();
  if (!/^[1-9]\d*$/.test(trimmed)) return null;
  const count = Number(trimmed);
  return Number.isSafeInteger(count) ? count : null;
}

/**
 * Checks whether `value` is a {@link DateConditionGrain}.
 * @param value - The candidate grain string, if any.
 * @returns Whether it is a recognised grain.
 * @internal
 */
export function isDateConditionGrain(value: string | undefined): value is DateConditionGrain {
  return value !== undefined && GRAIN_SET.has(value);
}

/**
 * Checks whether the whole filter is ready to publish.
 * @param draft - The draft to check.
 * @returns Whether every field the current operator needs is filled in.
 * @internal
 */
export function isDateConditionComplete(draft: DateConditionDraft): boolean {
  const shape = dateOperatorOf(draft.op).shape;
  if (shape === 'current') return isDateConditionGrain(draft.grain);
  if (shape === 'relative') {
    return parseDateConditionCount(draft.count) !== null && isDateConditionGrain(draft.grain);
  }
  return draft.anchor.trim() !== '';
}

/**
 * Canonical `yyyy-MM-dd` for a local calendar day — the JAQL wire format.
 * @param date - The local calendar day to format.
 * @returns Its canonical `yyyy-MM-dd` string.
 * @internal
 */
export function canonicalDay(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Reads a JAQL / DateRange day (`yyyy-MM-DD` or with a clock) as a local calendar day.
 * @param value - The stored JAQL date string, if any.
 * @returns The local calendar day, or `null` if unparseable.
 * @internal
 */
export function parseCanonicalDay(value: string | undefined | null): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  return asCalendarDay(Number(match[1]), Number(match[2]), Number(match[3]));
}

type RangeGrain = 'Year' | 'Quarter' | 'Month' | 'Week' | 'Day';

const LEVEL_TO_RANGE_GRAIN: Record<DateConditionGrain, RangeGrain> = {
  [DateLevels.Years]: 'Year',
  [DateLevels.Quarters]: 'Quarter',
  [DateLevels.Months]: 'Month',
  [DateLevels.Weeks]: 'Week',
  [DateLevels.Days]: 'Day',
};

function startOfGrain(date: Date, grain: RangeGrain, weekStartsOn: 0 | 1 = 0): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  switch (grain) {
    case 'Day':
      return new Date(year, month, date.getDate());
    case 'Week': {
      const day = new Date(year, month, date.getDate());
      const back = (day.getDay() - weekStartsOn + 7) % 7;
      day.setDate(day.getDate() - back);
      return day;
    }
    case 'Month':
      return new Date(year, month, 1);
    case 'Quarter':
      return new Date(year, month - (month % 3), 1);
    case 'Year':
      return new Date(year, 0, 1);
  }
}

function addGrains(start: Date, grain: RangeGrain, n: number): Date {
  const year = start.getFullYear();
  const month = start.getMonth();
  const day = start.getDate();
  switch (grain) {
    case 'Day':
      return new Date(year, month, day + n);
    case 'Week':
      return new Date(year, month, day + n * 7);
    case 'Month':
      return new Date(year, month + n, 1);
    case 'Quarter':
      return new Date(year, month + n * 3, 1);
    case 'Year':
      return new Date(year + n, 0, 1);
  }
}

/**
 * An inclusive civil-day window — a resolved Last/This/Next span.
 * @internal
 */
type DateConditionWindow = { start: Date; end: Date };

/**
 * Inclusive civil-day window a Last / This / Next condition names from `today`.
 * Including current shifts Last/Next even when count is 1 (unlike the prototype's
 * preset-row rule 3).
 * @param op - Which of the three relative operators.
 * @param count - How many grains back/forward; ignored for `this`.
 * @param grain - The calendar grain to count in.
 * @param includingCurrent - Whether the current, not-yet-complete grain counts too.
 * @param today - The clock to resolve the window against.
 * @param weekStartsOn - First day of the week, `0` (Sunday) or `1` (Monday); only matters
 * for the Week grain.
 * @returns The inclusive start/end of the named window.
 * @internal
 */
export function resolveDateConditionRange(
  op: Extract<DateConditionOp, 'last' | 'this' | 'next'>,
  count: number,
  grain: DateConditionGrain,
  includingCurrent: boolean,
  today: Date,
  weekStartsOn: 0 | 1 = 0,
): DateConditionWindow {
  const rangeGrain = LEVEL_TO_RANGE_GRAIN[grain];
  const current = startOfGrain(today, rangeGrain, weekStartsOn);
  const n = op === 'this' ? 1 : Math.max(1, Math.floor(count) || 1);
  const withCurrent = op !== 'this' && includingCurrent;
  let first: Date;
  switch (op) {
    case 'this':
      first = current;
      break;
    case 'last':
      first = addGrains(current, rangeGrain, withCurrent ? -(n - 1) : -n);
      break;
    case 'next':
      first = addGrains(current, rangeGrain, withCurrent ? 0 : 1);
      break;
  }
  const endExclusive = addGrains(first, rangeGrain, n);
  const end = new Date(
    endExclusive.getFullYear(),
    endExclusive.getMonth(),
    endExclusive.getDate() - 1,
  );
  return { start: first, end };
}

/**
 * Formats a range as `09/01/2026 – 12/31/2026` (or one day once) in the reader's mask.
 * @param range - The inclusive start/end to format.
 * @param mask - The reader's date format.
 * @returns The formatted range.
 * @internal
 */
export function formatDateConditionRange(range: DateConditionWindow, mask: DateMask): string {
  const start = formatDateInput(mask, range.start);
  const end = formatDateInput(mask, range.end);
  return start === end ? start : `${start} – ${end}`;
}

function triggerOperatorLabel(
  op: DateConditionOp,
  labelOf: (op: DateConditionOp) => string,
): string {
  return labelOf(op);
}

/**
 * Legacy concatenation, used only when no `t` is passed (see `summariseDateCondition`).
 * @param name - The operator's already-resolved label.
 * @param shape - Which value-field shape the operator uses.
 * @param draft - The draft, for its anchor text when `shape` is `date`.
 * @param count - The already-parsed Last/Next count; ignored for other shapes.
 * @param grain - The grain's already-resolved label.
 * @returns The concatenated sentence.
 */
function summariseByConcatenation(
  name: string,
  shape: 'current' | 'relative' | 'date',
  draft: DateConditionDraft,
  count: number,
  grain: string,
): string {
  if (shape === 'current') return `${name} ${grain}`;
  if (shape === 'relative') return `${name} ${count} ${grain}`;
  return `${name} ${draft.anchor.trim()}`;
}

/**
 * Closed-trigger sentence. Incomplete drafts return `undefined` (`Set filter`).
 * After Apply: `Last 1 Year`, `Last 3 Days including current`, `Before 09/11/2026`.
 *
 * @remarks
 * Building this by concatenating separately-translated words (operator, count, grain) gets
 * the word order wrong in most locales and can't carry a locale's own plural forms (Russian
 * `день`/`дня`/`дней`). One `t()` call per shape — `filterWidget.dateCondition.summary.{shape}`
 * — lets each locale's resource file own both the word order and, via `{ count }`, the CLDR
 * plural form i18next resolves for `filterEditor.datetimeLevels.*`. `t` is optional so the
 * function still works (in English word order) where no translator is wired up, e.g. tests.
 * The relative shape with Including current on uses its own
 * `summary.relativeIncludingCurrent` template rather than gluing `includingCurrentLabel` onto
 * `summary.relative` — some locales place it before the count/grain, not after, and Russian's
 * template sidesteps the adjective/noun gender agreement `включая текущий` can't carry.
 * @param draft - The draft to summarise.
 * @param labelOf - Resolves an operator id to its already-translated label.
 * @param grainLabelOf - Resolves a grain (and count, for plural forms) to its already-translated
 * label.
 * @param includingCurrentLabel - Already-translated "including current" suffix.
 * @param t - Optional translator; omit for the English-word-order fallback (tests).
 * @returns The closed-trigger sentence, or `undefined` while the draft is incomplete.
 * @internal
 */
export function summariseDateCondition(
  draft: DateConditionDraft,
  labelOf: (op: DateConditionOp) => string,
  grainLabelOf: (grain: DateConditionGrain, count: number) => string,
  includingCurrentLabel: string,
  t?: TFunction,
): string | undefined {
  if (!isDateConditionComplete(draft)) return undefined;
  const name = triggerOperatorLabel(draft.op, labelOf);
  const shape = dateOperatorOf(draft.op).shape;
  // isDateConditionComplete already required a real grain for these two shapes.
  if (shape === 'current') {
    const grain = grainLabelOf(draft.grain as DateConditionGrain, 1);
    return t
      ? t('filterWidget.dateCondition.summary.current', { operator: name, grain })
      : summariseByConcatenation(name, shape, draft, 1, grain);
  }
  if (shape === 'relative') {
    const count = parseDateConditionCount(draft.count);
    if (count === null) return undefined;
    const grain = grainLabelOf(draft.grain as DateConditionGrain, count);
    if (draft.includingCurrent) {
      return t
        ? t('filterWidget.dateCondition.summary.relativeIncludingCurrent', {
            operator: name,
            count,
            grain,
            includingCurrent: includingCurrentLabel,
          })
        : `${summariseByConcatenation(name, shape, draft, count, grain)} ${includingCurrentLabel}`;
    }
    return t
      ? t('filterWidget.dateCondition.summary.relative', { operator: name, count, grain })
      : summariseByConcatenation(name, shape, draft, count, grain);
  }
  const date = draft.anchor.trim();
  return t
    ? t('filterWidget.dateCondition.summary.date', { operator: name, date })
    : summariseByConcatenation(name, shape, draft, 0, '');
}

/**
 * Builds open-panel trigger wording — unfinished anchors still name the operator.
 * @param draft - The draft to summarise.
 * @param labelOf - Resolves an operator id to its already-translated label.
 * @param grainLabelOf - Resolves a grain (and count, for plural forms) to its already-translated
 * label.
 * @param includingCurrentLabel - Already-translated "including current" suffix.
 * @param t - Optional translator; omit for the English-word-order fallback (tests).
 * @returns The trigger wording, complete or not.
 * @internal
 */
export function summariseDateConditionDraft(
  draft: DateConditionDraft,
  labelOf: (op: DateConditionOp) => string,
  grainLabelOf: (grain: DateConditionGrain, count: number) => string,
  includingCurrentLabel: string,
  t?: TFunction,
): string | undefined {
  const complete = summariseDateCondition(draft, labelOf, grainLabelOf, includingCurrentLabel, t);
  if (complete) return complete;
  return triggerOperatorLabel(draft.op, labelOf);
}

/**
 * Closed-trigger hover: the resolved range only (relative) or the operator sentence (anchor).
 * Incomplete drafts return `[]`.
 * @param draft - The draft to describe.
 * @param mask - The reader's date format.
 * @param today - The clock to resolve a relative range against.
 * @param labelOf - Resolves an operator id to its already-translated label.
 * @param grainLabelOf - Resolves a grain (and count, for plural forms) to its already-translated
 * label.
 * @param includingCurrentLabel - Already-translated "including current" suffix.
 * @param t - Optional translator; omit for the English-word-order fallback (tests).
 * @returns The hover lines, or `[]` while the draft is incomplete.
 * @internal
 */
export function describeDateCondition(
  draft: DateConditionDraft,
  mask: DateMask,
  today: Date,
  labelOf: (op: DateConditionOp) => string,
  grainLabelOf: (grain: DateConditionGrain, count: number) => string,
  includingCurrentLabel: string,
  t?: TFunction,
): readonly string[] {
  if (!isDateConditionComplete(draft)) return [];
  const shape = dateOperatorOf(draft.op).shape;
  if (shape === 'relative' || shape === 'current') {
    const count = shape === 'current' ? 1 : parseDateConditionCount(draft.count);
    if (count === null) return [];
    const op = draft.op as Extract<DateConditionOp, 'last' | 'this' | 'next'>;
    // isDateConditionComplete already required a real grain for these two shapes.
    const range = resolveDateConditionRange(
      op,
      count,
      draft.grain as DateConditionGrain,
      shape === 'current' ? false : draft.includingCurrent,
      today,
    );
    return [formatDateConditionRange(range, mask)];
  }
  const sentence = summariseDateCondition(draft, labelOf, grainLabelOf, includingCurrentLabel, t);
  return sentence ? [sentence] : [];
}

/**
 * Builds a Days/Months/… level attribute off a plain or already-leveled attribute, named
 * like List/Calendar (`t` present) so a host syncing its filter-panel tile from the JAQL
 * title never sees the bare column name. Exported for `range-date.ts` — Range's anchors are
 * always at Days, the same construction date Condition's own anchors already use.
 * @param attribute - The plain or already-leveled attribute to re-level.
 * @param grain - The calendar grain to level at.
 * @param t - Optional translator for the level's display name.
 * @returns The attribute at `grain`.
 * @internal
 */
export function levelAttributeAt(
  attribute: Attribute,
  grain: DateConditionGrain,
  t?: TFunction,
): LevelAttribute {
  if (attribute instanceof DimensionalLevelAttribute) {
    return createLevelAttribute(attribute, grain, t);
  }
  if (isLevelAttribute(attribute)) {
    /* `setGranularity` keeps the previous level's name — the filter-panel tile then
       stays on "Years in Date" after Apply of Months, or collapses to the bare column
       when createLevelAttribute ran without `t`. Always re-name like List/Calendar. */
    return createLevelAttribute(
      new DimensionalLevelAttribute(attribute.name, attribute.expression, attribute.granularity),
      grain,
      t,
    );
  }
  throw new Error('Date condition requires a datetime level attribute');
}

function thisPeriodJaql(count: number, offset: number) {
  return {
    last: { count, offset },
    isNotCurrentPeriod: false,
  };
}

function isThisPeriodCustomFilter(filter: Filter): boolean {
  if (!isCustomFilter(filter)) return false;
  const jaql = filter.jaqlExpression as {
    last?: { count?: number; offset?: number };
    isNotCurrentPeriod?: boolean;
  };
  return jaql?.last?.count === 1 && jaql?.last?.offset === 0 && jaql?.isNotCurrentPeriod === false;
}

/**
 * Builds a RelativeDateFilter, DateRangeFilter, or This-period CustomFilter.
 * Callers pass the widget attribute; grain / Day re-level happens here.
 * Pass `t` so the published attribute is named like List (`Months in Date`), not the
 * bare column (`Date`) — hosts sync the filter-panel tile title from that name.
 * @param attribute - The widget's attribute, at whatever level it was given.
 * @param draft - The complete draft to publish (see {@link isDateConditionComplete}).
 * @param mask - The reader's date format, for parsing an anchor operator's typed text.
 * @param config - Forwarded to the built filter unchanged.
 * @param t - Optional translator for the published attribute's display name.
 * @returns The built filter.
 * @internal
 */
export function dateConditionToFilter(
  attribute: Attribute,
  draft: DateConditionDraft,
  mask: DateMask,
  config?: FilterConfig,
  t?: TFunction,
): Filter {
  const shape = dateOperatorOf(draft.op).shape;
  // Callers only reach here with a complete draft (isDateConditionComplete already ran),
  // which requires a real grain for these two shapes.
  if (shape === 'current') {
    const level = levelAttributeAt(attribute, draft.grain as DateConditionGrain, t);
    return filterFactory.customFilter(level, thisPeriodJaql(1, 0), config);
  }
  if (shape === 'relative') {
    const count = parseDateConditionCount(draft.count) ?? 1;
    const offset = draft.includingCurrent ? 0 : 1;
    const level = levelAttributeAt(attribute, draft.grain as DateConditionGrain, t);
    return draft.op === 'next'
      ? filterFactory.dateRelativeFrom(level, offset, count, undefined, config)
      : filterFactory.dateRelativeTo(level, offset, count, undefined, config);
  }

  const parsed = parseDateInput(mask, draft.anchor);
  const day = parsed ?? new Date(0);
  const canonical = canonicalDay(day);
  const days = levelAttributeAt(attribute, DateLevels.Days, t);
  if (draft.op === 'before') {
    return filterFactory.dateBefore(days, canonical, config);
  }
  if (draft.op === 'on-before') {
    return filterFactory.dateTo(days, canonical, config);
  }
  if (draft.op === 'after') {
    return filterFactory.dateAfter(days, canonical, config);
  }
  return filterFactory.dateFrom(days, canonical, config);
}

function grainFromAttribute(attribute: Attribute): DateConditionGrain {
  if (isLevelAttribute(attribute) && isDateConditionGrain(attribute.granularity)) {
    return attribute.granularity;
  }
  return DateLevels.Years;
}

/**
 * Reads a RelativeDateFilter, DateRangeFilter (from XOR to), or This CustomFilter.
 * Unsupported filters yield the default Last 1 Year draft.
 * @param filter - The linked filter, if any.
 * @param mask - The reader's date format, for formatting an anchor into masked text.
 * @returns The filter read as a draft, or the default draft if unsupported.
 * @internal
 */
export function filterToDateConditionDraft(
  filter: Filter | null | undefined,
  mask: DateMask,
): DateConditionDraft {
  if (!filter || !isEditableDateConditionFilter(filter)) {
    return defaultDateConditionDraft();
  }

  if (isThisPeriodCustomFilter(filter)) {
    return {
      ...defaultDateConditionDraft(),
      op: 'this',
      grain: grainFromAttribute(filter.attribute),
    };
  }

  if (isRelativeDateFilter(filter)) {
    const includingCurrent = filter.offset === 0;
    return {
      ...defaultDateConditionDraft(),
      op: filter.operator === DateOperators.Next ? 'next' : 'last',
      count: String(filter.count),
      grain: grainFromAttribute(filter.attribute),
      includingCurrent,
    };
  }

  if (isDateRangeFilter(filter)) {
    const from = parseCanonicalDay(filter.from);
    const to = parseCanonicalDay(filter.to);
    if (from && !filter.to) {
      return {
        ...defaultDateConditionDraft(),
        op: filter.operatorA === DateOperators.FromNotEqual ? 'after' : 'on-after',
        anchor: formatDateInput(mask, from),
      };
    }
    if (to && !filter.from) {
      return {
        ...defaultDateConditionDraft(),
        op: filter.operatorB === DateOperators.ToNotEqual ? 'before' : 'on-before',
        anchor: formatDateInput(mask, to),
      };
    }
  }

  return defaultDateConditionDraft();
}

function isEditableRelative(filter: Filter): boolean {
  if (!isRelativeDateFilter(filter)) return false;
  if (filter.operator !== DateOperators.Last && filter.operator !== DateOperators.Next) {
    return false;
  }
  if (!Number.isInteger(filter.count) || filter.count < 1) return false;
  if (filter.offset !== 0 && filter.offset !== 1) return false;
  return isDateConditionGrain(
    isLevelAttribute(filter.attribute) ? filter.attribute.granularity : undefined,
  );
}

function isEditableAnchor(filter: Filter): boolean {
  if (!isDateRangeFilter(filter)) return false;
  const hasFrom = Boolean(filter.from);
  const hasTo = Boolean(filter.to);
  if (hasFrom === hasTo) return false;
  return parseCanonicalDay(hasFrom ? filter.from : filter.to) !== null;
}

/**
 * Checks whether the linked filter is a date condition this control can edit.
 * @param filter - The candidate filter, if any.
 * @returns Whether date Condition can read and edit this filter.
 * @internal
 */
export function isEditableDateConditionFilter(filter: Filter | null | undefined): filter is Filter {
  if (!filter) return false;
  return isThisPeriodCustomFilter(filter) || isEditableRelative(filter) || isEditableAnchor(filter);
}
