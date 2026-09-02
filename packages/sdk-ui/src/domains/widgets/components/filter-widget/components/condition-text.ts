/**
 * String Condition catalogue and Filter ↔ draft mapping for FilterWidget.
 *
 * Operators match the CSDK filter-editor text Condition list, minus Is not / Top /
 * Bottom (those belong to List / ranking, not this control).
 *
 * One primary row plus an optional AND/OR chain (one connector for the whole chain),
 * published as `filterFactory.intersection` / `union` → JAQL `{ and|or: [] }`.
 * @internal
 */
import {
  Attribute,
  Filter,
  FilterConfig,
  filterFactory,
  isLogicalAttributeFilter,
  isTextFilter,
  LogicalAttributeFilter,
  TextFilter,
} from '@sisense/sdk-data';

import {
  CRITERIA_FILTER_MAP,
  FilterOption,
  filterToDefaultValues,
  filterToOption,
} from '@/domains/filters/components/criteria-filter-tile/criteria-filter-operations.js';
import { isSameAttribute } from '@/shared/utils/filters.js';

/**
 * Identifies a string comparison operator shown in the Condition filter control.
 *
 * Matches the filter-editor text condition list, excluding ranking operators
 * (`Top` / `Bottom`) and the members exclude flow.
 * @example
 * ```ts
 * const op: TextConditionOp = 'contains';
 * ```
 * @internal
 */
export type TextConditionOp =
  | 'contains'
  | 'not-contains'
  | 'starts-with'
  | 'not-starts-with'
  | 'ends-with'
  | 'not-ends-with'
  | 'equals'
  | 'not-equals'
  | 'empty'
  | 'not-empty';

/**
 * Describes whether a {@link TextConditionOp} requires a value field.
 *
 * - `text` — operator needs a free-text operand (for example `contains`).
 * - `none` — operator is self-contained (for example `empty`).
 * @internal
 */
export type TextConditionShape = 'text' | 'none';

/**
 * Logical connector shared by every row in a chained text condition.
 *
 * Stored as the runtime token (`AND` / `OR`) and localized at display time.
 * @internal
 */
export type TextConditionConnector = 'AND' | 'OR';

/**
 * Catalogue entry for one selectable string condition operator.
 * @internal
 */
export type TextConditionOperator = {
  /** Operator id passed to mapping helpers. */
  id: TextConditionOp;
  /** i18n key under `filterEditor.conditions.*`. */
  labelKey: string;
  /** Whether the operator needs a value field. */
  shape: TextConditionShape;
};

/** Product order — same ten as filter-widget-components TEXT_OPERATORS. */
export const TEXT_CONDITION_OPERATORS: readonly TextConditionOperator[] = [
  { id: 'contains', labelKey: 'filterEditor.conditions.contains', shape: 'text' },
  { id: 'not-contains', labelKey: 'filterEditor.conditions.notContain', shape: 'text' },
  { id: 'starts-with', labelKey: 'filterEditor.conditions.startsWith', shape: 'text' },
  { id: 'not-starts-with', labelKey: 'filterEditor.conditions.notStartsWith', shape: 'text' },
  { id: 'ends-with', labelKey: 'filterEditor.conditions.endsWith', shape: 'text' },
  { id: 'not-ends-with', labelKey: 'filterEditor.conditions.notEndsWith', shape: 'text' },
  { id: 'equals', labelKey: 'filterEditor.conditions.equals', shape: 'text' },
  { id: 'not-equals', labelKey: 'filterEditor.conditions.notEquals', shape: 'text' },
  { id: 'empty', labelKey: 'filterEditor.conditions.isEmpty', shape: 'none' },
  { id: 'not-empty', labelKey: 'filterEditor.conditions.isNotEmpty', shape: 'none' },
] as const;

/**
 * Operators a chained row may use — every text comparison plus Is empty /
 * Is not empty. Same set as the primary catalogue for string.
 */
export const TEXT_CHAIN_OPERATORS: readonly TextConditionOperator[] = TEXT_CONDITION_OPERATORS;

