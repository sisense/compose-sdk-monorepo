import { useCallback } from 'react';

import { useWidgetPluginRegistry } from '@/infra/plugins/use-widget-plugin-registry';
import type { CustomVisualization } from '@/infra/plugins/widget-plugins/types';

import { CustomWidgetComponent, CustomWidgetComponentProps } from './types';

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
export const useCustomWidgets = (): UseCustomWidgetsResult => {
  const widgetRegistry = useWidgetPluginRegistry();

  const registerCustomWidget = useCallback(
    <T = unknown>(customWidgetType: string, customWidget: CustomWidgetComponent<T>) => {
      widgetRegistry.register(customWidgetType, customWidget as CustomVisualization, 'legacy');
    },
    [widgetRegistry],
  );

  const hasCustomWidget = useCallback(
    (customWidgetType: string) => widgetRegistry.has(customWidgetType, 'legacy'),
    [widgetRegistry],
  );

  const getCustomWidget = useCallback(
    (customWidgetType: string) =>
      widgetRegistry.getComponent(customWidgetType, 'legacy') as CustomWidgetComponent | undefined,
    [widgetRegistry],
  );

  return {
    registerCustomWidget,
    hasCustomWidget,
    getCustomWidget,
  };
};

/**
 * Result of the `useCustomWidgets` hook.
 */
export type UseCustomWidgetsResult = {
  /** Registers a custom widget. */
  registerCustomWidget: <T = CustomWidgetComponentProps>(
    customWidgetType: string,
    customWidget: CustomWidgetComponent<T>,
  ) => void;
  /** Checks if a custom widget is registered. */
  hasCustomWidget: (customWidgetType: string) => boolean;
  /** Gets a custom widget. */
  getCustomWidget: (customWidgetType: string) => CustomWidgetComponent | undefined;
};
