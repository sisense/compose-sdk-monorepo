import { Filter, FilterRelations } from '@sisense/sdk-data';
import { dashboardHelpers as dashboardHelpersPreact } from '@sisense/sdk-ui-preact';

import { DashboardProps } from '../components';
import {
  toDashboardProps,
  toPreactDashboardProps,
} from '../helpers/dashboard-props-preact-translator';

/**
 * {@inheritDoc @sisense/sdk-ui!dashboardHelpers.replaceFilters}
 *
 * @example
 * Replace all filters on a dashboard with a new set of filters.
 * ```ts
 * const existingDashboard: DashboardProps = {...}
 * const newFilters: Filter[] = [{...}, {...}, ...];
 * const updatedDashboard = dashboardHelpers.replaceFilters(existingDashboard, newFilters);
 * ```
 * @param dashboard - The original dashboard (`DashboardProps`) whose filters are to be replaced.
 * @param newFilters - An array of new filters or filter relations to set on the dashboard.
 * @returns A new dashboard instance with the updated filters.
 */
export const replaceFilters = (
  dashboard: DashboardProps,
  newFilters: Filter[] | FilterRelations,
): DashboardProps => {
  return toDashboardProps(
    dashboardHelpersPreact.replaceFilters(toPreactDashboardProps(dashboard), newFilters),
  );
};

/**
 * {@inheritDoc @sisense/sdk-ui!dashboardHelpers.addFilter}
 *
 * @example
 * Add a new filter to a dashboard.
 * ```ts
 * const existingDashboard: DashboardProps = {...};
 * const newFilter: Filter = {...};
 * const updatedDashboard = dashboardHelpers.addFilter(existingDashboard, newFilter);
 * ```
 * @param dashboard - The original dashboard (`DashboardProps`) to which the filter will be added.
 * @param newFilter - The filter to add to the dashboard.
 * @returns A new dashboard instance with the new filter added.
 */
export const addFilter = (dashboard: DashboardProps, newFilter: Filter): DashboardProps => {
  return toDashboardProps(
    dashboardHelpersPreact.addFilter(toPreactDashboardProps(dashboard), newFilter),
  );
};

/**
 * {@inheritDoc @sisense/sdk-ui!dashboardHelpers.addFilters}
 *
 * @example
 * Add multiple new filters to a dashboard.
 * ```ts
 * const existingDashboard: DashboardProps = {...};
 * const newFilters: Filter[] = [{...}, {...}, ...];
 * const updatedDashboard = dashboardHelpers.addFilters(existingDashboard, newFilters);
 * ```
 * @param dashboard - The original dashboard (`DashboardProps`) to which the filters will be added.
 * @param newFilters - An array of filters to add to the dashboard.
 * @returns A new dashboard instance with the new filters added.
 */
export const addFilters = (dashboard: DashboardProps, newFilters: Filter[]): DashboardProps => {
  return toDashboardProps(
    dashboardHelpersPreact.addFilters(toPreactDashboardProps(dashboard), newFilters),
  );
};

/**
 * {@inheritDoc @sisense/sdk-ui!dashboardHelpers.replaceFilter}
 *
 * @example
 * Replace a filter in a dashboard.
 * ```ts
 * const existingDashboard: DashboardProps = {...};
 * const filterToReplace: Filter = {...};
 * const newFilter: Filter = {...};
 * const updatedDashboard = dashboardHelpers.replaceFilter(existingDashboard, filterToReplace, newFilter);
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
  return toDashboardProps(
    dashboardHelpersPreact.replaceFilter(
      toPreactDashboardProps(dashboard),
      filterToReplace,
      newFilter,
    ),
  );
};

/**
 * {@inheritDoc @sisense/sdk-ui!dashboardHelpers.removeFilter}
 *
 * @example
 * Remove a filter from a dashboard.
 * ```ts
 * const existingDashboard: DashboardProps = {...};
 * const filterToRemove: Filter = {...};
 * const updatedDashboard = dashboardHelpers.removeFilter(existingDashboard, filterToRemove);
 * ```
 * @param dashboard - The original dashboard (`DashboardProps`) from which to remove the filter.
 * @param filterToRemove - The filter to be removed.
 * @returns A new dashboard instance with the specified filter removed.
 */
export const removeFilter = (dashboard: DashboardProps, filterToRemove: Filter): DashboardProps => {
  return toDashboardProps(
    dashboardHelpersPreact.removeFilter(toPreactDashboardProps(dashboard), filterToRemove),
  );
};

/**
 * {@inheritDoc @sisense/sdk-ui!dashboardHelpers.removeFilters}
 *
 * @example
 * Remove multiple filters from a dashboard.
 * ```ts
 * const existingDashboard: DashboardProps = {...};
 * const filtersToRemove: Filter[] = [{...}, {...}, ...];
 * const updatedDashboard = dashboardHelpers.removeFilters(existingDashboard, filtersToRemove);
 * ```
 * @param dashboard - The original dashboard (`DashboardProps`) from which the specified filters are removed.
 * @param filtersToRemove - An array of filters to remove.
 * @returns A new dashboard instance with the specified filters removed.
 */
export const removeFilters = (
  dashboard: DashboardProps,
  filtersToRemove: Filter[],
): DashboardProps => {
  return toDashboardProps(
    dashboardHelpersPreact.removeFilters(toPreactDashboardProps(dashboard), filtersToRemove),
  );
};
