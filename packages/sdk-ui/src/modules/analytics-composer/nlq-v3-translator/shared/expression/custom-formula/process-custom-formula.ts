import {
  DIMENSIONAL_NAME_PREFIX,
  FunctionContext,
  isFunctionCall,
  isRecordStringUnknown,
  ProcessedArg,
} from '../../../types.js';
import { createAttributeFromName } from '../../utils/schema-index.js';
import { getRequiredDateLevel, getTimeDiffFormulaFunctions } from '../formula-function-schemas.js';
import { processNode } from '../process-node.js';
import { parseTimeDiffCalls, validateCustomFormula } from './validate-custom-formula.js';

/**
 * Custom processor for measureFactory.customFormula that:
 * - Validates formula bracket references match context keys
 * - Validates all context keys are used in the formula (when context is provided)
 * - Validates context is not empty only when formula contains bracket references
 * - Allows empty context when formula has no bracket references (e.g., MOD(10, 7))
 * - Validates formula is not empty
 * - Transforms context items by executing nested function calls
 * - Converts attribute strings to actual attribute objects
 * - Accepts optional 4th argument (format) and optional 5th argument (description) for LLM context (ignored during processing)
 *
 * @param processedArgs - [title: string, formula: string, context: Record<string, unknown>, format?: string, description?: string]
 * @param context - Processing context with error prefix and other metadata
 * @throws Error with descriptive message if validation fails
 */
export function processCustomFormula(
  processedArgs: ProcessedArg[],
  context: FunctionContext,
): void {
  // Ensure we have the expected number of arguments (should be guaranteed by basic validation)
  // Accept 3, 4, or 5 arguments (4th is optional format, 5th is optional description for LLM context)
  if (processedArgs.length < 3 || processedArgs.length > 5) {
    throw new Error(
      `${context.pathPrefix}Expected 3, 4, or 5 arguments for customFormula (title, formula, context, format?, description?)`,
    );
  }

  const formulaArg = processedArgs[1];
  if (typeof formulaArg !== 'string') {
    throw new Error(
      `${context.pathPrefix}args[1]: Expected formula string, got ${typeof formulaArg}`,
    );
  }
  const formula = formulaArg;

  const contextArg = processedArgs[2];
  if (!isRecordStringUnknown(contextArg)) {
    throw new Error(
      `${context.pathPrefix}args[2]: Expected context object, got ${
        contextArg === null ? 'null' : typeof contextArg
      }`,
    );
  }
  const rawContext = contextArg;

  // 1. First, validate formula references (incl. time-diff datetime/level when schemaIndex available)
  validateCustomFormula(formula, rawContext, {
    errorPrefix: `${context.pathPrefix}`,
    errorOnUnusedContext: true, // Strict validation: all context keys must be used
    allowEmptyFormula: false, // Custom formulas must have content
    schemaIndex: context.schemaIndex,
  });

  // 2. Build ref -> inferred date level from time-diff calls (for refs without level in name)
  const refToInferredLevel = buildRefToInferredDateLevel(formula);

  // 3. Validate and transform each context item
  const processedContext: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rawContext)) {
    const fullArgPath = `args[2].${key}`;

    if (isFunctionCall(value)) {
      // Function call - process using the injected processNode function
      processedContext[`${key}`] = processNode({
        data: value,
        context: {
          dataSource: context.dataSource,
          schemaIndex: context.schemaIndex,
          pathPrefix: fullArgPath,
        },
      });
    } else if (typeof value === 'string' && value.startsWith(DIMENSIONAL_NAME_PREFIX)) {
      // Attribute string - process using createAttributeFromName (with inferred level when ref has no level)
      const normalizedKey = key.startsWith('[') && key.endsWith(']') ? key.slice(1, -1) : key;
      const inferredLevel = refToInferredLevel[normalizedKey];
      try {
        processedContext[`${key}`] = createAttributeFromName(
          value,
          context.dataSource,
          context.schemaIndex,
          inferredLevel !== undefined ? { inferredDateLevel: inferredLevel } : undefined,
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`${fullArgPath}: ${errorMessage}`);
      }
    } else if (value && typeof value === 'object' && 'kind' in value) {
      // Already a QueryElement - use as-is
      processedContext[`${key}`] = value;
    } else {
      // Invalid context value type
      throw new Error(
        `${fullArgPath}: Invalid context value for key '${key}'. ` +
          `Expected a function call or attribute reference (${DIMENSIONAL_NAME_PREFIX}...), ` +
          `but got: ${typeof value}`,
      );
    }
  }

  // 4. Replace rawContext with processedContext in processedArgs[2]
  // This now contains actual QueryElements (Measures, Attributes, etc.)
  processedArgs[2] = processedContext;
}

/**
 * Builds a map from context ref name to required date level for refs used in time-diff calls.
 * Used to infer date level when the dimensional name has no level (e.g. DM.Table.Column -> Days for DDIFF).
 * Throws if the same ref is used in multiple time-diff calls with different required levels.
 */
function buildRefToInferredDateLevel(formula: string): Record<string, string> {
  const timeDiffNames = getTimeDiffFormulaFunctions();
  const calls = parseTimeDiffCalls(formula, timeDiffNames);
  const refToLevel: Record<string, string> = {};
  for (const call of calls) {
    const requiredLevel = getRequiredDateLevel(call.functionName);
    if (requiredLevel === undefined) continue;
    for (const ref of [call.ref1, call.ref2]) {
      const existing = refToLevel[ref];
      if (existing !== undefined && existing !== requiredLevel) {
        throw new Error(
          `Reference [${ref}] is used in time-diff functions with conflicting date levels ('${existing}' and '${requiredLevel}'). Specify the date level in the context (e.g. DM.Table.Column.${requiredLevel}).`,
        );
      }
      refToLevel[ref] = requiredLevel;
    }
  }
  return refToLevel;
}
