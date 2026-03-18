/**
 * Validates top-level PivotTableJSON structure.
 * Detects typos in prop names and invalid dataOptions structure.
 *
 * @internal
 */
import { NlqTranslationError } from '../../../types.js';
import { findBestMatch, SUGGESTION_THRESHOLD } from '../../shared/utils/fuzzy-match.js';
import type { PivotTableDataOptionsJSON, PivotTableJSON } from '../../types.js';
import { isRecordStringUnknown } from '../../types.js';

const PIVOT_DATA_OPTIONS_KEYS = ['rows', 'columns', 'values', 'grandTotals'] as const;

function isValidGrandTotals(value: unknown): boolean {
  if (!isRecordStringUnknown(value)) return false;
  const keys = Object.keys(value);
  return (
    keys.every((k) => k === 'rows' || k === 'columns') &&
    keys.every((k) => typeof value[k] === 'boolean')
  );
}

/**
 * Validates top-level PivotTableJSON structure.
 * Returns normalized PivotTableJSON and any structural errors.
 *
 * @param rawInput - Raw input (object) to validate
 * @returns Normalized PivotTableJSON and array of validation errors
 */
export function validatePivotTableJSONStructure(rawInput: unknown): {
  normalized: PivotTableJSON;
  errors: NlqTranslationError[];
} {
  const errors: NlqTranslationError[] = [];
  const normalized: PivotTableJSON = {
    dataOptions: {},
  };

  if (!isRecordStringUnknown(rawInput)) {
    errors.push({
      category: 'dataOptions',
      index: -1,
      input: rawInput,
      message: 'Expected an object',
    });
    return { normalized, errors };
  }

  // dataOptions required
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
  } else if (isRecordStringUnknown(dataOptionsValue)) {
    const dataOptions = dataOptionsValue;
    normalized.dataOptions = dataOptions as PivotTableDataOptionsJSON;

    // Validate dataOptions keys (typo detection)
    for (const key of Object.keys(dataOptions)) {
      if (!(PIVOT_DATA_OPTIONS_KEYS as readonly string[]).includes(key)) {
        const match = findBestMatch(key, [...PIVOT_DATA_OPTIONS_KEYS], (k) => k);
        const suggestion =
          match && match.distance <= SUGGESTION_THRESHOLD ? ` Did you mean '${match.best}'?` : '';
        errors.push({
          category: 'dataOptions',
          index: key,
          input: dataOptions[key],
          message: `Unknown dataOptions key '${key}'. Valid keys: rows, columns, values, grandTotals.${suggestion}`,
        });
      }
    }

    // Validate rows, columns, values are arrays (if present)
    for (const key of ['rows', 'columns', 'values'] as const) {
      const val = dataOptions[key];
      if (val !== undefined && val !== null && !Array.isArray(val)) {
        errors.push({
          category: 'dataOptions',
          index: key,
          input: val,
          message: `dataOptions.${key} must be an array`,
        });
      }
    }

    // Validate grandTotals shape (if present)
    const grandTotals = dataOptions.grandTotals;
    if (grandTotals !== undefined && grandTotals !== null && !isValidGrandTotals(grandTotals)) {
      errors.push({
        category: 'dataOptions',
        index: 'grandTotals',
        input: grandTotals,
        message: 'grandTotals must be an object with optional rows?: boolean, columns?: boolean',
      });
    }
  }

  // Pass through styleOptions, filters, highlights
  if (rawInput.styleOptions !== undefined) {
    normalized.styleOptions = rawInput.styleOptions as PivotTableJSON['styleOptions'];
  }
  if (rawInput.filters !== undefined && Array.isArray(rawInput.filters)) {
    normalized.filters = rawInput.filters as PivotTableJSON['filters'];
  }
  if (rawInput.highlights !== undefined && Array.isArray(rawInput.highlights)) {
    normalized.highlights = rawInput.highlights as PivotTableJSON['highlights'];
  }

  return { normalized, errors };
}
