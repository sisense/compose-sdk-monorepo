/**
 * Schema index for efficient table/column lookups and dimensional name parsing.
 *
 * @internal
 */
import {
  createAttributeHelper,
  createDateDimension,
  DateDimension,
  DateLevels,
  isDatetime,
  JaqlDataSourceForDto,
} from '@sisense/sdk-data';

import type { NormalizedColumn, NormalizedTable } from '../../../types.js';
import { DIMENSIONAL_NAME_PREFIX } from '../../types.js';
import { findBestMatch, SUGGESTION_THRESHOLD } from './fuzzy-match.js';

/** Stable locale for identifier comparisons (case-insensitive table/column segments). */
const IDENTIFIER_LOCALE = 'en';

function equalsIgnoreCase(a: string, b: string): boolean {
  return a.localeCompare(b, IDENTIFIER_LOCALE, { sensitivity: 'accent' }) === 0;
}

function startsWithIgnoreCase(str: string, prefix: string): boolean {
  return (
    prefix.length <= str.length &&
    str
      .slice(0, prefix.length)
      .localeCompare(prefix, IDENTIFIER_LOCALE, { sensitivity: 'accent' }) === 0
  );
}

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
 * Parses a dimensional name using schema-aware greedy matching to handle dots in table/column names.
 * Table and column segments are matched case-insensitively against the schema; returned table/column
 * objects keep canonical names and expressions. Date level suffixes are case-sensitive.
 * If two tables share the same name ignoring case, the first match in {@link SchemaIndex.sortedTables} wins.
 *
 * @param dimensionalName - The dimensional name (e.g., "DM.Brand.io.Brand" or "DM.Commerce.Date.Years")
 * @param schemaIndex - The schema index for efficient matching
 * @returns Parsed result with matched table, column, and optional level
 * @internal
 */
export function parseDimensionalName(
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
      `Invalid dimensional element name format: '${dimensionalName}'. Expected format: '${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName[.Level]'`,
    );
  }

  // Remove DM. prefix
  const remaining = dimensionalName.slice(DIMENSIONAL_NAME_PREFIX.length);
  if (!remaining) {
    throw new Error(
      `Invalid dimensional element name format: '${dimensionalName}'. Expected format: '${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName[.Level]'`,
    );
  }

  // Greedy matching: try longest table names first
  let matchedTable: NormalizedTable | undefined;
  let matchedTableAfter: string | undefined;

  for (const table of schemaIndex.sortedTables) {
    if (startsWithIgnoreCase(remaining, table.name + '.')) {
      const afterTable = remaining.slice(table.name.length + 1);
      if (!afterTable) {
        throw new Error(
          `Invalid dimensional element name format: '${dimensionalName}'. Expected format: '${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName[.Level]'`,
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
        `Invalid dimensional element name format: '${dimensionalName}'. Expected format: '${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName[.Level]'`,
      );
    }
    const potentialTableName = remaining.slice(0, firstDotIndex);
    const tableMatch = findBestMatch(potentialTableName, schemaIndex.sortedTables, (t) => t.name);
    const suggestion =
      tableMatch && tableMatch.distance <= SUGGESTION_THRESHOLD
        ? ` Did you mean '${tableMatch.best.name}'?`
        : '';
    throw new Error(`Table '${potentialTableName}' not found in the data model.${suggestion}`);
  }

  // Get sorted columns for this table (longest first)
  const sortedColumns = schemaIndex.tableColumnMap.get(matchedTable.name);
  if (!sortedColumns) {
    // Should not happen, but handle gracefully
    throw new Error(`Table '${matchedTable.name}' found but has no columns`);
  }

  // Try matching columns (longest first)
  let matchedColumnWithInvalidLevel: NormalizedColumn | undefined;
  let matchedColumnAfterInvalid: string | undefined;
  const validLevels = DateLevels.all;

  for (const column of sortedColumns) {
    if (equalsIgnoreCase(matchedTableAfter!, column.name)) {
      // Exact match, no level
      return { table: matchedTable, column };
    }

    if (!startsWithIgnoreCase(matchedTableAfter!, column.name + '.')) {
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
        `Invalid date level '${matchedColumnAfterInvalid}' in dimensional element '${dimensionalName}'. Column '${matchedTable.name}.${matchedColumnWithInvalidLevel.name}' is not a datetime column`,
      );
    }
    // Invalid date level on datetime column
    const levelMatch = findBestMatch(matchedColumnAfterInvalid, validLevels, (l) => l);
    const levelSuggestion =
      levelMatch && levelMatch.distance <= SUGGESTION_THRESHOLD
        ? ` Did you mean '${levelMatch.best}'?`
        : '';
    throw new Error(
      `Invalid date level '${matchedColumnAfterInvalid}' in dimensional element '${dimensionalName}'. Valid levels are: ${validLevels.join(
        ', ',
      )}.${levelSuggestion}`,
    );
  }

  // Table matched but no column matched
  // Try to extract potential column name for better error message
  const firstDotIndex = matchedTableAfter!.indexOf('.');
  const potentialColumnName =
    firstDotIndex === -1 ? matchedTableAfter! : matchedTableAfter!.slice(0, firstDotIndex);
  // Use full remaining string for fuzzy match to catch typos in dotted column names (e.g. "Quantity.dollr" -> "Quantity.dollars")
  const columnMatch = findBestMatch(matchedTableAfter!, sortedColumns, (c) => c.name);
  const suggestDifferentName =
    columnMatch &&
    columnMatch.distance <= SUGGESTION_THRESHOLD &&
    !equalsIgnoreCase(columnMatch.best.name, potentialColumnName);
  const columnSuggestion = suggestDifferentName ? ` Did you mean '${columnMatch.best.name}'?` : '';
  const trailingDotHint =
    !suggestDifferentName &&
    matchedTableAfter!.endsWith('.') &&
    columnMatch !== undefined &&
    equalsIgnoreCase(columnMatch.best.name, potentialColumnName)
      ? ` Use '${potentialColumnName}' without a trailing dot.`
      : '';
  throw new Error(
    `Column '${potentialColumnName}' not found in table '${matchedTable.name}'.${columnSuggestion}${trailingDotHint}`,
  );
}

