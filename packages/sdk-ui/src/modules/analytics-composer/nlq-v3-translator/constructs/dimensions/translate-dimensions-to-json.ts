import {
  Attribute,
  convertSortDirectionToSort,
  convertSortToSortDirection,
  type FunctionCall,
  JSONValue,
  MetadataTypes,
  parseComposeCodeToFunctionCall,
  Sort,
} from '@sisense/sdk-data';
import type { SortDirection } from '@sisense/sdk-data';
import omit from 'lodash-es/omit';

import { NlqTranslationError, NlqTranslationResult } from '../../../types.js';
import { toNlqErrorInput } from '../../shared/utils/translation-helpers.js';
import {
  DIMENSIONAL_NAME_PREFIX,
  type DimensionItemJSON,
  type StyledColumnJSON,
} from '../../types.js';

/** Runtime StyledColumn: wrapper with column and optional CategoryStyle (from chart dataOptions) */
type StyledColumn = { column: Attribute; sortType?: SortDirection; [key: string]: unknown };

function isStyledColumn(item: unknown): item is StyledColumn {
  return (
    typeof item === 'object' &&
    item !== null &&
    'column' in item &&
    (item as Record<string, unknown>).column !== undefined
  );
}

/**
 * Translates CSDK Attribute or StyledColumn array to NLQ JSON format (string or StyledColumnJSON array).
 *
 * When an attribute has sort applied (via getSort() or StyledColumn.sortType), or when StyledColumn
 * has other style props (dateFormat, numberFormatConfig, etc.), outputs StyledColumnJSON with all
 * properties; otherwise outputs composeCode string.
 *
 * @param dimensions - Array of CSDK Attribute or StyledColumn objects
 * @returns NlqTranslationResult with dimension items in NLQ JSON format
 * @internal
 */
export function translateDimensionsToJSON(
  dimensions: (Attribute | StyledColumn)[],
): NlqTranslationResult<DimensionItemJSON[]> {
  const results: DimensionItemJSON[] = [];
  const errors: NlqTranslationError[] = [];

  dimensions.forEach((item, index) => {
    const attr = isStyledColumn(item) ? item.column : item;
    const styledItem = isStyledColumn(item) ? item : undefined;

    const getInputJson = () => toNlqErrorInput(attr);

    if (!attr.composeCode) {
      errors.push({
        path: `dimensions[${index}]`,
        input: getInputJson(),
        message: `Dimension at index ${index} (${attr.name || 'unnamed'}) is missing composeCode`,
      });
      return;
    }

    // A calculated dimension is defined by a formula, not by a table/column path, so its compose
    // code is an attributeFactory call rather than a 'DM.' reference.
    if (
      !attr.composeCode.startsWith(DIMENSIONAL_NAME_PREFIX) &&
      !MetadataTypes.isCalculatedAttribute(attr)
    ) {
      errors.push({
        path: `dimensions[${index}]`,
        input: getInputJson(),
        message: `Expected composeCode to start with '${DIMENSIONAL_NAME_PREFIX}' for dimension at index ${index} (${
          attr.name || 'unnamed'
        }). Got: '${attr.composeCode}'`,
      });
      return;
    }

    // Prefer StyledColumn.sortType when present (sort lives on wrapper, not on attribute)
    const sort =
      (styledItem?.sortType ? convertSortDirectionToSort(styledItem.sortType) : undefined) ??
      (attr.getSort?.() !== undefined && attr.getSort?.() !== Sort.None
        ? attr.getSort()
        : undefined);

    const style = styledItem ? (omit(styledItem, 'column') as Record<string, JSONValue>) : {};
    const hasStyle =
      (sort !== undefined && sort !== Sort.None) || (styledItem && Object.keys(style).length > 0);

    // A plain dimension is referenced by name, so its composeCode goes out as-is. A calculated
    // dimension is a factory call and must go out parsed, the way measures do — emitting the raw
    // string would produce JSON that translateDimensionsFromJSON cannot read back, since a string
    // there is resolved as a name.
    let column: string | FunctionCall;
    if (MetadataTypes.isCalculatedAttribute(attr)) {
      try {
        column = parseComposeCodeToFunctionCall(attr.composeCode);
      } catch (error) {
        errors.push({
          path: `dimensions[${index}]`,
          input: getInputJson(),
          message: `Failed to parse composeCode for calculated dimension at index ${index} (${
            attr.name || 'unnamed'
          }): ${error instanceof Error ? error.message : 'Unknown error'}. ComposeCode: '${
            attr.composeCode
          }'`,
        });
        return;
      }
    } else {
      column = attr.composeCode;
    }

    if (hasStyle) {
      const styled: StyledColumnJSON = {
        column,
        ...(sort !== undefined &&
          sort !== Sort.None && { sortType: convertSortToSortDirection(sort) }),
        ...style,
      };
      results.push(styled);
    } else {
      results.push(column);
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
}
