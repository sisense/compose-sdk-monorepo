/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Tooltip from '@mui/material/Tooltip';

import { JtdJumpableIcon } from '@/common/icons/jtd-jumpable-icon';
import { CustomDataCellFormatter, CustomHeaderCellFormatter } from '@/pivot-table/formatters/types';
import { PivotTableDataPointEventHandler, WidgetProps } from '@/props.js';
import { DEFAULT_HYPERLINK_COLOR } from '@/theme-provider/default-theme-settings';
import { DataPoint, PivotTableDataPoint } from '@/types';
import { combineHandlers } from '@/utils/combine-handlers';
import {
  isChartWidgetProps,
  isPivotTableWidgetProps,
  isTextWidgetProps,
  registerDataPointContextMenuHandler,
  registerDataPointsSelectedHandler,
} from '@/widget-by-id/utils';

import {
  createJtdHyperlinkDataCellFormatter,
  createJtdHyperlinkHeaderCellFormatter,
  getPivotTargetActionability,
  isPivotClickHandlerActionable,
} from './jtd-formatters';
import {
  convertPivotToDataPoint,
  getJtdClickHandler,
  handleDataPointClick,
  handlePivotDataPointClick,
  handleTextWidgetClick,
} from './jtd-handlers';
import {
  getJumpToDashboardMenuItem,
  getJumpToDashboardMenuItemForMultiplePoints,
} from './jtd-menu';
import { JtdActions, JtdWidgetTransformConfig } from './jtd-types';

const jumpToDashboardMenuId = 'jump-to-dashboard-menu';

/**
 * JTD Jumpable Icon with tooltip
 * @internal
 */
const JtdJumpableIconWithTooltip = () => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('jumpToDashboard.jumpableTooltip')} placement="top" arrow>
      <div>
        <JtdJumpableIcon />
      </div>
    </Tooltip>
  );
};

/**
 * Add pointer cursor to chart widgets that support it
 *
 * @param widgetProps - The widget props
 * @returns Updated widget props with pointer cursor
 * @internal
 */
export const addPointerCursorToChart = (widgetProps: WidgetProps): WidgetProps => {
  if (!isChartWidgetProps(widgetProps)) {
    return widgetProps;
  }

  // Chart types that support cursor styling
  const supportedChartTypes = [
    'line',
    'area',
    'column',
    'bar',
    'pie',
    'funnel',
    'scatter',
    'bubble',
  ];
  if (!supportedChartTypes.includes(widgetProps.chartType)) {
    return widgetProps;
  }

  // Add cursor pointer through plotOptions (the correct way for Highcharts)
  const updatedProps = { ...widgetProps } as WidgetProps & {
    plotOptions?: {
      series?: {
        cursor?: string;
      };
    };
  };
  const existingPlotOptions = updatedProps.plotOptions || {};
  const existingSeries = existingPlotOptions.series || {};

  updatedProps.plotOptions = {
    ...existingPlotOptions,
    series: {
      ...existingSeries,
      cursor: 'pointer',
    },
  };

  return updatedProps as WidgetProps;
};

/**
 * Apply JTD click navigation for chart widgets
 *
 * @param widgetProps - The widget props
 * @param config - The JTD configuration and context
 * @param actions - The action functions
 * @returns Updated widget props with click navigation
 * @internal
 */
export const applyClickNavigationForChart = (
  widgetProps: WidgetProps,
  config: JtdWidgetTransformConfig,
  actions: Pick<JtdActions, 'openModal' | 'openMenu' | 'translate'>,
): WidgetProps => {
  if (!isChartWidgetProps(widgetProps)) {
    return widgetProps;
  }

  // Add pointer cursor for supported chart types
  const updatedProps = addPointerCursorToChart(widgetProps);

  const jtdClickHandler = (point: DataPoint, nativeEvent: PointerEvent) => {
    handleDataPointClick(
      {
        jtdConfig: config.jtdConfig,
        widgetProps,
        point,
      },
      {
        dashboardFilters: config.dashboardFilters,
        originalWidgetFilters: config.originalWidgetFilters,
        extraFilters: config.extraFilters,
      },
      actions,
      {
        nativeEvent,
        getJumpToDashboardMenuItem,
      },
    );
  };

  // Replace the original onDataPointClick handler instead of combining
  // When JTD click navigation is configured, we want ONLY JTD behavior, not the default chart filtering
  // The original onDataPointClick (if any) would typically apply filters, which conflicts with JTD
  return {
    ...updatedProps,
    onDataPointClick: jtdClickHandler,
  } as WidgetProps;
};