function findColumnAndLevel(
  dimensionalName: string,
  schemaIndex: SchemaIndex,
): { table: NormalizedTable; column: NormalizedColumn; level?: string } {
  const { table, column, level } = parseDimensionalName(dimensionalName, schemaIndex);

  if (level) {
    if (!isDatetime(column.dataType)) {
      throw new Error(
        `Invalid date level '${level}' in dimensional element '${dimensionalName}'. Column '${table.name}.${column.name}' is not a datetime column`,
      );
    }
    const validLevels = DateLevels.all;
    if (!validLevels.includes(level)) {
      throw new Error(
        `Invalid date level '${level}' in dimensional element '${dimensionalName}'. Valid levels are: ${validLevels.join(
          ', ',
        )}`,
      );
    }

    // throw error for time levels on date only column
    const dateOnlyLevels = DateLevels.dateOnly;
    if (column.dataType === 'date' && !dateOnlyLevels.includes(level)) {
      throw new Error(
        `Invalid level '${level}' in dimensional element '${dimensionalName}'. Column '${table.name}.${column.name}' is only a date column, not a datetime column`,
      );
    }

    // throw error for date levels on time only column
    const timeOnlyLevels = DateLevels.timeOnly;
    if (column.dataType === 'time' && !timeOnlyLevels.includes(level)) {
      throw new Error(
        `Invalid level '${level}' in dimensional element '${dimensionalName}'. Column '${table.name}.${column.name}' is only a time column, not a date column`,
      );
    }
  }

  return { table, column, level };
}

/** Options for {@link createAttributeFromName} when translating custom formula context. */
export interface CreateAttributeFromNameOptions {
  /** When the dimensional name has no date level, use this level for datetime columns (e.g. from xdiff function). */
  inferredDateLevel?: string;
}

export function createAttributeFromName(
  attributeName: string,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  options?: CreateAttributeFromNameOptions,
) {
  const { table, column, level } = findColumnAndLevel(attributeName, schemaIndex);

  let granularity: string | undefined = level;
  if (isDatetime(column.dataType) && granularity === undefined && options?.inferredDateLevel) {
    const inferred = options.inferredDateLevel;
    const validLevels = DateLevels.all;
    if (!validLevels.includes(inferred)) {
      throw new Error(
        `Invalid inferred date level '${inferred}'. Valid levels are: ${validLevels.join(', ')}`,
      );
    }
    // Validate inferred level against column temporal type (same as findColumnAndLevel for explicit names)
    const dimensionalElementWithLevel = `${attributeName}.${inferred}`;
    const dateOnlyLevels = DateLevels.dateOnly;
    if (column.dataType === 'date' && !dateOnlyLevels.includes(inferred)) {
      throw new Error(
        `Invalid level '${inferred}' in dimensional element '${dimensionalElementWithLevel}'. Column '${table.name}.${column.name}' is only a date column, not a datetime column`,
      );
    }
    const timeOnlyLevels = DateLevels.timeOnly;
    if (column.dataType === 'time' && !timeOnlyLevels.includes(inferred)) {
      throw new Error(
        `Invalid level '${inferred}' in dimensional element '${dimensionalElementWithLevel}'. Column '${table.name}.${column.name}' is only a time column, not a date column`,
      );
    }
    granularity = inferred;
  }

  return createAttributeHelper({
    expression: column.expression,
    dataType: column.dataType,
    granularity,
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
      `Invalid DateDimension name format: '${dateDimensionName}'. Expected format: '${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName'`,
    );
  }

  // Validate that the field is a datetime type
  if (!isDatetime(column.dataType)) {
    throw new Error(
      `Invalid DateDimension name '${dateDimensionName}'. Column '${column.name}' is not a datetime column (got ${column.dataType}).`,
    );
  }

  return createDateDimension({
    name: column.name,
    expression: column.expression,
    dataSource,
  });
}
