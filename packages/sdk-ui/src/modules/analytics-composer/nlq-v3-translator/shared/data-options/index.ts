/**
 * Shared data options translation utilities.
 * Used by chart and pivot-table translators.
 *
 * @internal
 */
export {
  adaptDimensionsToStyledColumn,
  adaptMeasuresToStyledMeasureColumn,
  toJSONArray,
  withAxisContext,
} from './adapters.js';
export {
  translateSingleAxisFromJSON,
  type AxisType,
  type TranslatedAxis,
} from './translate-axis-from-json.js';
export { translateSingleAxisToJSON } from './translate-axis-to-json.js';