/**
 * One chained condition row after the primary {@link TextConditionDraft} row.
 * @internal
 */
export type TextConditionRow = {
  /** Stable row id used for updates and removal. */
  id: string;
  /** Comparison operator for the row. */
  op: TextConditionOp;
  /** Operand when the operator shape is `text`; otherwise ignored. */
  text: string;
};

/**
 * In-memory edit state for a string Condition filter before Apply publishes it.
 *
 * The primary row (`op` / `text`) plus optional chained rows in `extra`. One
 * {@link TextConditionDraft.connector} value applies to the whole chain.
 * @example
 * ```ts
 * const draft: TextConditionDraft = {
 *   op: 'contains',
 *   text: 'cardio',
 *   connector: 'AND',
 *   extra: [{ id: 'row-1', op: 'ends-with', text: 'logy' }],
 * };
 * ```
 * @internal
 */
export type TextConditionDraft = {
  /** Primary comparison operator. */
  op: TextConditionOp;
  /** Primary operand when the operator shape is `text`. */
  text: string;
  /** Logical connector shared by every row in `extra`. */
  connector: TextConditionConnector;
  /** Additional chained rows after the primary row. */
  extra: TextConditionRow[];
};

let nextRowSeq = 0;

/** Stable id for a new chained row (survives edits; not an index). */
export function newTextConditionRowId(): string {
  nextRowSeq += 1;
  return `row-${nextRowSeq}`;
}

export function defaultTextConditionDraft(): TextConditionDraft {
  return { op: TEXT_CONDITION_OPERATORS[0].id, text: '', connector: 'AND', extra: [] };
}

export function operatorOf(op: TextConditionOp): TextConditionOperator {
  return TEXT_CONDITION_OPERATORS.find((entry) => entry.id === op) ?? TEXT_CONDITION_OPERATORS[0];
}

/** Text / none shapes accept `+ Add condition`. */
export function isTextConditionChainable(shape: TextConditionShape | null | undefined): boolean {
  return shape === 'text' || shape === 'none';
}

/** Primary row alone is filled — ignores the chain (gates Add / primary error). */
export function isTextConditionPrimaryFilled(draft: TextConditionDraft): boolean {
  const shape = operatorOf(draft.op).shape;
  if (shape === 'none') return true;
  return draft.text.trim() !== '';
}

/** Whole filter is ready to publish — primary + every chained row. */
export function isTextConditionComplete(draft: TextConditionDraft): boolean {
  if (!isTextConditionPrimaryFilled(draft)) return false;
  return draft.extra.every((row) => {
    if (operatorOf(row.op).shape === 'none') return true;
    return row.text.trim() !== '';
  });
}

function summarisePrimary(
  draft: Pick<TextConditionDraft, 'op' | 'text'>,
  labelOf: (op: TextConditionOp) => string,
): string | undefined {
  const shape = operatorOf(draft.op).shape;
  if (shape === 'none') return labelOf(draft.op);
  if (draft.text.trim() === '') return undefined;
  return `${labelOf(draft.op)} ${draft.text}`;
}

function chainRowLine(
  row: TextConditionRow,
  connector: TextConditionConnector,
  labelOf: (op: TextConditionOp) => string,
  /** When true, blank values render as `…` (open draft). Closed summaries omit incomplete filters. */
  allowEllipsis: boolean,
): string {
  const label = labelOf(row.op);
  if (operatorOf(row.op).shape === 'none') return `${connector} ${label}`;
  const value = row.text.trim() || (allowEllipsis ? '…' : '');
  const suffix = value ? ` ${value}` : '';
  return `${connector} ${label}${suffix}`;
}

/**
 * Returns closed-trigger tooltip lines for a complete text condition.
 *
 * Incomplete drafts return `[]` so the placeholder (`Set filter`) shows instead.
 * The hover tooltip uses these lines as-is; the box joins them with spaces.
 * @param draft - Text condition draft
 * @param labelOf - Resolves the localized operator label
 * @returns One non-abbreviated line per condition, or an empty array for an incomplete draft.
 * @internal
 */
