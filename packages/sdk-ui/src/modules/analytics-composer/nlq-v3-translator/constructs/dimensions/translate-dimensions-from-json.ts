import {
  Attribute,
  isSortDirection,
  JaqlDataSourceForDto,
  PivotRowsSort,
  SortDirection,
} from '@sisense/sdk-data';
import omit from 'lodash-es/omit';

import type { CategoryStyle } from '@/domains/visualizations/core/chart-data-options/types.js';

import {
  NlqTranslationError,
  NlqTranslationErrorContext,
  NlqTranslationResult,
} from '../../../types.js';
import { processNode } from '../../shared/expression/process-node.js';
import {
  createAttributeFromName,
  REQUIRE_EXPLICIT_DATE_LEVEL,
  type SchemaIndex,
} from '../../shared/utils/schema-index.js';
import {
  DimensionsInput,
  DimensionTranslationItem,
  type FunctionCall,
  isAttributeElement,
  isFunctionCall,
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
  // A styled column may hold a calculated dimension, which is defined by a formula and so cannot
  // be resolved by name.
  const attribute = isFunctionCall(styledColumn.column)
    ? processCalculatedDimension(styledColumn.column, dataSource, schemaIndex, context)
    : createAttributeFromName(
        styledColumn.column,
        dataSource,
        schemaIndex,
        REQUIRE_EXPLICIT_DATE_LEVEL,
      );
  if (sortError) {
    return {
      attribute,
      style: {},
      error: sortError,
    };
  }

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
/**
 * Builds a calculated attribute (a calculated dimension) from a parsed compose-code function call.
 *
 * A calculated dimension has no table/column, so it cannot be resolved by name the way a plain
 * dimension is — it carries its own `formula` and `context` instead.
 */
const processCalculatedDimension = (
  functionCall: FunctionCall,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  context: NlqTranslationErrorContext,
): Attribute => {
  const element = processNode({
    data: functionCall,
    context: { dataSource, schemaIndex, pathPrefix: context.path },
  });

  if (!isAttributeElement(element)) {
    throw new Error(
      `Expected '${functionCall.function}' to produce an attribute, got a different element type.`,
    );
  }

  return element;
};

const processDimensionItem = (
  dimensionJSON: string | StyledColumnJSON | unknown,
  dataSource: JaqlDataSourceForDto,
  schemaIndex: SchemaIndex,
  context: NlqTranslationErrorContext,
): { attribute?: Attribute; style?: CategoryStyle; error?: NlqTranslationError } => {
  if (typeof dimensionJSON === 'string') {
    const attribute = createAttributeFromName(
      dimensionJSON,
      dataSource,
      schemaIndex,
      REQUIRE_EXPLICIT_DATE_LEVEL,
    );
    return { attribute };
  }

  if (isFunctionCall(dimensionJSON)) {
    return {
      attribute: processCalculatedDimension(dimensionJSON, dataSource, schemaIndex, context),
    };
  }

  if (isStyledColumnJSON(dimensionJSON)) {
    return processStyledColumn(dimensionJSON, dataSource, schemaIndex, context);
  }

  return {
    error: {
      ...context,
      message:
        "Invalid dimension item. Expected a string (composeCode), a function call for a calculated dimension, or an object with 'column' and optional 'sortType'.",
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
          path: 'dimensions',
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
      path: `dimensions[${index}]`,
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
