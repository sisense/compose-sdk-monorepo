import {
  Attribute,
  isSortDirection,
  JaqlDataSourceForDto,
  PivotRowsSort,
  SortDirection,
} from '@sisense/sdk-data';
import omit from 'lodash-es/omit';

import type { CategoryStyle } from '@/public-api/index.js';

import {
  NlqTranslationError,
  NlqTranslationErrorContext,
  NlqTranslationResult,
} from '../../../types.js';
import { createAttributeFromName, type SchemaIndex } from '../../shared/utils/schema-index.js';
import {
  DimensionsInput,
  DimensionTranslationItem,
  isStyledColumnJSON,
  StyledColumnJSON,
} from '../../types.js';

/**
 * Validates sortType for error reporting. Does not apply sort.
 */
const validateSortType = (
  sortType: SortDirection | PivotRowsSort | undefined,
  context: NlqTranslationErrorContext,
): NlqTranslationError | undefined => {
  if (!sortType) return undefined;
  const direction = typeof sortType === 'object' ? sortType.direction : sortType;
  if (!isSortDirection(direction)) {
    return {
      ...context,
      message: `Invalid sort type. Expected 'sortAsc', 'sortDesc', or 'sortNone'. Got: '${direction}'.`,
    };
  }
  return undefined;
};

/**
 * Processes a single styled column JSON item into an attribute and style.
 * Does not apply sort to the attribute.
 *
 * @param styledColumn - The styled column JSON object
 * @param dataSource - Data source
 * @param schemaIndex - Schema index
 * @param context - Error context
 * @returns Object with the attribute, style, and any validation errors
 */
const processStyledColumn = (
  styledColumn: StyledColumnJSON,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  context: NlqTranslationErrorContext,
): { attribute: Attribute; style: CategoryStyle; error?: NlqTranslationError } => {
  const sortError = validateSortType(styledColumn.sortType, context);
  if (sortError) {
    return {
      attribute: createAttributeFromName(styledColumn.column, dataSource, schemaIndex),
      style: {},
      error: sortError,
    };
  }

  const attribute = createAttributeFromName(styledColumn.column, dataSource, schemaIndex);
  const style = omit(styledColumn, 'column') as CategoryStyle;
  return { attribute, style };
};

/**
 * Processes a single dimension JSON item into an attribute and optional style.
 *
 * @param dimensionJSON - The dimension JSON item (string or StyledColumnJSON)
 * @param dataSource - Data source
 * @param schemaIndex - Schema index
 * @param context - Error context
 * @returns Object with the attribute, optional style, and any validation errors
 */
const processDimensionItem = (
  dimensionJSON: string | StyledColumnJSON | unknown,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  context: NlqTranslationErrorContext,
): { attribute?: Attribute; style?: CategoryStyle; error?: NlqTranslationError } => {
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
        "Invalid dimension item. Expected a string (composeCode) or object with 'column' and optional 'sortType'.",
    },
  };
};

/**
 * Translates an array of JSON dimension items (strings or StyledColumnJSON) to enriched format.
 *
 * Direction: JSON → CSDK
 *
 * @param input - DimensionsInput object
 * @returns NlqTranslationResult<DimensionTranslationItem[]>
 */
export const translateDimensionsFromJSON = (
  input: DimensionsInput,
): NlqTranslationResult<DimensionTranslationItem[]> => {
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

  const results: DimensionTranslationItem[] = [];
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
        results.push(
          result.style !== undefined
            ? { attribute: result.attribute, style: result.style }
            : { attribute: result.attribute },
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ ...context, message: errorMsg });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
};
