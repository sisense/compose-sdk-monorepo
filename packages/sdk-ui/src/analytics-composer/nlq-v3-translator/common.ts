import {
  Attribute,
  createAttributeHelper,
  createDateDimension,
  DateDimension,
  DateLevels,
  isDatetime,
  JaqlDataSourceForDto,
  MetadataTypes,
} from '@sisense/sdk-data';

import { NlqTranslationResult, NormalizedColumn, NormalizedTable } from '../types.js';
import { DIMENSIONAL_NAME_PREFIX } from './types.js';

function parseDimensionalName(dimensionalName: string): {
  tableName: string;
  columnName: string;
  level?: string;
} {
  // Parse "DM.Commerce.Date.Years" -> tableName: "Commerce", columnName: "Date", level: "Years"
  // Parse "DM.Brand.Brand" -> tableName: "Brand", columnName: "Brand", level: undefined
  const parts = dimensionalName.split('.');
  if (parts.length < 3 || `${parts[0]}.` !== DIMENSIONAL_NAME_PREFIX) {
    throw new Error(
      `Invalid dimensional element name format: "${dimensionalName}". Expected format: "${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName[.Level]"`,
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

function findTableAndColumn(
  tableName: string,
  columnName: string,
  tables: NormalizedTable[],
): { table: NormalizedTable; column: NormalizedColumn } {
  const table = tables.find((t) => t.name === tableName);
  if (!table) {
    throw new Error(`Table "${tableName}" not found in the data model`);
  }
  const column = table.columns.find((col) => col.name === columnName);
  if (!column) {
    throw new Error(`Column "${columnName}" not found in table "${tableName}"`);
  }
  return { table, column };
}

function findColumnAndLevel(
  dimensionalName: string,
  tables: NormalizedTable[],
): { column: NormalizedColumn; level?: string } {
  const { tableName, columnName, level } = parseDimensionalName(dimensionalName);

  const { column } = findTableAndColumn(tableName, columnName, tables);

  if (level) {
    if (!isDatetime(column.dataType)) {
      throw new Error(
        `Invalid date level "${level}" in dimensional element "${dimensionalName}". Column "${tableName}.${columnName}" is not a datetime column`,
      );
    }
    const validLevels = DateLevels.all;
    if (!validLevels.includes(level)) {
      throw new Error(
        `Invalid date level "${level}" in dimensional element "${dimensionalName}". Valid levels are: ${validLevels.join(
          ', ',
        )}`,
      );
    }

    // throw error for time levels on date only column
    const dateOnlyLevels = DateLevels.dateOnly;
    if (column.dataType === 'date' && !dateOnlyLevels.includes(level)) {
      throw new Error(
        `Invalid level "${level}" in dimensional element "${dimensionalName}". Column "${tableName}.${columnName}" is only a date column, not a datetime column`,
      );
    }

    // throw error for date levels on time only column
    const timeOnlyLevels = DateLevels.timeOnly;
    if (column.dataType === 'time' && !timeOnlyLevels.includes(level)) {
      throw new Error(
        `Invalid level "${level}" in dimensional element "${dimensionalName}". Column "${tableName}.${columnName}" is only a time column, not a date column`,
      );
    }
  }

  return { column, level };
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
  const { column, level } = findColumnAndLevel(attributeName, tables);

  return createAttributeHelper({
    expression: column.expression,
    dataType: column.dataType,
    granularity: level,
    format: undefined,
    sort: undefined,
    dataSource,
  });
}

export function createDateDimensionFromName(
  dateDimensionName: string,
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): DateDimension {
  const { tableName, columnName, level } = parseDimensionalName(dateDimensionName);

  // Reject if level is present - DateDimension should not have a level
  if (level) {
    throw new Error(
      `Invalid DateDimension name format: "${dateDimensionName}". Expected format: "${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName"`,
    );
  }

  const { column } = findTableAndColumn(tableName, columnName, tables);

  // Validate that the field is a datetime type
  if (!isDatetime(column.dataType)) {
    throw new Error(
      `Invalid DateDimension name "${dateDimensionName}". Column "${tableName}.${columnName}" is not a datetime column (got ${column.dataType}).`,
    );
  }

  return createDateDimension({
    name: columnName,
    expression: column.expression,
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
