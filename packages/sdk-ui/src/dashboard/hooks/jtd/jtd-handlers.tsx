import React from 'react';
import {
  type Filter,
  filterFactory,
  isMembersFilter,
  mergeFilters,
  Attribute,
} from '@sisense/sdk-data';
import { WidgetProps } from '@/props.js';
import { JtdConfig } from '@/widget-by-id/types';
import { OpenModalFn } from '@/common/components/modal/modal-context';
import { JtdDashboard } from '@/dashboard/components/jtd-dashboard';
import {
  getFiltersFromDataPoint,
  getFormulaContextFilters,
  filterByAllowedDimensions,
  handleFormulaDuplicateFilters,
} from './jtd-filters';
import {
  JtdCoreData,
  JtdContext,
  JtdActions,
  JtdClickHandlerData,
  JtdDataPointClickEvent,
} from './jtd-types';

/**
 * Get the JTD click handler for a specific data point of the specific widget
 *
 * @param data - Core data with drill target (config, drill target, widget props, point)
 * @param context - Context data (filters)
 * @param actions - Action functions
 * @returns The JTD click handler
 * @internal
 */
export const getJtdClickHandler = (
  data: JtdClickHandlerData,
  context: JtdContext,
  actions: Pick<JtdActions, 'openModal'>,
) => {
  let generatedFilters: Filter[] = [];
  if (data.point) {
    generatedFilters = getFiltersFromDataPoint(data.point);
  }

  // Extract formula context filters from the clicked widget - these are always included regardless of includeWidgetFilterDims
  const formulaContextFilters = filterByAllowedDimensions(
    getFormulaContextFilters(data.widgetProps, data.jtdConfig),
    data.jtdConfig.includeWidgetFilterDims,
  );

  // Filter dashboard filters based on includeDashFilterDims
  const allowedDashboardFilters = filterByAllowedDimensions(
    context.dashboardFilters,
    data.jtdConfig.includeDashFilterDims,
  );

  // Filter widget filters based on includeWidgetFilterDims
  const allowedWidgetFilters = filterByAllowedDimensions(
    context.originalWidgetFilters,
    data.jtdConfig.includeWidgetFilterDims,
  );

  // Merge all filters: formula context filters are always included
  const mergedFilters = mergeFilters(
    mergeFilters(
      mergeFilters(allowedDashboardFilters, allowedWidgetFilters),
      formulaContextFilters,
    ),
    generatedFilters,
  );

  // Return the click handler
  return () => {
    return actions.openModal({
      title: data.drillTarget.caption,
      width: data.jtdConfig.modalWindowWidth,
      height: data.jtdConfig.modalWindowHeight,
      measurement: data.jtdConfig.modalWindowMeasurement,
      content: (
        <JtdDashboard
          key={`jtd-${data.drillTarget.id}`}
          dashboardOid={data.drillTarget.id}
          filters={mergedFilters}
          mergeTargetDashboardFilters={data.jtdConfig.mergeTargetDashboardFilters || false}
          displayToolbarRow={data.jtdConfig.displayToolbarRow || false}
          displayFilterPane={data.jtdConfig.displayFilterPane || false}
        />
      ),
    });
  };
};

/**
 * Get the JTD click handler for multiple data points
 *
 * @param data - Core data with drill target (config, drill target, widget props, points)
 * @param context - Context data (filters)
 * @param actions - Action functions
 * @returns The JTD click handler
 * @internal
 */
