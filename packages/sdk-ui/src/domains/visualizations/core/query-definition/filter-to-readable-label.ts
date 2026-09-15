import { DateLevels, type Filter } from '@sisense/sdk-data';

import { formatDate, getDefaultDateFormat } from '@/infra/formatting/format-date.js';

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

const TEXT_OP_LABELS = new Map<string, string>([
  ['contains', 'contains'],
  ['startsWith', 'starts with'],
  ['endsWith', 'ends with'],
  ['equals', '='],
  ['doesntEqual', "doesn't equal"],
  ['doesntStartWith', "doesn't start with"],
  ['doesntContain', "doesn't contain"],
  ['doesntEndWith', "doesn't end with"],
  ['like', 'like'],
]);

const NUMERIC_OP_SYMBOLS = new Map<string, string>([
  ['equals', '='],
  ['doesntEqual', '!='],
  ['from', '>='],
  ['fromNotEqual', '>'],
  ['to', '<='],
  ['toNotEqual', '<'],
]);

const DATE_LEVEL_WORDS = new Map<string, string>([
  ['Years', 'years'],
  ['Quarters', 'quarters'],
  ['Months', 'months'],
  ['Weeks', 'weeks'],
  ['WeekOfYear', 'weeks'],
  ['Days', 'days'],
  ['Hours', 'hours'],
  ['AggHours', 'hours'],
  ['Minutes', 'minutes'],
  ['MinutesRoundTo30', 'minutes'],
  ['MinutesRoundTo15', 'minutes'],
  ['AggMinutesRoundTo30', 'minutes'],
  ['AggMinutesRoundTo15', 'minutes'],
  ['AggMinutesRoundTo1', 'minutes'],
]);

const FILTER_TYPE_MEASURE = 'measure';
const FILTER_TYPE_MEASURE_RANKING = 'measure-ranking';
const MAX_INLINE_VALUES = 3;

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

function customChip(name: string): string {
  return asChip(name, 'custom filter');
}

