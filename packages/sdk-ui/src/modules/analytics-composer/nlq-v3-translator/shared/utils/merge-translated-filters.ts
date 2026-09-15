import {
  Filter,
  filterFactory,
  FilterRelations,
  isFilterRelations,
  mergeFiltersOrFilterRelations,
} from '@sisense/sdk-data';

/**
 * Folds one translated filter/relation entry into an accumulator, preserving relation trees on
 * both sides.
 *
 * `mergeFiltersOrFilterRelations` recalculates relations from `sourceFilters` only — whichever
 * side is passed as `targetFilters` has its relation tree flattened away (its leaves survive,
 * re-attached under `AND`). So: when both sides carry a tree, combine them explicitly with
 * `filterFactory.logic.and`; when only one side does, that side must be `sourceFilters` so its
 * tree is the one recalculated (and preserved).
 *
 * @internal
 * @param accumulated - Filters/relations merged so far
 * @param incoming - The next translated filter/relation entry to fold in
 * @returns The combined filters or filter relations
 */
export function mergeTranslatedFilters(
  accumulated: Filter[] | FilterRelations,
  incoming: Filter[] | FilterRelations,
): Filter[] | FilterRelations {
  if (isFilterRelations(accumulated) && isFilterRelations(incoming)) {
    return filterFactory.logic.and(accumulated, incoming);
  }
  return isFilterRelations(incoming)
    ? mergeFiltersOrFilterRelations(incoming, accumulated)
    : mergeFiltersOrFilterRelations(accumulated, incoming);
}
