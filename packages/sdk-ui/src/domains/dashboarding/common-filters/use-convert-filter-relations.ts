import { useCallback, useMemo, useRef } from 'react';

import type { Filter, FilterRelations } from '@sisense/sdk-data';
import { filterFactory, isCascadingFilter, isFilterRelations } from '@sisense/sdk-data';
import isEqual from 'lodash-es/isEqual';

import { getFilterCompareId, mergeFilters } from '@/domains/widgets/components/widget-by-id/utils';
import { useSyncedState } from '@/shared/hooks/use-synced-state';
import type { FilterRelationsRules } from '@/shared/utils/filter-relations';
import {
  calculateNewRelations,
  combineFiltersAndRelations,
  splitFiltersAndRelations,
} from '@/shared/utils/filter-relations';

import { reassembleCascadingFilters } from './cascading-utils.js';

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
  /** Calculates relations for some other filters based on current relations and applies them. */
  applyRelationsToOtherFilters: (otherFilters: Filter[]) => Filter[] | FilterRelations;
  /** Connects the dashboard filters a widget applies to its own filters — see {@link connectWidgetFilters}. */
  connectWidgetFilters: (
    sliceFilters: Filter[],
    widgetFilters: Filter[] | FilterRelations | undefined,
  ) => Filter[] | FilterRelations;
};

// Combination of filters and relation rules
type FiltersAndRelations = {
  filters: Filter[];
  relations: FilterRelationsRules;
};
/**
 * Applies the relations among `filters` to another set of filters — a widget's own filters merged
 * with the dashboard ones — so they keep the dashboard's relation semantics.
 *
 * @param filters - Filters the relations are defined on.
 * @param relations - Relations among `filters`; none leaves `otherFilters` as is.
 * @param otherFilters - Filters to apply the relations to.
 * @returns `otherFilters`, combined with the relations that apply to them.
 * @internal
 */
export function applyFilterRelationsToOtherFilters(
  filters: Filter[],
  relations: FilterRelationsRules | null,
  otherFilters: Filter[],
): Filter[] | FilterRelations {
  // If there are no relations to apply, return the filters as is
  if (!relations) {
    return otherFilters;
  }
  // If cascading filters are present in original filters,
  // try to reassemble passed filters to match the original relations
  const alignedOtherFilters = filters.some((filter) => isCascadingFilter(filter))
    ? reassembleCascadingFilters(otherFilters, filters)
    : otherFilters;

  const otherRelations = calculateNewRelations(filters, relations, alignedOtherFilters, {
    shouldReplaceSameAttributeFilters: true,
  });

  return combineFiltersAndRelations(alignedOtherFilters, otherRelations);
}

/**
 * Connects the dashboard filters a widget applies to the widget's own filters, the way the
 * dashboard renders the widget: a dashboard filter on the same attribute as a widget filter gives
 * way to the widget's, the relations among the dashboard filters carry over, and the widget's own
 * relations are kept — a widget filtered by `A OR B` on a dashboard filtered by `C` gets
 * `C AND (A OR B)`, not `A AND B AND C`.
 *
 * When the dashboard has relations, a widget filter that overrides a dashboard filter takes that
 * filter's place in the dashboard relations, as for a plain widget, and leaves the widget's own
 * tree: a widget filtered by `D' OR E` on a dashboard filtered by `C OR D` gets `(C OR D') AND E`.
 * Without dashboard relations, the overridden dashboard filter is dropped and the widget's tree is
 * kept whole: `C AND (D' OR E)`.
 *
 * @param dashboardFilters - Dashboard filters the relations are defined on.
 * @param dashboardRelations - Relations among the dashboard filters, if any.
 * @param sliceFilters - Dashboard filters the widget applies.
 * @param widgetFilters - The widget's own filters or filter relations.
 * @returns The widget's filters, combined with the relations that apply to them.
 * @internal
 */
export function connectWidgetFilters(
  dashboardFilters: Filter[],
  dashboardRelations: FilterRelationsRules | null,
  sliceFilters: Filter[],
  widgetFilters: Filter[] | FilterRelations | undefined,
): Filter[] | FilterRelations {
  if (!isFilterRelations(widgetFilters)) {
    return applyFilterRelationsToOtherFilters(
      dashboardFilters,
      dashboardRelations,
      mergeFilters(sliceFilters, widgetFilters ?? []),
    );
  }
  const { filters: ownFilters, relations: ownRelations } = splitFiltersAndRelations(widgetFilters);
  const sliceFilterIds = new Set(sliceFilters.map(getFilterCompareId));
  const overrides = dashboardRelations
    ? ownFilters.filter((filter) => sliceFilterIds.has(getFilterCompareId(filter)))
    : [];
  const ownFilterIds = new Set(ownFilters.map(getFilterCompareId));
  const dashboardPart = dashboardRelations
    ? mergeFilters(sliceFilters, overrides)
    : sliceFilters.filter((filter) => !ownFilterIds.has(getFilterCompareId(filter)));
  const remainingOwnFilters = ownFilters.filter((filter) => !overrides.includes(filter));
  const widgetPart = combineFiltersAndRelations(
    remainingOwnFilters,
    calculateNewRelations(ownFilters, ownRelations, remainingOwnFilters),
  );

  if (dashboardPart.length === 0) {
    return widgetPart;
  }
  const connectedDashboardPart = applyFilterRelationsToOtherFilters(
    dashboardFilters,
    dashboardRelations,
    dashboardPart,
  );
  if (remainingOwnFilters.length === 0) {
    return connectedDashboardPart;
  }
  return filterFactory.logic.and(connectedDashboardPart, widgetPart);
}

/**
 * Hook for handling conversion between regular filters and filter relations.
 *
 * @param initialFiltersOrFilterRelations - Initial filters or filter relations.
 * @param onFiltersChange - Called when the filters or their relations change.
 * @returns The result of the conversion. See {@link UseFilterRelationsConversionResult}.
 */
export function useConvertFilterRelations(
  initialFiltersOrFilterRelations: Filter[] | FilterRelations,
  onFiltersChange?: (filters: Filter[] | FilterRelations) => void,
): UseFilterRelationsConversionResult {
  // Track the last notified value to prevent double-firing
  const lastNotifiedValueRef = useRef<Filter[] | FilterRelations | undefined>(undefined);

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
            const newValue = combineFiltersAndRelations(filters, relations);
            // Only call onFiltersChange if the value has actually changed
            // This prevents double-firing when React batches state updates
            if (!isEqual(lastNotifiedValueRef.current, newValue)) {
              lastNotifiedValueRef.current = newValue;
              onFiltersChange(newValue);
            }
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

  const applyRelationsToOtherFilters = useCallback(
    (otherFilters: Filter[]) =>
      applyFilterRelationsToOtherFilters(filters, relations, otherFilters),
    [filters, relations],
  );
  const connectWidgetFiltersToCommon = useCallback(
    (sliceFilters: Filter[], widgetFilters: Filter[] | FilterRelations | undefined) =>
      connectWidgetFilters(filters, relations, sliceFilters, widgetFilters),
    [filters, relations],
  );

  return {
    regularFilters: filters,
    addFilter,
    filtersOrFilterRelations,
    setFiltersOrFilterRelations,
    setFilters: setFiltersExternal,
    applyRelationsToOtherFilters,
    connectWidgetFilters: connectWidgetFiltersToCommon,
  };
}
