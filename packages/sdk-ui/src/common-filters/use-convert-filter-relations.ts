import { useSyncedState } from '@/common/hooks/use-synced-state';
import {
  calculateNewRelations,
  combineFiltersAndRelations,
  FilterRelationsRules,
  splitFiltersAndRelations,
} from '@/utils/filter-relations';
import { mergeFilters } from '@/widget-by-id/utils';
import { Filter, FilterRelations, isCascadingFilter, isFilterRelations } from '@sisense/sdk-data';
import { useCallback, useMemo } from 'react';
import { reassembleCascadingFilters } from './cascading-utils';

/**
 * Result of the FilterRelations conversion.
 */
type UseFilterRelationsConversionResult = {
  /** The current filters or filter relations. */
  filtersOrFilterRelations: Filter[] | FilterRelations;
  /** The current regular filters without relations. */
  regularFilters: Filter[];
  /** Adds a new filter to the current filters (recalculates relations if needed). */
  addFilter: (filter: Filter) => void;
  /** Completely replaces the current filters and relations with new ones. */
  setFiltersOrFilterRelations: (filtersOrFilterRelations: Filter[] | FilterRelations) => void;
  /** Completely replaces the current filters with new ones (recalculates relations if needed). */
  setFilters: (filters: Filter[]) => void;
  /** Calculates relations for some other filters based on current relations and applies them */
  applyRelationsToOtherFilters: (otherFilters: Filter[]) => Filter[] | FilterRelations;
};

// Combination of filters and relation rules
type FiltersAndRelations = {
  filters: Filter[];
  relations: FilterRelationsRules;
};
/**
 * Hook for handling conversion between regular filters and filter relations.
 *
 * @param initialFiltersOrFilterRelations - Initial filters or filter relations.
 * @returns The result of the conversion. See {@link UseFilterRelationsConversionResult}.
 */
export function useConvertFilterRelations(
  initialFiltersOrFilterRelations: Filter[] | FilterRelations,
  onFiltersChange?: (filters: Filter[] | FilterRelations) => void,
): UseFilterRelationsConversionResult {
  // keep single state for filters and relations
  const [filtersAndRelations, setFiltersAndRelations] = useSyncedState<FiltersAndRelations>(
    useMemo(
      () => splitFiltersAndRelations(initialFiltersOrFilterRelations),
      [initialFiltersOrFilterRelations],
    ),
    {
      onLocalStateChange: useCallback(
        (newFiltersAndFilterRelations: FiltersAndRelations) => {
          const { filters, relations } = newFiltersAndFilterRelations;
          if (onFiltersChange) {
            onFiltersChange(combineFiltersAndRelations(filters, relations));
          }
        },
        [onFiltersChange],
      ),
    },
  );

  const { filters, relations } = filtersAndRelations;

  const filtersOrFilterRelations = useMemo(
    () => combineFiltersAndRelations(filters, relations),
    [filters, relations],
  );

  const setFiltersOrFilterRelations = useCallback(
    (newFiltersOrFilterRelations: Filter[] | FilterRelations) => {
      if (isFilterRelations(newFiltersOrFilterRelations)) {
        const { filters, relations } = splitFiltersAndRelations(newFiltersOrFilterRelations);
        setFiltersAndRelations({ filters: filters || [], relations: relations || null });
      } else {
        setFiltersAndRelations({ filters: newFiltersOrFilterRelations, relations: null });
      }
    },
    [setFiltersAndRelations],
  );

  const addFilter = useCallback(
    (newFilter: Filter) => {
      const newFilters = mergeFilters(filters, [newFilter]);
      setFiltersAndRelations({
        filters: newFilters,
        relations: calculateNewRelations(filters, relations, newFilters),
      });
    },
    [filters, relations, setFiltersAndRelations],
  );

  const setFiltersExternal = useCallback(
    (newFilters: Filter[]) => {
      setFiltersAndRelations({
        filters: newFilters,
        relations: calculateNewRelations(filters, relations, newFilters),
      });
    },
    [filters, relations, setFiltersAndRelations],
  );

  const areCascadingFiltersPresent = useMemo(
    () => filters.some((filter) => isCascadingFilter(filter)),
    [filters],
  );
  const applyRelationsToOtherFilters = useCallback(
    (otherFilters: Filter[]) => {
      // If cascading filters are present in original filters,
      // try to reassemble passed filters to match the original relations
      const alignedOtherFilters = areCascadingFiltersPresent
        ? reassembleCascadingFilters(otherFilters, filters)
        : otherFilters;
      const otherRelations = calculateNewRelations(filters, relations, alignedOtherFilters);
      return combineFiltersAndRelations(alignedOtherFilters, otherRelations);
    },
    [areCascadingFiltersPresent, filters, relations],
  );

  return {
    regularFilters: filters,
    addFilter,
    filtersOrFilterRelations,
    setFiltersOrFilterRelations,
    setFilters: setFiltersExternal,
    applyRelationsToOtherFilters,
  };
}
