import omit from 'lodash-es/omit.js';

import { Filter, FilterRelations, isFilterRelations } from '../../index.js';
import {
  calculateNewRelations,
  combineFiltersAndRelations,
  getFiltersArray,
  getRelationsWithReplacedFilter,
  splitFiltersAndRelations,
} from './filter-relations.js';

/**
 * Returns a function that adds a filter to existing filters or filter relations.
 *
 * @param filter - The filter to add.
 * @returns A function that takes existing filters or filter relations and returns updated filters or filter relations with the new filter added.
 * @group Filter Utilities
 * @example
 * ```ts
 * // Using with an array of filters
 * const originalFilters = [filterByAgeRange];
 * const updatedFilters = withAddedFilter(filterByCost)(originalFilters);
 * // [filterByAgeRange, filterByCost]
 *
 * // Using with filter relations
 * const originalFilterRelations = filterFactory.logic.or(filterByAgeRange, filterByRevenue);
 * const updatedFilterRelations = withAddedFilter(filterByCost)(originalFilterRelations);
 * // (filterByAgeRange OR filterByRevenue) AND filterByCost
 * ```
 */
export function withAddedFilter(
  filter: Filter,
): (filters: Filter[] | FilterRelations | undefined) => Filter[] | FilterRelations {
  return (filters: Filter[] | FilterRelations | undefined) => {
    if (isFilterRelations(filters)) {
      const { filters: existingFilters, relations } = splitFiltersAndRelations(filters);
      const newFilters = [...existingFilters, filter];
      const newRelations = calculateNewRelations(existingFilters, relations, newFilters);
      return combineFiltersAndRelations(newFilters, newRelations);
    }

    return [...(filters || []), filter];
  };
}

/**
 * Returns a function that adds multiple filters to existing filters or filter relations.
 *
 * @param filtersToAdd - An array of filters to add.
 * @returns A function that takes existing filters or filter relations and returns updated filters or filter relations with the new filters added.
 * @group Filter Utilities
 * @example
 * ```ts
 * // Using with an array of filters
 * const originalFilters = [filterByAgeRange];
 * const updatedFilters = withAddedFilters([filterByCost, filterByRevenue])(originalFilters);
 * // [filterByAgeRange, filterByCost, filterByRevenue]
 *
 * // Using with filter relations
 * const originalFilterRelations = filterFactory.logic.or(filterByAgeRange, filterByRevenue);
 * const updatedFilterRelations = withAddedFilters([filterByCost, filterByRevenue])(originalFilterRelations);
 * // (filterByAgeRange OR filterByRevenue) AND filterByCost AND filterByRevenue
 * ```
 */
export function withAddedFilters(
  filtersToAdd: Filter[],
): (filters: Filter[] | FilterRelations | undefined) => Filter[] | FilterRelations {
  return (filters: Filter[] | FilterRelations | undefined) => {
    if (isFilterRelations(filters)) {
      const { filters: existingFilters, relations } = splitFiltersAndRelations(filters);
      const newFilters = [...existingFilters, ...filtersToAdd];
      const newRelations = calculateNewRelations(existingFilters, relations, newFilters);
      return combineFiltersAndRelations(newFilters, newRelations);
    }

    return [...(filters || []), ...filtersToAdd];
  };
}

/**
 * Returns a function that removes a filter from existing filters or filter relations.
 *
 * @param filterToRemove - The filter to remove.
 * @returns A function that takes existing filters or filter relations and returns updated filters or filter relations without the specified filter.
 * @group Filter Utilities
 * @example
 * ```ts
 * // Using with an array of filters
 * const originalFilters = [filterByAgeRange, filterByRevenue, filterByCost];
 * const updatedFilters = withoutFilter(filterByCost)(originalFilters);
 * // [filterByAgeRange, filterByRevenue]
 *
 * // Using with filter relations
 * const originalFilterRelations = filterFactory.logic.or(filterByAgeRange, filterByRevenue);
 * const updatedFiltersRelations = withoutFilter(filterByRevenue)(originalFilterRelations);
 * // filterByAgeRange
 * ```
 */
export function withoutFilter(
  filterToRemove: Filter,
): (filters: Filter[] | FilterRelations | undefined) => Filter[] | FilterRelations {
  return (filters: Filter[] | FilterRelations | undefined) => {
    if (isFilterRelations(filters)) {
      const { filters: existingFilters, relations } = splitFiltersAndRelations(filters);
      const newFilters = existingFilters.filter(
        (filter) => filter.config.guid !== filterToRemove.config.guid,
      );
      const newRelations = calculateNewRelations(existingFilters, relations, newFilters);
      return combineFiltersAndRelations(newFilters, newRelations);
    }

    return (filters || []).filter((filter) => filter.config.guid !== filterToRemove.config.guid);
  };
}

