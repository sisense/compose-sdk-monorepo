import {
  convertSortDirectionToSort,
  convertSortToSortDirection,
  JSONArray,
  JSONValue,
  Measure,
  Sort,
} from '@sisense/sdk-data';
import type { SortDirection } from '@sisense/sdk-data';
import { parseComposeCodeToFunctionCall } from '@sisense/sdk-data';
import omit from 'lodash-es/omit';

import { NlqTranslationError, NlqTranslationResult } from '../../../types.js';

/** Runtime StyledMeasureColumn: wrapper with column and optional style (from chart dataOptions) */
type StyledMeasureColumn = { column: Measure; sortType?: SortDirection; [key: string]: unknown };

function isStyledMeasureColumn(item: unknown): item is StyledMeasureColumn {
  return (
    typeof item === 'object' &&
    item !== null &&
    'column' in item &&
    (item as Record<string, unknown>).column !== undefined
  );
}

/**
 * Translates CSDK Measure or StyledMeasureColumn array to NLQ JSON format (FunctionCall or StyledMeasureColumnJSON array).
 *
 * When a measure has sort applied (via getSort() or StyledMeasureColumn.sortType), or when StyledMeasureColumn
 * has other style props (trend, forecast, numberFormatConfig, etc.), outputs StyledMeasureColumnJSON;
 * otherwise outputs the parsed FunctionCall.
 *
 * @param measures - Array of CSDK Measure or StyledMeasureColumn objects
 * @returns NlqTranslationResult<JSONArray> - JSON array output for NLQ measures
 * @internal
 */
export function translateMeasuresToJSON(
  measures: (Measure | StyledMeasureColumn)[],
): NlqTranslationResult<JSONArray> {
  const results: JSONArray = [];
  const errors: NlqTranslationError[] = [];

  measures.forEach((item, index) => {
    const measure = isStyledMeasureColumn(item) ? item.column : item;
    const styledItem = isStyledMeasureColumn(item) ? item : undefined;

    const getInputJson = () =>
      typeof measure.toJSON === 'function' ? measure.toJSON() : (measure as unknown as JSONValue);

    if (!measure.composeCode) {
      errors.push({
        category: 'measures',
        index,
        input: getInputJson(),
        message: `Measure at index ${index} (${measure.name || 'unnamed'}) is missing composeCode`,
      });
      return;
    }

    try {
      const functionCall = parseComposeCodeToFunctionCall(measure.composeCode);
      // Prefer StyledMeasureColumn.sortType when present (sort lives on wrapper, not on measure)
      const sort =
        (styledItem?.sortType ? convertSortDirectionToSort(styledItem.sortType) : undefined) ??
        (measure.getSort?.() !== undefined && measure.getSort?.() !== Sort.None
          ? measure.getSort()
          : undefined);

      const hasStyle =
        (sort !== undefined && sort !== Sort.None) ||
        (styledItem && Object.keys(omit(styledItem, 'column')).length > 0);

      if (hasStyle) {
        const style = styledItem ? (omit(styledItem, 'column') as Record<string, JSONValue>) : {};
        const styled: JSONValue = {
          column: functionCall,
          ...(sort !== undefined &&
            sort !== Sort.None && { sortType: convertSortToSortDirection(sort) }),
          ...style,
        };
        results.push(styled);
      } else {
        results.push(functionCall);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push({
        category: 'measures',
        index,
        input: getInputJson(),
        message: `Failed to parse composeCode for measure at index ${index} (${
          measure.name || 'unnamed'
        }): ${errorMessage}. ComposeCode: '${measure.composeCode}'`,
      });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
}
