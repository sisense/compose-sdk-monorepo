/**
 * Attribute type predicates for filter validation.
 *
 * @internal
 */
import { Attribute, MetadataTypes } from '@sisense/sdk-data';

/**
 * Validates that an attribute is compatible with text values
 *
 * @param attribute - The attribute to validate
 * @returns True if the attribute is a text type
 */
export function isTextAttribute(attribute: Attribute): boolean {
  return attribute.type === MetadataTypes.TextAttribute;
}

/**
 * Validates that an attribute is compatible with numeric values
 *
 * @param attribute - The attribute to validate
 * @returns True if the attribute is a numeric type
 */
export function isNumericAttribute(attribute: Attribute): boolean {
  return attribute.type === MetadataTypes.NumericAttribute;
}

/**
 * Validates that an attribute is a date/datetime type
 *
 * @param attribute - The attribute to validate
 * @returns True if the attribute is a date/datetime type
 */
export function isDateLevelAttribute(attribute: Attribute): boolean {
  return attribute.type === MetadataTypes.DateLevel;
}

/**
 * Validates that an attribute is compatible with text OR numeric values
 * Used for filters like equals, doesntEqual that accept both text and number
 *
 * @param attribute - The attribute to validate
 * @returns True if the attribute is text or numeric type
 */
export function isTextOrNumericAttribute(attribute: Attribute): boolean {
  return isTextAttribute(attribute) || isNumericAttribute(attribute);
}

/**
 * Validates that an attribute is NOT a date type
 * Used for filters that should not work with date attributes
 *
 * @param attribute - The attribute to validate
 * @returns True if the attribute is not a date type
 */
export function isNonDateLevelAttribute(attribute: Attribute): boolean {
  return !isDateLevelAttribute(attribute);
}

/**
 * Gets a display string for the attribute type
 *
 * @param attribute - The attribute to get the type display string for
 * @returns A human-readable string representing the attribute type
 */
export function getAttributeTypeDisplayString(attribute: Attribute): string {
  return attribute.type === MetadataTypes.TextAttribute
    ? 'text'
    : attribute.type === MetadataTypes.NumericAttribute
    ? 'numeric'
    : attribute.type === MetadataTypes.DateLevel
    ? 'date/datetime'
    : 'unknown';
}
