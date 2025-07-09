import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { type Filter } from '@sisense/sdk-data';
import { WidgetProps } from '@/props.js';
import { OpenMenuFn } from '@/common/components/menu/types.js';
import { WidgetsOptions } from '@/index-typedoc';
import { JtdNavigateType } from '@/widget-by-id/types';
import { useModal } from '@/common/hooks/use-modal';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { isChartWidgetProps, isTextWidgetProps } from '@/widget-by-id/utils';

// Import JTD-specific functions and types
import {
  applyClickNavigationForChart,
  applyClickNavigationForText,
  applyRightClickNavigation,
  addJtdIconToHeader,
  type JtdWidgetTransformConfig,
  type JtdActions,
} from '@/dashboard/hooks/jtd';

/**
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
  dashboardFilters = [],
  widgetFilters = new Map<string, Filter[]>(),
  openMenu,
}: {
  widgetOptions: WidgetsOptions;
  dashboardFilters?: Filter[];
  widgetFilters?: Map<string, Filter[]>;
  openMenu: OpenMenuFn;
}) => {
  const { openModal } = useModal();
  const translate = useTranslation().t;
  const { app } = useSisenseContext();

  const connectToWidgetProps = useCallback(
    (widgetProps: WidgetProps) => {
      if (!app?.settings.jumpToDashboardConfig?.enabled) {
        return widgetProps;
      }

      const jtdConfig = widgetOptions[widgetProps.id]?.jtdConfig;
      if (!jtdConfig || !jtdConfig.enabled || !jtdConfig.drillTargets.length) {
        return widgetProps;
      }

      // Get original widget filters
      const originalWidgetFilters = widgetFilters.get(widgetProps.id) || [];
      let updatedProps = widgetProps;

      // Create config object once to avoid repetition
      const config: JtdWidgetTransformConfig = {
        jtdConfig,
        dashboardFilters,
        originalWidgetFilters,
      };

      // Create action objects
      const actions: JtdActions = {
        openModal,
        openMenu,
        translate,
      };

      // Apply navigation handlers based on configuration
      if (jtdConfig.navigateType === JtdNavigateType.CLICK) {
        if (isChartWidgetProps(updatedProps)) {
          updatedProps = applyClickNavigationForChart(updatedProps, config, actions);
        } else if (isTextWidgetProps(updatedProps)) {
          updatedProps = applyClickNavigationForText(updatedProps, config, actions);
        }
      } else if (
        jtdConfig.navigateType === JtdNavigateType.RIGHT_CLICK &&
        isChartWidgetProps(updatedProps)
      ) {
        updatedProps = applyRightClickNavigation(updatedProps, config, actions);
      }

      // Add JTD icon if configured
      if (jtdConfig.showJtdIcon && updatedProps.widgetType !== 'text') {
        updatedProps = addJtdIconToHeader(updatedProps);
      }

      return updatedProps;
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

// Re-export JTD functions for backward compatibility and testing
export * from './jtd';
