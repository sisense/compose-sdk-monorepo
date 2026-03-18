import { convertDataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import { PivotTableProps } from '@/props.js';

import type { NlqTranslationError } from '../../types.js';
import { NlqTranslationResult } from '../../types.js';
import { translateFiltersFromJSON } from '../constructs/filters/translate-filters-from-json.js';
import { translateHighlightsFromJSON } from '../constructs/filters/translate-filters-from-json.js';
import { createSchemaIndex } from '../shared/utils/schema-index.js';
import { collectTranslationErrors } from '../shared/utils/translation-helpers.js';
import type { PivotTableInput } from '../types.js';
import {
  translatePivotTableDataOptionsFromJSON,
  validatePivotTableJSONStructure,
} from './helpers/index.js';

/**
 * Translates NLQ PivotTableJSON format to CSDK pivot table props.
 * Direction: JSON → CSDK
 *
 * @param input - PivotTableInput object containing pivotTableJSON and data schema context
 * @returns NlqTranslationResult with PivotTableProps or errors
 * @internal
 */
export const translatePivotTableFromJSON = (
  input: PivotTableInput,
): NlqTranslationResult<PivotTableProps> => {
  const { data: pivotTableJSON, context } = input;
  const { dataSource, tables } = context;

  // Phase 1: Validate top-level structure
  const { normalized, errors: structureErrors } = validatePivotTableJSONStructure(pivotTableJSON);
  if (structureErrors.length > 0) {
    return { success: false, errors: structureErrors };
  }

  const schemaIndex = createSchemaIndex(tables);
  const translationErrors: NlqTranslationError[] = [];

  // Translate dataOptions
  const dataOptions = translatePivotTableDataOptionsFromJSON(
    normalized.dataOptions,
    { dataSource, schemaIndex },
    translationErrors,
  );

  // Translate filters if present
  let filters: Filter[] | FilterRelations | null = null;
  if (normalized.filters && normalized.filters.length > 0) {
    filters = collectTranslationErrors<Filter[] | FilterRelations>(
      () =>
        translateFiltersFromJSON({
          data: normalized.filters || [],
          context: { dataSource, schemaIndex },
        }),
      translationErrors,
    );
  }

  // Translate highlights if present
  let highlights: Filter[] | null = null;
  if (normalized.highlights && normalized.highlights.length > 0) {
    highlights = collectTranslationErrors<Filter[]>(
      () =>
        translateHighlightsFromJSON({
          data: normalized.highlights || [],
          context: { dataSource, schemaIndex },
        }),
      translationErrors,
    );
  }

  if (translationErrors.length > 0 || dataOptions === null) {
    return {
      success: false,
      errors: translationErrors,
    };
  }

  const result: PivotTableProps = {
    dataSet: convertDataSource(dataSource),
    dataOptions,
    ...(normalized.styleOptions && { styleOptions: normalized.styleOptions }),
    ...(filters && { filters }),
    ...(highlights && { highlights }),
  };

  return {
    success: true,
    data: result,
  };
};
