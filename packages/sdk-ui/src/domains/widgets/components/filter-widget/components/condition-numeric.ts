/**
 * Numeric Condition catalogue and Filter ↔ draft mapping for FilterWidget.
 *
 * Operators match the numeric operator catalogue — seven
 * comparisons including Between — minus Is not / Top / Bottom from the CSDK filter
 * editor (those belong to List / ranking, not this control). Number has no
 * value-less operators (no Is empty).
 *
 * One primary row plus an optional AND/OR chain of unary comparisons (Between is
 * primary-only), published as `filterFactory.intersection` / `union` → JAQL
 * `{ and|or: [] }`. Mapping reuses {@link CRITERIA_FILTER_MAP} / {@link FilterOption}
 * like {@link condition-text.ts}.
 * @internal
 */
import {
  Attribute,
  Filter,
  FilterConfig,
  filterFactory,
  isLogicalAttributeFilter,
  isNumericFilter,
  LogicalAttributeFilter,
  NumericFilter,
} from '@sisense/sdk-data';

import {
  CRITERIA_FILTER_MAP,
  FilterOption,
  filterToDefaultValues,
  filterToOption,
} from '@/domains/filters/components/criteria-filter-tile/criteria-filter-operations.js';
import { isSameAttribute } from '@/shared/utils/filters.js';
import { isNumericString } from '@/shared/utils/is-numeric-string.js';

/**
 * Identifies a numeric comparison operator shown in the Condition filter control.
 * @internal
 */
export type NumericConditionOp = 'equals' | 'not-equals' | 'lt' | 'lte' | 'gt' | 'gte' | 'between';

/**
 * Describes whether a {@link NumericConditionOp} requires one or two value fields.
 * @internal
 */
export type NumericConditionShape = 'number' | 'between';

/**
 * Logical connector shared by every row in a chained numeric condition.
 * @internal
 */
export type NumericConditionConnector = 'AND' | 'OR';

/**
 * Catalogue entry for one selectable numeric condition operator.
 * @internal
 */
export type NumericConditionOperator = {
  id: NumericConditionOp;
  /** i18n key under `filterEditor.conditions.*` or `criteriaFilter.*`. */
  labelKey: string;
  shape: NumericConditionShape;
  /** Symbol shown in the operator list for comparisons (product parity). */
  glyph?: string;
};

/** Product order — same seven as filter-widget-components NUMBER_OPERATORS. */
export const NUMERIC_CONDITION_OPERATORS: readonly NumericConditionOperator[] = [
  { id: 'equals', labelKey: 'filterEditor.conditions.equals', shape: 'number', glyph: '=' },
  {
    id: 'not-equals',
    labelKey: 'filterEditor.conditions.notEquals',
    shape: 'number',
    glyph: '≠',
  },
  { id: 'lt', labelKey: 'filterEditor.conditions.lessThan', shape: 'number', glyph: '<' },
  {
    id: 'lte',
    labelKey: 'filterEditor.conditions.lessThanOrEqual',
    shape: 'number',
    glyph: '≤',
  },
  { id: 'gt', labelKey: 'filterEditor.conditions.greaterThan', shape: 'number', glyph: '>' },
  {
    id: 'gte',
    labelKey: 'filterEditor.conditions.greaterThanOrEqual',
    shape: 'number',
    glyph: '≥',
  },
  // Operator list / trigger label — plain "Between", not criteriaFilter.between
  // (`Between {{valA}} and {{valB}}`), which is for tile summaries with interpolated values.
  { id: 'between', labelKey: 'filterEditor.conditions.between', shape: 'between', glyph: '>>' },
] as const;

/** Unary comparisons only — Between stays out of chained rows (product rule). */
export const NUMERIC_CHAIN_OPERATORS: readonly NumericConditionOperator[] =
  NUMERIC_CONDITION_OPERATORS.filter((entry) => entry.shape === 'number');

/**
 * One chained condition row after the primary {@link NumericConditionDraft} row.
 * @internal
 */
export type NumericConditionRow = {
  id: string;
  op: NumericConditionOp;
  /** Operand when the operator shape is `number`; otherwise ignored. */
  number: string;
};

/**
 * In-memory edit state for a numeric Condition filter before Apply publishes it.
 * @internal
 */
