/**
 * Chart JSON processing: schema metadata, validation, and translation.
 *
 * @internal
 */
export {
  CHART_TYPE_AXES_METADATA,
  DIMENSION_AXES,
  getChartTypeMetadata,
  getValidChartTypes,
  isValidChartType,
  isValidDataOptionsKey,
  MEASURE_AXES,
  VALID_CHART_TYPES_ARRAY,
  VALID_DATA_OPTIONS_KEYS,
} from './chart-type-schemas.js';
export { isDimensionAxisType } from './axis-type-detection.js';
export { validateChartJSONStructure } from './validate-chart-json.js';
export { translateDataOptionsFromJSON } from './translate-data-options.js';
