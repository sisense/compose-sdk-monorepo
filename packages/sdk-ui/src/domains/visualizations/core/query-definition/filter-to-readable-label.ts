import type { TFunction } from '@sisense/sdk-common';
import { DateLevels, type Filter } from '@sisense/sdk-data';

import { formatDate, getDefaultDateFormat } from '@/infra/formatting/format-date.js';
import { i18nextInstance } from '@/infra/translation/initialize-i18n';

import { formatChipLabel } from './format-chip-label';

/**
 * Separator between the chip label and the chip value.
 * @internal
 */
export const FILTER_CHIP_SEPARATOR = ': ';

/**
 * Minimal structural view of concrete filter subclasses. Only the fields read here are
 * declared optional to stay decoupled from the (mostly `@internal`) class hierarchy.
 * @internal
 */
type FilterView = Filter & {
  config?: { excludeMembers?: boolean };
  members?: string[];
  operatorA?: string;
  operatorB?: string;
  valueA?: unknown;
  valueB?: unknown;
  measure?: { name?: string };
  operator?: string;
  count?: number;
  offset?: number;
  anchor?: Date | string;
  not?: boolean;
  filter?: FilterView;
  filters?: FilterView[];
  _filters?: FilterView[];
  from?: Date | string;
  to?: Date | string;
  attribute: Filter['attribute'] & { granularity?: string };
};

const TEXT_OP_KEYS = new Map<string, string>([
  ['contains', 'queryDefinition.filterPill.text.contains'],
  ['startsWith', 'queryDefinition.filterPill.text.startsWith'],
  ['endsWith', 'queryDefinition.filterPill.text.endsWith'],
  ['doesntEqual', 'queryDefinition.filterPill.text.doesntEqual'],
  ['doesntStartWith', 'queryDefinition.filterPill.text.doesntStartWith'],
  ['doesntContain', 'queryDefinition.filterPill.text.doesntContain'],
  ['doesntEndWith', 'queryDefinition.filterPill.text.doesntEndWith'],
  ['like', 'queryDefinition.filterPill.text.like'],
]);

/** Text operator whose chip shows the bare value, matching a selected-member chip. */
const TEXT_EQUALS_OP = 'equals';

const NUMERIC_OP_SYMBOLS = new Map<string, string>([
  ['equals', '='],
  ['doesntEqual', '!='],
  ['from', '>='],
  ['fromNotEqual', '>'],
  ['to', '<='],
  ['toNotEqual', '<'],
]);

type DateUnit = 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute';

const DATE_LEVEL_UNITS = new Map<string, DateUnit>([
  ['Years', 'year'],
  ['Quarters', 'quarter'],
  ['Months', 'month'],
  ['Weeks', 'week'],
  ['WeekOfYear', 'week'],
  ['Days', 'day'],
  ['Hours', 'hour'],
  ['AggHours', 'hour'],
  ['Minutes', 'minute'],
  ['MinutesRoundTo30', 'minute'],
  ['MinutesRoundTo15', 'minute'],
  ['AggMinutesRoundTo30', 'minute'],
  ['AggMinutesRoundTo15', 'minute'],
  ['AggMinutesRoundTo1', 'minute'],
]);

const CURRENT_PERIOD_KEYS = new Map<DateUnit, string>([
  ['day', 'queryDefinition.filterPill.relative.today'],
  ['week', 'queryDefinition.filterPill.relative.thisWeek'],
  ['month', 'queryDefinition.filterPill.relative.thisMonth'],
  ['quarter', 'queryDefinition.filterPill.relative.thisQuarter'],
  ['year', 'queryDefinition.filterPill.relative.thisYear'],
]);

const FILTER_TYPE_MEASURE = 'measure';
const FILTER_TYPE_MEASURE_RANKING = 'measure-ranking';
const MAX_INLINE_VALUES = 3;

/**
 * Translates a pill phrase. Values are interpolated unescaped: the pill renders them as
 * React text, and escaping here would show `&quot;` for a quoted filter value.
 * @param t - Translate function.
 * @param key - Key under `queryDefinition.filterPill`.
 * @param options - Interpolation values.
 * @returns The translated phrase.
 */