export function describeTextCondition(
  draft: TextConditionDraft,
  labelOf: (op: TextConditionOp) => string,
): readonly string[] {
  if (!isTextConditionComplete(draft)) return [];
  const head = summarisePrimary(draft, labelOf);
  if (!head) return [];
  if (draft.extra.length === 0) return [head];
  return [head, ...draft.extra.map((row) => chainRowLine(row, draft.connector, labelOf, false))];
}

/**
 * Closed-trigger sentence. Incomplete drafts return `undefined` so the placeholder
 * (`Set filter`) shows instead. A finished chain joins rows with spaces.
 */
export function summariseTextCondition(
  draft: TextConditionDraft,
  labelOf: (op: TextConditionOp) => string,
): string | undefined {
  const lines = describeTextCondition(draft, labelOf);
  return lines.length === 0 ? undefined : lines.join(' ');
}

/**
 * Open-panel trigger wording — shows unfinished rows with `…` rather than withholding.
 */
export function summariseTextConditionDraft(
  draft: TextConditionDraft,
  labelOf: (op: TextConditionOp) => string,
): string | undefined {
  const head = summarisePrimary(draft, labelOf) ?? (draft.op ? labelOf(draft.op) : undefined);
  if (!head) return undefined;
  if (draft.extra.length === 0) return head;
  return [
    head,
    ...draft.extra.map((row) => chainRowLine(row, draft.connector, labelOf, true)),
  ].join(' ');
}

const OP_TO_FILTER_OPTION: Record<Exclude<TextConditionOp, 'empty' | 'not-empty'>, string> = {
  contains: FilterOption.CONTAINS,
  'not-contains': FilterOption.NOT_CONTAIN,
  'starts-with': FilterOption.STARTS_WITH,
  'not-starts-with': FilterOption.NOT_STARTS_WITH,
  'ends-with': FilterOption.ENDS_WITH,
  'not-ends-with': FilterOption.NOT_ENDS_WITH,
  equals: FilterOption.EQUALS_TEXT,
  'not-equals': FilterOption.NOT_EQUALS_TEXT,
};

const FILTER_OPTION_TO_OP: Partial<Record<string, TextConditionOp>> = {
  [FilterOption.CONTAINS]: 'contains',
  [FilterOption.NOT_CONTAIN]: 'not-contains',
  [FilterOption.STARTS_WITH]: 'starts-with',
  [FilterOption.NOT_STARTS_WITH]: 'not-starts-with',
  [FilterOption.ENDS_WITH]: 'ends-with',
  [FilterOption.NOT_ENDS_WITH]: 'not-ends-with',
  [FilterOption.EQUALS_TEXT]: 'equals',
  [FilterOption.NOT_EQUALS_TEXT]: 'not-equals',
};

function leafDraftToFilter(
  attribute: Attribute,
  op: TextConditionOp,
  text: string,
  config?: FilterConfig,
): Filter {
  if (op === 'empty') {
    return CRITERIA_FILTER_MAP[FilterOption.EQUALS_TEXT]!.fn(attribute, '', config);
  }
  if (op === 'not-empty') {
    return CRITERIA_FILTER_MAP[FilterOption.NOT_EQUALS_TEXT]!.fn(attribute, '', config);
  }
  const option = OP_TO_FILTER_OPTION[op];
  return CRITERIA_FILTER_MAP[option]!.fn(attribute, text, config);
}

/**
 * Builds a TextFilter or LogicalAttributeFilter from a complete draft.
 * Empty / not-empty map to equals '' / doesn'tEqual '' — same as the filter editor.
 * AND → intersection, OR → union (JAQL `{ and|or: [...] }`).
 */
