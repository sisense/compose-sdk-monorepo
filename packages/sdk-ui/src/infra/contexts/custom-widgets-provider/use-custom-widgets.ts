import { useCallback, useContext } from 'react';

import { CustomWidgetsContext } from './custom-widgets-context';
import { CustomWidgetComponent } from './types';

/**
 * Hook that provides API for configuring custom widgets.
 *
 * @example
 * Example of registering a custom widget in a dashboard:
 * ```tsx
 * import { useCustomWidgets, DashboardById } from '@sisense/sdk-ui';
 * import CustomHistogramWidget from './custom-histogram-widget';
 *
 * const Example = () => {
 *   const { registerCustomWidget } = useCustomWidgets();
 *   registerCustomWidget('histogramwidget', CustomHistogramWidget);
 *
 *   return <DashboardById dashboardOid="your-dashboard-oid" />;
 * }
 * ```
 *
 * @group Dashboards
 */
export const useCustomWidgets = () => {
  const customWidgets = useContext(CustomWidgetsContext);

  if (!customWidgets) {
    throw new Error('useCustomWidgets must be used within a CustomWidgetsProvider');
  }

  /**
   * Registers a custom widget.
   *
   * @param customWidgetType - The type of the custom widget.
   * @param customWidget - The custom widget component.
   */
  const registerCustomWidget = useCallback(
    <T = any>(customWidgetType: string, customWidget: CustomWidgetComponent<T>) => {
      if (!customWidgets.has(customWidgetType)) {
        customWidgets.set(customWidgetType, customWidget);
      }
    },
    [customWidgets],
  );

  /**
   * Checks if a custom widget is registered.
   *
   * @param customWidgetType - The type of the custom widget.
   * @returns True if the custom widget is registered, false otherwise.
   */
  const hasCustomWidget = useCallback(
    (customWidgetType: string) => {
      return customWidgets.has(customWidgetType);
    },
    [customWidgets],
  );

  /**
   * Retrieves a custom widget.
   *
   * @param customWidgetType - The type of the custom widget.
   * @returns The custom widget component.
   *
   * @internal
   */
  const getCustomWidget = useCallback(
    (customWidgetType: string) => {
      return customWidgets.get(customWidgetType);
    },
    [customWidgets],
  );

  /**
   * Unregister a custom widget, from the context.
   *
   * @param customWidgetType - The type of the custom widget.
   */
  const unregisterCustomWidget = useCallback((customWidgetType: string) => {
      if (customWidgets.has(customWidgetType)) {
        customWidgets.delete(customWidgetType);
      }
    },
    [customWidgets],
  );

  return {
    registerCustomWidget,
    unregisterCustomWidget,
    hasCustomWidget,
    getCustomWidget,
  };
};
