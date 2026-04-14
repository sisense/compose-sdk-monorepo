/**
 * Custom Formula Validation Utilities
 *
 * This module provides validation functions specifically for measureFactory.customFormula
 * to ensure that bracket references in formulas match the provided context keys.
 */
import { findMatchingCloseParen, isDatetime, splitAtDepthZero } from '@sisense/sdk-data';

import { DIMENSIONAL_NAME_PREFIX, isFunctionCall, isRecordStringUnknown } from '../../../types.js';
import type { SchemaIndex } from '../../utils/schema-index.js';
import { parseDimensionalName } from '../../utils/schema-index.js';
import {
  formatFormulaFunctionArityMessage,
  FORMULA_FUNCTION_SCHEMAS,
  getRequiredDateLevel,
  getXDiffFormulaFunctions,
  UNSUPPORTED_FORMULA_FUNCTIONS,
} from '../formula-function-schemas.js';

export interface FormulaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  references: string[];
  unusedContextKeys: string[];
}

export interface FormulaValidationOptions {
  /** Whether to warn about unused context keys (default: true) */
  warnUnusedContext?: boolean;
  /** Whether to treat unused context keys as errors instead of warnings (default: true) */
  errorOnUnusedContext?: boolean;
  /** Whether to allow empty formulas (default: false) */
  allowEmptyFormula?: boolean;
  /** Custom error message prefix for better context */
  errorPrefix?: string;
  /** When provided, xdiff args are validated as datetime dimensions and level-matched */
  schemaIndex?: SchemaIndex;
}

/**
 * Regular expression pattern for matching bracket references in formulas.
 * Matches [identifier] where identifier can contain letters, numbers, underscores, dots, dashes.
 * Allows identifiers starting with numbers (e.g. [124E5-B6F]) for Fusion/generated IDs.
 */
const BRACKET_REFERENCE_PATTERN = /\[(\w[\w.-]*)\]/g;

/**
 * Sisense formula function names that create aggregations (per functions.md).
 * Only these satisfy the "every measure must be aggregative" rule when formulas
 * contain bracket references to raw attributes.
 */
const AGGREGATIVE_FORMULA_FUNCTIONS = new Set([
  // Universal – Aggregative (per Sisense doc: (A) only; Statistical CONTRIBUTION, PERCENTILE, etc. are non-aggregative)
  'AVG',
  'COUNT',
  'DUPCOUNT',
  'MAX',
  'MEDIAN',
  'MIN',
  'MODE',
  'SUM',
  // Universal – Time-to-date (WTD/MTD/QTD/YTD)
  'WTDAVG',
  'WTDSUM',
  'MTDAVG',
  'MTDSUM',
  'QTDAVG',
  'QTDSUM',
  'YTDAVG',
  'YTDSUM',
  // RAVG, RSUM are non-aggregative per Sisense doc (Other Functions, not (A))
  // CORREL, COVAR*, SKEW*, SLOPE, LARGEST are unsupported in custom formulas (see UNSUPPORTED_FORMULA_FUNCTIONS).
]);

/** Regex matching a call to any known aggregative function (e.g. SUM(, AVG(). Case-insensitive. */
const AGGREGATIVE_FUNCTION_CALL_PATTERN = new RegExp(
  `\\b(${Array.from(AGGREGATIVE_FORMULA_FUNCTIONS).join('|')})\\s*\\(`,
  'i',
);

function isContextValueMeasure(value: unknown): boolean {
  if (isFunctionCall(value)) return true;
  if (typeof value === 'string' && value.startsWith(DIMENSIONAL_NAME_PREFIX)) return false;
  if (isRecordStringUnknown(value) && 'kind' in value) {
    return value.kind === 'measure';
  }
  return true; // unknown: treat as measure (lenient)
}

