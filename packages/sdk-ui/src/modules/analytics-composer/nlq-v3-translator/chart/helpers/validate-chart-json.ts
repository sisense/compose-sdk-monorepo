/**
 * Validates top-level ChartJSON structure.
 * Detects typos in prop names and invalid chartType values.
 *
 * @internal
 */
import { NlqTranslationError } from '../../../types.js';
import { findBestMatch, SUGGESTION_THRESHOLD } from '../../shared/utils/fuzzy-match.js';
import type { ChartJSON, DataOptionsJSON } from '../../types.js';
import { isRecordStringUnknown } from '../../types.js';
import { isValidChartType, VALID_CHART_TYPES_ARRAY } from './chart-type-schemas.js';

/**
 * Validates top-level ChartJSON structure.
 * Returns normalized ChartJSON and any structural errors.
 *
 * @param rawInput - Raw input (object) to validate
 * @returns Normalized ChartJSON and array of validation errors
 */
export function validateChartJSONStructure(rawInput: unknown): {
  normalized: ChartJSON;
  errors: NlqTranslationError[];
} {
  const errors: NlqTranslationError[] = [];
  const normalized: ChartJSON = {
    chartType: '',
    dataOptions: {},
  };

  if (!isRecordStringUnknown(rawInput)) {
    errors.push({
      category: 'chartType',
      index: -1,
      input: rawInput,
      message: 'Expected an object',
    });
    return { normalized, errors };
  }

  // chartType missing or invalid
  const chartTypeValue = rawInput.chartType;
  if (chartTypeValue === undefined) {
    const inputKeys = Object.keys(rawInput);
    const match = findBestMatch('chartType', inputKeys, (k) => k);
    const suggestion =
      match && match.distance <= SUGGESTION_THRESHOLD
        ? ` Did you mean 'chartType'? (You may have typed '${match.best}')`
        : '';
    const input =
      match && match.distance <= SUGGESTION_THRESHOLD
        ? { [match.best]: rawInput[match.best] }
        : rawInput;
    errors.push({
      category: 'chartType',
      index: -1,
      input,
      message: `chartType is required.${suggestion}`,
    });
  } else if (!isValidChartType(chartTypeValue)) {
    const match = findBestMatch(String(chartTypeValue), VALID_CHART_TYPES_ARRAY, (t) => t);
    const suggestion =
      match && match.distance <= SUGGESTION_THRESHOLD ? ` Did you mean '${match.best}'?` : '';
    const validList = VALID_CHART_TYPES_ARRAY.slice(0, 8).join(', ');
    errors.push({
      category: 'chartType',
      index: -1,
      input: chartTypeValue,
      message: `Invalid chartType '${chartTypeValue}'. Valid types: ${validList}, ...${suggestion}`,
    });
  } else {
    normalized.chartType = chartTypeValue;
  }

  // dataOptions missing
  const dataOptionsValue = rawInput.dataOptions;
  if (dataOptionsValue === undefined) {
    const inputKeys = Object.keys(rawInput);
    const match = findBestMatch('dataOptions', inputKeys, (k) => k);
    const suggestion =
      match && match.distance <= SUGGESTION_THRESHOLD
        ? ` Did you mean 'dataOptions'? (You may have typed '${match.best}')`
        : '';
    const input =
      match && match.distance <= SUGGESTION_THRESHOLD
        ? { [match.best]: rawInput[match.best] }
        : rawInput;
    errors.push({
      category: 'dataOptions',
      index: -1,
      input,
      message: `dataOptions is required.${suggestion}`,
    });
  } else if (dataOptionsValue !== null && typeof dataOptionsValue === 'object') {
    normalized.dataOptions = dataOptionsValue as DataOptionsJSON;
  }

  // Pass through styleOptions and filters (shape already validated by structure)
  if (rawInput.styleOptions !== undefined) {
    normalized.styleOptions = rawInput.styleOptions as ChartJSON['styleOptions'];
  }
  if (rawInput.filters !== undefined && Array.isArray(rawInput.filters)) {
    normalized.filters = rawInput.filters as ChartJSON['filters'];
  }
  if (rawInput.highlights !== undefined && Array.isArray(rawInput.highlights)) {
    normalized.highlights = rawInput.highlights as ChartJSON['highlights'];
  }

  return { normalized, errors };
}
