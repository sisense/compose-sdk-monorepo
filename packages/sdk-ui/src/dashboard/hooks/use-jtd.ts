import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mergeFilters, type Filter, filterFactory, isCascadingFilter } from '@sisense/sdk-data';
import { WidgetProps } from '@/props.js';
import { OpenMenuFn } from '@/common/components/menu/types.js';
import { DataPoint } from '@/types';
import { combineHandlers } from '@/utils/combine-handlers';
import { isChartWidgetProps, registerDataPointContextMenuHandler } from '@/widget-by-id/utils';
import { WidgetsOptions } from '@/index-typedoc';
import { JTDConfig, JTDDrillTarget, JTDNavigateType } from '@/widget-by-id/types';
import { useModalContext } from '@/common/components/modal';
import React from 'react';
import { JTDDashboard } from '@/dashboard/components/jtd-dashboard';
import { SizeMeasurement } from '@/types';
import { OpenModalFn } from '@/common/components/modal/modal-context';
import { useSisenseContext } from '@/sisense-context/sisense-context';

/**
 * Jump to Dashboard (JTD) Filter Merging Logic:
 *
 * When a user clicks on a datapoint to open a JTD modal, multiple types of filters are merged:
 *
 * 1. **Generated Filters**: Created from the clicked datapoint's category and breakBy entries
 * 2. **Dashboard Filters**: Current dashboard filters (filtered by includeDashFilterDims)
 * 3. **Widget Filters**: Original widget-specific filters (filtered by includeWidgetFilterDims)
 * 4. **Formula Context Filters**: NEW - Embedded filters from the clicked widget's datapoint calculations
 *
 * ## Formula Context Filters (New Feature)
 *
 * Formula context filters are embedded within datapoint calculations and represent intrinsic
 * filters that are part of the measure/column computation itself. They are extracted only from
 * the specific widget that was clicked, not from all widgets. For example:
 *
 * ```
 * clickedWidget.dataOptions.value[0].column.context = {
 *   "13FC1-655": {
 *     "type": "filter",
 *     "filterType": "numeric",
 *     "attribute": { ... },
 *     "valueA": 10,
 *     "valueB": 27249.89453125
 *   }
 * }
 * ```
 *
 * These filters:
 * - Represent calculation constraints that are intrinsic to the clicked widget's datapoint
 * - Are extracted from all dataOption fields of the clicked widget (value, category, breakBy, x, y, etc.)
 * - Support both object format and string reference format
 *
 * ## Duplicate Filter Handling
 *
 * Complex formulas like `AVG(cost) - AVG(PREVMONTH(cost))` can contain multiple filters on the same dimension.
 * The `sendFormulaFiltersDuplicate` parameter controls how duplicates are handled:
 *
 * - **"none"**: Exclude all duplicate filters (only include filters that appear once)
 * - **Number (1+)**: Include only the filter at that position (1-indexed). Invalid numbers treated as "none"
 * - **Other values**: Include only the first duplicate filter
 *
 * Examples:
 * - Formula has 2 filters on Commerce.Cost dimension
 * - `sendFormulaFiltersDuplicate = "none"` → No Cost filters included
 * - `sendFormulaFiltersDuplicate = 1` → Include first Cost filter
 * - `sendFormulaFiltersDuplicate = 2` → Include second Cost filter
 * - `sendFormulaFiltersDuplicate = 3` → Invalid (out of range), treat as "none"
 */

// Extract formula context filters from data point
export const getFormulaContextFilters = (
  point: DataPoint,
  clickedWidget: WidgetProps,
  jtdConfig: JTDConfig,
): Filter[] => {
  const allFilters: Filter[] = [];

  try {
    // Check if this is a chart widget that has dataOptions
    if (isChartWidgetProps(clickedWidget) && clickedWidget.dataOptions) {
      const dataOptions = clickedWidget.dataOptions;

      // Helper function to extract context from a column
      const extractContextFromColumn = (column: any) => {
        if (column?.column?.context) {
          const context = column.column.context;

          // Handle different context types
          if (typeof context === 'object' && context !== null) {
            // If context is already parsed as an object
            for (const key in context) {
              // eslint-disable-next-line max-depth
              if (context[key] && typeof context[key].filterType !== 'undefined') {
                allFilters.push(context[key] as Filter);
              }
            }
          }
        }
      };

      // Extract from different data option fields based on chart type
      // Handle value arrays (present in most chart types)
      if ('value' in dataOptions && Array.isArray(dataOptions.value)) {
        dataOptions.value.forEach((column) => extractContextFromColumn(column));
      }
    }

    // Apply duplicate handling logic based on sendFormulaFiltersDuplicate
    return handleFormulaDuplicateFilters(allFilters, jtdConfig.sendFormulaFiltersDuplicate);
  } catch (error) {
    console.warn('Error extracting formula context filters:', error);
    return [];
  }
};

