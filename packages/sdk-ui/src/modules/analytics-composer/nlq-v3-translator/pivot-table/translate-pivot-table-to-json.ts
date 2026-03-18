import { JSONValue } from '@sisense/sdk-data';

import { PivotTableProps } from '@/props.js';

import { NlqTranslationError, NlqTranslationResult } from '../../types.js';
import { translateFiltersToJSON } from '../constructs/filters/translate-filters-to-json.js';
import { translateHighlightsToJSON } from '../constructs/filters/translate-filters-to-json.js';
import { translateSingleAxisToJSON } from '../shared/data-options/index.js';
import {
  collectTranslationErrors,
  stripDelimitersFromJson,
} from '../shared/utils/translation-helpers.js';
import type { PivotTableDataOptionsJSON, PivotTableJSON } from '../types.js';

/**
 * Translates CSDK pivot table props to NLQ PivotTableJSON format.
 * Direction: CSDK → JSON
 *
 * @param pivotTableProps - Partial pivot table props with dataOptions
 * @returns NlqTranslationResult with PivotTableJSON or errors
 * @internal
 */
export const translatePivotTableToJSON = (
  pivotTableProps: Partial<PivotTableProps>,
): NlqTranslationResult<PivotTableJSON> => {
  const translationErrors: NlqTranslationError[] = [];

  if (!pivotTableProps.dataOptions) {
    return {
      success: false,
      errors: [
        {
          category: 'dataOptions',
          index: -1,
          input: pivotTableProps,
          message: 'dataOptions is required',
        },
      ],
    };
  }

  const dataOptions = pivotTableProps.dataOptions;
  const dataOptionsJSON: PivotTableDataOptionsJSON = {};

  // rows, columns: dimensions
  for (const axisKey of ['rows', 'columns'] as const) {
    const axisValue = dataOptions[axisKey];
    if (axisValue && axisValue.length > 0) {
      const result = translateSingleAxisToJSON(axisKey, axisValue, 'dimension');
      if (!result.success) {
        translationErrors.push(...result.errors);
      } else {
        dataOptionsJSON[axisKey] = result.data as PivotTableDataOptionsJSON['rows'];
      }
    }
  }

  // values: measures
  const values = dataOptions.values;
  if (values && values.length > 0) {
    const result = translateSingleAxisToJSON('values', values, 'measure');
    if (!result.success) {
      translationErrors.push(...result.errors);
    } else {
      dataOptionsJSON.values = result.data as PivotTableDataOptionsJSON['values'];
    }
  }

  // grandTotals: passthrough
  if (dataOptions.grandTotals !== undefined) {
    dataOptionsJSON.grandTotals = dataOptions.grandTotals;
  }

  // Translate filters
  let filtersJSON: PivotTableJSON['filters'] = undefined;
  if (pivotTableProps.filters) {
    const filtersResult = collectTranslationErrors(
      () => translateFiltersToJSON(pivotTableProps.filters),
      translationErrors,
    );
    filtersJSON = (filtersResult ?? undefined) as PivotTableJSON['filters'];
  }

  // Translate highlights
  let highlightsJSON: PivotTableJSON['highlights'] = undefined;
  if (pivotTableProps.highlights && pivotTableProps.highlights.length > 0) {
    const highlightsResult = collectTranslationErrors(
      () => translateHighlightsToJSON(pivotTableProps.highlights),
      translationErrors,
    );
    highlightsJSON = (highlightsResult ?? undefined) as PivotTableJSON['highlights'];
  }

  if (translationErrors.length > 0) {
    return { success: false, errors: translationErrors };
  }

  const pivotTableJSONBase: PivotTableJSON = {
    dataOptions: dataOptionsJSON,
    ...(pivotTableProps.styleOptions && { styleOptions: pivotTableProps.styleOptions }),
    ...(filtersJSON && filtersJSON.length > 0 && { filters: filtersJSON }),
    ...(highlightsJSON && highlightsJSON.length > 0 && { highlights: highlightsJSON }),
  };

  // Type boundary: PivotTableJSON is JSON-serializable at runtime but TS does not infer assignability to JSONValue
  const strippedJSON = stripDelimitersFromJson(
    pivotTableJSONBase as unknown as JSONValue,
  ) as unknown as PivotTableJSON;

  return {
    success: true,
    data: strippedJSON,
  };
};
