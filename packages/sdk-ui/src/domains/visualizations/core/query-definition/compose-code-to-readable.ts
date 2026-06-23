import type { Attribute, Filter, FilterRelations, Measure, MeasureColumn } from '@sisense/sdk-data';

import type { QueryPillCategory, QueryPillItem } from './types';

/**
 * Query-pill tooltip generation: shows `composeCode` with factory and `DM.` prefixes removed for readability.
 *
 * @internal
 */

/**
 * True when `composeCode` is a single dimensional path (`DM...`) and not a factory/call (`(`).
 * Paths may include `[[Segment With Spaces]]` (sdk-data normalization for non-identifier names);
 * parentheses inside `[[...]]` are ignored for the call-syntax check (e.g. `[[Revenue (USD)]]`).
 *
 * @internal
 */
function isDmAttributePath(composeCode: string): boolean {
  const t = composeCode.trim();
  if (!t.startsWith('DM.')) {
    return false;
  }
  const withoutBracketedSegments = t.replace(/\[\[[^\]]+\]\]/g, '');
  return !withoutBracketedSegments.includes('(');
}

/**
 * Unwraps `[[Name]]` tokens (sdk-data normalization for non-identifier segments) for readable tooltips.
 *
 * @internal
 */
function unwrapDoubleBracketSegments(path: string): string {
  return path.replace(/\[\[([^\]]+)\]\]/g, '$1');
}

/**
 * When `composeCode` is a DM attribute path, returns that path with the leading `DM.` module prefix removed
 * once and `[[...]]` unwrapped. Inner `DM.` segments (e.g. in display names) are left unchanged.
 *
 * @internal
 */
function stripDmModulePrefixFromPath(composeCode: string): string {
  const trimmed = composeCode.trim();
  const withoutDm = trimmed.replace(/^DM\./, '');
  return unwrapDoubleBracketSegments(withoutDm);
}

/**
 * Structured tooltip model produced by {@link getQueryPillTooltipModel}.
 *
 * @sisenseInternal
 */
export type TooltipModel = {
  layoutText: string;
  typeLabel: 'Measure' | 'Dimension' | 'Filter';
  /** Resolved field path or display fallback; may duplicate {@link TooltipModel.formula}. */
  column: string;
  formula: string;
  /** When false, the UI omits the "Column:" row (empty/`-` or same as the pill display name). */
  showColumnInTooltip: boolean;
  /** When false, the UI omits the "Formula:" row (identical to Column, e.g. plain DM dimensions). */
  showFormulaInTooltip: boolean;
};

/**
 * Strips `measureFactory.`, `filterFactory.`, and `DM.` from compose code for tooltip display.
 * Preserves the rest of the string (including quoted literals). Rare titles containing `DM.`
 * inside quotes may be altered.
 *
 * @internal
 */
export function simplifyComposeCodeForTooltip(composeCode: string): string {
  const trimmed = composeCode.trim();
  return trimmed
    .replace(/\bmeasureFactory\./g, '')
    .replace(/\bfilterFactory\./g, '')
    .replace(/\bDM\./g, '');
}

function stringifyTooltipSource(data: unknown): string {
  if (data === undefined) {
    return '';
  }
  try {
    return JSON.stringify(data, (_k, v: unknown) => (typeof v === 'bigint' ? v.toString() : v), 2);
  } catch {
    return String(data);
  }
}

function getPillType(category: QueryPillCategory): 'Measure' | 'Dimension' | 'Filter' {
  if (category === 'measure') {
    return 'Measure';
  }
  if (category === 'dimension') {
    return 'Dimension';
  }
  return 'Filter';
}

function getColumnName(source: Attribute | Measure | FilterRelations | Filter): string | undefined {
  const composeCode =
    (source as Filter).attribute?.composeCode ?? (source as Attribute | Measure).composeCode;
  if (!composeCode) {
    return (source as Attribute | Measure).name;
  }
  const trimmed = composeCode.trim();
  if (isDmAttributePath(trimmed)) {
    return stripDmModulePrefixFromPath(trimmed);
  }
  return (source as Attribute | Measure).name;
}

function computeShowColumnInTooltip(column: string, layoutText: string): boolean {
  const c = column.trim();
  return c !== '' && c !== '-' && c !== layoutText.trim();
}

function computeShowFormulaInTooltip(column: string, formula: string): boolean {
  return formula.trim() !== column.trim();
}

/**
 * Builds the structured tooltip model rendered by {@link QueryPill} from a {@link QueryPillItem}.
 * Returns `null` when the item has no tooltip-eligible data (e.g. operator pills or pills without `tooltipData`).
 *
 * @sisenseInternal
 */
export function getQueryPillTooltipModel(item: QueryPillItem): TooltipModel | null {
  if (
    item.tooltipData === undefined ||
    stringifyTooltipSource(item.tooltipData) === '' ||
    item.category === 'operator'
  ) {
    return null;
  }

  const source = item.tooltipData;
  const typeLabel = getPillType(item.category);
  const layoutText =
    'name' in source && source.name !== undefined
      ? (source as Attribute).title ?? source.name
      : item.label;
  const aggregation = (source as MeasureColumn).aggregation;
  const column = getColumnName(source) ?? '-';

  const composeCode = source.composeCode;
  const trimmed = composeCode?.trim() ?? '';
  const aggregationFormula = aggregation ? `${aggregation.toUpperCase()}(${column})` : column;
  let formula = aggregationFormula;
  if (trimmed && /^[a-zA-Z_$][\w.$]*\(/.test(trimmed)) {
    formula = simplifyComposeCodeForTooltip(trimmed);
  }
  const showColumnInTooltip = computeShowColumnInTooltip(column, layoutText);
  const showFormulaInTooltip = computeShowFormulaInTooltip(column, formula);
  return {
    layoutText,
    typeLabel,
    column,
    formula,
    showColumnInTooltip,
    showFormulaInTooltip,
  };
}
