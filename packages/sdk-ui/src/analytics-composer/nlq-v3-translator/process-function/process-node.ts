/* eslint-disable max-lines */
import { FunctionContext, NodeInput, ProcessedArg, QueryElement } from '../types.js';
import { executeFunction } from './execute-function.js';
import { getCustomProcessor } from './factory-function-processors.js';
import {
  getFunctionSchema,
  getMaxArgCount,
  getRequiredArgCount,
} from './factory-function-schemas.js';
import { processArg } from './process-arg.js';

/**
 * Recursively processes a parsed JSON object to execute filterFactory and measureFactory functions.
 * It includes comprehensive validation based on function schemas.
 *
 * @param input - The input containing parsed object and context
 * @returns The result of the executed function or the processed nested structure.
 */
export function processNode(input: NodeInput): QueryElement {
  const { data: parsedObject } = input;
  const { dataSource, tables, pathPrefix } = input.context;
  const { function: functionPath, args } = parsedObject;
  const actualPathPrefix = pathPrefix ? `${pathPrefix}.` : '';

  // Get the schema for this function
  const schema = getFunctionSchema(functionPath);
  if (!schema) {
    throw new Error(`${actualPathPrefix}function: Unknown function "${functionPath}"`);
  }

  // Validate argument count
  const requiredCount = getRequiredArgCount(functionPath);
  const maxCount = getMaxArgCount(functionPath);

  if (args.length < requiredCount) {
    throw new Error(
      `${actualPathPrefix}function: Expected at least ${requiredCount} arguments, got ${args.length}`,
    );
  }

  if (args.length > maxCount) {
    throw new Error(
      `${actualPathPrefix}function: Expected at most ${maxCount} arguments, got ${args.length}`,
    );
  }

  // Validate and process each argument using the schema
  const processedArgs: ProcessedArg[] = [];
  const argErrorMsgs: string[] = [];

  for (let i = 0; i < Math.max(args.length, schema.length); i++) {
    const argSchema = schema[`${i}`];
    const rawArg = args[`${i}`];
    const fullArgPath = actualPathPrefix ? `${actualPathPrefix}args[${i}]` : `args[${i}]`;

    // Handle missing optional arguments
    if (rawArg === undefined) {
      if (argSchema?.required) {
        argErrorMsgs.push(`${fullArgPath}: Missing required argument (expected ${argSchema.type})`);
      }
      continue; // Skip processing undefined optional args
    }

    // Handle extra arguments beyond schema
    if (!argSchema) {
      argErrorMsgs.push(`${fullArgPath}: Unexpected argument`);
      continue;
    }

    // Validate and transform the argument - collect errors instead of throwing
    try {
      const processedArg = processArg({
        data: rawArg,
        context: {
          dataSource,
          tables,
          pathPrefix: fullArgPath,
          argSchema: argSchema,
        },
      });
      processedArgs.push(processedArg);
    } catch (error) {
      // Collect error messages and continue processing other arguments
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      argErrorMsgs.push(errorMsg);
      // Continue processing other args instead of stopping
    }
  }

  // After processing all arguments, check if we have errors
  if (argErrorMsgs.length > 0) {
    const combinedErrorMsg = argErrorMsgs.join('; ');
    throw new Error(combinedErrorMsg);
  }

  // Run custom processing if the function has it
  const customProcessor = getCustomProcessor(functionPath);
  if (customProcessor) {
    try {
      const processingContext: FunctionContext = {
        dataSource,
        tables,
        pathPrefix: actualPathPrefix,
      };

      customProcessor(processedArgs, processingContext);
    } catch (validationError) {
      const errorMsg =
        validationError instanceof Error ? validationError.message : 'Unknown validation error';
      throw new Error(errorMsg);
    }
  }

  // Execute the function with validated arguments
  return executeFunction(functionPath, processedArgs);
}
