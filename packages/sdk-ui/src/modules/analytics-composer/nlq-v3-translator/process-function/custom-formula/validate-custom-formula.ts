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

  // Extract bracket references using shared regex pattern
  const bracketPattern = BRACKET_REFERENCE_PATTERN;
  const references = new Set<string>();
  let match;

  while ((match = bracketPattern.exec(formula)) !== null) {
    const reference = match[1];
    references.add(reference);
  }

  result.references = Array.from(references);

  const contextKeys = Object.keys(context);

  // Validate aggregate function requirement: formulas with bracket references must contain function calls
  // OR all bracket references must point to measures (function calls) in the context
  if (result.references.length > 0) {
    const functionCallPattern = /\b\w+\s*\(/gi;
    const hasFunctionCalls = functionCallPattern.test(formula);

    // If formula has function calls, it's valid
    if (!hasFunctionCalls) {
      // Check if all bracket references point to raw attributes
      const allReferencesAreAttributes = result.references.every((ref) => {
        // Skip if reference doesn't exist in context (already handled by missing reference check)
        if (!(ref in context)) {
          return false; // Don't count missing references as attributes
        }

        const contextValue = context[ref];

        // Function call → measure (already aggregated)
        if (isFunctionCall(contextValue as JSONValue)) {
          return false;
        }

        // Attribute string (DM. prefix) → raw attribute (needs aggregation)
        if (typeof contextValue === 'string' && contextValue.startsWith(DIMENSIONAL_NAME_PREFIX)) {
          return true;
        }

        // QueryElement with kind → check if it's a measure
        if (contextValue && typeof contextValue === 'object' && 'kind' in contextValue) {
          return (contextValue as { kind: string }).kind !== 'measure';
        }

        // Unknown type → be lenient, don't assume it needs aggregation
        // This handles test mocks and other edge cases
        return false;
      });

      if (allReferencesAreAttributes) {
        result.errors.push(
          `${errorPrefix}args[1]: Formulas with bracket references must contain aggregate function calls`,
        );
        result.isValid = false;
      }
    }
  }

  // If no references found, empty context is allowed
  if (result.references.length === 0) {
    result.warnings.push(
      `${errorPrefix}args[1]: No bracket references found in formula - ensure this is intentional`,
    );
    // Allow empty context when there are no bracket references
    // Skip further context validation
    return result;
  }

  // If references exist, context is required
  if (contextKeys.length === 0) {
    result.errors.push(
      `${errorPrefix}args[2]: Context cannot be empty - custom formulas require context definitions`,
    );
    result.isValid = false;
    return result;
  }

  // Check each reference exists in context
  const missingReferences: string[] = [];

  for (const reference of result.references) {
    if (!contextKeys.includes(reference)) {
      missingReferences.push(reference);
    }
  }

  // Report missing references as errors
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

  // Check for unused context keys (warnings or errors)
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