export type NumericConditionDraft = {
  op: NumericConditionOp;
  number: string;
  min: string;
  max: string;
  connector: NumericConditionConnector;
  extra: NumericConditionRow[];
};

let nextRowSeq = 0;

/** Stable id for a new chained row (survives edits; not an index). */
export function newNumericConditionRowId(): string {
  nextRowSeq += 1;
  return `row-${nextRowSeq}`;
}

/**
 * Creates the empty numeric condition draft used when no filter is linked yet.
 * @returns Draft with the first operator and empty operands
 * @internal
 */
export function defaultNumericConditionDraft(): NumericConditionDraft {
  return {
    op: NUMERIC_CONDITION_OPERATORS[0].id,
    number: '',
    min: '',
    max: '',
    connector: 'AND',
    extra: [],
  };
}

/**
 * Resolves the catalogue entry for an operator id.
 * @param op - Operator id to resolve
 * @returns Matching entry, or the first catalogue entry when the id is unknown
 * @internal
 */
export function numericOperatorOf(op: NumericConditionOp): NumericConditionOperator {
  return (
    NUMERIC_CONDITION_OPERATORS.find((entry) => entry.id === op) ?? NUMERIC_CONDITION_OPERATORS[0]
  );
}

/** Unary numeric shapes accept `+ Add condition` (Between is primary-only). */
export function isNumericConditionChainable(
  shape: NumericConditionShape | null | undefined,
): boolean {
  return shape === 'number';
}

/** Primary row alone is filled — ignores the chain (gates Add / primary error). */
export function isNumericConditionPrimaryFilled(draft: NumericConditionDraft): boolean {
  const shape = numericOperatorOf(draft.op).shape;
  if (shape === 'between') {
    return draft.min.trim() !== '' && draft.max.trim() !== '';
  }
  return draft.number.trim() !== '';
}

/** Whole filter is ready to publish — primary + every chained row with numeric operands. */
export function isNumericConditionComplete(draft: NumericConditionDraft): boolean {
  if (!isNumericConditionPrimaryFilled(draft)) return false;
  const shape = numericOperatorOf(draft.op).shape;
  const primaryOk =
    shape === 'between'
      ? isNumericString(draft.min) && isNumericString(draft.max)
      : isNumericString(draft.number);
  if (!primaryOk) return false;
  return draft.extra.every((row) => {
    if (numericOperatorOf(row.op).shape === 'between') return false;
    return isNumericString(row.number);
  });
}

function triggerOperatorLabel(
  op: NumericConditionOp,
  labelOf: (op: NumericConditionOp) => string,
): string {
  const raw = labelOf(op);
  const glyph = numericOperatorOf(op).glyph;
  if (!glyph) return raw;
  const prefix = `${glyph} `;
  return raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
}

function summarisePrimary(
  draft: Pick<NumericConditionDraft, 'op' | 'number' | 'min' | 'max'>,
  labelOf: (op: NumericConditionOp) => string,
): string | undefined {
  const shape = numericOperatorOf(draft.op).shape;
  const name = triggerOperatorLabel(draft.op, labelOf);
  if (shape === 'between') {
    if (draft.min.trim() === '' || draft.max.trim() === '') return undefined;
    return `${name} ${draft.min} – ${draft.max}`;
  }
  if (draft.number.trim() === '') return undefined;
  return `${name} ${draft.number}`;
}

function chainRowLine(
  row: NumericConditionRow,
  connector: NumericConditionConnector,
  labelOf: (op: NumericConditionOp) => string,
  allowEllipsis: boolean,
): string {
  const label = triggerOperatorLabel(row.op, labelOf);
  const value = row.number.trim() || (allowEllipsis ? '…' : '');
  const suffix = value ? ` ${value}` : '';
  return `${connector} ${label}${suffix}`;
}

/**
 * Returns closed-trigger tooltip lines for a complete numeric condition.
 *
 * Incomplete drafts return `[]`. The hover tooltip uses these lines as-is; the
 * box joins them with spaces.
 * @param draft - Numeric condition draft
 * @param labelOf - Resolves the localized operator label
 * @returns One non-abbreviated line per condition, or an empty array for an incomplete draft.
 * @internal
 */
export function describeNumericCondition(
  draft: NumericConditionDraft,
  labelOf: (op: NumericConditionOp) => string,
): readonly string[] {
  if (!isNumericConditionComplete(draft)) return [];
  const head = summarisePrimary(draft, labelOf);
  if (!head) return [];
  if (draft.extra.length === 0) return [head];
  return [head, ...draft.extra.map((row) => chainRowLine(row, draft.connector, labelOf, false))];
}

