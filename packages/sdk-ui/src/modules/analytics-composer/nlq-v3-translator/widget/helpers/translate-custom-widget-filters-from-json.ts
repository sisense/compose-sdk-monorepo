import type { Filter, FilterRelations, FunctionCall } from '@sisense/sdk-data';

import type {
  DataSchemaContext,
  NlqTranslationError,
  NlqTranslationResult,
} from '../../../types.js';
import {
  translateFiltersFromJSON,
  translateHighlightsFromJSON,
} from '../../constructs/filters/translate-filters-from-json.js';
import { createSchemaIndex } from '../../shared/utils/schema-index.js';
import { collectTranslationErrors } from '../../shared/utils/translation-helpers.js';

export type CustomWidgetFiltersTranslation = {
  readonly filters?: Filter[] | FilterRelations;
  readonly highlights?: Filter[];
};

/**
 * Translates custom-widget filters and highlights from NLQ JSON to CSDK filters.
 *
 * @internal
 */
export const translateCustomWidgetFiltersFromJSON = (
  filters: FunctionCall[] | undefined,
  highlights: FunctionCall[] | undefined,
  context: DataSchemaContext,
): NlqTranslationResult<CustomWidgetFiltersTranslation> => {
  const schemaIndex = createSchemaIndex(context.tables);
  const filterContext = { dataSource: context.dataSource, schemaIndex };

  const translationErrors: NlqTranslationError[] = [];

  const translatedFilters =
    filters && filters.length > 0
      ? collectTranslationErrors(
          () => translateFiltersFromJSON({ data: filters, context: filterContext }),
          translationErrors,
        )
      : undefined;

  const translatedHighlights =
    highlights && highlights.length > 0
      ? collectTranslationErrors(
          () => translateHighlightsFromJSON({ data: highlights, context: filterContext }),
          translationErrors,
        )
      : undefined;

  if (translationErrors.length > 0) {
    return { success: false, errors: translationErrors };
  }

  return {
    success: true,
    data: {
      ...(translatedFilters !== null &&
        translatedFilters !== undefined && { filters: translatedFilters }),
      ...(translatedHighlights !== null &&
        translatedHighlights !== undefined && { highlights: translatedHighlights }),
    },
  };
};
