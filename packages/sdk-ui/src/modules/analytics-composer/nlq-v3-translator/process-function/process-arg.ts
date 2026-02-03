/* eslint-disable max-lines */
import { JaqlDataSourceForDto, LevelAttribute } from '@sisense/sdk-data';

import {
  createAttributeFromName,
  createDateDimensionFromName,
  getAttributeTypeDisplayString,
  isDateLevelAttribute,
  type SchemaIndex,
} from '../common.js';
import { ArgInput, DIMENSIONAL_NAME_PREFIX, isFunctionCall, ProcessedArg } from '../types.js';
import { processNode } from './process-node.js';

/**
 * Checks if a string is a valid ISO date time string
 */
function isValidIsoDateString(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  // Basic format check: ensure string starts with YYYY-MM-DD pattern
  // This catches obviously malformed strings before parsing
  const datePattern = /^\d{4}-\d{2}-\d{2}/;
  if (!datePattern.test(value)) {
    return false;
  }

  // Check ISO 8601 format - use Date.parse for validation
  // Date.parse already validates:
  // - The string is parseable as a date
  // - Date components are valid (rejects '2024-13-01', '2024-01-32', etc.)
  // - The format is acceptable to JavaScript's Date parser
  const timestamp = Date.parse(value);
  if (isNaN(timestamp) || value.length < 10) {
    return false;
  }

  // Verify the parsed date is valid
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Processes an attribute string with validation and helpful error messages
 */
function processAttributeString(
  attrStr: string,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  errorPrefix: string,
): ProcessedArg {
  // Already has DM prefix - validate and create attribute
  if (attrStr.startsWith(DIMENSIONAL_NAME_PREFIX)) {
    try {
      return createAttributeFromName(attrStr, dataSource, schemaIndex);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`${errorPrefix}: ${errorMessage}`);
    }
  }

  throw new Error(
    `${errorPrefix}: Invalid attribute "${attrStr}". Expected format: "${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName[.Level]"`,
  );
}

function processDateDimensionString(
  dateDimensionStr: string,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  errorPrefix: string,
): ProcessedArg {
  if (dateDimensionStr.startsWith(DIMENSIONAL_NAME_PREFIX)) {
    try {
      return createDateDimensionFromName(dateDimensionStr, dataSource, schemaIndex);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`${errorPrefix}: ${errorMessage}`);
    }
  }

  throw new Error(
    `${errorPrefix}: Invalid date dimension string "${dateDimensionStr}". Expected format: "${DIMENSIONAL_NAME_PREFIX}TableName.ColumnName"`,
  );
}

/**
 * Processes a single argument based on its expected type schema
 *
 * @param input - The input containing raw argument, schema, and context
 * @returns The processed argument
 */
