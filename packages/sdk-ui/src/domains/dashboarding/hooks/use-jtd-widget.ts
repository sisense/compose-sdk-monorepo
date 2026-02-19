import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { useCombinedMenu } from '@/infra/contexts/menu-provider/hooks/use-combined-menu';
import { MenuIds } from '@/infra/contexts/menu-provider/menu-ids';
import { MenuOptions } from '@/infra/contexts/menu-provider/types';
import { useModal } from '@/infra/contexts/modal-provider/use-modal';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { withTracking } from '@/infra/decorators/hook-decorators';
import { combineHandlers } from '@/shared/utils/combine-handlers';

import { normalizeToJtdConfig } from './jtd/jtd-config-transformers.js';
import { JumpToDashboardConfig } from './jtd/jtd-types.js';
// Import the shared JTD application logic
import { applyJtdToWidget, JumpToDashboardConfigForPivot } from './use-jtd.js';

function isDrilldownMenu(options: MenuOptions): boolean {
  return options.id === MenuIds.WIDGET_POINTS_DRILLDOWN;
}

function isJumpToDashboardMenu(options: MenuOptions): boolean {
  return options.id === 'jump-to-dashboard-menu';
}

function combineWidgetMenus(menusOptions: MenuOptions[]): MenuOptions {
  if (menusOptions.length === 1) {
    return menusOptions[0];
  }

  const drilldownMenuOptions = menusOptions.find((menuOptions) => isDrilldownMenu(menuOptions));
  const jumpToDashboardMenuOptions = menusOptions.find((menuOptions) =>
    isJumpToDashboardMenu(menuOptions),
  );

  // Start with the drilldown menu as base (if it exists)
  const baseMenu = drilldownMenuOptions || menusOptions[0];
  const combinedMenuOptions: MenuOptions = {
    position: baseMenu.position,
    onClose: combineHandlers(menusOptions.map(({ onClose }) => onClose)),
    itemSections: [...baseMenu.itemSections],
  };

  // Add JTD menu items if they exist
  if (jumpToDashboardMenuOptions) {
    combinedMenuOptions.itemSections.push(...jumpToDashboardMenuOptions.itemSections);
  }

  return combinedMenuOptions;
}

/**
 * Hook to add Jump To Dashboard (JTD) functionality to individual Widget components.
 *
 * Jump To Dashboard (JTD) allows users to navigate from one dashboard to another when interacting with widgets,
 * such as clicking on chart data points or using context menus. This hook is particularly useful when rendering
 * Widget components directly (not through a Dashboard component), but you still want JTD navigation functionality.
 *
 * For widgets that are part of a dashboard, consider using `applyJtdConfig` or `applyJtdConfigs` instead,
 * as they apply JTD configuration at the dashboard level rather than individual widget level.
 *
 * Note: dashboard-only 'includeDashboardFilters' is not supported and would just be ignored, since we do not have a dashboard in the current context.
 *
 * This hook enhances the provided widget props with JTD navigation capabilities, including:
 * - Click and right-click event handlers for navigation
 * - Hyperlink styling for actionable pivot cells (when applicable)
 * - JTD icon display in widget headers
 *
 * @example
 * Basic JTD configuration with right-click navigation.
 * ```typescript
 * import { useJtdWidget } from '@sisense/sdk-ui';
 *
 * const jtdConfig: JumpToDashboardConfig = {
 *   targets: [{ id: 'dashboard-1', caption: 'Sales Dashboard' }],
 *   interaction: {
 *     triggerMethod: 'rightclick',
 *     captionPrefix: 'Jump to'
 *   }
 * };
 *
 * const MyComponent = () => {
 *   const widgetWithJtd = useJtdWidget(myWidgetProps, jtdConfig);
 *
 *   return <Widget {...widgetWithJtd} />;
 * };
 * ```
 *
 * @example
 * JTD configuration with multiple targets and custom styling.
 * ```typescript
 * const jtdConfig: JumpToDashboardConfig = {
 *   enabled: true,
 *   targets: [
 *     { id: 'sales-dashboard', caption: 'Sales Analysis' },
 *     { id: 'marketing-dashboard', caption: 'Marketing Insights' }
 *   ],
 *   interaction: {
 *     triggerMethod: 'click',
 *     captionPrefix: 'Navigate to',
 *     showIcon: true
 *   },
 *   filtering: {
 *     mergeWithTargetFilters: true,
 *     includeWidgetFilters: true
 *   }
 * };
 *
 * const widgetWithJtd = useJtdWidget(chartProps, jtdConfig);
 * ```
 *
 * @returns Enhanced widget props with JTD navigation capabilities, menu combination, and styling applied
 *
 * @group Dashboards
 */
export const useJtdWidget = withTracking('useJtdWidget')(
  (
    widgetProps: WidgetProps | null,
    config: JumpToDashboardConfig | JumpToDashboardConfigForPivot,
  ): WidgetProps | null => {
    const { openModal } = useModal();
    const { openMenu } = useCombinedMenu({ combineMenus: combineWidgetMenus });
    const translate = useTranslation().t;
    const { app } = useSisenseContext();
    const { themeSettings } = useThemeContext();

    const onBeforeInnerWidgetMenuOpen = useCallback(
      (menuOptions: MenuOptions) => {
        if (isDrilldownMenu(menuOptions)) {
          openMenu(menuOptions);
          return null;
        }
        return menuOptions;
      },
      [openMenu],
    );

    return useMemo(() => {
      // Check if JTD is globally enabled
      if (!app?.settings.jumpToDashboardConfig?.enabled || !widgetProps) {
        return widgetProps || null;
      }

      // Normalize config to legacy JtdConfig format for internal use
      const normalizedJtdConfig = normalizeToJtdConfig(config, widgetProps);

      // Apply JTD transformations to the widget
      const enhancedWidgetProps = applyJtdToWidget(widgetProps, {
        normalizedJtdConfig,
        dashboardFilters: [],
        originalWidgetFilters: [],
        extraFilters: config.filtering?.extraFilters || normalizedJtdConfig.extraFilters,
        actions: { openModal, openMenu, translate },
        hyperlinkColor: themeSettings.typography?.hyperlinkColor,
      });

      // Add the menu interceptor for drilldown menu combination
      if (enhancedWidgetProps.onBeforeMenuOpen) {
        const originalBeforeMenuOpen = enhancedWidgetProps.onBeforeMenuOpen;
        enhancedWidgetProps.onBeforeMenuOpen = (menuOptions: MenuOptions) => {
          const result = onBeforeInnerWidgetMenuOpen(menuOptions);
          if (result === null) return null;
          return originalBeforeMenuOpen ? originalBeforeMenuOpen(result) : result;
        };
      } else {
        enhancedWidgetProps.onBeforeMenuOpen = onBeforeInnerWidgetMenuOpen;
      }

      return enhancedWidgetProps;
    }, [
      widgetProps,
      config,
      openModal,
      openMenu,
      translate,
      themeSettings.typography?.hyperlinkColor,
      onBeforeInnerWidgetMenuOpen,
      app?.settings.jumpToDashboardConfig?.enabled,
    ]);
  },
);