function phrase(t: TFunction, key: string, options: Record<string, unknown> = {}): string {
  return t(key, { ...options, interpolation: { escapeValue: false } });
}

function resolveAttributeName(filter: Filter, attributeName?: string): string {
  if (attributeName !== undefined) {
    return attributeName;
  }
  return filter.attribute ? formatChipLabel(filter.attribute) : '';
}

function asChip(name: string, value: string | undefined): string {
  if (!value) {
    return '';
  }
  return name ? `${name}${FILTER_CHIP_SEPARATOR}${value}` : value;
}

function customChip(t: TFunction, name: string): string {
  return asChip(name, phrase(t, 'queryDefinition.filterPill.customFilter'));
}

function composeFilterLabel(t: TFunction, filter: Filter, attributeName?: string): string {
  const view = filter as FilterView;
  const name = resolveChipName(view, attributeName);

  switch (view.filterType) {
    case 'members':
      return asChip(
        name,
        formatMembersValue(
          t,
          view.members ?? [],
          view.config?.excludeMembers === true,
          view.attribute?.granularity,
        ),
      );
    case 'exclude':
      return asChip(name, formatExcludeValue(t, view));
    case 'text':
      return asChip(name, formatTextValue(t, view));
    case 'numeric':
      return asChip(name, formatNumericValue(t, view));
    case 'dateRange':
      return asChip(name, formatDateRangeValue(t, view));
    case 'relativeDate':
      return asChip(name, formatRelativeDateValue(t, view));
    case 'ranking':
      return asChip(name, formatRankingValue(t, view));
    case FILTER_TYPE_MEASURE_RANKING:
      return asChip(name, formatRankingValue(t, view));
    case FILTER_TYPE_MEASURE:
      return asChip(name, formatNumericValue(t, view));
    case 'logicalAttribute':
      return asChip(name, formatLogicalAttributeValue(t, view));
    case 'cascading':
      return asChip(name, formatCascadingValue(t, view));
    case 'empty':
      return asChip(
        name,
        phrase(
          t,
          view.not === true
            ? 'queryDefinition.filterPill.notEmpty'
            : 'queryDefinition.filterPill.empty',
        ),
      );
    case 'advanced':
      return customChip(t, name);
    default:
      return customChip(t, name);
  }
}

function resolveChipName(view: FilterView, attributeName?: string): string {
  if (view.filterType === FILTER_TYPE_MEASURE || view.filterType === FILTER_TYPE_MEASURE_RANKING) {
    return view.measure ? formatChipLabel(view.measure) : resolveAttributeName(view, attributeName);
  }
  if (view.filterType === 'exclude') {
    const inner = view.filter;
    if (inner) {
      return resolveChipName(inner, attributeName);
    }
  }
  if (view.filterType === 'cascading') {
    const levels = view.filters ?? view._filters ?? [];
    const leaf = levels[levels.length - 1];
    if (leaf) {
      return resolveAttributeName(leaf);
    }
  }
  return resolveAttributeName(view, attributeName);
}

function negate(t: TFunction, value: string): string {
  return phrase(t, 'queryDefinition.filterPill.not', { value });
}

const JOINER_KEYS = {
  and: 'queryDefinition.filterPill.and',
  or: 'queryDefinition.filterPill.or',
} as const;

function joinWith(t: TFunction, joiner: keyof typeof JOINER_KEYS, values: string[]): string {
  const word = phrase(t, JOINER_KEYS[joiner]);
  return values.join(` ${word} `);
}

function formatMembersValue(
  t: TFunction,
  members: string[],
  excludeMembers = false,
  granularity?: string,
): string | undefined {
  if (members.length === 0) {
    return undefined;
  }
  const includeCalendarDay = shouldIncludeCalendarDay(members, granularity);
  const list = formatValuesList(
    t,
    members.map((member) => formatChipDate(member, granularity, includeCalendarDay)),
  );
  return excludeMembers ? negate(t, list) : list;
}