export function processArg(input: ArgInput): ProcessedArg {
  const rawArg = input.data;
  const { argSchema, dataSource, schemaIndex, pathPrefix } = input.context;
  const errorPrefix = pathPrefix;

  // Handle undefined arguments
  if (rawArg === undefined) {
    if (argSchema.required) {
      throw new Error(`${errorPrefix}: Required argument is missing (expected ${argSchema.type})`);
    }
    return undefined;
  }

  switch (argSchema.type) {
    case 'string':
      if (typeof rawArg !== 'string') {
        throw new Error(`${errorPrefix}: Expected string, got ${typeof rawArg}`);
      }
      return rawArg;

    case 'number':
      if (typeof rawArg !== 'number') {
        throw new Error(`${errorPrefix}: Expected number, got ${typeof rawArg}`);
      }
      return rawArg;

    case 'boolean':
      if (typeof rawArg !== 'boolean') {
        throw new Error(`${errorPrefix}: Expected boolean, got ${typeof rawArg}`);
      }
      return rawArg;

    case 'string[]':
      if (!Array.isArray(rawArg)) {
        throw new Error(
          `${errorPrefix}: Expected array of strings, got ${typeof rawArg}. Example: ["value1", "value2"]`,
        );
      }
      if (!rawArg.every((item) => typeof item === 'string')) {
        throw new Error(
          `${errorPrefix}: Expected array of strings, but contains non-string values`,
        );
      }
      return rawArg;

    case 'number[]':
      if (!Array.isArray(rawArg)) {
        throw new Error(
          `${errorPrefix}: Expected array of numbers, got ${typeof rawArg}. Example: [10, 20]`,
        );
      }
      if (!rawArg.every((item) => typeof item === 'number')) {
        throw new Error(
          `${errorPrefix}: Expected array of numbers, but contains non-number values`,
        );
      }
      return rawArg;

    case 'Attribute':
      if (typeof rawArg !== 'string') {
        throw new Error(
          `${errorPrefix}: Expected attribute string, got ${typeof rawArg}. Example: "DM.Commerce.Revenue"`,
        );
      }
      return processAttributeString(rawArg, dataSource, schemaIndex, errorPrefix);

    case 'Attribute[]':
      if (!Array.isArray(rawArg)) {
        throw new Error(
          `${errorPrefix}: Expected array of attributes, got ${typeof rawArg}. Example: ["DM.Commerce.AgeRange"]`,
        );
      }
      return rawArg.map((item, i) => {
        if (typeof item !== 'string') {
          throw new Error(`${errorPrefix}[${i}]: Expected attribute string, got ${typeof item}`);
        }
        return processAttributeString(item, dataSource, schemaIndex, `${errorPrefix}[${i}]`);
      });

    case 'Measure':
    case 'BaseMeasure':
      if (!isFunctionCall(rawArg)) {
        throw new Error(
          `${errorPrefix}: Expected measure function call, got ${typeof rawArg}. Example: {"function": "measureFactory.sum", "args": ["DM.Commerce.Revenue"]}`,
        );
      }
      return processNode({
        data: rawArg,
        context: { dataSource, schemaIndex, pathPrefix: errorPrefix },
      });

    case 'Measure[]':
      if (!Array.isArray(rawArg)) {
        throw new Error(
          `${errorPrefix}: Expected array of measure function calls, got ${typeof rawArg}`,
        );
      }
      return rawArg.map((item, i) => {
        if (!isFunctionCall(item)) {
          throw new Error(
            `${errorPrefix}[${i}]: Expected measure function call, got ${typeof item}`,
          );
        }
        return processNode({
          data: item,
          context: { dataSource, schemaIndex, pathPrefix: `${errorPrefix}[${i}]` },
        });
      });

    case 'Filter':
      if (!isFunctionCall(rawArg)) {
        throw new Error(
          `${errorPrefix}: Expected filter function call, got ${typeof rawArg}. Example: {"function": "filterFactory.contains", "args": ["DM.Brand.Brand", "Apple"]}`,
        );
      }
      return processNode({
        data: rawArg,
        context: { dataSource, schemaIndex, pathPrefix: errorPrefix },
      });

    case 'Filter[]':
      if (!Array.isArray(rawArg)) {
        throw new Error(
          `${errorPrefix}: Expected array of filter function calls, got ${typeof rawArg}`,
        );
      }
      return rawArg.map((item, i) => {
        if (!isFunctionCall(item)) {
          throw new Error(
            `${errorPrefix}[${i}]: Expected filter function call, got ${typeof item}`,
          );
        }
        return processNode({
          data: item,
          context: { dataSource, schemaIndex, pathPrefix: `${errorPrefix}[${i}]` },
        });
      });

    case 'FilterRelationsNode':
      // FilterRelationsNode can be Filter | FilterRelations | Filter[]
      if (Array.isArray(rawArg)) {
        // Array of filters - validate each one
        return rawArg.map((item, i) => {
          if (!isFunctionCall(item)) {
            throw new Error(
              `${errorPrefix}[${i}]: Expected filter function call, got ${typeof item}`,
            );
          }
          return processNode({
            data: item,
            context: { dataSource, schemaIndex, pathPrefix: `${errorPrefix}[${i}]` },
          });
        });
      } else if (isFunctionCall(rawArg)) {
        return processNode({
          data: rawArg,
          context: { dataSource, schemaIndex, pathPrefix: errorPrefix },
        });
      } else {
        throw new Error(
          `${errorPrefix}: Expected filter function call or array of filters, got ${typeof rawArg}`,
        );
      }

    case 'DateDimension':
      if (typeof rawArg !== 'string') {
        throw new Error(
          `${errorPrefix}: Expected date dimension string, got ${typeof rawArg}. Example: "DM.Commerce.Date"`,
        );
      }
      return processDateDimensionString(rawArg, dataSource, schemaIndex, errorPrefix);

    case 'LevelAttribute': {
      if (typeof rawArg !== 'string') {
        throw new Error(
          `${errorPrefix}: Expected date attribute string, got ${typeof rawArg}. Example: "DM.Commerce.Date.Years"`,
        );
      }
      const levelAttribute = processAttributeString(
        rawArg,
        dataSource,
        schemaIndex,
        errorPrefix,
      ) as LevelAttribute;
      // Validate that the attribute is actually a date level attribute
      if (!isDateLevelAttribute(levelAttribute)) {
        throw new Error(
          `${errorPrefix}: Attribute must be date/datetime type, got ${getAttributeTypeDisplayString(
            levelAttribute,
          )} attribute`,
        );
      }
      return levelAttribute;
    }

    case 'Measure | number':
      if (typeof rawArg === 'number') {
        return rawArg;
      } else if (isFunctionCall(rawArg)) {
        return processNode({
          data: rawArg,
          context: { dataSource, schemaIndex, pathPrefix: errorPrefix },
        });
      } else {
        throw new Error(
          `${errorPrefix}: Expected measure function call or number, got ${typeof rawArg}`,
        );
      }

    case 'Date | string':
      if (typeof rawArg === 'string') {
        // Check if it's a valid ISO date string
        if (isValidIsoDateString(rawArg)) {
          return rawArg;
        }
        // Throw error for invalid date strings
        throw new Error(
          `${errorPrefix}: Expected valid ISO date string or Date object, got invalid date string "${rawArg}"`,
        );
      } else if (rawArg instanceof Date) {
        return rawArg;
      } else {
        throw new Error(
          `${errorPrefix}: Expected date string or Date object, got ${typeof rawArg}`,
        );
      }

    case 'string | number':
      if (typeof rawArg === 'string' || typeof rawArg === 'number') {
        return rawArg;
      } else {
        throw new Error(`${errorPrefix}: Expected string or number, got ${typeof rawArg}`);
      }

    case 'BaseFilterConfig':
    case 'MembersFilterConfig':
    case 'CustomFormulaContext':
    case 'any':
      // For complex config objects, perform basic null check and return as-is
      if (rawArg == null && argSchema.required) {
        throw new Error(`${errorPrefix}: Required argument is null/undefined`);
      }
      return rawArg;

    default:
      // Fallback for unknown types
      return rawArg;
  }
}
