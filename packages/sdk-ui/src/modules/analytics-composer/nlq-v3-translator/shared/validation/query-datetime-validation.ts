import {
  Attribute,
  Filter,
  isDateRangeFilter,
  isLevelAttribute,
  isMembersFilter,
  isRelativeDateFilter,
  LevelAttribute,
} from '@sisense/sdk-data';

import { NlqTranslationError } from '../../../types.js';
import { isDateLevelAttribute } from '../utils/attribute-helpers.js';
import { getDateColumnDisplayName } from './datetime-validation-utils.js';
import { flattenFilters } from './flatten-filters.js';

type DateLevelRef = {
  columnName: string;
  granularity: string;
  source: string;
};

function getDateLevelRef(attribute: Attribute, source: string): DateLevelRef | null {
  if (!isDateLevelAttribute(attribute)) {
    return null;
  }
  const levelAttribute = attribute as LevelAttribute;
  return {
    columnName: getDateColumnDisplayName(levelAttribute),
    granularity: levelAttribute.granularity,
    source,
  };
}

function collectDateLevelRefsFromFilters(filters: Filter[], sourcePrefix: string): DateLevelRef[] {
  const refs: DateLevelRef[] = [];
  filters.forEach((filter, index) => {
    const source = `${sourcePrefix}[${index}]`;
    if (
      (isMembersFilter(filter) || isDateRangeFilter(filter) || isRelativeDateFilter(filter)) &&
      isLevelAttribute(filter.attribute)
    ) {
      const ref = getDateLevelRef(filter.attribute, source);
      if (ref) {
        refs.push(ref);
      }
    }
  });
  return refs;
}

function getDateLevelRefLabel(source: string): string {
  if (source.startsWith('dimensions[')) {
    return 'Date breakdown';
  }
  if (source.startsWith('highlights[')) {
    return 'Date highlight';
  }
  return 'Date filter';
}

function findGranularityConflict(left: DateLevelRef, right: DateLevelRef): string | null {
  if (left.columnName !== right.columnName || left.granularity === right.granularity) {
    return null;
  }
  const leftLabel = getDateLevelRefLabel(left.source);
  const rightLabel = getDateLevelRefLabel(right.source);
  return (
    `${leftLabel} on ${left.granularity} (${left.source}) conflicts with ` +
    `${rightLabel} on ${right.granularity} (${right.source}) on the same datetime column '${left.columnName}'. ` +
    `Use the same date level for filters/highlights, or for breakdown dimensions.`
  );
}

/**
 * Validates same-column datetime granularity consistency across query elements.
 *
 * Backend alignment:
 * - Dimension vs filter/highlight on the same column at different levels is allowed.
 *   Filters and dimensions are independent leveled attributes on the same column
 *   (e.g. YEARS vs MONTHS). Period filter members are rewritten to half-open
 *   [from, to) ranges on the raw datetime column, while the breakdown truncates
 *   at its own level (e.g. years filter → Date >= 2013-01-01 AND Date < 2014-01-01,
 *   months dimension → truncate to month). The backend does not reject this pattern.
 * - Filter vs filter on the same column at different levels is rejected (D1).
 *   The backend only merges same-level date filters; mismatched filter levels are
 *   ambiguous / not safely combinable.
 * - Dimension vs dimension on the same column at different levels is rejected (D2).
 *   The backend can execute dual Year+Month breakdowns silently with misleading results.
 *
 * @param input - Query dimensions, filters, and highlights to check for same-column
 *   datetime granularity conflicts.
 * @returns Translation errors for conflicting filter/highlight (D1) or dimension (D2)
 *   date levels; empty when consistent.
 */
export function validateQueryDatetimeConsistency(input: {
  dimensions: Attribute[];
  filters: Filter[] | import('@sisense/sdk-data').FilterRelations | null | undefined;
  highlights: Filter[] | null | undefined;
}): NlqTranslationError[] {
  const errors: NlqTranslationError[] = [];

  const dimensionRefs = input.dimensions
    .map((dimension, index) => getDateLevelRef(dimension, `dimensions[${index}]`))
    .filter((ref): ref is DateLevelRef => ref !== null);

  const filterRefs = collectDateLevelRefsFromFilters(flattenFilters(input.filters), 'filters');

  const highlightRefs = collectDateLevelRefsFromFilters(input.highlights ?? [], 'highlights');

  const allFilterRefs = [...filterRefs, ...highlightRefs];

  // D1: multiple filters/highlights on same column at different levels
  for (let i = 0; i < allFilterRefs.length; i++) {
    for (let j = i + 1; j < allFilterRefs.length; j++) {
      const message = findGranularityConflict(allFilterRefs[i], allFilterRefs[j]);
      if (message) {
        errors.push({ path: 'filters', message, input: null });
      }
    }
  }

  // D2: two dimensions using the same datetime column at different granularities
  for (let i = 0; i < dimensionRefs.length; i++) {
    for (let j = i + 1; j < dimensionRefs.length; j++) {
      const message = findGranularityConflict(dimensionRefs[i], dimensionRefs[j]);
      if (message) {
        errors.push({ path: 'dimensions', message, input: null });
      }
    }
  }

  return errors;
}
