import {
  Attribute,
  DimensionalCalculatedAttribute,
  Filter,
  isCustomFilter,
  isDatetime,
  isMeasureFilter,
  isMembersFilter,
  isNumber,
  isNumericFilter,
  isRankingFilter,
  isRelativeDateFilter,
  isText,
  isTextFilter,
  MembersFilter,
  MetadataTypes,
  NumericOperators,
  RelativeDateFilter,
} from '@sisense/sdk-data';

export function isSupportedByFilterEditor(filter: Filter): boolean {
  return !isCustomFilter(filter);
}

/**
 * Resolves which editor the given attribute should be edited with.
 * @param attribute - Attribute to resolve the editor for
 * @returns The value type of the applicable editor, or `null` when none applies, meaning the
 * attribute is not editable
 * @internal
 */
export function getFilterEditorValueType(
  attribute: Attribute,
): 'text' | 'numeric' | 'datetime' | null {
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

export function isIncludeAllFilter(filter: Filter): filter is MembersFilter {
  return (
    isMembersFilter(filter) && !filter.members.length && !filter.config.deactivatedMembers.length
  );
}

export function isIncludeMembersFilter(filter: Filter): filter is MembersFilter {
  return isMembersFilter(filter) && !filter.config.excludeMembers;
}

export function isExcludeMembersFilter(filter: Filter): filter is MembersFilter {
  return isMembersFilter(filter) && filter.config.excludeMembers;
}

export function isConditionalFilter(filter: Filter) {
  return (
    isExcludeMembersFilter(filter) ||
    isMeasureFilter(filter) ||
    isNumericFilter(filter) ||
    isTextFilter(filter) ||
    isRankingFilter(filter)
  );
}

export function isNumericBetweenFilter(filter: Filter): boolean {
  return (
    isNumericFilter(filter) &&
    filter.operatorA === NumericOperators.From &&
    filter.operatorB === NumericOperators.To
  );
}

export function isRelativeDateFilterWithAnchor(filter: Filter): filter is RelativeDateFilter {
  return isRelativeDateFilter(filter) && !!filter.anchor;
}

export function isRelativeDateFilterWithoutAnchor(filter: Filter): filter is RelativeDateFilter {
  return isRelativeDateFilter(filter) && !filter.anchor;
}

/**
 * Formats a given Date object into a string in the format "YYYY-MM-DDT00:00:00".
 *
 * @param {Date} date - The Date object to format.
 * @returns {string} The formatted date string in "YYYY-MM-DDT00:00:00" format.
 */
export function convertDateToMemberString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00`;
}
