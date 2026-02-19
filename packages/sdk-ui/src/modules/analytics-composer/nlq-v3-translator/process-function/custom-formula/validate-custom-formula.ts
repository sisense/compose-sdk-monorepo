/**
 * Custom Formula Validation Utilities
 *
 * This module provides validation functions specifically for measureFactory.customFormula
 * to ensure that bracket references in formulas match the provided context keys.
 */
import { JSONValue } from '@sisense/sdk-data';

import { DIMENSIONAL_NAME_PREFIX, isFunctionCall } from '../../types.js';

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
}

/**
 * Regular expression pattern for matching bracket references in formulas.
 * Matches [identifier] where identifier can contain letters, numbers, underscores, dots, dashes
 * and must start with a letter or underscore.
 */
const BRACKET_REFERENCE_PATTERN = /\[([a-zA-Z_][a-zA-Z0-9_.-]*)\]/g;

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
  'LARGEST',
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
  // Elasticube – Aggregative
  'CORREL',
  'COVARP',
  'COVAR',
  'SKEWP',
  'SKEW',
  'SLOPE',
]);

/** Regex matching a call to any known aggregative function (e.g. SUM(, AVG(). Case-insensitive. */
const AGGREGATIVE_FUNCTION_CALL_PATTERN = new RegExp(
  `\\b(${Array.from(AGGREGATIVE_FORMULA_FUNCTIONS).join('|')})\\s*\\(`,
  'i',
);

function isContextValueMeasure(value: unknown): boolean {
  if (isFunctionCall(value as JSONValue)) return true;
  if (typeof value === 'string' && value.startsWith(DIMENSIONAL_NAME_PREFIX)) return false;
  if (value && typeof value === 'object' && 'kind' in value) {
    return (value as { kind: string }).kind === 'measure';
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
  const {
    warnUnusedContext = true,
    errorOnUnusedContext = true,
    allowEmptyFormula = false,
    errorPrefix = 'customFormula validation',
  } = options;

  const result: FormulaValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    references: [],
    unusedContextKeys: [],
  };

  // Early validation for empty/whitespace formulas
  if (!formula || formula.trim().length === 0) {
    if (!allowEmptyFormula) {
      result.errors.push(`${errorPrefix}args[1]: Formula cannot be empty`);
      result.isValid = false;
    }
    return result;
  }

  // Validate operator syntax: check for words before bracket references without parentheses
  const operatorPattern = /\b\w+\s*\[/gi;
  const operatorMatch = formula.match(operatorPattern);
  if (operatorMatch) {
    const operator = operatorMatch[0].replace(/\s*\[.*$/, '');
    result.errors.push(
      `${errorPrefix}args[1]: Invalid syntax: '${operator}' - operator cannot be used before bracket reference without parentheses`,
    );
    result.isValid = false;
  }

  // Extract bracket references (matchAll avoids mutable regex state)
  result.references = [
    ...new Set(
      [...formula.matchAll(new RegExp(BRACKET_REFERENCE_PATTERN.source, 'g'))].map((m) => m[1]),
    ),
  ];

  const contextKeys = Object.keys(context);

  // No references: allow empty context and skip further context validation
  if (result.references.length === 0) {
    result.warnings.push(
      `${errorPrefix}args[1]: No bracket references found in formula - ensure this is intentional`,
    );
    return result;
  }

  // References exist: context is required
  if (contextKeys.length === 0) {
    result.errors.push(
      `${errorPrefix}args[2]: Context cannot be empty - custom formulas require context definitions`,
    );
    result.isValid = false;
    return result;
  }

  // Missing references
  const missingReferences = result.references.filter((ref) => !contextKeys.includes(ref));
  if (missingReferences.length > 0) {
    result.isValid = false;
    if (missingReferences.length === 1) {
      result.errors.push(
        `${errorPrefix}args[1]: Reference [${missingReferences[0]}] not found in context. ` +
          `Available keys: ${contextKeys.join(', ')}`,
      );
    } else {
      result.errors.push(
        `${errorPrefix}args[1]: References [${missingReferences.join(
          '], [',
        )}] not found in context. ` + `Available keys: ${contextKeys.join(', ')}`,
      );
    }
  }

  // Aggregate requirement: when there's no aggregative call, refs in context must point to measures
  const hasAggregativeFunctionCall = AGGREGATIVE_FUNCTION_CALL_PATTERN.test(formula);
  if (!hasAggregativeFunctionCall) {
    const refsPointingToRawAttributes = result.references.filter(
      (ref) => ref in context && !isContextValueMeasure(context[ref]),
    );
    if (refsPointingToRawAttributes.length > 0) {
      result.errors.push(
        `${errorPrefix}args[1]: ${formatNonAggregativePhrase(
          getNonAggregativeFunctionNames(formula),
        )}Bracket reference(s) ${formatBracketRefList(
          refsPointingToRawAttributes,
        )} point to raw attributes and must be wrapped in an aggregative function (e.g. SUM, AVG)`,
      );
      result.isValid = false;
    }
  }

  // Unused context keys (warnings or errors)
  if ((warnUnusedContext || errorOnUnusedContext) && contextKeys.length > 0) {
    const unusedKeys = contextKeys.filter((key) => !result.references.includes(key));
    result.unusedContextKeys = unusedKeys;
    if (unusedKeys.length > 0) {
      const message = `${errorPrefix}args[2]: Context keys [${unusedKeys.join(
        ', ',
      )}] are defined but not used in formula`;
      if (errorOnUnusedContext) {
        result.errors.push(message);
        result.isValid = false;
      } else if (warnUnusedContext) {
        result.warnings.push(message);
      }
    }
  }

  return result;
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