/**
 * Apply JTD click navigation for pivot table widgets
 *
 * @param widgetProps - The widget props
 * @param config - The JTD configuration and context
 * @param actions - The action functions
 * @returns Updated widget props with click navigation
 * @internal
 */
export const applyClickNavigationForPivot = (
  widgetProps: WidgetProps,
  config: JtdWidgetTransformConfig,
  actions: Pick<JtdActions, 'openModal' | 'openMenu' | 'translate'>,
): WidgetProps => {
  if (!isPivotTableWidgetProps(widgetProps)) {
    return widgetProps;
  }

  const pivotHandler: PivotTableDataPointEventHandler = (
    point: PivotTableDataPoint,
    nativeEvent: MouseEvent,
  ) => {
    const { isActionable, matchingTarget } = isPivotClickHandlerActionable(config.jtdConfig, point);

    if (!isActionable || !matchingTarget) {
      widgetProps.onDataPointClick?.(point, nativeEvent);
      return;
    }

    handlePivotDataPointClick(
      {
        jtdConfig: config.jtdConfig,
        widgetProps,
        point,
      },
      {
        dashboardFilters: config.dashboardFilters,
        originalWidgetFilters: config.originalWidgetFilters,
        extraFilters: config.extraFilters,
      },
      actions,
    );
  };

  return {
    ...widgetProps,
    onDataPointClick: pivotHandler,
  };
};

/**
 * Apply JTD click navigation for text widgets
 *
 * @param widgetProps - The widget props
 * @param config - The JTD configuration and context
 * @param actions - The action functions for modal operations
 * @returns Updated widget props with click navigation
 * @internal
 */
export const applyClickNavigationForText = (
  widgetProps: WidgetProps,
  config: JtdWidgetTransformConfig,
  actions: Pick<JtdActions, 'openModal'>,
): WidgetProps => {
  if (!isTextWidgetProps(widgetProps)) {
    return widgetProps;
  }

  const originalClickHandler = widgetProps.onDataPointClick;

  return {
    ...widgetProps,
    onDataPointClick: combineHandlers([
      originalClickHandler,
      () => {
        handleTextWidgetClick(
          config.jtdConfig,
          widgetProps,
          config.dashboardFilters,
          config.originalWidgetFilters,
          actions.openModal,
        );
      },
    ]),
  } as WidgetProps;
};

/**
 * Apply JTD right-click navigation for chart widgets
 *
 * @param widgetProps - The widget props
 * @param config - The JTD configuration and context
 * @param actions - The action functions
 * @returns Updated widget props with right-click navigation
 * @internal
 */
