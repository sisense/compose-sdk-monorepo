import { useCallback } from 'react';

import { MenuButton } from '@/common/components/menu/menu-button';
import { useMenu } from '@/common/hooks/use-menu';
import { MenuItemSection } from '@/index';
import { useThemeContext } from '@/theme-provider';

/**
 * @internal
 */
export interface DashboardHeaderToolbarMenuItem {
  title: string;
  icon?: JSX.Element;
  ariaLabel?: string;
  onClick: () => void;
}

/**
 * @internal
 */
export interface UseDashboardHeaderToolbarProps {
  menuItemSections: MenuItemSection[];
  toolbarComponents?: JSX.Element[];
}

/**
 * Hook that returns a toolbar element for dashboard header
 * @internal
 */
export const useDashboardHeaderToolbar = ({
  menuItemSections = [],
  toolbarComponents = [],
}: UseDashboardHeaderToolbarProps) => {
  const { themeSettings } = useThemeContext();
  const { openMenu } = useMenu();

  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!menuItemSections.length) return;
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      openMenu({
        position: {
          left: rect.left + rect.width / 2,
          top: rect.bottom,
        },
        itemSections: menuItemSections,
        alignment: { horizontal: 'right' },
      });
    },
    [menuItemSections, openMenu],
  );

  const toolbar = useCallback(
    () => (
      <>
        {toolbarComponents.map((component, index) => (
          <div key={`csdk-toolbar-component-${index}`}>{component}</div>
        ))}
        {menuItemSections.length > 0 && (
          <MenuButton
            onClick={handleMenuOpen}
            aria-label="dashboard toolbar menu"
            data-testid="dashboard-toolbar-menu"
            color={themeSettings.dashboard.toolbar.primaryTextColor}
          />
        )}
      </>
    ),
    [
      handleMenuOpen,
      themeSettings.dashboard.toolbar.primaryTextColor,
      menuItemSections.length,
      toolbarComponents,
    ],
  );

  return { toolbar };
};

export default useDashboardHeaderToolbar;
