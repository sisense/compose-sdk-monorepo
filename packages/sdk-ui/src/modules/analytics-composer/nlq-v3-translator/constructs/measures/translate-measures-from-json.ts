import { isSortDirection, JaqlDataSourceForDto, Measure } from '@sisense/sdk-data';
import omit from 'lodash-es/omit';

import type { SeriesStyle, ValueStyle } from '@/public-api/index.js';

import {
  NlqTranslationError,
  NlqTranslationErrorContext,
  NlqTranslationResult,
} from '../../../types.js';
import { processNode } from '../../shared/expression/process-node.js';
import type { SchemaIndex } from '../../shared/utils/schema-index.js';
import {
  FunctionCall,
  InternalDataSchemaContext,
  isFunctionCall,
  isMeasureElement,
  isStyledMeasureColumnJSON,
  MeasuresInput,
  MeasureTranslationItem,
  StyledMeasureColumnJSON,
} from '../../types.js';

/**
 * Validates sortType for error reporting. Does not apply sort.
 */
const validateMeasureSortType = (
  sortType: string | undefined,
  context: NlqTranslationErrorContext,
): NlqTranslationError | undefined => {
  if (!sortType) return undefined;
  if (!isSortDirection(sortType)) {
    return {
      ...context,
      message: `Invalid sort type. Expected 'sortAsc', 'sortDesc', or 'sortNone'. Got: '${sortType}'.`,
    };
  }
  return undefined;
};

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
 * Processes a single styled measure column JSON item into a measure and style.
 * Does not apply sort to the measure.
 *
 * @param styledMeasure - The styled measure column JSON object
 * @param dataSource - Data source
 * @param schemaIndex - Schema index
 * @param context - Error context
 * @returns Object with the measure, style, and any validation errors
 */
const processStyledMeasureColumn = (
  styledMeasure: StyledMeasureColumnJSON,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  context: NlqTranslationErrorContext,
): { measure?: Measure; style: ValueStyle & SeriesStyle; error?: NlqTranslationError } => {
  const measureElement = processNode({
    data: styledMeasure.column,
    context: { dataSource, schemaIndex, pathPrefix: '' },
  });

  if (!isMeasureElement(measureElement)) {
    return {
      style: {} as ValueStyle & SeriesStyle,
      error: { ...context, message: 'Invalid measure JSON' },
    };
  }

  const sortError = validateMeasureSortType(styledMeasure.sortType, context);
  if (sortError) {
    const style = omit(styledMeasure, 'column') as ValueStyle & SeriesStyle;
    return { measure: measureElement, style, error: sortError };
  }

  const style = omit(styledMeasure, 'column') as ValueStyle & SeriesStyle;
  return { measure: measureElement, style };
};

/**
 * Processes a single measure JSON item into a measure and optional style.
 *
 * @param measureJSON - The measure JSON item (FunctionCall or StyledMeasureColumnJSON)
 * @param dataSource - Data source
 * @param schemaIndex - Schema index
 * @param context - Error context
 * @returns Object with the measure, optional style, and any validation errors
 */
const processMeasureItem = (
  measureJSON: FunctionCall | StyledMeasureColumnJSON | unknown,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  context: NlqTranslationErrorContext,
): { measure?: Measure; style?: ValueStyle & SeriesStyle; error?: NlqTranslationError } => {
  if (isStyledMeasureColumnJSON(measureJSON)) {
    return processStyledMeasureColumn(measureJSON, dataSource, schemaIndex, context);
  }

  if (isFunctionCall(measureJSON)) {
    const result = translateMeasureFromJSONFunctionCall(
      measureJSON,
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
        "Invalid measure item. Expected a function call (function/args) or object with 'column' and optional 'sortType'.",
    },
  };
};

/**
 * Translates an array of JSON measure items (FunctionCall or StyledMeasureColumnJSON) to enriched format.
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
): NlqTranslationResult<MeasureTranslationItem[]> => {
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

  const results: MeasureTranslationItem[] = [];
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
        results.push(
          result.style !== undefined
            ? { measure: result.measure, style: result.style }
            : { measure: result.measure },
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ ...context, message: errorMsg });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
};
