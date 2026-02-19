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

import {
  NlqTranslationError,
  NlqTranslationResult,
  NormalizedColumn,
  NormalizedTable,
} from '../types.js';
import { DIMENSIONAL_NAME_PREFIX } from './types.js';

/**
 * Schema index for efficient table/column lookups and greedy matching
 * @internal
 */
export interface SchemaIndex {
  /** Tables sorted by name length (descending) for greedy matching */
  sortedTables: NormalizedTable[];
  /** Columns sorted by name length (descending) per table for greedy matching */
  tableColumnMap: Map<string, NormalizedColumn[]>;
  /** O(1) table lookup by exact name */
  tableMap: Map<string, NormalizedTable>;
  /** O(1) column lookup: table name → (column name → column) */
  columnMap: Map<string, Map<string, NormalizedColumn>>;
}

/**
 * Creates a schema index with pre-sorted arrays and Maps for efficient lookups
 *
 * @param tables - Array of normalized tables
 * @returns SchemaIndex with sorted arrays and Maps
 * @internal
 */
export function createSchemaIndex(tables: NormalizedTable[]): SchemaIndex {
  // Sort tables by name length (descending) for greedy matching
  const sortedTables = [...tables].sort((a, b) => b.name.length - a.name.length);

  // Create Maps for O(1) lookups
  const tableMap = new Map<string, NormalizedTable>();
  const columnMap = new Map<string, Map<string, NormalizedColumn>>();
  const tableColumnMap = new Map<string, NormalizedColumn[]>();

  for (const table of tables) {
    // Add to table map
    tableMap.set(table.name, table);

    // Sort columns by name length (descending) for greedy matching
    const sortedColumns = [...table.columns].sort((a, b) => b.name.length - a.name.length);
    tableColumnMap.set(table.name, sortedColumns);

    // Create column map for this table
    const tableColumnMapInner = new Map<string, NormalizedColumn>();
    for (const column of table.columns) {
      tableColumnMapInner.set(column.name, column);
    }
    columnMap.set(table.name, tableColumnMapInner);
  }

  return {
    sortedTables,
    tableColumnMap,
    tableMap,
    columnMap,
  };
}

/**
 * Parses a dimensional name using schema-aware greedy matching to handle dots in table/column names
 *
 * @param dimensionalName - The dimensional name (e.g., "DM.Brand.io.Brand" or "DM.Commerce.Date.Years")
 * @param schemaIndex - The schema index for efficient matching
 * @returns Parsed result with matched table, column, and optional level
 */
