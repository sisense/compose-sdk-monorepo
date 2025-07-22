import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import { WidgetProps } from '@/props.js';
import { DataPoint } from '@/types';
import { combineHandlers } from '@/utils/combine-handlers.js';
import {
  isChartWidgetProps,
  isTextWidgetProps,
  registerDataPointContextMenuHandler,
} from '@/widget-by-id/utils';
import { JtdJumpableIcon } from '@/common/icons/jtd-jumpable-icon';
import { handleDataPointClick, handleTextWidgetClick } from './jtd-handlers';
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

  return {
    ...updatedProps,
    onDataPointClick: (point: DataPoint, nativeEvent: PointerEvent) => {
      handleDataPointClick(
        {
          jtdConfig: config.jtdConfig,
          widgetProps,
          point,
        },
        {
          dashboardFilters: config.dashboardFilters,
          originalWidgetFilters: config.originalWidgetFilters,
        },
        actions,
        {
          nativeEvent,
          getJumpToDashboardMenuItem,
        },
      );
    },
  } as WidgetProps;
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
    const menuItem = getJumpToDashboardMenuItemForMultiplePoints(
      {
        jtdConfig: config.jtdConfig,
        points,
        widgetProps,
      },
      {
        dashboardFilters: config.dashboardFilters,
        originalWidgetFilters: config.originalWidgetFilters,
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

  registerDataPointContextMenuHandler(widgetProps, onDataPointContextMenu);

  const originalPointsSelectedHandler = widgetProps.onDataPointsSelected;
  return {
    ...widgetProps,
    onDataPointsSelected: combineHandlers([originalPointsSelectedHandler, onDataPointsSelected]),
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
  // Only add header to chart widgets (text widgets don't have header styleOptions)
  if (!isChartWidgetProps(widgetProps)) {
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
