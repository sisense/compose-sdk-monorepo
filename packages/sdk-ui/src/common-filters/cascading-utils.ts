import { getFilterCompareId } from '@/dashboard-widget/utils';
import { clearMembersFilter, haveSameAttribute, isCascadingFilter } from '@/utils/filters';
import { CascadingFilter, Filter } from '@sisense/sdk-data';
import { FiltersIgnoringRules, PureFilter } from './types';
import { isEqualMembersFilters } from './utils';

/**
 * Flattens cascading filters into a single array of filters.
 */
export function flattenCascadingFilters(filters: Filter[]): {
  flatFilters: PureFilter[];
  cascadingToPureFiltersMap: Record<string, PureFilter[]>;
} {
  const cascadingToPureFiltersMap: Record<string, PureFilter[]> = {};
  const flatFilters = filters.reduce<Filter[]>((acc, filter) => {
    if (isCascadingFilter(filter)) {
      if (!cascadingToPureFiltersMap[filter.guid]) {
        cascadingToPureFiltersMap[filter.guid] = [];
      }
      filter.filters.forEach((levelFilter) => {
        cascadingToPureFiltersMap[filter.guid].push(levelFilter);
        acc.push(levelFilter);
      });
    } else {
      acc.push(filter);
    }
    return acc;
  }, []);
  return { flatFilters, cascadingToPureFiltersMap };
}

/**
 * Represents a group of filters that were previously cascading
 * and should be reassembled back into CascadingFilter.
 */
type CascadingGroup = { groupId: string; filters: Filter[]; previousFilters: Filter[] };

/**
 * Reassembles flattened filters back into cascading filters based on original cascading filters.
 *
 * @param updatedFilters - Updated pure filters to reassemble.
 * @param originalFilters - Original filters with maybe cascading filters.
 * @returns reassembled filters.
 */
export function reassembleCascadingFilters(
  updatedFilters: PureFilter[],
  originalFilters: (PureFilter | CascadingFilter)[],
): (PureFilter | CascadingFilter)[] {
  const originalCascadingFilters = originalFilters.filter(isCascadingFilter);
  const regroupedFilters = combineFiltersIntoCascadingGroups(
    updatedFilters,
    originalCascadingFilters,
  );
  return regroupedFilters.map((filterOrGroup) => {
    if (isCascadingGroup(filterOrGroup)) {
      const originalCascadingFilter = originalCascadingFilters.find(
        (cascadingFilter) => cascadingFilter.guid === filterOrGroup.groupId,
      );
      if (!originalCascadingFilter) {
        throw new Error(
          'Error in cascading filters reassembling. Original cascading filter not found',
        );
      }
      return createNewCascadingFilter(filterOrGroup, originalCascadingFilter);
    }

    return filterOrGroup;
  });
}

function isCascadingGroup(filterOrGroup: Filter | CascadingGroup): filterOrGroup is CascadingGroup {
  return 'groupId' in filterOrGroup;
}

/**
 * Combines updated filters into cascading groups based on original cascading filters.
 */
function combineFiltersIntoCascadingGroups(
  updatedFilters: Filter[],
  originalCascadingFilters: CascadingFilter[],
): (Filter | CascadingGroup)[] {
  const groupedFilters: (Filter | CascadingGroup)[] = [];
  updatedFilters.forEach((mergedFilter) => {
    const originalCascadingFilter = originalCascadingFilters.find((cascadingFilter) =>
      cascadingFilter.filters.some(
        (levelFilter) => getFilterCompareId(levelFilter) === getFilterCompareId(mergedFilter),
      ),
    );
    if (originalCascadingFilter) {
      const groupId = originalCascadingFilter.guid;
      const group = groupedFilters.find((group) => 'groupId' in group && group.groupId === groupId);
      if (group) {
        (group as CascadingGroup).filters.push(mergedFilter);
      } else {
        groupedFilters.push({
          groupId,
          filters: [mergedFilter],
          previousFilters: originalCascadingFilter.filters,
        });
      }
    } else {
      groupedFilters.push(mergedFilter);
    }
  });
  return groupedFilters;
}

/**
 * Creates a new cascading filter from the cascading group.
 */
