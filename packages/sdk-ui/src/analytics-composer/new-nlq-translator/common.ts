import {
  createAttributeHelper,
  DateLevels,
  Filter,
  FilterRelations,
  JaqlDataSourceForDto,
  filterFactory,
  measureFactory,
  JSONArray,
  JSONValue,
  Measure,
  DataType,
} from '@sisense/sdk-data';
import { NormalizedTable, NormalizedField } from '../types.js';

// Type to represent a function arg
export type ParsedArg = string | number | ParsedFunctionCall | string[];

// Type to represent the structure parsed from the JSON
export type ParsedFunctionCall = {
  function: string;
  args: ParsedArg[];
};

function isParsedFunctionCall(value: JSONValue): value is ParsedFunctionCall {
  return typeof value === 'object' && value !== null && 'function' in value && 'args' in value;
}

export function isParsedFunctionCallArray(value: JSONArray): value is ParsedFunctionCall[] {
  return value.every(isParsedFunctionCall);
}

type QueryElement = Filter | FilterRelations | Measure;

// Type guard to check if the argument is a Filter
export function isFilterElement(arg: QueryElement): arg is Filter {
  return 'attribute' in arg && 'config' in arg;
}

// Type guard to check if the argument is a FilterRelations
export function isFilterRelationsElement(arg: QueryElement): arg is FilterRelations {
  return 'left' in arg && 'right' in arg && 'operator' in arg;
}

export function isMeasureElement(arg: QueryElement): arg is Measure {
  return !isFilterElement(arg) && !isFilterRelationsElement(arg);
}

export function getFactoryFunctionsMap(
  factoryName: string,
  factoryObject: Record<string, any>,
): Record<string, (...args: any[]) => any> {
  const functionsMap: Record<string, (...args: any[]) => any> = {};
  const prefix = factoryName !== '' ? factoryName + '.' : '';
  for (const key in factoryObject) {
    if (typeof factoryObject[`${key}`] === 'function') {
      functionsMap[`${prefix}${key}`] = factoryObject[`${key}`];
    } else if (typeof factoryObject[`${key}`] === 'object') {
      const nestedFunctionsMap = getFactoryFunctionsMap('', factoryObject[`${key}`]);
      for (const nestedKey in nestedFunctionsMap) {
        functionsMap[`${prefix}${key}.${nestedKey}`] = nestedFunctionsMap[`${nestedKey}`];
      }
    }
  }
  return functionsMap;
}

export const measureFactoryFunctionsMap = getFactoryFunctionsMap('measureFactory', measureFactory);
export const filterFactoryFunctionsMap = getFactoryFunctionsMap('filterFactory', filterFactory);

function executeFunction(functionPath: string, args: any[]): QueryElement {
  const parts = functionPath.split('.');
  const factoryName = parts[0];

  if (factoryName === 'filterFactory' && filterFactoryFunctionsMap[`${functionPath}`]) {
    return (
      filterFactoryFunctionsMap[`${functionPath}`] as (...params: any[]) => Filter | FilterRelations
    )(...args);
  } else if (factoryName === 'measureFactory' && measureFactoryFunctionsMap[`${functionPath}`]) {
    return (measureFactoryFunctionsMap[`${functionPath}`] as (...params: ParsedArg[]) => Measure)(
      ...args,
    );
  }

  throw new Error(`Function "${functionPath}" not found in filterFactory or measureFactory.`);
}

function parseAttributeName(attributeName: string): {
  tableName: string;
  columnName: string;
  level?: string;
} {
  // Parse "DM.Commerce.Date.Years" -> tableName: "Commerce", columnName: "Date", level: "Years"
  // Parse "DM.Brand.Brand" -> tableName: "Brand", columnName: "Brand", level: undefined
  const parts = attributeName.split('.');
  if (parts.length < 3 || parts[0] !== 'DM') {
    throw new Error(
      `Invalid attribute name format: "${attributeName}". Expected format: "DM.TableName.ColumnName[.Level]".`,
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
    throw new Error(`Table "${tableName}" not found in the data model.`);
  }

  const field = table.columns.find((column) => column.name === columnName);
  if (!field) {
    throw new Error(`Column "${columnName}" not found in table "${tableName}".`);
  }

  if (level) {
    if (field.dataType !== DataType.DATETIME) {
      throw new Error(
        `Invalid date level "${level}" in attribute "${attributeName}". Column "${tableName}.${columnName}" is not a datetime column.`,
      );
    }
    const validLevels = DateLevels.all;
    if (!validLevels.includes(level)) {
      throw new Error(
        `Invalid date level "${level}" in attribute "${attributeName}". Valid levels are: ${validLevels.join(
          ', ',
        )}.`,
      );
    }
  }

  return { field, level };
}

export function createAttribute(
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

function processArg(arg: ParsedArg, dataSource: JaqlDataSourceForDto, tables: NormalizedTable[]) {
  if (
    typeof arg === 'object' &&
    arg !== null &&
    !Array.isArray(arg) &&
    'function' in arg &&
    'args' in arg
  ) {
    return processNode(arg, dataSource, tables);
  }
  if (typeof arg === 'string' && arg.startsWith('DM.')) {
    return createAttribute(arg, dataSource, tables);
  }
  return arg;
}

/**
 * Recursively processes a parsed JSON object to execute filterFactory and measureFactory functions.
 *
 * @param parsedObject - The parsed JSON object representing a function call or a nested structure.
 * @param dataSource - The data source to use for the query.
 * @param tables - The tables to use for the query.
 * @returns The result of the executed function or the processed nested structure.
 */
export function processNode(
  parsedObject: ParsedFunctionCall,
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): QueryElement {
  const { function: functionPath, args } = parsedObject;
  // Recursively process arguments that are also function calls
  const processedArgs = args.map((arg) => processArg(arg, dataSource, tables));
  return executeFunction(functionPath, processedArgs);
}