export function textConditionToFilter(
  attribute: Attribute,
  draft: TextConditionDraft,
  config?: FilterConfig,
): Filter {
  const primary = leafDraftToFilter(attribute, draft.op, draft.text, config);
  if (draft.extra.length === 0) return primary;

  const parts: Filter[] = [
    primary,
    ...draft.extra.map((row) => leafDraftToFilter(attribute, row.op, row.text)),
  ];

  return draft.connector === 'OR'
    ? filterFactory.union(parts, config)
    : filterFactory.intersection(parts, config);
}

function textFilterToLeafDraft(filter: TextFilter): Pick<TextConditionDraft, 'op' | 'text'> | null {
  let option: string;
  try {
    option = filterToOption(filter);
  } catch {
    return null;
  }

  const value = String(filterToDefaultValues(filter)[0] ?? '');

  if (option === FilterOption.EQUALS_TEXT && value === '') {
    return { op: 'empty', text: '' };
  }
  if (option === FilterOption.NOT_EQUALS_TEXT && value === '') {
    return { op: 'not-empty', text: '' };
  }

  const op = FILTER_OPTION_TO_OP[option];
  if (!op) return null;
  return { op, text: value };
}

function leafFilterToDraft(filter: Filter): Pick<TextConditionDraft, 'op' | 'text'> | null {
  if (!isTextFilter(filter)) return null;
  return textFilterToLeafDraft(filter);
}

function isEditableTextConditionLeaf(filter: Filter): boolean {
  if (!isTextFilter(filter)) return false;
  try {
    const option: string = filterToOption(filter);
    const value = filterToDefaultValues(filter)[0];
    if (option === FilterOption.EQUALS_TEXT || option === FilterOption.NOT_EQUALS_TEXT) {
      return value !== undefined;
    }
    return FILTER_OPTION_TO_OP[option] !== undefined && value !== undefined;
  } catch {
    return false;
  }
}

function logicalChainConnector(
  operator: LogicalAttributeFilter['operator'],
): TextConditionConnector | null {
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
 * Reads a TextFilter or LogicalAttributeFilter into a draft. Unsupported filters
 * yield the default empty draft (closed trigger stays on Set filter).
 */
export function filterToTextConditionDraft(filter: Filter | null | undefined): TextConditionDraft {
  if (!filter || !isEditableTextConditionFilter(filter)) {
    return defaultTextConditionDraft();
  }

  if (isLogicalAttributeFilter(filter)) {
    const logical = filter;
    const parts = logical.filters ?? [];
    const leaves = parts.map(leafFilterToDraft);
    const connector = logicalChainConnector(logical.operator);
    type LeafDraft = { op: TextConditionOp; text: string };
    const isLeaf = (leaf: LeafDraft | null): leaf is LeafDraft => leaf !== null;
    if (!connector || leaves.length === 0 || !leaves.every(isLeaf)) {
      return defaultTextConditionDraft();
    }

    const [head, ...rest] = leaves;
    return {
      op: head.op,
      text: head.text,
      connector,
      extra: rest.map((leaf) => ({
        id: newTextConditionRowId(),
        op: leaf.op,
        text: leaf.text,
      })),
    };
  }

  if (!isTextFilter(filter)) return defaultTextConditionDraft();
  const leaf = textFilterToLeafDraft(filter);
  if (!leaf) return defaultTextConditionDraft();
  return { ...leaf, connector: 'AND', extra: [] };
}

/**
 * Checks whether the linked filter is a text condition (single or flat AND/OR) this control
 * can edit. Mixed-attribute chains are rejected — Apply would rewrite every leaf onto
 * the widget attribute.
 */
export function isEditableTextConditionFilter(filter: Filter | null | undefined): filter is Filter {
  if (!filter) return false;

  if (isLogicalAttributeFilter(filter)) {
    const logical = filter;
    if (!logicalChainConnector(logical.operator)) return false;
    const parts = logical.filters;
    return (
      Array.isArray(parts) &&
      parts.length > 0 &&
      logicalLeavesShareAttribute(parts) &&
      parts.every((part) => isEditableTextConditionLeaf(part))
    );
  }

  return isEditableTextConditionLeaf(filter);
}
