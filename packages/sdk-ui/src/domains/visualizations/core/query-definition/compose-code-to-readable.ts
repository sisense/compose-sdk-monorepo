import type {
  Attribute,
  Filter,
  FilterRelations,
  FunctionCall,
  Measure,
  MeasureColumn,
} from '@sisense/sdk-data';
import { parseComposeCodeToFunctionCall } from '@sisense/sdk-data';

import type { QueryPillCategory, QueryPillItem } from './types';

/**
 * Query-pill tooltip generation: parses compose code with {@link parseComposeCodeToFunctionCall}
 * and formats {@link FunctionCall} trees into short readable formulas.
 *
 * @internal
 */

const DM_PATH_ONLY = /^DM\.[\w.]+$/;

export type TooltipModel = {
  layoutText: string;
  typeLabel: 'Measure' | 'Dimension' | 'Filter';
  column: string;
  formula: string;
};

function dmPathLeaf(token: string): string | undefined {
  const t = token.trim();
  if (!t.startsWith('DM.') || !DM_PATH_ONLY.test(t)) {
    return undefined;
  }
  const parts = t.split('.');
  return parts.length >= 3 ? parts[parts.length - 1] : undefined;
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
  const leaf = dmPathLeaf(composeCode);
  return leaf ?? (source as Attribute | Measure).name;
}

function formatArgForFunctionCall(arg: unknown, ignoreArgs: string[]): string {
  if (arg === null) {
    return 'null';
  }
  if (arg === undefined) {
    return 'undefined';
  }
  if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean') {
    return String(arg);
  }
  if (typeof arg === 'bigint') {
    return arg.toString();
  }
  if ((arg as FunctionCall)?.function) {
    return functionCallToString(arg as FunctionCall, ignoreArgs);
  }
  if (Array.isArray(arg)) {
    return `[${arg.map((v) => formatArgForFunctionCall(v, ignoreArgs)).join(',')}]`;
  }
  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

/** @internal */
export function functionCallToString(
  functionCall: FunctionCall,
  ignoreArgs: string[] = [],
): string {
  const leaf = (s: string) => s?.split && (s.split('.').pop() ?? '');
  if (!Array.isArray(functionCall.args)) return '???';
  const args = functionCall.args.filter((arg) => {
    return typeof arg !== 'string' || !ignoreArgs.includes(leaf(arg));
  });

  return (
    leaf(functionCall.function) +
    '(' +
    args.map((arg) => formatArgForFunctionCall(arg, ignoreArgs)).join(', ') +
    ')'
  );
}

/** @internal */
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
  const layoutText = (source as Attribute).name ?? item.label;
  const aggregation = (source as MeasureColumn).aggregation;
  const column = getColumnName(source) ?? '-';

  const composeCode = (source as FilterRelations | Filter).composeCode;
  const aggregationFormula = aggregation ? `${aggregation.toUpperCase()}(${column})` : column;
  let formula = aggregationFormula;
  if (composeCode && /^[a-zA-Z_$][\w.$]*\(/.test(composeCode)) {
    try {
      formula = functionCallToString(parseComposeCodeToFunctionCall(composeCode), [column]);
    } catch {
      formula = aggregationFormula;
    }
  }
  return {
    layoutText,
    typeLabel,
    column,
    formula,
  };
}
