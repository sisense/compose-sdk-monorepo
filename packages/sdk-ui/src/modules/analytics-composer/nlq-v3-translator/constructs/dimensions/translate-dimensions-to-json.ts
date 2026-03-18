import {
  Attribute,
  convertSortDirectionToSort,
  convertSortToSortDirection,
  JSONArray,
  JSONValue,
  Sort,
} from '@sisense/sdk-data';
import type { SortDirection } from '@sisense/sdk-data';
import omit from 'lodash-es/omit';

import { NlqTranslationError, NlqTranslationResult } from '../../../types.js';
import { DIMENSIONAL_NAME_PREFIX } from '../../types.js';

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
 * @returns NlqTranslationResult<JSONArray> - JSON array output for NLQ dimensions
 * @internal
 */
export function translateDimensionsToJSON(
  dimensions: (Attribute | StyledColumn)[],
): NlqTranslationResult<JSONArray> {
  const results: JSONArray = [];
  const errors: NlqTranslationError[] = [];

  dimensions.forEach((item, index) => {
    const attr = isStyledColumn(item) ? item.column : item;
    const styledItem = isStyledColumn(item) ? item : undefined;

    const getInputJson = () =>
      typeof attr.toJSON === 'function'
        ? attr.toJSON()
        : (attr as unknown as Record<string, unknown>);

    if (!attr.composeCode) {
      errors.push({
        category: 'dimensions',
        index,
        input: getInputJson(),
        message: `Dimension at index ${index} (${attr.name || 'unnamed'}) is missing composeCode`,
      });
      return;
    }

    if (!attr.composeCode.startsWith(DIMENSIONAL_NAME_PREFIX)) {
      errors.push({
        category: 'dimensions',
        index,
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

    if (hasStyle) {
      const styled: JSONValue = {
        column: attr.composeCode,
        ...(sort !== undefined &&
          sort !== Sort.None && { sortType: convertSortToSortDirection(sort) }),
        ...style,
      };
      results.push(styled);
    } else {
      results.push(attr.composeCode);
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
}
