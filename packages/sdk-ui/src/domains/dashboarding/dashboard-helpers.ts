import { Filter, FilterRelations } from '@sisense/sdk-data';

import { WidgetsOptions } from '@/domains/dashboarding/dashboard-model/types';
import {
  withAddedFilter,
  withAddedFilters,
  withoutFilter,
  withoutFilters,
  withReplacedFilter,
} from '@/domains/filters/helpers';

import type { JumpToDashboardConfig } from './hooks/jtd/jtd-types.js';
import { DashboardProps } from './types.js';

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
 * const updatedDashboard = dashboardHelpers.addFilter(existingDashboard, newFilter);
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
 * const updatedDashboard = dashboardHelpers.addFilters(existingDashboard, newFilters);
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
  return replaceFilters(
    dashboard,
    withReplacedFilter(filterToReplace, newFilter)(dashboard.filters),
  );
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
 * const updatedDashboard = dashboardHelpers.removeFilter(existingDashboard, filterToRemove);
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
  return replaceFilters(dashboard, withoutFilters(filtersToRemove)(dashboard.filters));
};

/**
 * Creates a new `DashboardProps` instance with JTD (Jump To Dashboard) configuration applied to a single widget.
 *
 * Jump To Dashboard (JTD) allows users to navigate from one dashboard to another when interacting with widgets,
 * such as clicking on chart data points or using context menus. This function applies JTD configuration to a specific
 * widget in a dashboard, enabling jump-to-dashboard functionality.
 *
 * This function does not modify the original dashboard; instead, it returns a new `DashboardProps` instance with the JTD
 * configuration applied. If the specified widget does not exist in the dashboard, the function returns the original
 * `DashboardProps` unchanged and logs a warning to the console.
 *
 * @example
 * Apply JTD configuration to a dashboard widget.
 * ```ts
 * const jtdConfig: JumpToDashboardConfig = {
 *   targets: [{ id: 'dashboardId1', caption: 'Analytics Dashboard' }],
 *   interaction: {
 *     triggerMethod: 'rightclick',
 *     contextMenuCaption: 'Jump to Analytics'
 *   }
 * };
 *
 * const updatedDashboard = dashboardHelpers.applyJtdConfig(dashboard, 'widgetId3', jtdConfig);
 * ```
 *
 * @param dashboard - The original dashboard to modify. Must be a valid `DashboardProps` object containing the target widget.
 * @param widgetOid - The unique identifier (OID) of the widget to apply JTD configuration to. Must match an existing widget ID in the dashboard.
 * @param config - The JTD configuration to apply.
 *
 * @returns A new `DashboardProps` instance with the JTD configuration applied to the specified widget. If the widget doesn't exist, returns the original dashboard unchanged.
 *
 * @group Dashboard Utilities
 */
export const applyJtdConfig = (
  dashboard: DashboardProps,
  widgetOid: string,
  config: JumpToDashboardConfig,
): DashboardProps => {
  // Ensure the widget exists in the dashboard
  const widgetExists = dashboard.widgets.some((widget) => widget.id === widgetOid);
  if (!widgetExists) {
    console.warn(`Widget with OID "${widgetOid}" not found in dashboard. JTD config not applied.`);
    return dashboard;
  }

  // Create a new widgetsOptions object with the JTD config applied
  const currentWidgetsOptions = dashboard.widgetsOptions || {};
  const currentWidgetOptions = currentWidgetsOptions[widgetOid] || {};

  const updatedWidgetsOptions: WidgetsOptions = {
    ...currentWidgetsOptions,
    [widgetOid]: {
      ...currentWidgetOptions,
      jtdConfig: config,
    },
  };

  return {
    ...dashboard,
    widgetsOptions: updatedWidgetsOptions,
  };
};

