import { isFunctionCall } from '../../types.js';
import type { FunctionCall } from '../../types.js';
import { getDimensionName } from '../dimensions/get-dimension-name.js';
import { getMeasureName } from '../measures/get-measure-name.js';

const LOGICAL_FILTER_PREFIX = 'filterFactory.logic.';
/**
 * Extracts a human-readable label from a filter FunctionCall.
 *
 * @param call - Filter factory function call
 * @returns Attribute name, measure name, or function suffix for logical combinators
 *
 * @internal
 */
export function getFilterName(call: FunctionCall): string {
  if (call.function.startsWith(LOGICAL_FILTER_PREFIX)) {
    return call.function.slice(LOGICAL_FILTER_PREFIX.length);
  }
  const firstArg = call.args[0];
  if (typeof firstArg === 'string') return getDimensionName(firstArg);
  if (isFunctionCall(firstArg)) return getMeasureName(firstArg);
  return call.function.split('.').pop() ?? call.function;
}
