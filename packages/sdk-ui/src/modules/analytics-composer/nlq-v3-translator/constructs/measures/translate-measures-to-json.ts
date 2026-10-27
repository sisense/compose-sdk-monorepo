import {
  convertSortDirectionToSort,
  convertSortToSortDirection,
  JSONValue,
  Measure,
  Sort,
} from '@sisense/sdk-data';
import type { SortDirection } from '@sisense/sdk-data';
import { parseComposeCodeToFunctionCall } from '@sisense/sdk-data';
import omit from 'lodash-es/omit';

import { NlqTranslationError, NlqTranslationResult } from '../../../types.js';
import { isConditionalColor } from '../../shared/utils/conditional-color.js';
import { toNlqErrorInput } from '../../shared/utils/translation-helpers.js';
import type { MeasureItemJSON, StyledMeasureColumnJSON } from '../../types.js';

/** Runtime StyledMeasureColumn: wrapper with column and optional style (from chart dataOptions) */
type StyledMeasureColumn = { column: Measure; sortType?: SortDirection; [key: string]: unknown };

/**
 * Replaces each formula-driven color condition's `valueMeasure` with its parsed function call, so
 * the threshold measure stays a `FunctionCall` in JSON instead of a serialized class instance.
 *
 * @param color - The `color` style of a measure column.
 * @param path - Error path of the `color` style, such as `measures[0].color`.
 * @returns The color style with JSON-safe condition measures, or an error per invalid condition.
 */
function translateColorConditionMeasuresToJSON(
  color: unknown,
  path: string,
): NlqTranslationResult<unknown> {
  if (!isConditionalColor<{ valueMeasure?: Measure }>(color)) return { success: true, data: color };
  const errors: NlqTranslationError[] = [];
  const conditions = color.conditions.map((condition, index) => {
    const valueMeasure = condition?.valueMeasure;
    if (!valueMeasure) return condition;
    const conditionPath = `${path}.conditions[${index}].valueMeasure`;
    const name = valueMeasure.name || 'unnamed';
    if (!valueMeasure.composeCode) {
      errors.push({
        path: conditionPath,
        input: toNlqErrorInput(valueMeasure),
        message: `Measure (${name}) is missing composeCode`,
      });
      return condition;
    }
    try {
      return {
        ...condition,
        valueMeasure: parseComposeCodeToFunctionCall(valueMeasure.composeCode),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push({
        path: conditionPath,
        input: toNlqErrorInput(valueMeasure),
        message: `Failed to parse composeCode for measure (${name}): ${errorMessage}. ComposeCode: '${valueMeasure.composeCode}'`,
      });
      return condition;
    }
  });
  return errors.length > 0
    ? { success: false, errors }
    : { success: true, data: { ...color, conditions } };
}

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
 * @returns NlqTranslationResult with measure items in NLQ JSON format
 * @internal
 */
export function translateMeasuresToJSON(
  measures: (Measure | StyledMeasureColumn)[],
): NlqTranslationResult<MeasureItemJSON[]> {
  const results: MeasureItemJSON[] = [];
  const errors: NlqTranslationError[] = [];

  measures.forEach((item, index) => {
    const measure = isStyledMeasureColumn(item) ? item.column : item;
    const styledItem = isStyledMeasureColumn(item) ? item : undefined;

    const getInputJson = () => toNlqErrorInput(measure);

    if (!measure.composeCode) {
      errors.push({
        path: `measures[${index}]`,
        input: getInputJson(),
        message: `Measure at index ${index} (${measure.name || 'unnamed'}) is missing composeCode`,
      });
      return;
    }

    const colorResult = translateColorConditionMeasuresToJSON(
      styledItem?.color,
      `measures[${index}].color`,
    );
    if (!colorResult.success) {
      errors.push(...colorResult.errors);
      return;
    }
    const color = colorResult.data as JSONValue | undefined;

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
        if (color !== undefined) style.color = color;
        const styled: StyledMeasureColumnJSON = {
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
        path: `measures[${index}]`,
        input: getInputJson(),
        message: `Failed to parse composeCode for measure at index ${index} (${
          measure.name || 'unnamed'
        }): ${errorMessage}. ComposeCode: '${measure.composeCode}'`,
      });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
}