export const getJtdClickHandlerForMultiplePoints = (
  data: JtdClickHandlerData,
  context: JtdContext,
  actions: Pick<JtdActions, 'openModal'>,
) => {
  if (!data.points || data.points.length === 0) {
    return () => {};
  }

  return () => {
    // Generate filters from all selected data points and group by dimension
    const allGeneratedFilters = data.points!.flatMap((point) => getFiltersFromDataPoint(point));

    // Group filters by dimension expression to merge members
    const filtersByDimension = new Map<string, { attribute: Attribute; members: Set<string> }>();

    allGeneratedFilters.forEach((filter) => {
      const dimensionKey = filter.attribute.expression;

      if (!filtersByDimension.has(dimensionKey)) {
        filtersByDimension.set(dimensionKey, {
          attribute: filter.attribute,
          members: new Set<string>(),
        });
      }

      // Extract members from the filter (assuming it's a members filter)
      if (isMembersFilter(filter)) {
        filter.members.forEach((member: string) => {
          filtersByDimension.get(dimensionKey)!.members.add(member);
        });
      }
    });

    // Create merged filters with all members for each dimension
    const mergedGeneratedFilters = Array.from(filtersByDimension.entries()).map(
      ([, { attribute, members }]) => {
        return filterFactory.members(attribute, Array.from(members));
      },
    );

    const allowedWidgetFilters = filterByAllowedDimensions(
      context.originalWidgetFilters,
      data.jtdConfig.includeWidgetFilterDims,
    );

    const allowedDashboardFilters = filterByAllowedDimensions(
      context.dashboardFilters,
      data.jtdConfig.includeDashFilterDims,
    );

    const formulaContextFilters =
      data.points!.length > 0
        ? handleFormulaDuplicateFilters(
            getFormulaContextFilters(data.widgetProps, data.jtdConfig),
            data.jtdConfig.sendFormulaFiltersDuplicate,
          )
        : [];
    // Merge all filters with generated filters taking priority
    const allFilters = mergeFilters(
      mergeFilters(allowedDashboardFilters, allowedWidgetFilters),
      mergeFilters(formulaContextFilters, mergedGeneratedFilters),
    );

    return actions.openModal({
      title: data.drillTarget.caption,
      width: data.jtdConfig.modalWindowWidth,
      height: data.jtdConfig.modalWindowHeight,
      measurement: data.jtdConfig.modalWindowMeasurement,
      content: (
        <JtdDashboard
          key={`jtd-${data.drillTarget.id}`}
          dashboardOid={data.drillTarget.id}
          filters={allFilters}
          mergeTargetDashboardFilters={data.jtdConfig.mergeTargetDashboardFilters || false}
          displayToolbarRow={data.jtdConfig.displayToolbarRow || false}
          displayFilterPane={data.jtdConfig.displayFilterPane || false}
        />
      ),
    });
  };
};

/**
 * Handle data point click for chart widgets
 *
 * @param coreData - Core data (config, widget props, point)
 * @param context - Context data (filters)
 * @param actions - Action functions
 * @param event - Event-related data
 * @internal
 */
export const handleDataPointClick = (
  coreData: JtdCoreData,
  context: JtdContext,
  actions: Pick<JtdActions, 'openModal' | 'openMenu' | 'translate'>,
  event: JtdDataPointClickEvent,
) => {
  if (coreData.jtdConfig.drillTargets.length === 1) {
    // Single drill target - direct navigation
    const drillTarget = coreData.jtdConfig.drillTargets[0];
    const clickHandler = getJtdClickHandler(
      {
        ...coreData,
        drillTarget,
      },
      context,
      {
        openModal: actions.openModal,
      },
    );
    return clickHandler();
  } else {
    // Multiple drill targets - show context menu
    const menuItem = event.getJumpToDashboardMenuItem(coreData, context, {
      openModal: actions.openModal,
      translate: actions.translate!,
    });

    if (menuItem) {
      return actions.openMenu?.({
        id: 'jump-to-dashboard-menu',
        position: {
          left: event.nativeEvent.clientX,
          top: event.nativeEvent.clientY,
        },
        itemSections: [{ items: [menuItem] }],
      });
    }
  }
};

/**
 * Handle text widget click (placeholder for future implementation)
 *
 * @param jtdConfig - The JTD config
 * @param widgetProps - The widget props
 * @param dashboardFilters - The dashboard filters
 * @param originalWidgetFilters - The original widget filters
 * @param openModal - The open modal function
 * @internal
 */
export const handleTextWidgetClick = (
  jtdConfig: JtdConfig,
  widgetProps: WidgetProps,
  dashboardFilters: Filter[],
  originalWidgetFilters: Filter[],
  openModal: OpenModalFn,
) => {
  // Text widgets don't support  functionality yet
  // This is a placeholder for potential future implementation
  if (jtdConfig.drillTargets.length === 1) {
    const drillTarget = jtdConfig.drillTargets[0];
    const clickHandler = getJtdClickHandler(
      {
        jtdConfig,
        drillTarget,
        widgetProps,
        point: undefined,
      },
      {
        dashboardFilters,
        originalWidgetFilters,
      },
      {
        openModal,
      },
    );
    return clickHandler();
  }

  // Multiple drill targets not supported for text widgets
  return Promise.resolve('');
};
