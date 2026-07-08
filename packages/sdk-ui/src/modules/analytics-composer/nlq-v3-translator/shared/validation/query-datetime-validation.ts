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
    `Use the same date level for filters and breakdown dimensions.`
  );
}

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

  // D2: multiple filters on same column at different levels
  for (let i = 0; i < allFilterRefs.length; i++) {
    for (let j = i + 1; j < allFilterRefs.length; j++) {
      const message = findGranularityConflict(allFilterRefs[i], allFilterRefs[j]);
      if (message) {
        errors.push({ path: 'filters', message, input: null });
      }
    }
  }

  // D1: dimension vs filter/highlight granularity mismatch
  for (const dimensionRef of dimensionRefs) {
    for (const filterRef of allFilterRefs) {
      const message = findGranularityConflict(dimensionRef, filterRef);
      if (message) {
        errors.push({ path: 'query', message, input: null });
      }
    }
  }

  // D3: two dimensions using the same datetime column at different granularities
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
