/**
 * Translates a single data options axis from CSDK to JSON format.
 * Shared by chart and pivot-table translators.
 *
 * @internal
 */
import type { NlqTranslationError, NlqTranslationResult } from '../../../types.js';
import { translateDimensionsToJSON } from '../../constructs/dimensions/translate-dimensions-to-json.js';
import { translateMeasuresToJSON } from '../../constructs/measures/translate-measures-to-json.js';
import type { DimensionItemJSON, MeasureItemJSON } from '../../types.js';
import { dataOptionsPath } from '../utils/error-path.js';
import type { AxisType } from './adapters.js';

const toDataOptionsAxisError = (
  axisKey: string,
  error: NlqTranslationError,
): NlqTranslationError => {
  const itemMatch = error.path.match(/\[(\d+)\]$/);
  const itemIndex = itemMatch ? Number(itemMatch[1]) : undefined;
  return { ...error, path: dataOptionsPath(axisKey, itemIndex) };
};

/**
 * Translates a single axis from CSDK to JSON format.
 *
 * @param axisKey - The axis key (for error messages)
 * @param axisValue - The axis value (array or single item)
 * @param axisType - Whether the axis contains dimensions or measures
 * @returns NlqTranslationResult with translated JSON array
 */
export function translateSingleAxisToJSON(
  axisKey: string,
  axisValue: unknown,
  axisType: AxisType,
): NlqTranslationResult<DimensionItemJSON[] | MeasureItemJSON[]> {
  const arr = Array.isArray(axisValue) ? axisValue : axisValue != null ? [axisValue] : [];

  if (axisType === 'dimension') {
    // Constructs expect (Attribute | StyledColumn)[]; chart uses Column|StyledColumn; structurally compatible at runtime
    const result = translateDimensionsToJSON(
      arr as Parameters<typeof translateDimensionsToJSON>[0],
    );
    if (!result.success) {
      return {
        success: false,
        errors: result.errors.map((e) => toDataOptionsAxisError(axisKey, e)),
      };
    }
    return { success: true, data: result.data as DimensionItemJSON[] };
  }

  const result = translateMeasuresToJSON(arr as Parameters<typeof translateMeasuresToJSON>[0]);
  if (!result.success) {
    return {
      success: false,
      errors: result.errors.map((e) => toDataOptionsAxisError(axisKey, e)),
    };
  }
  return { success: true, data: result.data as MeasureItemJSON[] };
}