/**
 * @internal
 * Handle duplicate formula filters based on sendFormulaFiltersDuplicate parameter
 * @param filters - The filters to handle
 * @param sendFormulaFiltersDuplicate - The send formula filters duplicate parameter
 * @returns The filtered filters
 */
// Handle duplicate formula filters based on sendFormulaFiltersDuplicate parameter
export const handleFormulaDuplicateFilters = (
  filters: Filter[],
  sendFormulaFiltersDuplicate?: number | 'none',
): Filter[] => {
  if (filters.length === 0) {
    return filters;
  }

  // Group filters by dimension (attribute expression)
  const filtersByDimension = new Map<string, Filter[]>();

  filters.forEach((filter) => {
    const dimensionKey = filter.attribute.expression;
    if (!filtersByDimension.has(dimensionKey)) {
      filtersByDimension.set(dimensionKey, []);
    }
    filtersByDimension.get(dimensionKey)!.push(filter);
  });

  const result: Filter[] = [];

  filtersByDimension.forEach((dimensionFilters, dimension) => {
    if (dimensionFilters.length === 1) {
      // No duplicates, include the filter
      result.push(dimensionFilters[0]);
    } else {
      // Handle duplicates based on sendFormulaFiltersDuplicate
      if (sendFormulaFiltersDuplicate === 'none') {
        // Don't include any duplicate filters
      } else if (typeof sendFormulaFiltersDuplicate === 'number') {
        if (
          sendFormulaFiltersDuplicate >= 1 &&
          sendFormulaFiltersDuplicate <= dimensionFilters.length
        ) {
          // Include the filter at the specified position (1-indexed)
          const selectedFilter = dimensionFilters[sendFormulaFiltersDuplicate - 1];
          result.push(selectedFilter);
        } else {
          console.warn(
            `Dimension ${dimension}: invalid sendFormulaFiltersDuplicate number ${sendFormulaFiltersDuplicate}, treating as "none"`,
          );
          // Invalid number (out of range or <= 0), treat as "none"
        }
      } else {
        // Any other value, include the first duplicate
        const firstFilter = dimensionFilters[0];
        result.push(firstFilter);
      }
    }
  });

  return result;
};

// Generate filters from data point based on its category entries
export const getFiltersFromDataPoint = (point: DataPoint): Filter[] => {
  const filters: Filter[] = [];

  // Extract category entries which represent dimensions that can be filtered
  const categoryEntries = point.entries?.category || [];

  for (const entry of categoryEntries) {
    if (entry.attribute && entry.value !== undefined && entry.value !== null) {
      // Create a members filter for each category dimension
      const filter = filterFactory.members(entry.attribute, [String(entry.value)]);
      filters.push(filter);
    }
  }

  // Also check for breakBy entries which can also be used for filtering
  const breakByEntries = point.entries?.breakBy || [];

  for (const entry of breakByEntries) {
    if (entry.attribute && entry.value !== undefined && entry.value !== null) {
      // Create a members filter for each breakBy dimension
      const filter = filterFactory.members(entry.attribute, [String(entry.value)]);
      filters.push(filter);
    }
  }

  return filters;
};

/**
 * Filter filters based on allowed dimension names, supporting cascading filters
 *
 * @param filters - The filters to filter
 * @param allowedDims - The allowed dimensions
 * @returns The filtered filters
 */
export const filterByAllowedDimensions = (filters: Filter[], allowedDims?: string[]): Filter[] => {
  if (!allowedDims) {
    return filters;
  }
  if (allowedDims.length === 0) {
    return []; // If no dimensions are specified, don't include any filters
  }

  return filters.reduce<Filter[]>((result, filter) => {
    if (isCascadingFilter(filter)) {
      // Handle cascading filter: filter each level
      const filteredLevels = filter.filters.filter((levelFilter) => {
        const dimensionName = levelFilter.attribute.expression;
        return allowedDims.includes(dimensionName);
      });

      if (filteredLevels.length === 0) {
        // No levels match, exclude the entire cascading filter
        return result;
      } else if (filteredLevels.length === 1) {
        // Only one level left, transform to regular filter
        result.push(filteredLevels[0]);
      } else {
        // Multiple levels remain, create new cascading filter
        const newCascadingFilter = filterFactory.cascading(filteredLevels, {
          guid: filter.config.guid,
          disabled: filter.config.disabled,
          locked: filter.config.locked,
        });
        result.push(newCascadingFilter);
      }
    } else {
      // Handle regular filter
      const dimensionName = filter.attribute.expression;
      if (allowedDims.includes(dimensionName)) {
        result.push(filter);
      }
    }

    return result;
  }, []);
};