/**
 * Creates a new `DashboardProps` instance with JTD (Jump To Dashboard) configurations applied to multiple widgets in a single operation.
 *
 * Jump To Dashboard (JTD) allows users to navigate from one dashboard to another when interacting with widgets.
 * This function efficiently applies JTD configurations to multiple widgets in a single operation.
 *
 * This function does not modify the original dashboard; instead, it returns a new `DashboardProps` instance with all valid
 * JTD configurations applied. Configurations for non-existent widgets are automatically filtered out, and warnings
 * are logged to the console for invalid widget OIDs.
 *
 * @example
 * Apply a variety of Jump To Dashboard configuration options to multiple widgets in a single operation.
 * ```ts
 * import { dashboardHelpers } from '@sisense/sdk-ui';
 *
 * const dashboard: DashboardProps = {
 *   title: 'Executive Dashboard',
 *   widgets: [
 *     { id: 'widgetId1', widgetType: 'chart', chartType: 'column', dataOptions: {...} },
 *     { id: 'widgetId2', widgetType: 'chart', chartType: 'pie', dataOptions: {...} },
 *     { id: 'widgetId3', widgetType: 'table', dataOptions: {...} }
 *   ]
 * };
 *
 * const jtdConfigs = {
 *   'widgetId1': {
 *     enabled: true,
 *     targets: [{ id: 'dashboardId1', caption: 'Sales Breakdown' }],
 *     interaction: {
 *       triggerMethod: 'rightclick'
 *     }
 *   },
 *   'widgetId2': {
 *     targets: [{ id: 'dashboardId2', caption: 'Revenue Analysis' }],
 *     interaction: {
 *       triggerMethod: 'click',
 *       contextMenuCaption: 'Analyze Revenue'
 *     }
 *   },
 *   'widgetId3': {
 *     enabled: true,
 *     targets: [
 *       { id: 'dashboardId3', caption: 'Customer Details' },
 *       { id: 'dashboardId4', caption: 'Product Analytics' }
 *     ],
 *     interaction: {
 *       triggerMethod: 'rightclick'
 *     }
 *   }
 * };
 *
 * const updatedDashboard = dashboardHelpers.applyJtdConfigs(dashboard, jtdConfigs);
 * ```
 *
 * @example Error handling
 * Batch apply JTD configurations with error handling.
 * ```ts
 * const configsWithInvalidWidget = {
 *   'widgetId1': { targets: [{ id: 'dashboardId1', caption: 'Target' }] },
 *   'invalidWidgetId': { targets: [{ id: 'dashboardId2', caption: 'Other' }] } // Will be filtered out
 * };
 *
 * const result = dashboardHelpers.applyJtdConfigs(dashboard, configsWithInvalidWidget);
 * // Console warning: "Widgets with OIDs [invalidWidgetId] not found in dashboard..."
 * // Only 'widgetId1' gets the JTD configuration applied
 * ```
 *
 * @param dashboard - The original dashboard to modify. Must be a valid `DashboardProps` object with widgets to configure.
 * @param jtdConfigs - An object mapping widget OIDs (keys) to their respective JTD configurations (values).
 * @returns A new `DashboardProps` instance with all valid JTD configurations applied to their respective widgets. Invalid widget configurations are skipped and warnings are logged.
 *
 * @group Dashboard Utilities
 */
export const applyJtdConfigs = (
  dashboard: DashboardProps,
  jtdConfigs: Record<string, JumpToDashboardConfig>,
): DashboardProps => {
  // Get all widget OIDs in the dashboard
  const existingWidgetOids = new Set(dashboard.widgets.map((widget) => widget.id));

  // Filter out configs for widgets that don't exist
  const validConfigs: Record<string, JumpToDashboardConfig> = {};
  const invalidWidgetOids: string[] = [];

  Object.entries(jtdConfigs).forEach(([widgetOid, config]) => {
    if (existingWidgetOids.has(widgetOid)) {
      validConfigs[widgetOid] = config;
    } else {
      invalidWidgetOids.push(widgetOid);
    }
  });

  // Warn about invalid widget OIDs
  if (invalidWidgetOids.length > 0) {
    console.warn(
      `Widgets with OIDs [${invalidWidgetOids.join(
        ', ',
      )}] not found in dashboard. JTD configs for these widgets not applied.`,
    );
  }

  // Create a new widgetsOptions object with all JTD configs applied
  const currentWidgetsOptions = dashboard.widgetsOptions || {};
  const updatedWidgetsOptions: WidgetsOptions = { ...currentWidgetsOptions };

  Object.entries(validConfigs).forEach(([widgetOid, config]) => {
    const currentWidgetOptions = updatedWidgetsOptions[widgetOid] || {};
    updatedWidgetsOptions[widgetOid] = {
      ...currentWidgetOptions,
      jtdConfig: config,
    };
  });

  return {
    ...dashboard,
    widgetsOptions: updatedWidgetsOptions,
  };
};
