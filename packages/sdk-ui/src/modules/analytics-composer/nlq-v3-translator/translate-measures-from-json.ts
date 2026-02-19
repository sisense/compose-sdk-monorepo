import {
  convertSortDirectionToSort,
  isSortDirection,
  JaqlDataSourceForDto,
  JSONValue,
  Measure,
} from '@sisense/sdk-data';

import { NlqTranslationError, NlqTranslationErrorContext, NlqTranslationResult } from '../types.js';
import { SchemaIndex } from './common.js';
import { processNode } from './process-function/process-node.js';
import {
  FunctionCall,
  InternalDataSchemaContext,
  isFunctionCall,
  isMeasureElement,
  isStyledMeasureColumnJSON,
  MeasuresInput,
  StyledMeasureColumnJSON,
} from './types.js';

/**
 * Translate a single function call to a measure.
 *
 * @internal
 */
export const translateMeasureFromJSONFunctionCall = (
  functionCall: FunctionCall,
  context: InternalDataSchemaContext,
  errorContext: NlqTranslationErrorContext,
): NlqTranslationResult<Measure> => {
  const { dataSource, schemaIndex } = context;
  try {
    const measure = processNode({
      data: functionCall,
      context: { dataSource, schemaIndex, pathPrefix: '' },
    });
    if (!isMeasureElement(measure)) {
      return {
        success: false,
        errors: [{ ...errorContext, message: 'Invalid measure JSON' }],
      };
    }
    return { success: true, data: measure };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      errors: [{ ...errorContext, message: errorMsg }],
    };
  }
};

/**
 * Applies sorting to a measure if a valid sort type is provided.
 *
 * @param measure - The measure to sort
 * @param sortType - Optional sort type (SortDirection | undefined)
 * @param context - Error context for validation errors
 * @returns Object with the sorted measure and any validation errors
 */
const applyMeasureSort = (
  measure: Measure,
  sortType: string | undefined,
  context: NlqTranslationErrorContext,
): { measure: Measure; error?: NlqTranslationError } => {
  if (!sortType) {
    return { measure };
  }

  if (!isSortDirection(sortType)) {
    return {
      measure,
      error: {
        ...context,
        message: `Invalid sort type. Expected "sortAsc", "sortDesc", or "sortNone". Got: "${sortType}".`,
      },
    };
  }

  return { measure: measure.sort(convertSortDirectionToSort(sortType)) };
};

/**
 * Processes a single styled measure column JSON item into a measure.
 *
 * @param styledMeasure - The styled measure column JSON object
 * @param dataSource - Data source
 * @param schemaIndex - Schema index
 * @param context - Error context
 * @returns Object with the measure and any validation errors
 */
const processStyledMeasureColumn = (
  styledMeasure: StyledMeasureColumnJSON,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  context: NlqTranslationErrorContext,
): { measure?: Measure; error?: NlqTranslationError } => {
  const measureElement = processNode({
    data: styledMeasure.column,
    context: { dataSource, schemaIndex, pathPrefix: '' },
  });

  if (!isMeasureElement(measureElement)) {
    return { error: { ...context, message: 'Invalid measure JSON' } };
  }

  return applyMeasureSort(measureElement, styledMeasure.sortType, context);
};

/**
 * Processes a single measure JSON item into a measure.
 *
 * @param measureJSON - The measure JSON item (FunctionCall or StyledMeasureColumnJSON)
 * @param dataSource - Data source
 * @param schemaIndex - Schema index
 * @param context - Error context
 * @returns Object with the measure and any validation errors
 */
const processMeasureItem = (
  measureJSON: FunctionCall | StyledMeasureColumnJSON | unknown,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  context: NlqTranslationErrorContext,
): { measure?: Measure; error?: NlqTranslationError } => {
  if (isStyledMeasureColumnJSON(measureJSON)) {
    return processStyledMeasureColumn(measureJSON, dataSource, schemaIndex, context);
  }

  if (isFunctionCall(measureJSON as JSONValue)) {
    const result = translateMeasureFromJSONFunctionCall(
      measureJSON as FunctionCall,
      { dataSource, schemaIndex },
      context,
    );
    if (!result.success) {
      return { error: result.errors[0] };
    }
    return { measure: result.data };
  }

  return {
    error: {
      ...context,
      message:
        'Invalid measure item. Expected a function call (function/args) or object with "column" and optional "sortType".',
    },
  };
};

/**
 * Translates an array of JSON measure items (FunctionCall or StyledMeasureColumnJSON) to measures.
 *
 * Direction: JSON → CSDK
 *
 * @example
 * [
 *   { "function": "measureFactory.sum", "args": ["DM.Commerce.Revenue", "Total Revenue"] },
 *   { "column": { "function": "measureFactory.sum", "args": ["DM.Commerce.Cost", "Total Cost"] }, "sortType": "sortDesc" }
 * ]
 * @internal
 */
export const translateMeasuresFromJSON = (
  input: MeasuresInput,
): NlqTranslationResult<Measure[]> => {
  const { data: measuresJSON } = input;
  const { dataSource, schemaIndex } = input.context;

  if (!measuresJSON) {
    return { success: true, data: [] };
  }

  if (!Array.isArray(measuresJSON)) {
    return {
      success: false,
      errors: [
        {
          category: 'measures',
          index: -1,
          input: measuresJSON,
          message: 'Invalid measures JSON. Expected an array.',
        },
      ],
    };
  }

  const results: Measure[] = [];
  const errors: NlqTranslationError[] = [];

  measuresJSON.forEach((measureJSON, index) => {
    const context: NlqTranslationErrorContext = {
      category: 'measures',
      index,
      input: measureJSON,
    };
    try {
      const result = processMeasureItem(measureJSON, dataSource, schemaIndex, context);
      if (result.error) {
        errors.push(result.error);
        return;
      }
      if (result.measure) {
        results.push(result.measure);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ ...context, message: errorMsg });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
};
