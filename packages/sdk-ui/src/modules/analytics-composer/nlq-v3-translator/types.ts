import {
  Filter,
  FilterRelations,
  JaqlDataSourceForDto,
  JSONArray,
  JSONValue,
  Measure,
} from '@sisense/sdk-data';

import { NlqTranslationInput } from '../types.js';
import type { SchemaIndex } from './common.js';

/**
 * Internal context type that uses schemaIndex for efficient lookups
 * @internal
 */
export interface InternalDataSchemaContext {
  /** The data source being used for the query */
  dataSource: JaqlDataSourceForDto;
  /** Schema index for efficient table/column lookups */
  schemaIndex: SchemaIndex;
}

export const DIMENSIONAL_NAME_PREFIX = 'DM.';

// Argument types for function validation
export type ArgType =
  // Basic types
  | 'string' // "Total Revenue", "DESC", etc.
  | 'string[]' // ["2012-01-01T00:00:00"], member arrays
  | 'number' // 5, 100, ranking values
  | 'number[]' // [10, 20] for numeric ranges
  | 'boolean' // true/false flags

  // SDK Object types (from function calls)
  | 'Attribute' // "DM.Commerce.Revenue" → Attribute
  | 'Attribute[]' // ["DM.Commerce.AgeRange"] → Attribute[]
  | 'Measure' // Function call → Measure (general)
  | 'BaseMeasure' // Function call → BaseMeasure (specific aggregation)
  | 'Measure[]' // Array of function calls → Measure[]
  | 'Filter' // Function call → Filter
  | 'Filter[]' // Array of function calls → Filter[]
  | 'FilterRelationsNode' // Filter | FilterRelations | Filter[]
  | 'DateDimension' // Date-specific attributes
  | 'LevelAttribute' // Date level attributes

  // Union types
  | 'Measure | number' // Can be either measure function or number
  | 'Date | string' // Date objects or ISO date strings
  | 'string | number' // String or numeric values

  // Configuration objects
  | 'BaseFilterConfig' // Optional filter config
  | 'MembersFilterConfig' // Members-specific filter config
  | 'CustomFormulaContext' // Custom formula context object

  // Catch-all for complex objects
  | 'any'; // Skip validation for complex types

// Argument schema for function validation
export interface ArgSchema {
  type: ArgType;
  required: boolean;
}

// Type to represent a function argument value (non-recursive base type)
export type ArgValue = string | number | boolean | FunctionCall | string[];

// Type to represent a function argument (includes context objects)
// Context objects use ArgValue to avoid circular reference
export type Arg = ArgValue | Record<string, ArgValue>;
export type ProcessedArg = unknown;
export type QueryElement = Filter | FilterRelations | Measure;
export type FactoryFunction = (...args: unknown[]) => QueryElement;

// Type to represent the structure parsed from the JSON
export type FunctionCall = {
  function: string;
  args: Arg[];
};

/**
 * Context object passed to all custom processors containing runtime information
 * needed for processing.
 * @internal
 */
export interface FunctionContext extends InternalDataSchemaContext {
  /** Path prefix for error messages (e.g., 'args[0].function') */
  pathPrefix: string;
}

export interface ArgContext extends FunctionContext {
  argSchema: ArgSchema;
}

// Translation input types (internal - use schemaIndex)
export type DimensionsInput = NlqTranslationInput<JSONArray, InternalDataSchemaContext>;
export type MeasuresInput = NlqTranslationInput<JSONArray, InternalDataSchemaContext>;
export type FiltersInput = NlqTranslationInput<JSONArray, InternalDataSchemaContext>;
export type HighlightsInput = NlqTranslationInput<JSONArray, InternalDataSchemaContext>;

// Function call input types (internal - use schemaIndex)
export type MeasuresFunctionCallInput = NlqTranslationInput<
  FunctionCall[],
  InternalDataSchemaContext
>;
export type FiltersFunctionCallInput = NlqTranslationInput<
  FunctionCall[],
  InternalDataSchemaContext
>;
export type HighlightsFunctionCallInput = NlqTranslationInput<
  FunctionCall[],
  InternalDataSchemaContext
>;

// Core processing input types (internal - use schemaIndex)
export type NodeInput = NlqTranslationInput<FunctionCall, FunctionContext>;
export type ArgInput = NlqTranslationInput<Arg, ArgContext>;

/**
 * Custom processor function signature.
 */
export type CustomFunctionProcessor = (
  processedArgs: ProcessedArg[],
  context: FunctionContext,
) => void;

export function isFunctionCall(value: JSONValue): value is FunctionCall {
  return typeof value === 'object' && value !== null && 'function' in value && 'args' in value;
}

export function isFunctionCallArray(value: JSONArray): value is FunctionCall[] {
  return value.every(isFunctionCall);
}

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

export function isStringArray(value: JSONArray): value is string[] {
  return value.every((item) => typeof item === 'string');
}
