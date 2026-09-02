import {
  Attribute,
  DimensionalCalculatedAttribute,
  isDatetime,
  isNumber,
  isText,
  MetadataTypes,
} from '@sisense/sdk-data';

/**
 * Value type of a filterable attribute — which condition / editor catalogue applies.
 *
 * Shared by the dashboard filter editor and the FilterWidget so both resolve
 * text / numeric / datetime the same way (including calculated dimensions).
 *
 * @internal
 */
export type FilterAttributeValueType = 'text' | 'numeric' | 'datetime';

/**
 * Resolves the value type of an attribute for filter editing and FilterWidget
 * condition UIs.
 *
 * @param attribute - Attribute to resolve
 * @returns The value type, or `null` when none applies (attribute is not filterable
 *   with the standard editors / condition catalogues)
 * @internal
 */
export function getFilterAttributeValueType(attribute: Attribute): FilterAttributeValueType | null {
  // A calculated dimension reports the metadata kind `'calculatedattribute'` as its `type`, which
  // is not a value type; the value type of its formula is carried in `dataType` instead. One built
  // in code carries no `dataType` at all, and text is the only data type Sisense supports for a
  // calculated dimension, so an absent one is read as text rather than as non-editable. A
  // `dataType` that is present but unrecognized falls through to `null`, as any other attribute
  // with an unrecognized type does.
  const isCalculated = MetadataTypes.isCalculatedAttribute(attribute);
  const valueType =
    (isCalculated
      ? (attribute as DimensionalCalculatedAttribute).dataType ?? 'text'
      : attribute.type) ?? '';

  if (isText(valueType)) {
    return 'text';
  }
  if (isNumber(valueType)) {
    return 'numeric';
  }
  if (isDatetime(valueType)) {
    // The datetime editor changes granularity through `LevelAttribute.setGranularity`, which a
    // calculated attribute does not implement, so a date calculated dimension is not editable.
    return isCalculated ? null : 'datetime';
  }
  return null;
}

/**
 * @deprecated Prefer {@link getFilterAttributeValueType}. Kept as the filter-editor name.
 * @internal
 */
export const getFilterEditorValueType = getFilterAttributeValueType;
