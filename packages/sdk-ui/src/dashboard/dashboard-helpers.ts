import { Filter } from '@sisense/sdk-data';
import { DashboardProps } from './types';

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
 * @param newFilters - An array of new filters to set on the dashboard.
 * @returns A new dashboard instance with the updated filters.
 */
export const replaceFilters = (dashboard: DashboardProps, newFilters: Filter[]): DashboardProps => {
  const newDashboard = { ...dashboard };
  newDashboard.filters = newFilters;
  return newDashboard;
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
  const newDashboard = { ...dashboard };
  if (!newDashboard.filters) {
    newDashboard.filters = [];
  }
  newDashboard.filters = [...newDashboard.filters, newFilter];
  return newDashboard;
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
  const newDashboard = { ...dashboard };
  if (!newDashboard.filters) {
    newDashboard.filters = [];
  }
  newDashboard.filters = [...newDashboard.filters, ...newFilters];
  return newDashboard;
};

/**
 * Creates a new dashboard instance with a specific filter modified.
 *
 * This function searches for a filter with the same GUID as the provided `filterToModify` and replaces it with `newFilter`.
 * This function does not modify the original dashboard; instead, it returns a new dashboard with the updated filters.
 *
 * @example
 * Modify a filter in a dashboard.
 * ```ts
 * const existingDashboard: DashboardProps = {...};
 * const filterToModify: Filter = {...};
 * const newFilter: Filter = {...};
 * const updatedDashboard = modifyFilter(existingDashboard, filterToModify, newFilter);
 * ```
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
  const newDashboard = { ...dashboard };
  if (!newDashboard.filters) {
    newDashboard.filters = [];
  }
  newDashboard.filters = newDashboard.filters.map((filter) =>
    filter.guid === filterToModify.guid ? newFilter : filter,
  );
  return newDashboard;
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
 * @param filter - The filter to be removed.
 * @returns A new dashboard instance with the specified filter removed.
 */
export const removeFilter = (dashboard: DashboardProps, filter: Filter): DashboardProps => {
  const newDashboard = { ...dashboard };
  if (!newDashboard.filters) {
    newDashboard.filters = [];
  }
  newDashboard.filters = newDashboard.filters.filter((f) => f.guid !== filter.guid);
  return newDashboard;
};