export const applyRightClickNavigation = (
  widgetProps: WidgetProps,
  config: JtdWidgetTransformConfig,
  actions: Pick<JtdActions, 'openModal' | 'openMenu' | 'translate'>,
): WidgetProps => {
  if (!isChartWidgetProps(widgetProps)) {
    return widgetProps;
  }

  const onDataPointContextMenu = (point: DataPoint, nativeEvent: PointerEvent) => {
    const menuItem = getJumpToDashboardMenuItem(
      {
        jtdConfig: config.jtdConfig,
        point,
        widgetProps,
      },
      {
        dashboardFilters: config.dashboardFilters,
        originalWidgetFilters: config.originalWidgetFilters,
        extraFilters: config.extraFilters,
      },
      actions,
    );
    if (menuItem) {
      actions.openMenu?.({
        id: jumpToDashboardMenuId,
        position: {
          left: nativeEvent.clientX,
          top: nativeEvent.clientY,
        },
        itemSections: [{ items: [menuItem] }],
      });
    }
  };

  const onDataPointsSelected = (points: DataPoint[], nativeEvent: MouseEvent) => {
    // Handle multi-point selection for right-click JTD navigation
    if (points.length === 0) return;

    // For single point, use the same logic as context menu
    if (points.length === 1) {
      onDataPointContextMenu(points[0], nativeEvent as PointerEvent);
      return;
    }

    // For multiple points, use the multi-point menu handler
    const menuItem = getJumpToDashboardMenuItemForMultiplePoints(
      {
        jtdConfig: config.jtdConfig,
        points,
        widgetProps,
      },
      {
        dashboardFilters: config.dashboardFilters,
        originalWidgetFilters: config.originalWidgetFilters,
        extraFilters: config.extraFilters,
      },
      actions,
    );

    if (menuItem) {
      actions.openMenu?.({
        id: jumpToDashboardMenuId,
        position: {
          left: nativeEvent.clientX,
          top: nativeEvent.clientY,
        },
        itemSections: [{ items: [menuItem] }],
      });
    }
  };

  const updatedProps = { ...widgetProps };
  registerDataPointContextMenuHandler(updatedProps, onDataPointContextMenu);
  registerDataPointsSelectedHandler(updatedProps, onDataPointsSelected);

  return updatedProps;
};

/**
 * Apply JTD right-click navigation for pivot table widgets
 *
 * @param widgetProps - The widget props
 * @param config - The JTD configuration and context
 * @param actions - The action functions
 * @returns Updated widget props with right-click navigation
 * @internal
 */
export const applyRightClickNavigationForPivot = (
  widgetProps: WidgetProps,
  config: JtdWidgetTransformConfig,
  actions: Pick<JtdActions, 'openModal' | 'openMenu' | 'translate'>,
): WidgetProps => {
  if (!isPivotTableWidgetProps(widgetProps)) {
    return widgetProps;
  }

  const jtdContextMenuHandler: PivotTableDataPointEventHandler = (
    point: PivotTableDataPoint,
    nativeEvent: MouseEvent,
  ) => {
    // Use pivot-specific logic to find actionable targets for this cell
    const { isActionable, matchingTargets } = getPivotTargetActionability(config.jtdConfig, point);

    if (!isActionable || matchingTargets.length === 0) {
      // No JTD menu - let any existing handler run
      return;
    }

    // Convert pivot data point to regular data point format for handlers
    const convertedPoint = convertPivotToDataPoint(point);

    // Use jumpToDashboardRightMenuCaption if provided, otherwise use translated default
    const menuCaption =
      config.jtdConfig.jumpToDashboardRightMenuCaption ||
      (actions.translate ? actions.translate('jumpToDashboard.defaultCaption') : 'Jump to');

    let menuItem;

    if (matchingTargets.length > 1) {
      // Multiple targets - create submenu with only matching targets
      menuItem = {
        caption: menuCaption,
        subItems: [
          {
            items: matchingTargets.map((jumpTarget) => ({
              caption: jumpTarget.caption,
              onClick: getJtdClickHandler(
                {
                  jtdConfig: config.jtdConfig,
                  point: convertedPoint,
                  widgetProps,
                  jumpTarget,
                },
                {
                  dashboardFilters: config.dashboardFilters,
                  originalWidgetFilters: config.originalWidgetFilters,
                  extraFilters: config.extraFilters,
                },
                {
                  openModal: actions.openModal,
                },
              ),
            })),
          },
        ],
      };
    } else {
      // Single target - create direct menu item
      const jumpTarget = matchingTargets[0];
      menuItem = {
        caption: `${menuCaption} ${jumpTarget.caption}`,
        onClick: getJtdClickHandler(
          {
            jtdConfig: config.jtdConfig,
            point: convertedPoint,
            widgetProps,
            jumpTarget,
          },
          {
            dashboardFilters: config.dashboardFilters,
            originalWidgetFilters: config.originalWidgetFilters,
            extraFilters: config.extraFilters,
          },
          {
            openModal: actions.openModal,
          },
        ),
      };
    }

    if (menuItem) {
      nativeEvent.preventDefault();
      nativeEvent.stopPropagation();

      actions.openMenu?.({
        id: jumpToDashboardMenuId,
        position: {
          left: nativeEvent.clientX,
          top: nativeEvent.clientY,
        },
        itemSections: [{ items: [menuItem] }],
      });
    }
  };

  return {
    ...widgetProps,
    onDataPointContextMenu: combineHandlers([
      widgetProps.onDataPointContextMenu,
      jtdContextMenuHandler,
    ]),
  };
};