function composeFilterLabel(filter: Filter, attributeName?: string): string {
  const view = filter as FilterView;
  const name = resolveChipName(view, attributeName);

  switch (view.filterType) {
    case 'members':
      return asChip(
        name,
        formatMembersValue(
          view.members ?? [],
          view.config?.excludeMembers === true,
          view.attribute?.granularity,
        ),
      );
    case 'exclude':
      return asChip(name, formatExcludeValue(view));
    case 'text':
      return asChip(name, formatTextValue(view));
    case 'numeric':
      return asChip(name, formatNumericValue(view));
    case 'dateRange':
      return asChip(name, formatDateRangeValue(view));
    case 'relativeDate':
      return asChip(name, formatRelativeDateValue(view));
    case 'ranking':
      return asChip(name, formatRankingValue(view));
    case FILTER_TYPE_MEASURE_RANKING:
      return asChip(name, formatRankingValue(view));
    case FILTER_TYPE_MEASURE:
      return asChip(name, formatNumericValue(view));
    case 'logicalAttribute':
      return asChip(name, formatLogicalAttributeValue(view));
    case 'cascading':
      return asChip(name, formatCascadingValue(view));
    case 'empty':
      return asChip(name, view.not === true ? 'not empty' : 'empty');
    case 'advanced':
      return customChip(name);
    default:
      return customChip(name);
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

function formatMembersValue(
  members: string[],
  excludeMembers = false,
  granularity?: string,
): string | undefined {
  if (members.length === 0) {
    return undefined;
  }
  const includeCalendarDay = shouldIncludeCalendarDay(members, granularity);
  const list = formatValuesList(
    members.map((member) => formatChipDate(member, granularity, includeCalendarDay)),
  );
  return excludeMembers ? `not ${list}` : list;
}

function formatExcludeValue(view: FilterView): string | undefined {
  const inner = view.filter;
  if (inner && inner.filterType === 'members') {
    return formatMembersValue(inner.members ?? [], true, inner.attribute?.granularity);
  }
  if (inner) {
    const innerValue = chipValue(composeFilterLabel(inner));
    return innerValue ? `not ${innerValue}` : undefined;
  }
  return undefined;
}

function formatTextValue(view: FilterView): string | undefined {
  const a = formatTextClause(view.operatorA, view.valueA);
  const b = formatTextClause(view.operatorB, view.valueB);
  if (a && b) {
    return `${a} and ${b}`;
  }
  return a || undefined;
}

function formatTextClause(op: string | undefined, value: unknown): string {
  if (op === undefined || value === undefined || value === null) {
    return '';
  }
  const opLabel = TEXT_OP_LABELS.get(op) ?? op;
  return `${opLabel} ${quoteText(String(value))}`;
}

function quoteText(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function formatNumericValue(view: FilterView): string | undefined {
  const { operatorA, operatorB, valueA, valueB } = view;
  const bothBounded =
    valueA !== undefined &&
    valueB !== undefined &&
    (operatorA === 'from' || operatorA === 'fromNotEqual') &&
    (operatorB === 'to' || operatorB === 'toNotEqual');
  if (bothBounded) {
    return `${formatNumber(valueA)} to ${formatNumber(valueB)}`;
  }
  const a = formatNumericClause(operatorA, valueA);
  const b = formatNumericClause(operatorB, valueB);
  if (a && b) {
    return `${a} and ${b}`;
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

function formatDateRangeValue(view: FilterView): string | undefined {
  const granularity = view.attribute?.granularity;
  const includeCalendarDay = shouldIncludeCalendarDay(
    [view.from, view.to].filter((bound): bound is Date | string => Boolean(bound)),
    granularity,
  );
  const from = view.from ? formatChipDate(view.from, granularity, includeCalendarDay) : '';
  const to = view.to ? formatChipDate(view.to, granularity, includeCalendarDay) : '';
  if (from && to) {
    return `${from} to ${to}`;
  }
  if (from) {
    return `${from} to latest date`;
  }
  if (to) {
    return `earliest date to ${to}`;
  }
  return undefined;
}

function formatRelativeDateValue(view: FilterView): string | undefined {
  const direction = view.operator === 'next' ? 'next' : 'last';
  const count = view.count ?? 0;
  const level = dateLevelWord(view);
  const offset = view.offset ?? 0;
  const anchor = view.anchor;
  if (anchor !== undefined && anchor !== '') {
    const granularity = view.attribute?.granularity;
    const bound = formatChipDate(anchor, granularity, isTimeOnlyGranularity(granularity));
    const preposition = direction === 'next' ? 'from' : 'to';
    return `${direction} ${count} ${level} ${preposition} ${bound}`;
  }
  if (direction === 'last' && offset === 0 && count === 1) {
    const currentPeriod = currentPeriodLabel(level);
    if (currentPeriod) {
      return currentPeriod;
    }
  }
  const base = `${direction} ${count} ${level}`;
  if (direction === 'last' && offset === 0) {
    return `${base} including current`;
  }
  if (offset !== 0) {
    return `${base}, offset ${offset}`;
  }
  return base;
}

function currentPeriodLabel(level: string): string | undefined {
  const labels = new Map<string, string>([
    ['days', 'today'],
    ['weeks', 'this week'],
    ['months', 'this month'],
    ['quarters', 'this quarter'],
    ['years', 'this year'],
  ]);
  return labels.get(level);
}

function dateLevelWord(view: FilterView): string {
  const granularity = view.attribute?.granularity;
  const mapped = granularity ? DATE_LEVEL_WORDS.get(granularity) : undefined;
  if (mapped) {
    return mapped;
  }
  if (granularity) {
    return granularity.toLowerCase();
  }
  return 'days';
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

function formatRankingValue(view: FilterView): string | undefined {
  const direction = view.operator === 'bottom' ? 'Bottom' : 'Top';
  const count = view.count ?? 0;
  const measureName = view.measure ? formatChipLabel(view.measure) : undefined;
  const base = `${direction} ${count}`;
  if (!measureName || view.filterType === FILTER_TYPE_MEASURE_RANKING) {
    return base;
  }
  return `${base} by ${measureName}`;
}

function formatLogicalAttributeValue(view: FilterView): string | undefined {
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
  if (allShareOp) {
    const quoted = children
      .map((child) => (child.valueA === undefined ? '' : quoteText(String(child.valueA))))
      .filter(Boolean);
    const opLabel = TEXT_OP_LABELS.get(sharedOp) ?? sharedOp;
    const separator = ` ${joiner} `;
    return `${opLabel} ${quoted.join(separator)}`;
  }
  const clauses = children.map((child) => chipValue(composeFilterLabel(child))).filter(Boolean);
  if (clauses.length === 0) {
    return undefined;
  }
  return clauses.join(` ${joiner} `);
}

function logicalJoiner(operator: string | undefined): string {
  const op = (operator ?? '').toLowerCase();
  if (op === 'union' || op === 'or') {
    return 'or';
  }
  return 'and';
}

function formatCascadingValue(view: FilterView): string | undefined {
  const levels = view.filters ?? view._filters ?? [];
  const parents = levels.slice(0, -1);
  const parentNames = parents.map((level) => resolveAttributeName(level)).filter(Boolean);
  return parentNames.length > 0 ? `dependent on ${parentNames.join(', ')}` : 'dependent filter';
}

function chipValue(fullChip: string): string {
  const index = fullChip.indexOf(FILTER_CHIP_SEPARATOR);
  return index === -1 ? fullChip : fullChip.slice(index + FILTER_CHIP_SEPARATOR.length);
}

function formatValuesList(values: string[]): string {
  const displayed = values.slice(0, MAX_INLINE_VALUES);
  const inline = displayed.join(', ');
  if (values.length <= MAX_INLINE_VALUES) {
    return inline;
  }
  return `${inline} +${values.length - MAX_INLINE_VALUES} more`;
}

/**
 * Builds a human-readable one-line chip for a {@link Filter} as `Label: Value`.
 * The **Value** follows the query-definition chip grammar (operators, members, ranges,
 * rank, fallback). The **Label** follows the Friendly Name / cleaned-technical-name rule,
 * optionally overridden via `attributeName`. Returns an empty string when the
 * filter has no selection (include-all).
 * Discrimination uses the `filterType` string rather than `instanceof` so the helper
 * stays robust when multiple `@sisense/sdk-data` copies exist in a workspace.
 * @param filter - Filter instance to describe
 * @param attributeName - Optional display name override (e.g. i18n date-level label)
 * @returns Readable chip text, or an empty string when the filter should render no chip
 * @sisenseInternal
 */
export function toReadableFilterLabel(filter: Filter, attributeName?: string): string {
  try {
    return composeFilterLabel(filter, attributeName);
  } catch {
    return customChip(resolveAttributeName(filter, attributeName));
  }
}