function formatExcludeValue(t: TFunction, view: FilterView): string | undefined {
  const inner = view.filter;
  if (inner && inner.filterType === 'members') {
    return formatMembersValue(t, inner.members ?? [], true, inner.attribute?.granularity);
  }
  if (inner) {
    const innerValue = chipValue(composeFilterLabel(t, inner));
    return innerValue ? negate(t, innerValue) : undefined;
  }
  return undefined;
}

function formatTextValue(t: TFunction, view: FilterView): string | undefined {
  const a = formatTextClause(t, view.operatorA, view.valueA);
  const b = formatTextClause(t, view.operatorB, view.valueB);
  if (a && b) {
    return joinWith(t, 'and', [a, b]);
  }
  return a || undefined;
}

function formatTextClause(t: TFunction, op: string | undefined, value: unknown): string {
  if (op === undefined || value === undefined || value === null) {
    return '';
  }
  if (op === TEXT_EQUALS_OP) {
    return formatTextEqualsValue(String(value));
  }
  return formatTextOperator(t, op, quoteText(String(value)));
}

/**
 * Phrases a text operator around an already-quoted value (or list of values).
 * An operator without a translation keeps its raw name in front of the value.
 * @param t - Translate function.
 * @param op - Text filter operator, e.g. `startsWith`.
 * @param value - Quoted value or joined list of quoted values.
 * @returns The operator phrase.
 */
function formatTextOperator(t: TFunction, op: string, value: string): string {
  const key = TEXT_OP_KEYS.get(op);
  return key ? phrase(t, key, { value }) : `${op} ${value}`;
}

/**
 * Formats a text `equals` value as the bare value, like a selected-member chip.
 * An empty value stays visible as `""` so the chip is not dropped.
 * @param value - Text value of the `equals` clause.
 * @returns Display text for the value.
 */
function formatTextEqualsValue(value: string): string {
  return value === '' ? quoteText(value) : value;
}

