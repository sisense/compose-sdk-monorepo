/**
 * Translates pivot table dataOptions from JSON to CSDK format.
 * Uses shared translateSingleAxisFromJSON for rows, columns, values.
 *
 * @internal
 */
import type { PivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/types.js';

import { NlqTranslationError } from '../../../types.js';
import { translateSingleAxisFromJSON } from '../../shared/data-options/index.js';
import type { InternalDataSchemaContext, PivotTableDataOptionsJSON } from '../../types.js';

/**
 * Translates pivot table dataOptions from JSON to CSDK format.
 * Pivot has fixed axes: rows/columns (dimensions), values (measures), grandTotals (passthrough).
 */
export function translatePivotTableDataOptionsFromJSON(
  dataOptionsJSON: PivotTableDataOptionsJSON | undefined,
  context: InternalDataSchemaContext,
  translationErrors: NlqTranslationError[],
): PivotTableDataOptions | null {
  if (!dataOptionsJSON || typeof dataOptionsJSON !== 'object') {
    translationErrors.push({
      category: 'dataOptions',
      index: -1,
      input: dataOptionsJSON,
      message: 'dataOptions is required',
    });
    return null;
  }

  const result: Record<string, unknown> = {};
  const errorsBefore = translationErrors.length;

  // rows, columns: dimensions
  for (const axisKey of ['rows', 'columns'] as const) {
    const translated = translateSingleAxisFromJSON(
      axisKey,
      dataOptionsJSON[axisKey],
      'dimension',
      context,
      translationErrors,
    );
    if (translated) {
      result[axisKey] = translated;
    }
  }

  // values: measures
  const valuesTranslated = translateSingleAxisFromJSON(
    'values',
    dataOptionsJSON.values,
    'measure',
    context,
    translationErrors,
  );
  if (valuesTranslated) {
    result.values = valuesTranslated;
  }

  // grandTotals: passthrough
  if (dataOptionsJSON.grandTotals !== undefined) {
    result.grandTotals = dataOptionsJSON.grandTotals;
  }

  // Object shape is produced by pivot axis translators and matches PivotTableDataOptions.
  return translationErrors.length > errorsBefore ? null : (result as PivotTableDataOptions);
}
