import {
  type Attribute,
  DimensionalLevelAttribute,
  isDimensionalLevelAttribute,
  type Measure,
} from '@sisense/sdk-data';

const DEFAULT_MEASURE_NUMBER_FORMAT = '0,0';

/**
 * Returns attributes prepared for Excel JAQL export: dimensional level attributes without an
 * explicit display format receive a level-appropriate default so the backend renders human-readable
 * date strings (e.g. "2009" for Years) instead of raw datetime values.
 * Attributes that already carry a display format are returned unchanged.
 *
 * @param attributes - Raw attributes from chart or pivot translation
 * @returns New array of attributes safe to pass as export dimensions
 */
export function mapAttributesForExcelExport(attributes: readonly Attribute[]): Attribute[] {
  return attributes.map((attribute) => {
    if (!isDimensionalLevelAttribute(attribute) || typeof attribute.format !== 'function') {
      return attribute;
    }
    if (attribute.getFormat()) {
      return attribute;
    }
    const fallbackFormat = DimensionalLevelAttribute.getDefaultFormatForGranularity(
      attribute.granularity,
    );
    return fallbackFormat ? attribute.format(fallbackFormat) : attribute;
  });
}

/**
 * Returns measures prepared for Excel JAQL export: applies a default number format when none is set.
 *
 * @param measures - Raw measures from chart or pivot translation
 * @returns New array of measures safe to pass as export measures
 */
export function mapMeasuresForExcelExport(measures: readonly Measure[]): Measure[] {
  return measures.map((measure) => {
    if (typeof measure.format !== 'function') {
      return measure;
    }
    const existingFormat =
      typeof measure.getFormat === 'function' ? measure.getFormat() : undefined;
    if (existingFormat) {
      return measure;
    }
    return measure.format(DEFAULT_MEASURE_NUMBER_FORMAT);
  });
}
