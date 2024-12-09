import { Filter, FilterRelations } from './interfaces.js';

/**
 * Type guard for checking if the provided filters are FilterRelations.
 *
 * @param filters - The filters to check.
 * @returns `true` if the filters are FilterRelations, `false` otherwise.
 * @group Filter Utilities
 */
export function isFilterRelations(
  filters: Filter[] | FilterRelations | undefined,
): filters is FilterRelations {
  return (
    !!filters &&
    'operator' in filters &&
    (filters.operator === 'AND' || filters.operator === 'OR') &&
    !!filters.right &&
    !!filters.left
  );
}