/**
 * @internal
 * Get the JTD click handler for a specific data point of the specific widget
 * @param jtdConfig - The JTD config
 * @param drillTarget - The drill target
 * @param widgetProps - The widget props
 * @param point - The data point
 * @param dashboardFilters - The dashboard filters
 * @param originalWidgetFilters - The original widget filters
 * @param openModal - The open modal function
 * @returns The JTD click handler
 */
export const getJtdClickHandler = (
  jtdConfig: JTDConfig,
  drillTarget: JTDDrillTarget,
  widgetProps: WidgetProps,
  point: DataPoint,
  dashboardFilters: Filter[], // Add dashboard filters parameter
  originalWidgetFilters: Filter[], // Add original widget filters parameter
  openModal: (options: {
    title: string;
    width?: number;
    height?: number;
    measurement?: SizeMeasurement;
    allowResize?: boolean;
    content: React.ReactNode;
  }) => Promise<string>,
) => {
  const generatedFilters = getFiltersFromDataPoint(point);

  // Extract formula context filters from the clicked widget - these are always included regardless of includeWidgetFilterDims
  const formulaContextFilters = filterByAllowedDimensions(
    getFormulaContextFilters(point, widgetProps, jtdConfig),
    jtdConfig.includeWidgetFilterDims,
  );

  // Filter dashboard filters based on includeDashFilterDims
  const allowedDashboardFilters = filterByAllowedDimensions(
    dashboardFilters,
    jtdConfig.includeDashFilterDims,
  );

  // Filter widget filters based on includeWidgetFilterDims
  const allowedWidgetFilters = filterByAllowedDimensions(
    originalWidgetFilters,
    jtdConfig.includeWidgetFilterDims,
  );

  // Merge all filters: formula context filters are always included
  const mergedFilters = mergeFilters(
    mergeFilters(mergeFilters(generatedFilters, allowedDashboardFilters), allowedWidgetFilters),
    formulaContextFilters,
  );

  return async () => {
    // Create dashboard content with a stable key to avoid remounting issues
    const dashboardContent = React.createElement(JTDDashboard, {
      key: `jtd-${drillTarget.id}`, // Add stable key
      dashboardOid: drillTarget.id,
      filters: mergedFilters,
      mergeTargetDashboardFilters: jtdConfig.mergeTargetDashboardFilters || false,
      displayToolbarRow: jtdConfig.displayToolbarRow || false,
      displayFilterPane: jtdConfig.displayFilterPane || false,
    });

    await openModal({
      title: drillTarget.caption,
      width: jtdConfig.modalWindowWidth,
      height: jtdConfig.modalWindowHeight,
      measurement: jtdConfig.modalWindowMeasurement,
      allowResize: jtdConfig.modalWindowResize,
      content: dashboardContent,
    });
  };
};

/**
 * @internal
 * Get the JTD menu item for a specific data point of the specific widget
 * @param jtdConfig - The JTD config
 * @param point - The data point
 * @param widgetProps - The widget props
 * @param dashboardFilters - The dashboard filters
 * @param originalWidgetFilters - The original widget filters
 * @param openModal - The open modal function
 * @param translate - The translation function
 * @returns The JTD menu item
 */
const getJumpToDashboardMenuItem = (
  jtdConfig: JTDConfig,
  point: DataPoint,
  widgetProps: WidgetProps,
  dashboardFilters: Filter[], // Add dashboard filters parameter
  originalWidgetFilters: Filter[], // Add original widget filters parameter
  openModal: OpenModalFn,
  translate: (key: string) => string,
) => {
  if (!jtdConfig) {
    return null;
  }
  const multipleDrillTargets = jtdConfig.drillTargets.length > 1;

  // Use drillToDashboardRightMenuCaption if provided, otherwise use translated default
  const menuCaption =
    jtdConfig.drillToDashboardRightMenuCaption || translate('jumpToDashboard.defaultCaption');

  if (multipleDrillTargets) {
    return {
      caption: menuCaption,
      subItems: [
        {
          items: jtdConfig.drillTargets.map((drillTarget) => ({
            caption: drillTarget.caption,
            onClick: getJtdClickHandler(
              jtdConfig,
              drillTarget,
              widgetProps,
              point,
              dashboardFilters,
              originalWidgetFilters,
              openModal,
            ),
          })),
        },
      ],
    };
  }

  const drillTarget = jtdConfig.drillTargets[0];
  return {
    caption: `${menuCaption} ${drillTarget.caption}`,
    onClick: getJtdClickHandler(
      jtdConfig,
      drillTarget,
      widgetProps,
      point,
      dashboardFilters,
      originalWidgetFilters,
      openModal,
    ),
  };
};