function quoteText(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function formatNumericValue(t: TFunction, view: FilterView): string | undefined {
  const { operatorA, operatorB, valueA, valueB } = view;
  const bothBounded =
    valueA !== undefined &&
    valueB !== undefined &&
    (operatorA === 'from' || operatorA === 'fromNotEqual') &&
    (operatorB === 'to' || operatorB === 'toNotEqual');
  if (bothBounded) {
    return phrase(t, 'queryDefinition.filterPill.range', {
      from: formatNumber(valueA),
      to: formatNumber(valueB),
    });
  }
  const a = formatNumericClause(operatorA, valueA);
  const b = formatNumericClause(operatorB, valueB);
  if (a && b) {
    return joinWith(t, 'and', [a, b]);
  }
  return a || undefined;
}

function formatNumericClause(op: string | undefined, value: unknown): string {
  if (op === undefined || value === undefined || value === null) {
    return '';
  }
  const symbol = NUMERIC_OP_SYMBOLS.get(op) ?? op;
  return `${symbol} ${formatNumber(value)}`;
}

function formatNumber(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return String(value);
}

function formatDateRangeValue(t: TFunction, view: FilterView): string | undefined {
  const granularity = view.attribute?.granularity;
  const includeCalendarDay = shouldIncludeCalendarDay(
    [view.from, view.to].filter((bound): bound is Date | string => Boolean(bound)),
    granularity,
  );
  const from = view.from ? formatChipDate(view.from, granularity, includeCalendarDay) : '';
  const to = view.to ? formatChipDate(view.to, granularity, includeCalendarDay) : '';
  if (from && to) {
    return phrase(t, 'queryDefinition.filterPill.range', { from, to });
  }
  if (from) {
    return phrase(t, 'queryDefinition.filterPill.fromToLatest', { from });
  }
  if (to) {
    return phrase(t, 'queryDefinition.filterPill.earliestTo', { to });
  }
  return undefined;
}

function formatRelativeDateValue(t: TFunction, view: FilterView): string | undefined {
  const direction = view.operator === 'next' ? 'next' : 'last';
  const count = view.count ?? 0;
  const unit = dateUnit(view);
  const unitWord = dateUnitWord(t, unit, count);
  const offset = view.offset ?? 0;
  const anchor = view.anchor;
  if (anchor !== undefined && anchor !== '') {
    const granularity = view.attribute?.granularity;
    const date = formatChipDate(anchor, granularity, isTimeOnlyGranularity(granularity));
    const key =
      direction === 'next'
        ? 'queryDefinition.filterPill.relative.nextFrom'
        : 'queryDefinition.filterPill.relative.lastTo';
    return phrase(t, key, { count, unit: unitWord, date });
  }
  const currentPeriodKey =
    direction === 'last' && offset === 0 && count === 1 && typeof unit !== 'object'
      ? CURRENT_PERIOD_KEYS.get(unit)
      : undefined;
  if (currentPeriodKey) {
    return phrase(t, currentPeriodKey);
  }
  const period = phrase(t, `queryDefinition.filterPill.relative.${direction}`, {
    count,
    unit: unitWord,
  });
  if (direction === 'last' && offset === 0) {
    return phrase(t, 'queryDefinition.filterPill.relative.includingCurrent', { period });
  }
  if (offset !== 0) {
    return phrase(t, 'queryDefinition.filterPill.relative.withOffset', { period, offset });
  }
  return period;
}

/** An unrecognized granularity is kept as its raw lowercased name, untranslated. */
type RawDateLevel = { readonly raw: string };

function dateUnit(view: FilterView): DateUnit | RawDateLevel {
  const granularity = view.attribute?.granularity;
  if (!granularity) {
    return 'day';
  }
  return DATE_LEVEL_UNITS.get(granularity) ?? { raw: granularity.toLowerCase() };
}

function dateUnitWord(t: TFunction, unit: DateUnit | RawDateLevel, count: number): string {
  if (typeof unit === 'object') {
    return unit.raw;
  }
  return phrase(t, `queryDefinition.filterPill.units.${unit}`, { count });
}

const ISO_DATE_LIKE = /^\d{4}-\d{2}/;

function isTimeOnlyGranularity(granularity?: string): boolean {
  return granularity !== undefined && DateLevels.timeOnly.includes(granularity);
}

function shouldIncludeCalendarDay(values: Array<Date | string>, granularity?: string): boolean {
  if (!isTimeOnlyGranularity(granularity)) {
    return false;
  }
  const days = new Set(values.map(calendarDayKey).filter(Boolean));
  return days.size > 1;
}

function calendarDayKey(value: Date | string): string {
  return normalizeDate(value);
}

function formatChipDate(
  value: Date | string,
  granularity?: string,
  includeCalendarDay = false,
): string {
  if (!granularity) {
    return normalizeDate(value);
  }
  const raw = value instanceof Date ? value : String(value);
  if (typeof raw === 'string' && !ISO_DATE_LIKE.test(raw)) {
    return raw;
  }
  const timeOrDate = formatDate(raw, getDefaultDateFormat(granularity));
  if (timeOrDate.includes('Invalid')) {
    return normalizeDate(value);
  }
  if (!includeCalendarDay) {
    return timeOrDate;
  }
  const datePart = formatDate(raw, getDefaultDateFormat(DateLevels.Days));
  if (datePart.includes('Invalid')) {
    return timeOrDate;
  }
  return `${datePart} ${timeOrDate}`;
}

function normalizeDate(value: Date | string | undefined): string {
  if (!value) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value);
  return s.length > 10 && s[10] === 'T' ? s.slice(0, 10) : s;
}

function formatRankingValue(t: TFunction, view: FilterView): string | undefined {
  const key =
    view.operator === 'bottom'
      ? 'queryDefinition.filterPill.ranking.bottom'
      : 'queryDefinition.filterPill.ranking.top';
  const rank = phrase(t, key, { count: view.count ?? 0 });
  const measure = view.measure ? formatChipLabel(view.measure) : undefined;
  if (!measure || view.filterType === FILTER_TYPE_MEASURE_RANKING) {
    return rank;
  }
  return phrase(t, 'queryDefinition.filterPill.ranking.by', { rank, measure });
}

