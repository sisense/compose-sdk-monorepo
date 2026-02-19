import { JSONValue } from '@sisense/sdk-data';

import { createAttributeFromName } from '../../common.js';
import {
  DIMENSIONAL_NAME_PREFIX,
  FunctionCall,
  FunctionContext,
  isFunctionCall,
  ProcessedArg,
} from '../../types.js';
import { processNode } from '../process-node.js';
import { validateCustomFormula } from './validate-custom-formula.js';

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

  const formula = processedArgs[1] as string;
  const rawContext = processedArgs[2] as Record<string, unknown>;

  // 1. First, validate formula references
  validateCustomFormula(formula, rawContext, {
    errorPrefix: `${context.pathPrefix}`,
    errorOnUnusedContext: true, // Strict validation: all context keys must be used
    allowEmptyFormula: false, // Custom formulas must have content
  });

  // 2. Validate and transform each context item
  const processedContext: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rawContext)) {
    const fullArgPath = `args[2].${key}`;

    if (isFunctionCall(value as JSONValue)) {
      // Function call - process using the injected processNode function
      processedContext[`${key}`] = processNode({
        data: value as FunctionCall,
        context: {
          dataSource: context.dataSource,
          schemaIndex: context.schemaIndex,
          pathPrefix: fullArgPath,
        },
      });
    } else if (typeof value === 'string' && value.startsWith(DIMENSIONAL_NAME_PREFIX)) {
      // Attribute string - process using createAttributeFromName
      try {
        processedContext[`${key}`] = createAttributeFromName(
          value,
          context.dataSource,
          context.schemaIndex,
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

  // 3. Replace rawContext with processedContext in processedArgs[2]
  // This now contains actual QueryElements (Measures, Attributes, etc.)
  processedArgs[2] = processedContext;
}
