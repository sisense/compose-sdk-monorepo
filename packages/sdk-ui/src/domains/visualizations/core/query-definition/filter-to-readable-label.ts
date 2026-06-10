import type { Filter } from '@sisense/sdk-data';

/**
 * Minimal structural view of concrete filter subclasses. Only the fields read here are
 * declared optional to stay decoupled from the (mostly `@internal`) class hierarchy.
 *
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
  filter?: Filter;
  input?: Filter;
  filters?: Filter[];
  _filters?: Filter[];
  from?: Date | string;
  to?: Date | string;
};

const TEXT_OP_LABELS: Record<string, string> = {
  contains: 'contains',
  startsWith: 'starts with',
  endsWith: 'ends with',
  equals: '=',
  doesntEqual: '≠',
  doesntStartWith: 'does not start with',
  doesntContain: 'does not contain',
  doesntEndWith: 'does not end with',
  like: 'like',
};

const NUMERIC_OP_LABELS: Record<string, string> = {
  equals: '=',
  doesntEqual: '≠',
  from: '≥',
  fromNotEqual: '>',
  to: '≤',
  toNotEqual: '<',
};

const MAX_MEMBER_VALUES = 4;

function resolveAttributeName(filter: Filter, attributeName?: string): string {
  return attributeName ?? filter.attribute?.name ?? '';
}

function composeFilterLabel(filter: Filter, attributeName?: string): string {
  const view = filter as FilterView;
  const name = resolveAttributeName(view, attributeName);

  switch (view.filterType) {
    case 'members':
      return formatMembers(name, view.members ?? [], view.config?.excludeMembers === true);
    case 'exclude':
      return formatExclude(view);
    case 'text':
      return formatTextFilter(name, view);
    case 'numeric':
      return formatNumericFilter(name, view);
    case 'dateRange':
      return formatDateRange(name, view);
    case 'relativeDate':
      return formatRelativeDate(name, view);
    case 'ranking':
      return formatRanking(name, view);
    case 'measure-ranking':
      return formatMeasureRanking(view);
    case 'measure':
      return formatMeasureFilter(name, view);
    case 'logicalAttribute':
      return formatLogicalAttribute(name, view);
    case 'cascading':
      return formatCascading(view);
    case 'advanced':
      return name ? `${name} (advanced)` : 'Advanced filter';
    default:
      return name;
  }
}

function formatMembers(name: string, members: string[], excludeMembers = false): string {
  if (members.length === 0) {
    return excludeMembers ? `${name} excluded` : name;
  }
  if (members.length === 1) {
    const value = members[0];
    return excludeMembers ? `${name} is not ${value}` : `${name} is ${value}`;
  }
  const list = formatMembersList(members);
  return excludeMembers ? `${name} not in ${list}` : `${name} in ${list}`;
}

function formatExclude(view: FilterView): string {
  const inner = view.filter as FilterView | undefined;
  if (inner && inner.filterType === 'members') {
    const name = resolveAttributeName(inner);
    const members = inner.members ?? [];
    return formatMembers(name, members, true);
  }
  if (inner) {
    const innerLabel = composeFilterLabel(inner);
    return innerLabel ? `NOT (${innerLabel})` : resolveAttributeName(view);
  }
  return resolveAttributeName(view);
}

function formatTextFilter(name: string, view: FilterView): string {
  const a = formatTextClause(view.operatorA, view.valueA);
  const b = formatTextClause(view.operatorB, view.valueB);
  if (a && b) {
    return `${name} ${a} and ${b}`;
  }
  return a ? `${name} ${a}` : name;
}

function formatTextClause(op: string | undefined, value: unknown): string {
  if (op === undefined || value === undefined || value === null) {
    return '';
  }
  const opLabel = TEXT_OP_LABELS[op] ?? op;
  return `${opLabel} "${String(value)}"`;
}

function formatNumericFilter(name: string, view: FilterView): string {
  return formatNumericShape(name, view);
}

function formatMeasureFilter(name: string, view: FilterView): string {
  const subject = view.measure?.name ?? name;
  return formatNumericShape(subject, view);
}

function formatNumericShape(subject: string, view: FilterView): string {
  const { operatorA, operatorB, valueA, valueB } = view;
  const bothBounded =
    valueA !== undefined &&
    valueB !== undefined &&
    (operatorA === 'from' || operatorA === 'fromNotEqual') &&
    (operatorB === 'to' || operatorB === 'toNotEqual');
  if (bothBounded) {
    return `${subject} between ${formatNumber(valueA)} and ${formatNumber(valueB)}`;
  }
  const a = formatNumericClause(operatorA, valueA);
  const b = formatNumericClause(operatorB, valueB);
  if (a && b) {
    return `${subject} ${a} and ${b}`;
  }
  return a ? `${subject} ${a}` : subject;
}

function formatNumericClause(op: string | undefined, value: unknown): string {
  if (op === undefined || value === undefined || value === null) {
    return '';
  }
  const opLabel = NUMERIC_OP_LABELS[op] ?? op;
  return `${opLabel} ${formatNumber(value)}`;
}

function formatNumber(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return String(value);
}

function formatDateRange(name: string, view: FilterView): string {
  const from = normalizeDate(view.from);
  const to = normalizeDate(view.to);
  if (from && to) {
    return `${name}: ${from} → ${to}`;
  }
  if (from) {
    return `${name} from ${from}`;
  }
  if (to) {
    return `${name} to ${to}`;
  }
  return name;
}

function formatRelativeDate(name: string, view: FilterView): string {
  const direction = view.operator === 'next' ? 'next' : 'last';
  const count = view.count ?? 0;
  const level = name || view.attribute?.name || '';
  const base = `${level}: ${direction} ${count}`;
  const offset = view.offset ?? 0;
  return offset !== 0 ? `${base} (offset ${offset})` : base;
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

function formatRanking(name: string, view: FilterView): string {
  const direction = view.operator === 'bottom' ? 'bottom' : 'top';
  const count = view.count ?? 0;
  const measureName = view.measure?.name;
  const base = `${name}: ${direction} ${count}`;
  return measureName ? `${base} by ${measureName}` : base;
}

function formatMeasureRanking(view: FilterView): string {
  const direction = view.operator === 'bottom' ? 'bottom' : 'top';
  const count = view.count ?? 0;
  const measureName = view.measure?.name ?? 'measure';
  return `${direction} ${count} by ${measureName}`;
}

function formatLogicalAttribute(name: string, view: FilterView): string {
  const children = (view.filters ?? []).map((f) => composeFilterLabel(f)).filter(Boolean);
  if (children.length === 0) {
    return name;
  }
  const joiner = logicalJoiner(view.operator);
  const separator = ` ${joiner} `;
  return `${name} (${children.join(separator)})`;
}

function logicalJoiner(operator: string | undefined): string {
  const op = (operator ?? '').toLowerCase();
  if (op === 'union' || op === 'or') {
    return 'OR';
  }
  if (op === 'intersection' || op === 'and') {
    return 'AND';
  }
  if (op === 'exclude' || op === 'not') {
    return 'NOT';
  }
  return operator ?? 'AND';
}

function formatCascading(view: FilterView): string {
  const levels = view.filters ?? view._filters ?? [];
  const names = levels.map((f) => resolveAttributeName(f as FilterView)).filter(Boolean);
  if (names.length === 0) {
    return resolveAttributeName(view);
  }
  return names.join(' › ');
}

function quoteMember(value: string): string {
  return `'${value.replace(/'/g, "\\'")}'`;
}

function formatMembersList(members: string[]): string {
  const displayed = members.slice(0, MAX_MEMBER_VALUES);
  const arrayLiteral = `[${displayed.map(quoteMember).join(', ')}]`;
  if (members.length <= MAX_MEMBER_VALUES) {
    return arrayLiteral;
  }
  return `${arrayLiteral} (+${members.length - MAX_MEMBER_VALUES} more)`;
}

/**
 * Builds a human-readable one-line label for a {@link Filter}, covering common
 * `filterType` variants (`members`, `exclude`, `text`, `numeric`, `dateRange`, etc.).
 *
 * Discrimination uses the `filterType` string rather than `instanceof` so the helper
 * stays robust when multiple `@sisense/sdk-data` copies exist in a workspace.
 *
 * @param filter - Filter instance to describe
 * @param attributeName - Optional display name override (e.g. i18n date-level label)
 * @returns Readable pill label; falls back to the attribute name when composition fails
 * @sisenseInternal
 */
export function toReadableFilterLabel(filter: Filter, attributeName?: string): string {
  try {
    return composeFilterLabel(filter, attributeName) || resolveAttributeName(filter, attributeName);
  } catch {
    return resolveAttributeName(filter, attributeName);
  }
}