function createNewCascadingFilter(
  cascadingGroup: CascadingGroup,
  originalCascadingFilter: CascadingFilter,
) {
  const newLevelFilters = resetFiltersDeeperThanModified(
    cascadingGroup.filters,
    cascadingGroup.previousFilters,
  );

  const newDisabled = calculateDisablingStatus(newLevelFilters, originalCascadingFilter.disabled);

  const newCascadingFilter = new CascadingFilter(newLevelFilters, originalCascadingFilter.guid);
  newCascadingFilter.disabled = newDisabled;

  return newCascadingFilter;
}

/**
 * Calculates new cascading filter disabling status.
 * Checks if any of the level filters disabling status was changed.
 */
function calculateDisablingStatus(
  levelFilters: PureFilter[],
  previousDisablingStatus: boolean,
): boolean {
  const wasDisablingStatusChanged = levelFilters.some(
    (filter) => filter.disabled !== previousDisablingStatus,
  );
  return wasDisablingStatusChanged ? !previousDisablingStatus : previousDisablingStatus;
}

/**
 * Converts cascading filters to pure filters and vice versa.
 *
 * @param complexFilters - all filters, including cascading filters.
 * @param updateComplexFilters - a function to update complex filters.
 * @param complexFiltersIgnoringRules - filters ignoring rules for complex filters.
 * @returns converted pure filters and a decorated filters updater.
 */
export function withCascadingFiltersConversion(
  complexFilters: (PureFilter | CascadingFilter)[],
  updateComplexFilters: (filters: (PureFilter | CascadingFilter)[]) => void,
  complexFiltersIgnoringRules: FiltersIgnoringRules,
): {
  pureFilters: PureFilter[];
  updateFilters: (filters: PureFilter[]) => void;
  pureFiltersIgnoringRules: FiltersIgnoringRules;
} {
  const { flatFilters, cascadingToPureFiltersMap } = flattenCascadingFilters(complexFilters);

  const updateFilters = (newFilters: PureFilter[]) => {
    const newComplexFilters = reassembleCascadingFilters(newFilters, complexFilters);
    updateComplexFilters(newComplexFilters);
  };

  return {
    pureFilters: flatFilters,
    updateFilters,
    pureFiltersIgnoringRules: convertFiltersIgnoringRules(
      complexFiltersIgnoringRules,
      cascadingToPureFiltersMap,
    ),
  };
}

/**
 * Resets level filters deeper than the deepest modified filter.
 *
 * After changing filters, that previously were cascading, we need to reset
 * all filters deeper than the deepest modified filter before reassambling them back to cascading filters.
 *
 * @param newLevelFilters - new level filters that possibly modified.
 * @param previousLevelFilters - previous level filters from cascading to compare.
 * @returns - filters with deeper filters reset.
 */
function resetFiltersDeeperThanModified(
  newLevelFilters: PureFilter[],
  previousLevelFilters: PureFilter[],
) {
  // Find index of the deepest modified filter in new filters
  const deepestModifiedNewFilterIndex = newLevelFilters.reduce(
    (deepestIndex, newFilter, currentIndex) => {
      const previousFilter = previousLevelFilters.find((filter) =>
        haveSameAttribute(filter, newFilter),
      );

      if (previousFilter && !isEqualMembersFilters(newFilter, previousFilter)) {
        return currentIndex;
      }

      return deepestIndex;
    },
    -1,
  );

  // Reset filters deeper than the deepest modified filter
  return newLevelFilters.map((newFilter, index) => {
    if (index > deepestModifiedNewFilterIndex) {
      return clearMembersFilter(newFilter);
    }
    return newFilter;
  });
}

/**
 * Converts complex filters (with possibly cascading filters) ignoring rules
 * to pure filters ignoring rules.
 *
 * @param filtersIgnoringRules
 * @param cascadingToPureFiltersMap
 * @returns
 */
function convertFiltersIgnoringRules(
  filtersIgnoringRules: FiltersIgnoringRules,
  cascadingToPureFiltersMap: Record<string, Filter[]>,
): FiltersIgnoringRules {
  return {
    all: filtersIgnoringRules.all,
    ids:
      filtersIgnoringRules.ids?.reduce<string[]>((acc, id) => {
        const pureFilters = cascadingToPureFiltersMap[id];
        if (pureFilters) {
          return acc.concat(pureFilters.map((f) => f.guid));
        }
        return acc.concat(id);
      }, []) || [],
  };
}