/** Closed-trigger sentence. Incomplete drafts return `undefined`. */
export function summariseNumericCondition(
  draft: NumericConditionDraft,
  labelOf: (op: NumericConditionOp) => string,
): string | undefined {
  const lines = describeNumericCondition(draft, labelOf);
  return lines.length === 0 ? undefined : lines.join(' ');
}

/** Open-panel trigger wording — unfinished rows show `…`. */
export function summariseNumericConditionDraft(
  draft: NumericConditionDraft,
  labelOf: (op: NumericConditionOp) => string,
): string | undefined {
  const head = summarisePrimary(draft, labelOf) ?? triggerOperatorLabel(draft.op, labelOf);
  if (!head) return undefined;
  if (draft.extra.length === 0) return head;
  return [
    head,
    ...draft.extra.map((row) => chainRowLine(row, draft.connector, labelOf, true)),
  ].join(' ');
}

const OP_TO_FILTER_OPTION: Record<Exclude<NumericConditionOp, 'between'>, string> = {
  equals: FilterOption.EQUALS_NUMERIC,
  'not-equals': FilterOption.NOT_EQUALS_NUMERIC,
  lt: FilterOption.LESS_THAN,
  lte: FilterOption.LESS_THAN_OR_EQUAL,
  gt: FilterOption.GREATER_THAN,
  gte: FilterOption.GREATER_THAN_OR_EQUAL,
};

const FILTER_OPTION_TO_OP: Partial<Record<string, NumericConditionOp>> = {
  [FilterOption.EQUALS_NUMERIC]: 'equals',
  [FilterOption.NOT_EQUALS_NUMERIC]: 'not-equals',
  [FilterOption.LESS_THAN]: 'lt',
  [FilterOption.LESS_THAN_OR_EQUAL]: 'lte',
  [FilterOption.GREATER_THAN]: 'gt',
  [FilterOption.GREATER_THAN_OR_EQUAL]: 'gte',
  [FilterOption.BETWEEN]: 'between',
};

function parseNumericOperand(value: string): number {
  return Number(value.trim());
}

function leafDraftToFilter(
  attribute: Attribute,
  draft: Pick<NumericConditionDraft, 'op' | 'number' | 'min' | 'max'>,
  config?: FilterConfig,
): Filter {
  if (draft.op === 'between') {
    return CRITERIA_FILTER_MAP[FilterOption.BETWEEN]!.fn(
      attribute,
      parseNumericOperand(draft.min),
      parseNumericOperand(draft.max),
      config,
    );
  }
  const option = OP_TO_FILTER_OPTION[draft.op];
  return CRITERIA_FILTER_MAP[option]!.fn(attribute, parseNumericOperand(draft.number), config);
}

function chainRowToFilter(
  attribute: Attribute,
  row: NumericConditionRow,
  config?: FilterConfig,
): Filter {
  const option = OP_TO_FILTER_OPTION[row.op as Exclude<NumericConditionOp, 'between'>];
  return CRITERIA_FILTER_MAP[option]!.fn(attribute, parseNumericOperand(row.number), config);
}

/**
 * Builds a NumericFilter or LogicalAttributeFilter from a complete draft.
 * AND → intersection, OR → union (JAQL `{ and|or: [...] }`).
 */
export function numericConditionToFilter(
  attribute: Attribute,
  draft: NumericConditionDraft,
  config?: FilterConfig,
): Filter {
  const primary = leafDraftToFilter(attribute, draft, config);
  if (draft.extra.length === 0) return primary;

  const parts: Filter[] = [
    primary,
    ...draft.extra.map((row) => chainRowToFilter(attribute, row, config)),
  ];

  return draft.connector === 'OR'
    ? filterFactory.union(parts, config)
    : filterFactory.intersection(parts, config);
}

function numericFilterToLeafDraft(
  filter: NumericFilter,
): Pick<NumericConditionDraft, 'op' | 'number' | 'min' | 'max'> | null {
  let option: string;
  try {
    option = filterToOption(filter);
  } catch {
    return null;
  }

  const values = filterToDefaultValues(filter);
  const op = FILTER_OPTION_TO_OP[option];
  if (!op) return null;

  if (op === 'between') {
    const min = values[0];
    const max = values[1];
    if (min === undefined || max === undefined) return null;
    return { op, number: '', min: String(min), max: String(max) };
  }

  const value = values[0];
  if (value === undefined) return null;
  return { op, number: String(value), min: '', max: '' };
}