function formatLogicalAttributeValue(t: TFunction, view: FilterView): string | undefined {
  const children = view.filters ?? [];
  if (children.length === 0) {
    return undefined;
  }
  const joiner = logicalJoiner(view.operator);
  const textOps = children.map((child) =>
    child.filterType === 'text' ? child.operatorA : undefined,
  );
  const sharedOp = textOps[0];
  const allShareOp =
    sharedOp !== undefined && textOps.every((op) => op === sharedOp) && children.length > 1;
  if (allShareOp && sharedOp === TEXT_EQUALS_OP) {
    return joinWith(
      t,
      joiner,
      children
        .map((child) =>
          child.valueA === undefined ? '' : formatTextEqualsValue(String(child.valueA)),
        )
        .filter(Boolean),
    );
  }
  if (allShareOp) {
    const quoted = children
      .map((child) => (child.valueA === undefined ? '' : quoteText(String(child.valueA))))
      .filter(Boolean);
    return formatTextOperator(t, sharedOp, joinWith(t, joiner, quoted));
  }
  const clauses = children.map((child) => chipValue(composeFilterLabel(t, child))).filter(Boolean);
  if (clauses.length === 0) {
    return undefined;
  }
  return joinWith(t, joiner, clauses);
}

function logicalJoiner(operator: string | undefined): keyof typeof JOINER_KEYS {
  const op = (operator ?? '').toLowerCase();
  if (op === 'union' || op === 'or') {
    return 'or';
  }
  return 'and';
}

function formatCascadingValue(t: TFunction, view: FilterView): string | undefined {
  const levels = view.filters ?? view._filters ?? [];
  const parents = levels.slice(0, -1);
  const parentNames = parents.map((level) => resolveAttributeName(level)).filter(Boolean);
  return parentNames.length > 0
    ? phrase(t, 'queryDefinition.filterPill.dependentOn', { parents: parentNames.join(', ') })
    : phrase(t, 'queryDefinition.filterPill.dependentFilter');
}

function chipValue(fullChip: string): string {
  const index = fullChip.indexOf(FILTER_CHIP_SEPARATOR);
  return index === -1 ? fullChip : fullChip.slice(index + FILTER_CHIP_SEPARATOR.length);
}

function formatValuesList(t: TFunction, values: string[]): string {
  const displayed = values.slice(0, MAX_INLINE_VALUES);
  const inline = displayed.join(', ');
  if (values.length <= MAX_INLINE_VALUES) {
    return inline;
  }
  return phrase(t, 'queryDefinition.filterPill.moreValues', {
    values: inline,
    count: values.length - MAX_INLINE_VALUES,
  });
}

/**
 * Builds a human-readable one-line chip for a {@link Filter} as `Label: Value`.
 * The **Value** follows the query-definition chip grammar (operators, members, ranges,
 * rank, fallback). The **Label** follows the Friendly Name / cleaned-technical-name rule,
 * optionally overridden via `attributeName`. Returns an empty string when the
 * filter has no selection (include-all).
 * Discrimination uses the `filterType` string rather than `instanceof` so the helper
 * stays robust when multiple `@sisense/sdk-data` copies exist in a workspace.
 * @param filter - Filter instance to describe.
 * @param attributeName - Optional display name override (for example, an i18n date-level label).
 * @param t - Optional translate function for the chip value; defaults to the sdk-ui i18n instance.
 * @returns Readable chip text, or an empty string when the filter should render no chip.
 * @sisenseInternal
 */
export function toReadableFilterLabel(
  filter: Filter,
  attributeName?: string,
  t: TFunction = i18nextInstance.t,
): string {
  try {
    return composeFilterLabel(t, filter, attributeName);
  } catch {
    return customChip(t, resolveAttributeName(filter, attributeName));
  }
}
