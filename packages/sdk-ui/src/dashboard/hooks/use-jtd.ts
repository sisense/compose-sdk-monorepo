import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { type Filter } from '@sisense/sdk-data';

import { OpenMenuFn } from '@/common/components/menu/types.js';
import { useModal } from '@/common/hooks/use-modal';
import { normalizeToJtdConfig } from '@/dashboard/hooks/jtd/jtd-config-transformers';
import { type JtdActions, type JtdWidgetTransformConfig } from '@/dashboard/hooks/jtd/jtd-types';
import { JtdConfig } from '@/dashboard/hooks/jtd/jtd-types';
// Import JTD-specific functions and types
import {
  addJtdIconToHeader,
  applyClickNavigationForChart,
  applyClickNavigationForPivot,
  applyClickNavigationForText,
  applyPivotLinkStyling,
  applyRightClickNavigation,
  applyRightClickNavigationForPivot,
} from '@/dashboard/hooks/jtd/jtd-widget-transforms';
import { WidgetsOptions } from '@/models/dashboard/types';
import { WidgetProps } from '@/props.js';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { useThemeContext } from '@/theme-provider';
import { CompleteThemeSettings } from '@/types';
import {
  isChartWidgetProps,
  isPivotTableWidgetProps,
  isTextWidgetProps,
} from '@/widget-by-id/utils';

/**
 * Shared function to apply JTD functionality to a widget.
 * Extracted to avoid code duplication between use-jtd.ts and use-jtd-widget.ts
 *
 * @param widgetProps - The widget props to enhance
 * @param config - JTD application configuration
 * @returns Enhanced widget props with JTD functionality
 * @internal
 */
export const applyJtdToWidget = (
  widgetProps: WidgetProps,
  config: {
    normalizedJtdConfig: JtdConfig;
    dashboardFilters: Filter[];
    originalWidgetFilters: Filter[];
    extraFilters?: Filter[];
    actions: JtdActions;
    themeSettings: CompleteThemeSettings;
  },
): WidgetProps => {
  const {
    normalizedJtdConfig,
    dashboardFilters,
    originalWidgetFilters,
    extraFilters,
    actions,
    themeSettings,
  } = config;

  if (!normalizedJtdConfig.enabled || !normalizedJtdConfig.jumpTargets?.length) {
    return widgetProps;
  }

  let updatedProps = widgetProps;

  // Create config object for JTD transforms
  const jtdTransformConfig: JtdWidgetTransformConfig = {
    jtdConfig: normalizedJtdConfig,
    dashboardFilters,
    originalWidgetFilters,
    extraFilters,
  };

  // Apply navigation handlers based on configuration
  if (normalizedJtdConfig.navigateType === 'click' && !isPivotTableWidgetProps(updatedProps)) {
    if (isChartWidgetProps(updatedProps)) {
      updatedProps = applyClickNavigationForChart(updatedProps, jtdTransformConfig, actions);
    } else if (isTextWidgetProps(updatedProps)) {
      updatedProps = applyClickNavigationForText(updatedProps, jtdTransformConfig, actions);
    }
  } else if (normalizedJtdConfig.navigateType === 'rightclick') {
    if (isChartWidgetProps(updatedProps)) {
      updatedProps = applyRightClickNavigation(updatedProps, jtdTransformConfig, actions);
    } else if (isPivotTableWidgetProps(updatedProps)) {
      updatedProps = applyRightClickNavigationForPivot(updatedProps, jtdTransformConfig, actions);
    }
  } else if (
    normalizedJtdConfig.navigateType === 'click' &&
    isPivotTableWidgetProps(updatedProps)
  ) {
    updatedProps = applyClickNavigationForPivot(updatedProps, jtdTransformConfig, actions);

    const { hyperlinkColor } = themeSettings.typography;
    updatedProps = applyPivotLinkStyling(updatedProps, jtdTransformConfig, hyperlinkColor);
  }

  // Add JTD icon if configured
  if (normalizedJtdConfig.showJtdIcon && updatedProps.widgetType !== 'text') {
    updatedProps = addJtdIconToHeader(updatedProps);
  }

  return updatedProps;
};

/**
 * Internal Jump To Dashboard (JTD) hook.
 * Implements the JTD functionality for each widget with JTD config.
 * Supports both legacy JtdConfig and new JumpToDashboardConfig formats.
 *
 * @param config - The configuration object
 * @param config.widgetOptions - The widget options of the dashboard
 * @param config.dashboardFilters - The dashboard filters to use
 * @param config.widgetFilters - The widget filters to use
 * @param config.extraFilters - Extra filters to apply with highest priority
 * @param config.openMenu - The open menu function to use
 * @returns The connect to widget props function
 * @internal
 */
export const useJtdInternal = ({
  widgetOptions,
  dashboardFilters = [],
  widgetFilters = new Map<string, Filter[]>(),
  openMenu,
  extraFilters,
}: {
  widgetOptions: WidgetsOptions;
  dashboardFilters?: Filter[];
  widgetFilters?: Map<string, Filter[]>;
  extraFilters?: Filter[];
  openMenu: OpenMenuFn;
}) => {
  const { openModal } = useModal();
  const translate = useTranslation().t;
  const { app } = useSisenseContext();
  const { themeSettings } = useThemeContext();

  const connectToWidgetProps = useCallback(
    (widgetProps: WidgetProps) => {
      if (!app?.settings.jumpToDashboardConfig?.enabled) {
        return widgetProps;
      }

      const jtdConfig = widgetOptions[widgetProps.id]?.jtdConfig;
      if (!jtdConfig) {
        return widgetProps;
      }

      // Normalize config to legacy JtdConfig format for internal use
      const normalizedJtdConfig = normalizeToJtdConfig(jtdConfig, widgetProps);

      // Get original widget filters
      const originalWidgetFilters = widgetFilters.get(widgetProps.id) || [];

      // Create action objects
      const actions: JtdActions = {
        openModal,
        openMenu,
        translate,
      };

      return applyJtdToWidget(widgetProps, {
        normalizedJtdConfig,
        dashboardFilters,
        originalWidgetFilters,
        extraFilters: extraFilters || normalizedJtdConfig.extraFilters,
        actions,
        themeSettings,
      });
    },
    [
      extraFilters,
      widgetOptions,
      openMenu,
      openModal,
      dashboardFilters,
      widgetFilters,
      translate,
      themeSettings,
      app?.settings.jumpToDashboardConfig?.enabled,
    ],
  );

  return {
    connectToWidgetProps,
  };
};

// Re-export JTD functions for backward compatibility and testing
export * from './jtd';

// Re-export the standalone widget hook
export { useJtdWidget } from './use-jtd-widget';
