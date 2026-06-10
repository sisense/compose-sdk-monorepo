import { getFunctionSchema } from '../../shared/expression/factory-function-schemas.js';
import { isFunctionCall } from '../../types.js';
import type { FunctionCall } from '../../types.js';
import { getDimensionName } from '../dimensions/get-dimension-name.js';

/**
 * Extracts a human-readable name from a measure FunctionCall.
 *
 * @param call - Measure factory function call
 * @returns Display name for LLM / UI labels
 *
 * @internal
 */
export function getMeasureName(call: FunctionCall): string {
  const schema = getFunctionSchema(call.function);
  if (schema) {
    const nameIdx = schema.findIndex((s) => s.isName);
    if (nameIdx >= 0) {
      const val = call.args[nameIdx];
      if (typeof val === 'string' && val.length > 0) return val;
    }
  }
  const firstArg = call.args[0];
  if (typeof firstArg === 'string') return getDimensionName(firstArg);
  if (isFunctionCall(firstArg)) return getMeasureName(firstArg);
  return call.function.split('.').pop() ?? call.function;
}
