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
 * - Validates all context keys are used in the formula
 * - Validates context is not empty and formula is not empty
 * - Transforms context items by executing nested function calls
 * - Converts attribute strings to actual attribute objects
 *
 * @param processedArgs - [title: string, formula: string, context: Record<string, unknown>]
 * @param context - Processing context with error prefix and other metadata
 * @throws Error with descriptive message if validation fails
 */
export function processCustomFormula(
  processedArgs: ProcessedArg[],
  context: FunctionContext,
): void {
  // Ensure we have the expected number of arguments (should be guaranteed by basic validation)
  if (processedArgs.length < 3) {
    throw new Error(`${context.pathPrefix}Expected at least 3 arguments for customFormula`);
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
          tables: context.tables,
          pathPrefix: fullArgPath,
        },
      });
    } else if (typeof value === 'string' && value.startsWith(DIMENSIONAL_NAME_PREFIX)) {
      // Attribute string - process using createAttributeFromName
      try {
        processedContext[`${key}`] = createAttributeFromName(
          value,
          context.dataSource,
          context.tables,
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
