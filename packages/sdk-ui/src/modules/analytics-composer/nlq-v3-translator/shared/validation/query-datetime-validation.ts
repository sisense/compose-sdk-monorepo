import { Attribute, LevelAttribute } from '@sisense/sdk-data';

import { NlqTranslationError } from '../../../types.js';
import { isDateLevelAttribute } from '../utils/attribute-helpers.js';
import { getDateColumnDisplayName } from './datetime-validation-utils.js';

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

function findGranularityConflict(left: DateLevelRef, right: DateLevelRef): string | null {
  if (left.columnName !== right.columnName || left.granularity === right.granularity) {
    return null;
  }
  return (
    `Date breakdown on ${left.granularity} (${left.source}) conflicts with ` +
    `Date breakdown on ${right.granularity} (${right.source}) on the same datetime column '${left.columnName}'. ` +
    `Use the same date level for breakdown dimensions.`
  );
}

/**
 * Validates same-column datetime granularity consistency across query dimensions.
 *
 * Backend alignment:
 * - Dimension vs filter/highlight on the same column at different levels is allowed.
 *   Filters and dimensions are independent leveled attributes on the same column
 *   (e.g. YEARS vs MONTHS). Period filter members are rewritten to half-open
 *   [from, to) ranges on the raw datetime column, while the breakdown truncates
 *   at its own level (e.g. years filter → Date >= 2013-01-01 AND Date < 2014-01-01,
 *   months dimension → truncate to month). The backend does not reject this pattern.
 * - Filter vs filter (or highlight) on the same column at different levels is allowed.
 *   The backend ANDs them (e.g. years = 2013 AND months = 2013-03 returns March 2013),
 *   and dashboards routinely carry filters on several levels of one date column.
 * - Dimension vs dimension on the same column at different levels is rejected (D2).
 *   The backend can execute dual Year+Month breakdowns silently with misleading results.
 *
 * @param input - Query dimensions to check for same-column datetime granularity conflicts.
 * @returns Translation errors for conflicting dimension (D2) date levels; empty when consistent.
 */
export function validateQueryDatetimeConsistency(input: {
  dimensions: Attribute[];
}): NlqTranslationError[] {
  const errors: NlqTranslationError[] = [];

  const dimensionRefs = input.dimensions
    .map((dimension, index) => getDateLevelRef(dimension, `dimensions[${index}]`))
    .filter((ref): ref is DateLevelRef => ref !== null);

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
