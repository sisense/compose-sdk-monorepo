import {
  Attribute,
  convertSortDirectionToSort,
  isSortDirection,
  JaqlDataSourceForDto,
  PivotRowsSort,
  SortDirection,
} from '@sisense/sdk-data';

import { NlqTranslationError, NlqTranslationErrorContext, NlqTranslationResult } from '../types.js';
import { createAttributeFromName, SchemaIndex } from './common.js';
import { DimensionsInput, isStyledColumnJSON, StyledColumnJSON } from './types.js';

/**
 * Applies sorting to an attribute if a valid sort type is provided.
 *
 * @param attribute - The attribute to sort
 * @param sortType - Optional sort type (SortDirection | PivotRowsSort | undefined)
 * @param context - Error context for validation errors
 * @returns Object with the sorted attribute and any validation errors
 */
const applyAttributeSort = (
  attribute: Attribute,
  sortType: SortDirection | PivotRowsSort | undefined,
  context: NlqTranslationErrorContext,
): { attribute: Attribute; error?: NlqTranslationError } => {
  if (!sortType) {
    return { attribute };
  }

  // Extract direction from PivotRowsSort object or use SortDirection string directly
  const direction = typeof sortType === 'object' ? sortType.direction : sortType;

  if (!isSortDirection(direction)) {
    return {
      attribute,
      error: {
        ...context,
        message: `Invalid sort type. Expected "sortAsc", "sortDesc", or "sortNone". Got: "${direction}".`,
      },
    };
  }

  return { attribute: attribute.sort(convertSortDirectionToSort(direction)) };
};

/**
 * Processes a single styled column JSON item into an attribute.
 *
 * @param styledColumn - The styled column JSON object
 * @param dataSource - Data source
 * @param schemaIndex - Schema index
 * @param context - Error context
 * @returns Object with the attribute and any validation errors
 */
const processStyledColumn = (
  styledColumn: StyledColumnJSON,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  context: NlqTranslationErrorContext,
): { attribute: Attribute; error?: NlqTranslationError } => {
  const attribute = createAttributeFromName(styledColumn.column, dataSource, schemaIndex);
  return applyAttributeSort(attribute, styledColumn.sortType, context);
};

/**
 * Processes a single dimension JSON item into an attribute.
 *
 * @param dimensionJSON - The dimension JSON item (string or StyledColumnJSON)
 * @param dataSource - Data source
 * @param schemaIndex - Schema index
 * @param context - Error context
 * @returns Object with the attribute and any validation errors
 */
const processDimensionItem = (
  dimensionJSON: string | StyledColumnJSON | unknown,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  context: NlqTranslationErrorContext,
): { attribute?: Attribute; error?: NlqTranslationError } => {
  if (typeof dimensionJSON === 'string') {
    const attribute = createAttributeFromName(dimensionJSON, dataSource, schemaIndex);
    return { attribute };
  }

  if (isStyledColumnJSON(dimensionJSON)) {
    return processStyledColumn(dimensionJSON, dataSource, schemaIndex, context);
  }

  return {
    error: {
      ...context,
      message:
        'Invalid dimension item. Expected a string (composeCode) or object with "column" and optional "sortType".',
    },
  };
};

/**
 * Translates an array of JSON dimension items (strings or StyledColumnJSON) to attributes.
 *
 * Direction: JSON → CSDK
 *
 * @param input - DimensionsInput object
 * @returns NlqTranslationResult<Attribute[]>
 */
export const translateDimensionsFromJSON = (
  input: DimensionsInput,
): NlqTranslationResult<Attribute[]> => {
  const { data: dimensionsJSON } = input;
  const { dataSource, schemaIndex } = input.context;

  if (!dimensionsJSON) {
    return { success: true, data: [] };
  }

  if (!Array.isArray(dimensionsJSON)) {
    return {
      success: false,
      errors: [
        {
          category: 'dimensions',
          index: -1,
          input: dimensionsJSON,
          message: 'Invalid dimensions JSON. Expected an array.',
        },
      ],
    };
  }

  const results: Attribute[] = [];
  const errors: NlqTranslationError[] = [];

  dimensionsJSON.forEach((dimensionJSON, index) => {
    const context: NlqTranslationErrorContext = {
      category: 'dimensions',
      index,
      input: dimensionJSON,
    };
    try {
      const result = processDimensionItem(dimensionJSON, dataSource, schemaIndex, context);
      if (result.error) {
        errors.push(result.error);
        return;
      }
      if (result.attribute) {
        results.push(result.attribute);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ ...context, message: errorMsg });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
};