/**
 * @internal
 * Jump to Dashboard (JTD) hook.
 * Implements the JTD functionality for each widget with JTD config.
 * @param widgetOptions - The widget options of the dashboard
 * @param dashboardFilters - The dashboard filters to use
 * @param widgetFilters - The widget filters to use
 * @param openMenu - The open menu function to use
 * @returns The connect to widget props function
 */
export const useJtd = ({
  widgetOptions,
  dashboardFilters = [], // Add dashboard filters parameter
  widgetFilters = new Map<string, Filter[]>(),
  openMenu,
}: {
  widgetOptions: WidgetsOptions;
  dashboardFilters?: Filter[]; // Add dashboard filters parameter
  widgetFilters?: Map<string, Filter[]>; // Map of widget id to it's filters
  openMenu: OpenMenuFn;
}) => {
  // We should not fail here if modal context is not available, thus we use the useModalContext hook instead of useModal
  const modalContext = useModalContext();
  const translate = useTranslation().t;
  const { app } = useSisenseContext();
  // Memoize the openModal function to prevent unnecessary re-renders
  const openModal = useMemo(
    () => modalContext?.openModal ?? (async () => ''),
    [modalContext?.openModal],
  );

  const connectToWidgetProps = useCallback(
    (widgetProps: WidgetProps) => {
      // Check if JTD feature is enabled in app config
      if (!app?.settings.jumpToDashboardConfig?.enabled) {
        return widgetProps;
      }

      const jtdConfig = widgetOptions[widgetProps.id]?.jtdConfig;

      if (!jtdConfig || !jtdConfig.enabled) {
        return widgetProps;
      }
      // Find the original widget to get its filters
      const originalWidgetFilters = widgetFilters.get(widgetProps.id) || [];

      if (jtdConfig.navigateType === JTDNavigateType.CLICK) {
        // For click navigation, register onDataPointClick handler
        if (isChartWidgetProps(widgetProps)) {
          const originalClickHandler = widgetProps.onDataPointClick;

          widgetProps.onDataPointClick = combineHandlers([
            originalClickHandler,
            (point: DataPoint, nativeEvent: PointerEvent) => {
              // Handle single drill target
              if (jtdConfig.drillTargets.length === 1) {
                const drillTarget = jtdConfig.drillTargets[0];
                const clickHandler = getJtdClickHandler(
                  jtdConfig,
                  drillTarget,
                  widgetProps,
                  point,
                  dashboardFilters,
                  originalWidgetFilters,
                  openModal,
                );
                clickHandler();
              } else {
                // Handle multiple drill targets - show context menu
                const menuItem = getJumpToDashboardMenuItem(
                  jtdConfig,
                  point,
                  widgetProps,
                  dashboardFilters,
                  originalWidgetFilters,
                  openModal,
                  translate,
                );
                if (!menuItem) {
                  return;
                }

                const itemSections = [
                  {
                    items: [menuItem],
                  },
                ];

                openMenu?.({
                  id: 'jump-to-dashboard-menu',
                  position: {
                    left: nativeEvent.clientX,
                    top: nativeEvent.clientY,
                  },
                  itemSections,
                });
              }
            },
          ]);
        }
      } else if (
        jtdConfig.navigateType === JTDNavigateType.RIGHT_CLICK &&
        isChartWidgetProps(widgetProps)
      ) {
        const onDataPointContextMenu = (point: DataPoint, nativeEvent: PointerEvent) => {
          const menuItem = getJumpToDashboardMenuItem(
            jtdConfig,
            point,
            widgetProps,
            dashboardFilters,
            originalWidgetFilters,
            openModal,
            translate,
          );

          if (!menuItem) {
            return;
          }

          const itemSections = [
            {
              items: [menuItem],
            },
          ];
          openMenu?.({
            id: 'jump-to-dashboard-menu',
            position: {
              left: nativeEvent.clientX,
              top: nativeEvent.clientY,
            },
            itemSections,
          });
        };
        registerDataPointContextMenuHandler(widgetProps, onDataPointContextMenu);
        return widgetProps;
      }
      // Note: PIVOT_LINK and BLOX navigation types are not implemented yet

      return widgetProps;
    },
    [
      widgetOptions,
      openMenu,
      openModal,
      dashboardFilters,
      widgetFilters,
      translate,
      app?.settings.jumpToDashboardConfig?.enabled,
    ],
  );

  return {
    connectToWidgetProps,
  };
};
