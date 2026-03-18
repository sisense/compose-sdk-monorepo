import {
  Attribute,
  Filter,
  FilterRelations,
  JaqlDataSourceForDto,
  JSONArray,
  Measure,
  PivotGrandTotals,
} from '@sisense/sdk-data';

import { CategoryStyle, SeriesStyle, ValueStyle } from '@/public-api/index.js';
import type { PivotTableStyleOptions } from '@/types.js';

import { DataSchemaContext, NlqTranslationInput } from '../types.js';
import type { SchemaIndex } from './shared/utils/schema-index.js';

/**
 * Internal context type that uses schemaIndex for efficient lookups
 * @internal
 */
export interface InternalDataSchemaContext {
  /** The data source being used for the query */
  dataSource: JaqlDataSourceForDto;
  /** Schema index for efficient table/column lookups */
  schemaIndex: SchemaIndex;
  /** Chart type for axis-specific translation (e.g., pivot columns, boxplot value) */
  chartType?: string;
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

/**
 * Type guard: value is a non-null object (Record<string, unknown>).
 * @internal
 */
export function isRecordStringUnknown(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isFunctionCall(value: unknown): value is FunctionCall {
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

/**
 * Enriched dimension translation result. Style uses CategoryStyle (same as StyledColumn).
 *
 * @internal
 */
export type DimensionTranslationItem = {
  attribute: Attribute;
  style?: CategoryStyle;
};

/**
 * Enriched measure translation result. Style uses ValueStyle & SeriesStyle (same as StyledMeasureColumn).
 *
 * @internal
 */
export type MeasureTranslationItem = {
  measure: Measure;
  style?: ValueStyle & SeriesStyle;
};

/**
 * JSON-facing type for a styled dimension/attribute.
 * Reusable for query JSON and future chart JSON (translateChartFromJSON).
 *
 * @internal
 */
export interface StyledColumnJSON extends CategoryStyle {
  /** Attribute reference (composeCode), e.g. "DM.Commerce.Gender" */
  column: string;
}

/**
 * JSON-facing type for a styled measure.
 * Reusable for query JSON and future chart JSON (translateChartFromJSON).
 *
 * @internal
 */
export interface StyledMeasureColumnJSON extends ValueStyle, SeriesStyle {
  /** Measure definition (function/args), e.g. { function: "measureFactory.sum", args: [...] } */
  column: FunctionCall;
}

/**
 * Dimension item in query JSON: plain composeCode string or styled column.
 *
 * @internal
 */
export type DimensionItemJSON = string | StyledColumnJSON;

/**
 * Measure item in query JSON: plain function call or styled measure.
 *
 * @internal
 */
export type MeasureItemJSON = FunctionCall | StyledMeasureColumnJSON;

/**
 * Type guard: value is StyledColumnJSON (object with column, not a FunctionCall).
 *
 * @internal
 */
export function isStyledColumnJSON(value: unknown): value is StyledColumnJSON {
  return (
    isRecordStringUnknown(value) &&
    'column' in value &&
    typeof value.column === 'string' &&
    !('function' in value && 'args' in value)
  );
}

/**
 * Type guard: value is StyledMeasureColumnJSON (object with column containing a measure definition).
 *
 * @internal
 */
export function isStyledMeasureColumnJSON(value: unknown): value is StyledMeasureColumnJSON {
  if (!isRecordStringUnknown(value) || !('column' in value)) {
    return false;
  }
  return isFunctionCall(value.column);
}

/**
 * JSON representation of chart data options.
 * Maps axis names to arrays of dimension or measure items.
 * Supports all chart types (cartesian, categorical, scatter, etc.).
 *
 * @internal
 */
export interface DataOptionsJSON {
  // Cartesian charts (column, line, bar, area, polar)
  category?: DimensionItemJSON[];
  /** Array for cartesian/categorical; single for calendar-heatmap */
  value?: MeasureItemJSON[] | MeasureItemJSON;
  breakBy?: DimensionItemJSON[];

  // Scatter charts
  x?: DimensionItemJSON | MeasureItemJSON;
  y?: DimensionItemJSON | MeasureItemJSON;
  breakByPoint?: DimensionItemJSON;
  breakByColor?: DimensionItemJSON | MeasureItemJSON;
  size?: MeasureItemJSON;

  // Categorical charts (pie, funnel, treemap, sunburst) - use category/value

  // Boxplot
  boxType?: MeasureItemJSON;
  outliers?: MeasureItemJSON[];

  // Scattermap
  geo?: DimensionItemJSON[];
  colorBy?: MeasureItemJSON;
  details?: DimensionItemJSON;

  // Areamap
  color?: MeasureItemJSON[];

  // Calendar heatmap
  date?: DimensionItemJSON;

  // Table/Pivot
  columns?: (DimensionItemJSON | MeasureItemJSON)[];
  rows?: DimensionItemJSON[];
  values?: MeasureItemJSON[];

  // Indicator
  secondary?: MeasureItemJSON[];
  min?: MeasureItemJSON[];
  max?: MeasureItemJSON[];
}

/**
 * JSON representation of a chart configuration from NLQ API.
 * Matches the structure returned by NLQ v3 for chart recommendations.
 * Reusable for chart JSON translation (translateChartFromJSON/translateChartToJSON).
 *
 * @internal
 */
export interface ChartJSON {
  /** Chart type (e.g., 'column', 'line', 'bar', 'pie', 'scatter') */
  chartType: string;

  /** Data options mapping chart axes to dimensions/measures */
  dataOptions: DataOptionsJSON;

  /** Optional style options for chart appearance (colors, legend, axes, etc.) */
  styleOptions?: Record<string, unknown>;

  /** Optional filters to apply to the chart data */
  filters?: FunctionCall[];

  /** Optional highlights (filter criteria) to apply to the chart */
  highlights?: FunctionCall[];
}

/**
 * Input type for chart translation (JSON → CSDK).
 * Combines chartJSON with data schema context.
 *
 * @internal
 */
export type ChartInput = NlqTranslationInput<ChartJSON, DataSchemaContext>;

/**
 * JSON representation of pivot table data options.
 *
 * @internal
 */
export interface PivotTableDataOptionsJSON {
  rows?: DimensionItemJSON[];
  columns?: DimensionItemJSON[];
  values?: MeasureItemJSON[];
  grandTotals?: PivotGrandTotals;
}

/**
 * JSON representation of pivot table config from NLQ API.
 *
 * @internal
 */
export interface PivotTableJSON {
  dataOptions: PivotTableDataOptionsJSON;
  styleOptions?: PivotTableStyleOptions;
  filters?: FunctionCall[];
  highlights?: FunctionCall[];
}

/**
 * Input type for pivot table translation (JSON → CSDK).
 *
 * @internal
 */
export type PivotTableInput = NlqTranslationInput<PivotTableJSON, DataSchemaContext>;
