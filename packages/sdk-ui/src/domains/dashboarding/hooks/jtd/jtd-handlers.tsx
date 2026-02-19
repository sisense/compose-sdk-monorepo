import React from 'react';

import {
  Attribute,
  type Filter,
  filterFactory,
  isMembersFilter,
  mergeFilters,
} from '@sisense/sdk-data';

import { JtdDashboard } from '@/domains/dashboarding/components/jtd-dashboard';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { OpenModalFn } from '@/infra/contexts/modal-provider/modal-context';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { DataPoint, PivotTableDataPoint } from '@/types';

import {
  filterByAllowedDimensions,
  getFiltersFromDataPoint,
  getFormulaContextFilters,
  handleFormulaDuplicateFilters,
} from './jtd-filters';
import { isPivotClickHandlerActionable } from './jtd-formatters';
import {
  isJumpTargetWithId,
  JtdActions,
  JtdClickHandlerData,
  JtdConfig,
  JtdContext,
  JtdCoreData,
  JtdDataPointClickEvent,
} from './jtd-types';

const noJumpTargetsError = 'jumpToDashboard.noJumpTargets';

/**
 * Get the JTD click handler for a specific data point of the specific widget
 *
 * @param data - Core data with jump target (config, jump target, widget props, point)
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

  // Merge all filters: formula context filters are always included, extra filters have highest priority
  const mergedFilters = mergeFilters(
    mergeFilters(
      mergeFilters(
        mergeFilters(allowedDashboardFilters, allowedWidgetFilters),
        formulaContextFilters,
      ),
      generatedFilters,
    ),
    context.extraFilters || [],
  );

  const jumpTarget = isJumpTargetWithId(data.jumpTarget)
    ? data.jumpTarget.id
    : data.jumpTarget.dashboard;
  const jumpTargetId = isJumpTargetWithId(data.jumpTarget)
    ? data.jumpTarget.id
    : data.jumpTarget.dashboard.id;
  return () => {
    return actions.openModal({
      title: data.jumpTarget.caption,
      width: data.jtdConfig.modalWindowWidth,
      height: data.jtdConfig.modalWindowHeight,
      measurement: data.jtdConfig.modalWindowMeasurement === 'px' ? 'px' : '%',
      content: (
        <JtdDashboard
          key={`jtd-${jumpTargetId}`}
          dashboard={jumpTarget}
          filters={mergedFilters}
          mergeTargetDashboardFilters={data.jtdConfig.mergeTargetDashboardFilters || false}
          dashboardConfig={data.jtdConfig.dashboardConfig}
        />
      ),
    });
  };
};

/**
 * Get the JTD click handler for multiple data points
 *
 * @param data - Core data with jump target (config, jump target, widget props, points)
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
    // Merge all filters with generated filters taking priority, extra filters have highest priority
    const allFilters = mergeFilters(
      mergeFilters(
        mergeFilters(allowedDashboardFilters, allowedWidgetFilters),
        mergeFilters(formulaContextFilters, mergedGeneratedFilters),
      ),
      context.extraFilters || [],
    );

    const jumpTarget = isJumpTargetWithId(data.jumpTarget)
      ? data.jumpTarget.id
      : data.jumpTarget.dashboard;
    const jumpTargetId = isJumpTargetWithId(data.jumpTarget)
      ? data.jumpTarget.id
      : data.jumpTarget.dashboard.id;

    return actions.openModal({
      title: data.jumpTarget.caption,
      width: data.jtdConfig.modalWindowWidth,
      height: data.jtdConfig.modalWindowHeight,
      measurement: data.jtdConfig.modalWindowMeasurement === 'px' ? 'px' : '%',
      content: (
        <JtdDashboard
          key={`jtd-${jumpTargetId}`}
          dashboard={jumpTarget}
          filters={allFilters}
          mergeTargetDashboardFilters={data.jtdConfig.mergeTargetDashboardFilters || false}
          dashboardConfig={data.jtdConfig.dashboardConfig}
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
  if (coreData.jtdConfig.jumpTargets.length === 0) {
    throw new TranslatableError(noJumpTargetsError);
  } else if (coreData.jtdConfig.jumpTargets.length === 1) {
    // Single jump target - direct navigation
    const jumpTarget = coreData.jtdConfig.jumpTargets[0];
    const clickHandler = getJtdClickHandler(
      {
        ...coreData,
        jumpTarget,
      },
      context,
      {
        openModal: actions.openModal,
      },
    );
    return clickHandler();
  } else {
    // Multiple jump targets - show context menu
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
 * Convert PivotTableDataPoint to DataPoint format for JTD processing
 *
 * @param pivotPoint - The pivot table data point
 * @returns Converted data point
 * @internal
 */
export const convertPivotToDataPoint = (pivotPoint: PivotTableDataPoint): DataPoint => {
  // Convert pivot entries structure to regular data point structure
  // Handle case where entries might be undefined
  const entries = pivotPoint.entries || { rows: [], columns: [], values: [] };
  const rows = entries.rows || [];
  const columns = entries.columns || [];
  const category = [...rows, ...columns];
  const value = entries.values || [];

  return {
    entries: {
      category,
      value, // Ensure it's always DataPointEntry[]
      breakBy: [], // Pivot tables don't have breakBy in the same way as charts
    },
  };
};

/**
 * Handle pivot table data point click
 *
 * @param data - Core data with jump target (config, jump target, widget props, pivot point)
 * @param context - Context data (filters)
 * @param actions - Action functions
 * @param eventData - Event-related data
 * @internal
 */
export const handlePivotDataPointClick = (
  data: { jtdConfig: JtdConfig; widgetProps: WidgetProps; point: PivotTableDataPoint },
  context: JtdContext,
  actions: Pick<JtdActions, 'openModal' | 'openMenu' | 'translate'>,
) => {
  // Guard against misconfigured jump targets
  if (data.jtdConfig.jumpTargets.length === 0) {
    throw new TranslatableError(noJumpTargetsError);
  }

  // Use click handler-specific logic to determine if cell should be actionable and get matching target
  const { isActionable, matchingTarget } = isPivotClickHandlerActionable(
    data.jtdConfig,
    data.point,
  );

  if (!isActionable || !matchingTarget) {
    // Cell is not actionable, don't perform any navigation
    return;
  }

  // Convert pivot data point to regular data point format
  const convertedPoint = convertPivotToDataPoint(data.point);

  return getJtdClickHandler(
    {
      jtdConfig: data.jtdConfig,
      jumpTarget: matchingTarget,
      widgetProps: data.widgetProps,
      point: convertedPoint,
    },
    context,
    {
      openModal: actions.openModal,
    },
  )();
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
  if (jtdConfig.jumpTargets.length === 0) {
    throw new TranslatableError(noJumpTargetsError);
  }
  const jumpTarget = jtdConfig.jumpTargets[0];
  const clickHandler = getJtdClickHandler(
    {
      jtdConfig,
      jumpTarget,
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
};
