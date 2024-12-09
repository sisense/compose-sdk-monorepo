import { DashboardProps } from './types';
import { Filter, FilterRelations } from '@sisense/sdk-data';
import {
  withAddedFilter,
  withAddedFilters,
  withoutFilter,
  withoutFilters,
  withReplacedFilter,
} from '@/filters/helpers';

/**
 * Creates a new dashboard instance with its filters replaced by a new set of filters.
 *
 * This function does not modify the original dashboard; instead, it returns a new dashboard with the updated filters.
 *
 * @example
 * Replace all filters on a dashboard with a new set of filters.
 * ```ts
 * const existingDashboard: DashboardProps = {...}
 * const newFilters: Filter[] = [{...}, {...}, ...];
 * const updatedDashboard = replaceFilters(existingDashboard, newFilters);
 * ```
 * @param dashboard - The original dashboard (`DashboardProps`) whose filters are to be replaced.
 * @param newFilters - An array of new filters or filter relations to set on the dashboard.
 * @returns A new dashboard instance with the updated filters.
 */
export const replaceFilters = (
  dashboard: DashboardProps,
  newFilters: Filter[] | FilterRelations,
): DashboardProps => {
  return { ...dashboard, filters: newFilters };
};

/**
 * Creates a new dashboard instance with an additional filter added to its existing filters.
 *
 * This function does not modify the original dashboard; instead, it returns a new dashboard with the added filter.
 *
 * @example
 * Add a new filter to a dashboard.
 * ```ts
 * const existingDashboard: DashboardProps = {...};
 * const newFilter: Filter = {...};
 * const updatedDashboard = addFilter(existingDashboard, newFilter);
 * ```
 * @param dashboard - The original dashboard (`DashboardProps`) to which the filter will be added.
 * @param newFilter - The filter to add to the dashboard.
 * @returns A new dashboard instance with the new filter added.
 */
export const addFilter = (dashboard: DashboardProps, newFilter: Filter): DashboardProps => {
  return replaceFilters(dashboard, withAddedFilter(newFilter)(dashboard.filters));
};

/**
 * Creates a new dashboard instance with additional filters added to its existing filters.
 *
 * This function does not modify the original dashboard; instead, it returns a new dashboard with the added filters.
 *
 * @example
 * Add multiple new filters to a dashboard.
 * ```ts
 * const existingDashboard: DashboardProps = {...};
 * const newFilters: Filter[] = [{...}, {...}, ...];
 * const updatedDashboard = addFilters(existingDashboard, newFilters);
 * ```
 * @param dashboard - The original dashboard (`DashboardProps`) to which the filters will be added.
 * @param newFilters - An array of filters to add to the dashboard.
 * @returns A new dashboard instance with the new filters added.
 */
export const addFilters = (dashboard: DashboardProps, newFilters: Filter[]): DashboardProps => {
  return replaceFilters(dashboard, withAddedFilters(newFilters)(dashboard.filters));
};

/**
 * Creates a new dashboard instance with a specific filter replaced.
 *
 * This function searches for a filter with the same GUID as the provided `filterToReplace` and replaces it with `newFilter`.
 * This function does not modify the original dashboard; instead, it returns a new dashboard with the updated filters.
 *
 * @example
 * Replace a filter in a dashboard.
 * ```ts
 * const existingDashboard: DashboardProps = {...};
 * const filterToReplace: Filter = {...};
 * const newFilter: Filter = {...};
 * const updatedDashboard = replaceFilter(existingDashboard, filterToReplace, newFilter);
 * ```
 * @param dashboard - The original dashboard (`DashboardProps`) containing the filter to be replaced.
 * @param filterToReplace - The existing filter to be replaced.
 * @param newFilter - The new filter to replace the existing one.
 * @returns A new dashboard instance with the specified filter replaced.
 */
export const replaceFilter = (
  dashboard: DashboardProps,
  filterToReplace: Filter,
  newFilter: Filter,
): DashboardProps => {
  return replaceFilters(
    dashboard,
    withReplacedFilter(filterToReplace, newFilter)(dashboard.filters),
  );
};

/**
 * Creates a new dashboard instance with a specific filter modified.
 * Alias for `replaceFilter`.
 *
 * @deprecated Use {@link replaceFilter} instead
 *
 * @param dashboard - The original dashboard (`DashboardProps`) containing the filter to modify.
 * @param filterToModify - The existing filter to be modified.
 * @param newFilter - The new filter to replace the existing one.
 * @returns A new dashboard instance with the specified filter modified.
 */
export const modifyFilter = (
  dashboard: DashboardProps,
  filterToModify: Filter,
  newFilter: Filter,
): DashboardProps => {
  return replaceFilter(dashboard, filterToModify, newFilter);
};

/**
 * Creates a new dashboard instance with a specific filter removed.
 *
 * This function removes the filter with the same GUID as the provided filter from the dashboard's filters.
 * This function does not modify the original dashboard; instead, it returns a new dashboard with the updated filters.
 *
 * @example
 * Remove a filter from a dashboard.
 * ```ts
 * const existingDashboard: DashboardProps = {...};
 * const filterToRemove: Filter = {...};
 * const updatedDashboard = removeFilter(existingDashboard, filterToRemove);
 * ```
 * @param dashboard - The original dashboard (`DashboardProps`) from which to remove the filter.
 * @param filterToRemove - The filter to be removed.
 * @returns A new dashboard instance with the specified filter removed.
 */
export const removeFilter = (dashboard: DashboardProps, filterToRemove: Filter): DashboardProps => {
  return replaceFilters(dashboard, withoutFilter(filterToRemove)(dashboard.filters));
};

/**
 * Creates a new dashboard instance with multiple filters removed.
 *
 * This function removes all filters with the same GUID as the provided filters from the dashboard's filters.
 * This function does not modify the original dashboard; instead, it returns a new dashboard with the updated filters.
 *
 * @example
 * Remove multiple filters from a dashboard.
 * ```ts
 * const existingDashboard: DashboardProps = {...};
 * const filtersToRemove: Filter[] = [{...}, {...}, ...];
 * const updatedDashboard = removeFilters(existingDashboard, filtersToRemove);
 * ```
 * @param dashboard - The original dashboard (`DashboardProps`) from which the specified filters are removed.
 * @param filtersToRemove - An array of filters to remove.
 * @returns A new dashboard instance with the specified filters removed.
 */
export const removeFilters = (
  dashboard: DashboardProps,
  filtersToRemove: Filter[],
): DashboardProps => {
  return replaceFilters(dashboard, withoutFilters(filtersToRemove)(dashboard.filters));
};