/**
 * Applies hyperlink styling to pivot table cells for PIVOT_LINK navigation
 * @param widgetProps - Pivot table widget props
 * @param config - JTD configuration
 * @param hyperlinkColor
 * @returns Updated widget props with hyperlink styling
 * @internal
 */
export const applyPivotLinkStyling = (
  widgetProps: WidgetProps,
  config: JtdWidgetTransformConfig,
  hyperlinkColor = DEFAULT_HYPERLINK_COLOR,
): WidgetProps => {
  if (!isPivotTableWidgetProps(widgetProps)) {
    return widgetProps;
  }

  // Create the JTD hyperlink formatters for both data and header cells

  const jtdHyperlinkFormatter = createJtdHyperlinkDataCellFormatter(
    hyperlinkColor,
    config.jtdConfig,
  );
  const jtdHyperlinkHeaderFormatter = createJtdHyperlinkHeaderCellFormatter(
    hyperlinkColor,
    config.jtdConfig,
  );

  // Combine existing formatters with JTD formatters into single callbacks
  const combinedDataCellFormatter: CustomDataCellFormatter = (
    cell,
    jaqlPanelItem,
    dataOption,
    id,
  ) => {
    // First apply existing formatter if present
    const existingResult = widgetProps.onDataCellFormat?.(cell, jaqlPanelItem, dataOption, id);
    // Then apply JTD formatter
    const jtdResult = jtdHyperlinkFormatter(cell, jaqlPanelItem, dataOption, id);

    // Merge results, with JTD taking precedence for conflicting properties
    return {
      ...existingResult,
      ...jtdResult,
      // Merge styles if both exist
      style: {
        ...existingResult?.style,
        ...jtdResult?.style,
      },
    };
  };

  const combinedHeaderCellFormatter: CustomHeaderCellFormatter = (
    cell,
    jaqlPanelItem,
    dataOption,
    id,
  ) => {
    // First apply existing formatter if present
    const existingResult = widgetProps.onHeaderCellFormat?.(cell, jaqlPanelItem, dataOption, id);
    // Then apply JTD formatter
    const jtdResult = jtdHyperlinkHeaderFormatter(cell, jaqlPanelItem, dataOption, id);

    // Merge results, with JTD taking precedence for conflicting properties
    return {
      ...existingResult,
      ...jtdResult,
      // Merge styles if both exist
      style: {
        ...existingResult?.style,
        ...jtdResult?.style,
      },
    };
  };

  // Add the combined formatters to the widget props
  return {
    ...widgetProps,
    onDataCellFormat: combinedDataCellFormatter,
    onHeaderCellFormat: combinedHeaderCellFormatter,
  };
};

/**
 * Add JTD icon to widget header if configured
 *
 * @param widgetProps - The widget props
 * @returns Updated widget props with JTD icon in header
 * @internal
 */
export const addJtdIconToHeader = (widgetProps: WidgetProps): WidgetProps => {
  // Only add header to widgets that support header styleOptions (chart and pivot widgets)
  if (!isChartWidgetProps(widgetProps) && !isPivotTableWidgetProps(widgetProps)) {
    return widgetProps;
  }

  const prevHeader = widgetProps.styleOptions?.header || {};
  const jtdRenderTitle = (element: ReactNode): ReactNode => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <JtdJumpableIconWithTooltip />
      {/* same class names as the parent element to preserve title positioning */}
      <div className="csdk-w-full csdk-whitespace-nowrap csdk-overflow-hidden">{element}</div>
    </div>
  );

  return {
    ...widgetProps,
    styleOptions: {
      ...widgetProps.styleOptions,
      header: {
        ...prevHeader,
        renderTitle: jtdRenderTitle,
      },
    },
  };
};