/**
 * Returns a function that removes multiple filters from existing filters or filter relations.
 *
 * @param filtersToRemove - An array of filters to remove.
 * @returns A function that takes existing filters or filter relations and returns updated filters or filter relations without the specified filters.
 * @group Filter Utilities
 * @example
 * ```ts
 * // Using with an array of filters
 * const originalFilters = [filterByAgeRange, filterByRevenue, filterByCost];
 * const updatedFilters = withRemovedFilters([filterByRevenue, filterByCost])(originalFilters);
 * // [filterByAgeRange]
 *
 * // Using with filter relations
 * const originalFilterRelations = filterFactory.logic.or(filterByAgeRange, filterByRevenue);
 * const updatedFiltersRelations = withRemovedFilters([filterByRevenue])(originalFilterRelations);
 * // filterByAgeRange
 * ```
 */
export function withoutFilters(
  filtersToRemove: Filter[],
): (filters: Filter[] | FilterRelations | undefined) => Filter[] | FilterRelations {
  return (filters: Filter[] | FilterRelations | undefined) => {
    if (isFilterRelations(filters)) {
      const { filters: existingFilters, relations } = splitFiltersAndRelations(filters);
      const newFilters = existingFilters.filter(
        (filter) =>
          !filtersToRemove.some(
            (filterToRemove) => filter.config.guid === filterToRemove.config.guid,
          ),
      );
      const newRelations = calculateNewRelations(existingFilters, relations, newFilters);
      return combineFiltersAndRelations(newFilters, newRelations);
    }

    return (filters || []).filter(
      (filter) =>
        !filtersToRemove.some(
          (filterToRemove) => filter.config.guid === filterToRemove.config.guid,
        ),
    );
  };
}

/**
 * Returns a function that replaces a filter with a new filter in existing filters or filter relations.
 *
 * @param filterToReplace - The filter to replace.
 * @param newFilter - The new filter to use as a replacement.
 * @returns A function that takes existing filters or filter relations and returns updated filters or filter relations with the filter replaced.
 * @group Filter Utilities
 * @example
 * ```ts
 * // Using with an array of filters
 * const originalFilters = [filterByAgeRange, filterByRevenue];
 * const updatedFilters = withReplacedFilter(filterByRevenue, filterByCost)(originalFilters);
 * // [filterByAgeRange, filterByCost]
 *
 * // Using with filter relations
 * const originalFilterRelations = filterFactory.logic.or(filterByAgeRange, filterByRevenue);
 * const updatedFilterRelations = withReplacedFilter(filterByRevenue, filterByCost)(originalFilterRelations);
 * // (filterByAgeRange OR filterByCost)
 * ```
 */
export function withReplacedFilter(
  filterToReplace: Filter,
  newFilter: Filter,
): (filters: Filter[] | FilterRelations | undefined) => Filter[] | FilterRelations {
  return (filters: Filter[] | FilterRelations | undefined) => {
    if (isFilterRelations(filters)) {
      const { filters: existingFilters, relations } = splitFiltersAndRelations(filters);
      const newFilters = existingFilters.map((filter) =>
        filter.config.guid === filterToReplace.config.guid ? newFilter : filter,
      );
      const newRelations = getRelationsWithReplacedFilter(relations, filterToReplace, newFilter);
      return combineFiltersAndRelations(newFilters, newRelations);
    }

    return (filters || []).map((filter) =>
      filter.config.guid === filterToReplace.config.guid ? newFilter : filter,
    );
  };
}

/**
 * Finds a filter in an array of filters or filter relations.
 * Returns the first filter that satisfies the provided search function.
 *
 * @group Filter Utilities
 * @param filters - An array of filters or filter relations to search.
 * @param searchFn - A function that takes a filter and returns a boolean indicating whether the filter satisfies the search criteria.
 * @returns The first filter that satisfies the search function, or `undefined` if no filter is found.
 */
export function findFilter(
  filters: Filter[] | FilterRelations | undefined,
  searchFn: (filter: Filter) => boolean,
): Filter | undefined {
  if (!filters) {
    return undefined;
  }

  const filtersArray = isFilterRelations(filters) ? getFiltersArray(filters) : filters;
  return filtersArray.find(searchFn);
}

function isFilter(node: any): node is Filter {
  return node && typeof node === 'object' && 'attribute' in node && 'config' in node;
}

function filterWithoutGuid(filter: Filter) {
  return {
    ...filter,
    config: omit(filter.config, 'guid'),
  };
}

function filtersWithoutGuids(filters: Filter[]) {
  return filters.map(filterWithoutGuid);
}

function filterRelationsWithoutGuids(filterRelations: FilterRelations) {
  const traverse = (node: FilterRelations | Filter | Filter[]): any => {
    if (Array.isArray(node)) {
      return node.map(traverse);
    }

    if (isFilter(node)) {
      return filterWithoutGuid(node);
    }

    if (isFilterRelations(node)) {
      return {
        ...node,
        left: traverse(node.left),
        right: traverse(node.right),
      };
    }

    return node;
  };
  return traverse(filterRelations);
}

/**
 * Removes GUIDs from filters for consistent snapshot testing.
 *
 * THIS FUNCTION IS USED FOR UNIT TESTING ONLY.
 *
 * @param filters - The filters to remove GUIDs from.
 * @returns The filters without GUIDs.
 * @group Filter Utilities
 * @internal
 */
export function withoutGuids(filters: Filter[] | FilterRelations) {
  if (isFilterRelations(filters)) {
    return filterRelationsWithoutGuids(filters);
  } else {
    return filtersWithoutGuids(filters);
  }
}