function leafFilterToDraft(
  filter: Filter,
): Pick<NumericConditionDraft, 'op' | 'number' | 'min' | 'max'> | null {
  if (!isNumericFilter(filter)) return null;
  return numericFilterToLeafDraft(filter);
}

function isEditableNumericConditionLeaf(filter: Filter, allowBetween = true): boolean {
  if (!isNumericFilter(filter)) return false;
  try {
    const option: string = filterToOption(filter);
    const op = FILTER_OPTION_TO_OP[option];
    if (!op) return false;
    if (op === 'between' && !allowBetween) return false;
    const values = filterToDefaultValues(filter);
    if (op === 'between') {
      return values.length >= 2 && values[0] !== undefined && values[1] !== undefined;
    }
    return values[0] !== undefined;
  } catch {
    return false;
  }
}

function logicalChainConnector(
  operator: LogicalAttributeFilter['operator'],
): NumericConditionConnector | null {
  if (operator === 'or') return 'OR';
  if (operator === 'and') return 'AND';
  return null;
}

/** Checks whether every leaf references the same attribute expression and granularity. */
function logicalLeavesShareAttribute(parts: readonly Filter[]): boolean {
  const [head, ...rest] = parts;
  if (!head) return false;
  return rest.every((part) => isSameAttribute(head.attribute, part.attribute));
}

/**
 * Reads a NumericFilter or flat LogicalAttributeFilter into a draft. Unsupported
 * filters yield the default empty draft (closed trigger stays on Set filter).
 * Same forms as {@link isEditableNumericConditionFilter} — Between never appears in a
 * logical chain (it is primary-only and cannot carry AND/OR rows in the panel).
 */
export function filterToNumericConditionDraft(
  filter: Filter | null | undefined,
): NumericConditionDraft {
  if (!filter || !isEditableNumericConditionFilter(filter)) {
    return defaultNumericConditionDraft();
  }

  if (isLogicalAttributeFilter(filter)) {
    const logical = filter;
    const parts = logical.filters ?? [];
    const connector = logicalChainConnector(logical.operator);
    type LeafDraft = Pick<NumericConditionDraft, 'op' | 'number' | 'min' | 'max'>;
    const leaves: Array<LeafDraft | null> = parts.map(leafFilterToDraft);
    const isLeaf = (leaf: LeafDraft | null): leaf is LeafDraft => leaf !== null;
    if (!connector || leaves.length === 0 || !leaves.every(isLeaf)) {
      return defaultNumericConditionDraft();
    }

    const [head, ...rest] = leaves;
    return {
      ...head,
      connector,
      extra: rest.map((leaf) => ({
        id: newNumericConditionRowId(),
        op: leaf.op,
        number: leaf.number,
      })),
    };
  }

  if (!isNumericFilter(filter)) return defaultNumericConditionDraft();
  const leaf = numericFilterToLeafDraft(filter);
  if (!leaf) return defaultNumericConditionDraft();
  return { ...leaf, connector: 'AND', extra: [] };
}

/**
 * Checks whether the linked filter is a numeric condition (single or flat AND/OR of unary
 * comparisons) this control can edit. Between is primary-only: a lone Between filter is
 * editable; any LogicalAttributeFilter that contains Between is not (the panel hides the
 * chain when Between is selected). Mixed-attribute chains are rejected — Apply would
 * rewrite every leaf onto the widget attribute.
 */
export function isEditableNumericConditionFilter(
  filter: Filter | null | undefined,
): filter is Filter {
  if (!filter) return false;

  if (isLogicalAttributeFilter(filter)) {
    const logical = filter;
    if (!logicalChainConnector(logical.operator)) return false;
    const parts = logical.filters;
    return (
      Array.isArray(parts) &&
      parts.length > 0 &&
      logicalLeavesShareAttribute(parts) &&
      // Between is never editable inside a logical chain (primary-only in the panel).
      parts.every((part) => isEditableNumericConditionLeaf(part, false))
    );
  }

  return isEditableNumericConditionLeaf(filter);
}