function parseDimensionalName(
  dimensionalName: string,
  schemaIndex: SchemaIndex,
): {
  table: NormalizedTable;
  column: NormalizedColumn;
  level?: string;
} {
  // Validate prefix
  if (!dimensionalName.startsWith(DIMENSIONAL_NAME_PREFIX)) {
    throw new Error(
      `Invalid dimensional element name format: "${dimensionalName}". Expected format: "${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName[.Level]"`,
    );
  }

  // Remove DM. prefix
  const remaining = dimensionalName.slice(DIMENSIONAL_NAME_PREFIX.length);
  if (!remaining) {
    throw new Error(
      `Invalid dimensional element name format: "${dimensionalName}". Expected format: "${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName[.Level]"`,
    );
  }

  // Greedy matching: try longest table names first
  let matchedTable: NormalizedTable | undefined;
  let matchedTableAfter: string | undefined;

  for (const table of schemaIndex.sortedTables) {
    if (remaining.startsWith(table.name + '.')) {
      const afterTable = remaining.slice(table.name.length + 1);
      if (!afterTable) {
        throw new Error(
          `Invalid dimensional element name format: "${dimensionalName}". Expected format: "${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName[.Level]"`,
        );
      }

      matchedTable = table;
      matchedTableAfter = afterTable;
      break; // Found matching table, now try columns
    }
  }

  // If no table matched, try to extract potential table name for better error message
  if (!matchedTable) {
    const firstDotIndex = remaining.indexOf('.');
    if (firstDotIndex === -1) {
      // No dots after DM., invalid format
      throw new Error(
        `Invalid dimensional element name format: "${dimensionalName}". Expected format: "${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName[.Level]"`,
      );
    }
    const potentialTableName = remaining.slice(0, firstDotIndex);
    throw new Error(`Table "${potentialTableName}" not found in the data model`);
  }

  // Get sorted columns for this table (longest first)
  const sortedColumns = schemaIndex.tableColumnMap.get(matchedTable.name);
  if (!sortedColumns) {
    // Should not happen, but handle gracefully
    throw new Error(`Table "${matchedTable.name}" found but has no columns`);
  }

  // Try matching columns (longest first)
  let matchedColumnWithInvalidLevel: NormalizedColumn | undefined;
  let matchedColumnAfterInvalid: string | undefined;
  const validLevels = DateLevels.all;

  for (const column of sortedColumns) {
    if (matchedTableAfter === column.name) {
      // Exact match, no level
      return { table: matchedTable, column };
    }

    if (!matchedTableAfter!.startsWith(column.name + '.')) {
      continue;
    }

    const afterColumn = matchedTableAfter!.slice(column.name.length + 1);
    if (!afterColumn) {
      // Should not happen (would be exact match above)
      continue;
    }

    const isValidDateLevel = validLevels.includes(afterColumn);
    const isDatetimeColumn = isDatetime(column.dataType);

    // Handle valid date level
    if (isValidDateLevel) {
      if (isDatetimeColumn) {
        // Valid date level on datetime column
        return { table: matchedTable, column, level: afterColumn };
      }
      // Valid date level but column is not datetime - store for error
      if (!matchedColumnWithInvalidLevel) {
        matchedColumnWithInvalidLevel = column;
        matchedColumnAfterInvalid = afterColumn;
      }
      continue;
    }

    // Handle invalid date level on datetime column
    if (isDatetimeColumn && !matchedColumnWithInvalidLevel) {
      matchedColumnWithInvalidLevel = column;
      matchedColumnAfterInvalid = afterColumn;
    }

    // Not a date level and not a datetime column, so it must be part of the column name
    // Continue to try longer column names (loop will naturally continue)
  }

  // If we found a column match with a potential date level issue, throw specific error
  // (only if no exact column match was found)
  if (matchedColumnWithInvalidLevel && matchedColumnAfterInvalid) {
    if (validLevels.includes(matchedColumnAfterInvalid)) {
      // Valid date level but column is not datetime
      throw new Error(
        `Invalid date level "${matchedColumnAfterInvalid}" in dimensional element "${dimensionalName}". Column "${matchedTable.name}.${matchedColumnWithInvalidLevel.name}" is not a datetime column`,
      );
    }
    // Invalid date level on datetime column
    throw new Error(
      `Invalid date level "${matchedColumnAfterInvalid}" in dimensional element "${dimensionalName}". Valid levels are: ${validLevels.join(
        ', ',
      )}`,
    );
  }

  // Table matched but no column matched
  // Try to extract potential column name for better error message
  const firstDotIndex = matchedTableAfter!.indexOf('.');
  const potentialColumnName =
    firstDotIndex === -1 ? matchedTableAfter! : matchedTableAfter!.slice(0, firstDotIndex);
  throw new Error(`Column "${potentialColumnName}" not found in table "${matchedTable.name}"`);
}

function findColumnAndLevel(
  dimensionalName: string,
  schemaIndex: SchemaIndex,
): { column: NormalizedColumn; level?: string } {
  const { table, column, level } = parseDimensionalName(dimensionalName, schemaIndex);

  if (level) {
    if (!isDatetime(column.dataType)) {
      throw new Error(
        `Invalid date level "${level}" in dimensional element "${dimensionalName}". Column "${table.name}.${column.name}" is not a datetime column`,
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
        `Invalid level "${level}" in dimensional element "${dimensionalName}". Column "${table.name}.${column.name}" is only a date column, not a datetime column`,
      );
    }

    // throw error for date levels on time only column
    const timeOnlyLevels = DateLevels.timeOnly;
    if (column.dataType === 'time' && !timeOnlyLevels.includes(level)) {
      throw new Error(
        `Invalid level "${level}" in dimensional element "${dimensionalName}". Column "${table.name}.${column.name}" is only a time column, not a date column`,
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
  schemaIndex: SchemaIndex,
) {
  const { column, level } = findColumnAndLevel(attributeName, schemaIndex);

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
  schemaIndex: SchemaIndex,
): DateDimension {
  const { column, level } = parseDimensionalName(dateDimensionName, schemaIndex);

  // Reject if level is present - DateDimension should not have a level
  if (level) {
    throw new Error(
      `Invalid DateDimension name format: "${dateDimensionName}". Expected format: "${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName"`,
    );
  }

  // Validate that the field is a datetime type
  if (!isDatetime(column.dataType)) {
    throw new Error(
      `Invalid DateDimension name "${dateDimensionName}". Column "${column.name}" is not a datetime column (got ${column.dataType}).`,
    );
  }

  return createDateDimension({
    name: column.name,
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

/**
 * Helper function to collect structured errors from translation operations.
 *
 * Executes a translation function and collects any errors into the provided errors array.
 * Returns the translated data if successful, or null if errors occurred.
 *
 * @param translateFn - Function that returns a NlqTranslationResult
 * @param errors - Array to collect errors into
 * @returns The translated data if successful, or null if errors occurred
 * @internal
 */
export function collectTranslationErrors<T>(
  translateFn: () => NlqTranslationResult<T>,
  errors: NlqTranslationError[],
): T | null {
  const result = translateFn();
  if (!result.success) {
    errors.push(...result.errors);
    return null;
  }
  return result.data;
}