function getNonAggregativeFunctionNames(formula: string): string[] {
  const re = /\b(\w+)\s*\(/g;
  const names = new Set<string>();
  let match;
  while ((match = re.exec(formula)) !== null) {
    const name = match[1];
    if (!AGGREGATIVE_FORMULA_FUNCTIONS.has(name.toUpperCase())) {
      names.add(name);
    }
  }
  return Array.from(names);
}

function formatBracketRefList(refs: string[]): string {
  return refs.length === 1 ? `[${refs[0]}]` : refs.map((r) => `[${r}]`).join(', ');
}

function formatNonAggregativePhrase(names: string[]): string {
  if (names.length === 0) return '';
  return names.length === 1
    ? `${names[0]} is not an aggregative function. `
    : `${names.join(', ')} are not aggregative functions. `;
}

/** Normalizes key to bracket format, consistent with measureFactory.customFormula. */
const toBracketKey = (k: string) => (k.startsWith('[') ? k : `[${k}]`);

/** Strips brackets for display to avoid [[key]] in error messages. */
const toDisplayKey = (k: string) => (k.startsWith('[') && k.endsWith(']') ? k.slice(1, -1) : k);

export interface TimeDiffCall {
  functionName: string;
  ref1: string;
  ref2: string;
}

/**
 * Extracts xdiff (or other two-arg bracket) calls from a formula string.
 * Matches FUNC([ref1], [ref2]) for each function name in the set (case-insensitive).
 */
export function parseXDiffCalls(formula: string, functionNames: readonly string[]): TimeDiffCall[] {
  if (functionNames.length === 0) return [];
  const escaped = functionNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const pattern = new RegExp(
    `\\b(${escaped})\\s*\\(\\s*\\[([^\\]]+)\\]\\s*,\\s*\\[([^\\]]+)\\]\\s*\\)`,
    'gi',
  );
  return [...formula.matchAll(pattern)].map((match) => ({
    functionName: match[1].toUpperCase(),
    ref1: match[2].trim(),
    ref2: match[3].trim(),
  }));
}

// ── Internal validation context shared across validator functions ──

interface ValidatorCtx {
  formula: string;
  context: Record<string, unknown>;
  contextKeys: string[];
  canonicalContextKeys: Set<string>;
  errorPrefix: string;
  warnUnusedContext: boolean;
  errorOnUnusedContext: boolean;
  schemaIndex?: SchemaIndex;
  result: FormulaValidationResult;
}

function buildValidatorCtx(
  formula: string,
  context: Record<string, unknown>,
  options: FormulaValidationOptions,
): ValidatorCtx {
  const contextKeys = Object.keys(context);
  // Normalize: trim and ensure trailing space when non-empty so "args[1]" is separated
  const raw = (options.errorPrefix ?? 'customFormula validation').trim();
  const errorPrefix = raw === '' ? '' : raw.endsWith(' ') ? raw : `${raw} `;
  return {
    formula,
    context,
    contextKeys,
    canonicalContextKeys: new Set(contextKeys.map(toBracketKey)),
    errorPrefix,
    warnUnusedContext: options.warnUnusedContext ?? true,
    errorOnUnusedContext: options.errorOnUnusedContext ?? true,
    schemaIndex: options.schemaIndex,
    result: { isValid: true, errors: [], warnings: [], references: [], unusedContextKeys: [] },
  };
}

function addError(ctx: ValidatorCtx, message: string): void {
  ctx.result.errors.push(message);
  ctx.result.isValid = false;
}

// ── Individual validator functions ──

const CASE_EXPRESSION_KEYWORDS = new Set(['CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AND', 'OR']);

function validateOperatorSyntax(ctx: ValidatorCtx): void {
  const operatorPattern = /\b(\w+)\s*\[/gi;
  const invalidMatch = [...ctx.formula.matchAll(operatorPattern)].find(
    (m) => !CASE_EXPRESSION_KEYWORDS.has(m[1].toUpperCase()),
  );
  if (invalidMatch) {
    addError(
      ctx,
      `${ctx.errorPrefix}args[1]: Invalid syntax: '${invalidMatch[1]}' - operator cannot be used before bracket reference without parentheses`,
    );
  }
}

/** Advances past a single- or double-quoted string starting at `start` (index of opening quote). */
function skipQuotedString(formula: string, start: number): number {
  const q = formula[start];
  let i = start + 1;
  while (i < formula.length) {
    const char = formula[i];
    const next = formula[i + 1];
    if (char !== q) {
      i++;
      continue;
    }
    if (next === q) {
      i += 2;
      continue;
    }
    return i + 1;
  }
  return formula.length;
}

export interface FormulaParenCall {
  readonly name: string;
  readonly argCount: number;
}

function countCommaSeparatedArgs(argsStr: string): number {
  return splitAtDepthZero(argsStr, ',').filter((s) => s.trim().length > 0).length;
}

/**
 * After an identifier ending at `i`, skips whitespace; if the next char is `(`, records the call
 * and recurses into the argument list. Returns the index to resume scanning from.
 */
function consumeParenCallsAfterIdent(
  formula: string,
  i: number,
  rawName: string,
  calls: FormulaParenCall[],
): number {
  while (i < formula.length && /\s/.test(formula[i])) {
    i++;
  }
  if (formula[i] !== '(') {
    return i;
  }
  const open = i;
  const close = findMatchingCloseParen(formula, open);
  if (close === -1) {
    return open + 1;
  }
  const argsStr = formula.slice(open + 1, close);
  calls.push({ name: rawName.toUpperCase(), argCount: countCommaSeparatedArgs(argsStr) });
  calls.push(...extractParenFunctionCalls(argsStr));
  return close + 1;
}

/**
 * Finds all `IDENT(` calls in a formula, outside quoted strings, with comma-separated arg counts
 * (nesting-aware, same rules as {@link splitAtDepthZero}). Recurses into argument lists so nested
 * calls (e.g. `SUM(MAX([a]))`) are included.
 *
 * @internal Exported for unit tests
 */
export function extractParenFunctionCalls(formula: string): FormulaParenCall[] {
  const calls: FormulaParenCall[] = [];
  let i = 0;
  while (i < formula.length) {
    const char = formula[i];
    if (char === "'" || char === '"') {
      i = skipQuotedString(formula, i);
      continue;
    }
    if (/[A-Za-z_]/.test(char)) {
      const nameStart = i;
      i++;
      while (i < formula.length && /[A-Za-z0-9_]/.test(formula[i])) {
        i++;
      }
      const rawName = formula.slice(nameStart, i);
      i = consumeParenCallsAfterIdent(formula, i, rawName, calls);
      continue;
    }
    i++;
  }
  return calls;
}

/**
 * Rejects unsupported engine functions and validates arity for registered formula functions.
 * Runs before aggregative checks so unsupported statistical functions do not suggest wrapping in SUM/AVG.
 */
function validateUnsupportedAndFormulaArity(ctx: ValidatorCtx): void {
  const calls = extractParenFunctionCalls(ctx.formula);
  const unsupportedReported = new Set<string>();
  const arityReported = new Set<string>();

  for (const { name, argCount } of calls) {
    if (UNSUPPORTED_FORMULA_FUNCTIONS.has(name)) {
      if (!unsupportedReported.has(name)) {
        unsupportedReported.add(name);
        addError(
          ctx,
          `${ctx.errorPrefix}args[1]: Function ${name} is not supported in custom formulas`,
        );
      }
      continue;
    }

    const meta = FORMULA_FUNCTION_SCHEMAS[name];
    if (!meta) continue;

    if ((argCount < meta.minArgs || argCount > meta.maxArgs) && !arityReported.has(name)) {
      arityReported.add(name);
      const range = formatFormulaFunctionArityMessage(meta.minArgs, meta.maxArgs);
      addError(ctx, `${ctx.errorPrefix}args[1]: Function ${name} accepts ${range}`);
    }
  }
}

function extractBracketReferences(formula: string): string[] {
  return [
    ...new Set(
      [...formula.matchAll(new RegExp(BRACKET_REFERENCE_PATTERN.source, 'g'))].map((m) => m[1]),
    ),
  ];
}

function validateMissingReferences(ctx: ValidatorCtx): void {
  const missing = ctx.result.references.filter(
    (ref) => !ctx.canonicalContextKeys.has(toBracketKey(ref)),
  );
  if (missing.length === 0) return;

  const available = ctx.contextKeys.map((k) => `[${toDisplayKey(k)}]`).join(', ');
  const refDisplay =
    missing.length === 1 ? `Reference [${missing[0]}]` : `References [${missing.join('], [')}]`;
  addError(
    ctx,
    `${ctx.errorPrefix}args[1]: ${refDisplay} not found in context. Available keys: ${available}`,
  );
}

function validateAggregativeRequirement(ctx: ValidatorCtx): void {
  if (AGGREGATIVE_FUNCTION_CALL_PATTERN.test(ctx.formula)) return;

  const rawAttrRefs = ctx.result.references.filter((ref) => {
    const value = ctx.context[toBracketKey(ref)] ?? ctx.context[ref];
    return value !== undefined && !isContextValueMeasure(value);
  });
  if (rawAttrRefs.length === 0) return;

  addError(
    ctx,
    `${ctx.errorPrefix}args[1]: ${formatNonAggregativePhrase(
      getNonAggregativeFunctionNames(ctx.formula),
    )}Bracket reference(s) ${formatBracketRefList(
      rawAttrRefs,
    )} point to raw attributes and must be wrapped in an aggregative function (e.g. SUM, AVG)`,
  );
}

function validateUnusedContextKeys(ctx: ValidatorCtx): void {
  if (!ctx.warnUnusedContext && !ctx.errorOnUnusedContext) return;
  if (ctx.contextKeys.length === 0) return;

  const canonicalRefs = new Set(ctx.result.references.map(toBracketKey));
  const unusedKeys = ctx.contextKeys.filter((key) => !canonicalRefs.has(toBracketKey(key)));
  ctx.result.unusedContextKeys = unusedKeys;
  if (unusedKeys.length === 0) return;

  const display = unusedKeys.map((k) => `[${toDisplayKey(k)}]`).join(', ');
  const message = `${ctx.errorPrefix}args[2]: Context keys ${display} are defined but not used in formula`;
  if (ctx.errorOnUnusedContext) {
    addError(ctx, message);
  } else if (ctx.warnUnusedContext) {
    ctx.result.warnings.push(message);
  }
}

function validateTimeDiffRef(
  ref: string,
  call: TimeDiffCall,
  requiredLevel: string | undefined,
  ctx: ValidatorCtx,
): void {
  const value = ctx.context[toBracketKey(ref)] ?? ctx.context[ref];
  if (value === undefined) return; // already reported as missing ref

  const isAttributeString = typeof value === 'string' && value.startsWith(DIMENSIONAL_NAME_PREFIX);

  if (!isAttributeString) {
    if (isContextValueMeasure(value)) {
      addError(
        ctx,
        `${ctx.errorPrefix}args[1]: ${call.functionName} requires datetime dimension attributes. Reference [${ref}] points to a measure; use an attribute (e.g. ${DIMENSIONAL_NAME_PREFIX}Table.Column.Level).`,
      );
    }
    return;
  }

  if (!ctx.schemaIndex) return;

  try {
    const parsed = parseDimensionalName(value, ctx.schemaIndex);
    if (!isDatetime(parsed.column.dataType)) {
      addError(
        ctx,
        `${ctx.errorPrefix}args[1]: ${call.functionName} requires datetime dimensions. Reference [${ref}] resolves to non-datetime column '${parsed.column.name}'.`,
      );
    } else if (requiredLevel && parsed.level && parsed.level !== requiredLevel) {
      addError(
        ctx,
        `${ctx.errorPrefix}args[1]: ${call.functionName} expects date level '${requiredLevel}'. Reference [${ref}] has level '${parsed.level}'.`,
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    addError(ctx, `${ctx.errorPrefix}args[1]: ${call.functionName} reference [${ref}]: ${msg}`);
  }
}

function validateTimeDiffCalls(ctx: ValidatorCtx): void {
  const timeDiffNames = getXDiffFormulaFunctions();
  const calls = parseXDiffCalls(ctx.formula, timeDiffNames);
  for (const call of calls) {
    const requiredLevel = getRequiredDateLevel(call.functionName);
    validateTimeDiffRef(call.ref1, call, requiredLevel, ctx);
    validateTimeDiffRef(call.ref2, call, requiredLevel, ctx);
  }
}

// ── Main validation function ──

/**
 * Validates that all bracket references in a custom formula exist in the provided context
 * and provides helpful error messages for debugging.
 *
 * Empty context is allowed when the formula contains no bracket references (e.g., MOD(10, 7)).
 * Context is required only when the formula contains bracket references.
 *
 * @example
 * ```typescript
 * const result = validateFormulaReferences(
 *   '([totalRevenue] - SUM([cost])) / [totalRevenue]',
 *   { totalRevenue: measureFactory.sum(DM.Revenue), cost: DM.Cost }
 * );
 *
 * if (!result.isValid) {
 *   throw new Error(result.errors.join('; '));
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Empty context is allowed when no bracket references exist
 * const result = validateFormulaReferences('MOD(10, 7)', {});
 * // result.isValid === true
 * ```
 *
 * @param formula - The formula string containing bracket references
 * @param context - The context object mapping keys to attributes/measures/filters
 * @param options - Additional validation options
 * @returns Validation result with errors, warnings, and analysis
 */
export function validateFormulaReferences(
  formula: string,
  context: Record<string, unknown>,
  options: FormulaValidationOptions = {},
): FormulaValidationResult {
  const ctx = buildValidatorCtx(formula, context, options);

  // Early exit: empty/whitespace formula
  if (!formula || formula.trim().length === 0) {
    if (!(options.allowEmptyFormula ?? false)) {
      addError(ctx, `${ctx.errorPrefix}args[1]: Formula cannot be empty`);
    }
    return ctx.result;
  }

  validateOperatorSyntax(ctx);
  validateUnsupportedAndFormulaArity(ctx);

  ctx.result.references = extractBracketReferences(formula);

  // No references: skip context validation
  if (ctx.result.references.length === 0) {
    ctx.result.warnings.push(
      `${ctx.errorPrefix}args[1]: No bracket references found in formula - ensure this is intentional`,
    );
    return ctx.result;
  }

  // References exist but context is empty
  if (ctx.contextKeys.length === 0) {
    addError(
      ctx,
      `${ctx.errorPrefix}args[2]: Context cannot be empty - custom formulas require context definitions`,
    );
    return ctx.result;
  }

  validateMissingReferences(ctx);
  validateAggregativeRequirement(ctx);
  validateUnusedContextKeys(ctx);
  validateTimeDiffCalls(ctx);

  return ctx.result;
}

/**
 * Wrapper validation function that throws on validation errors.
 * Useful for cases where you want to fail fast with clear error messages.
 *
 * @param formula - The formula string to validate
 * @param context - The context object to validate against
 * @param options - Validation options
 * @throws Error if validation fails
 */
export function validateCustomFormula(
  formula: string,
  context: Record<string, unknown>,
  options: FormulaValidationOptions = {},
): void {
  const result = validateFormulaReferences(formula, context, options);

  if (!result.isValid) {
    throw new Error(result.errors.join('; '));
  }

  // Also log warnings if any (non-blocking)
  if (result.warnings.length > 0) {
    console.warn('Formula validation warnings:', result.warnings.join('; '));
  }
}
