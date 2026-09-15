import {
  type ElementSummary,
  type FunctionCall,
  isFunctionCall,
  isStyledColumnJSON,
  isStyledMeasureColumnJSON,
  type QueryElementItemJSON,
} from '../types.js';
import { getDimensionName } from './dimensions/get-dimension-name.js';
import { getFilterName } from './filters/get-filter-name.js';
import { getMeasureName } from './measures/get-measure-name.js';

const MEASURE_FUNCTION_PREFIX = 'measureFactory.';
const FILTER_FUNCTION_PREFIX = 'filterFactory.';
const ATTRIBUTE_FUNCTION_PREFIX = 'attributeFactory.';

/**
 * Options for {@link getQueryElementSummary}.
 *
 * @internal
 */
export type GetQueryElementSummaryOptions = {
  /**
   * Distinguishes filter vs highlight when `item` is a `filterFactory.*` call.
   * Ignored for dimensions and measures. Defaults to `'filter'`.
   */
  readonly role?: 'filter' | 'highlight';
};

const isMeasureFunctionCall = (call: FunctionCall): boolean =>
  call.function.startsWith(MEASURE_FUNCTION_PREFIX);

const isFilterFunctionCall = (call: FunctionCall): boolean =>
  call.function.startsWith(FILTER_FUNCTION_PREFIX);

/**
 * Checks whether the call produces an attribute, such as a calculated dimension.
 *
 * @param call - The parsed function call to test
 * @returns True when the call targets `attributeFactory`
 * @internal
 */
const isAttributeFunctionCall = (call: FunctionCall): boolean =>
  call.function.startsWith(ATTRIBUTE_FUNCTION_PREFIX);

/**
 * Derives a human-readable name and element kind from a query JSON item.
 *
 * @param item - Dimension, measure, filter, or highlight JSON entry
 * @param options - When `item` is a filter/highlight `FunctionCall`, `role` selects the returned kind
 * @returns Summary with display name and type, or `null` when `item` is not a recognized shape
 *
 * @internal
 */
export function getQueryElementSummary(
  item: QueryElementItemJSON,
  options?: GetQueryElementSummaryOptions,
): ElementSummary | null {
  const filterRole = options?.role ?? 'filter';

  if (typeof item === 'string') {
    return { name: getDimensionName(item), type: 'dimension' };
  }

  if (isStyledColumnJSON(item)) {
    // A calculated dimension has no name to strip a 'DM.' prefix from — its display name is the
    // title argument, which getMeasureName resolves from the function's schema.
    return {
      name: isFunctionCall(item.column)
        ? getMeasureName(item.column)
        : getDimensionName(item.column),
      type: 'dimension',
    };
  }

  if (isStyledMeasureColumnJSON(item)) {
    return { name: getMeasureName(item.column), type: 'measure' };
  }

  if (!isFunctionCall(item)) {
    return null;
  }

  // Checked before the measure branch: a calculated dimension is a function call like a measure,
  // and the fallthrough at the end of this function would otherwise report it as a measure.
  if (isAttributeFunctionCall(item)) {
    return { name: getMeasureName(item), type: 'dimension' };
  }

  if (isMeasureFunctionCall(item)) {
    return { name: getMeasureName(item), type: 'measure' };
  }

  if (isFilterFunctionCall(item)) {
    return { name: getFilterName(item), type: filterRole };
  }

  if (options?.role !== undefined) {
    return { name: getFilterName(item), type: filterRole };
  }

  return { name: getMeasureName(item), type: 'measure' };
}
