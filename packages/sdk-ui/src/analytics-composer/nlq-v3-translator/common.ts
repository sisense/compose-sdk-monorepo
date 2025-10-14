import {
  Attribute,
  createAttributeHelper,
  DateLevels,
  isDatetime,
  JaqlDataSourceForDto,
  MetadataTypes,
} from '@sisense/sdk-data';

import { NlqTranslationResult, NormalizedField, NormalizedTable } from '../types.js';
import { ATTRIBUTE_PREFIX } from './types.js';

function parseAttributeName(attributeName: string): {
  tableName: string;
  columnName: string;
  level?: string;
} {
  // Parse "DM.Commerce.Date.Years" -> tableName: "Commerce", columnName: "Date", level: "Years"
  // Parse "DM.Brand.Brand" -> tableName: "Brand", columnName: "Brand", level: undefined
  const parts = attributeName.split('.');
  if (parts.length < 3 || `${parts[0]}.` !== ATTRIBUTE_PREFIX) {
    throw new Error(
      `Invalid attribute name format: "${attributeName}". Expected format: "${ATTRIBUTE_PREFIX}TableName.ColumnName[.Level]"`,
    );
  }

  const tableName = parts[1];
  const columnName = parts[2];
  let level: string | undefined;

  // extract level if present (4th part)
  if (parts.length === 4) {
    level = parts[3];
  }

  return { tableName, columnName, level };
}

function findDataFieldAndLevel(
  attributeName: string,
  tables: NormalizedTable[],
): { field: NormalizedField; level?: string } {
  const { tableName, columnName, level } = parseAttributeName(attributeName);

  const table = tables.find((t) => t.name === tableName);
  if (!table) {
    throw new Error(`Table "${tableName}" not found in the data model`);
  }

  const field = table.columns.find((column) => column.name === columnName);
  if (!field) {
    throw new Error(`Column "${columnName}" not found in table "${tableName}"`);
  }

  if (level) {
    if (!isDatetime(field.dataType)) {
      throw new Error(
        `Invalid date level "${level}" in attribute "${attributeName}". Column "${tableName}.${columnName}" is not a datetime column`,
      );
    }
    const validLevels = DateLevels.all;
    if (!validLevels.includes(level)) {
      throw new Error(
        `Invalid date level "${level}" in attribute "${attributeName}". Valid levels are: ${validLevels.join(
          ', ',
        )}`,
      );
    }

    // throw error for time levels on date only column
    const dateOnlyLevels = DateLevels.dateOnly;
    if (field.dataType === 'date' && !dateOnlyLevels.includes(level)) {
      throw new Error(
        `Invalid level "${level}" in attribute "${attributeName}". Column "${tableName}.${columnName}" is only a date column, not a datetime column`,
      );
    }

    // throw error for date levels on time only column
    const timeOnlyLevels = DateLevels.timeOnly;
    if (field.dataType === 'time' && !timeOnlyLevels.includes(level)) {
      throw new Error(
        `Invalid level "${level}" in attribute "${attributeName}". Column "${tableName}.${columnName}" is only a time column, not a date column`,
      );
    }
  }

  return { field, level };
}

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

export function createAttributeFromName(
  attributeName: string,
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
) {
  const { field, level } = findDataFieldAndLevel(attributeName, tables);

  return createAttributeHelper({
    expression: field.expression,
    dataType: field.dataType,
    granularity: level,
    format: undefined,
    sort: undefined,
    dataSource,
  });
}

export function getSuccessData<T>(result: NlqTranslationResult<T>): T {
  if (!result.success) throw new Error('Expected success result');
  return result.data;
}

export function getErrors<T>(result: NlqTranslationResult<T>): string[] {
  if (result.success) throw new Error('Expected error result');
  return result.errors.map((error) => error.message);
}
