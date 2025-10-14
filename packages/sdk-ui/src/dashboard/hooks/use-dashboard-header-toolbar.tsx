import { useCallback } from 'react';

import { MenuButton } from '@/common/components/menu/menu-button';
import { useMenu } from '@/common/hooks/use-menu';
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
  menuItems: DashboardHeaderToolbarMenuItem[];
  toolbarComponents?: JSX.Element[];
}

/**
 * Hook that returns a toolbar element for dashboard header
 * @internal
 */
export const useDashboardHeaderToolbar = ({
  menuItems,
  toolbarComponents = [],
}: UseDashboardHeaderToolbarProps) => {
  const { themeSettings } = useThemeContext();
  const { openMenu, closeMenu } = useMenu();

  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!menuItems.length) return;
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      openMenu({
        position: {
          left: rect.left + rect.width / 2,
          top: rect.bottom,
        },
        itemSections: [
          {
            items: menuItems.map((item) => ({
              caption: item.title,
              icon: item.icon,
              class: '',
              ariaLabel: item.ariaLabel,
              onClick: () => {
                item.onClick();
                closeMenu();
              },
            })),
          },
        ],
        alignment: { horizontal: 'right' },
      });
    },
    [menuItems, openMenu, closeMenu],
  );

  const toolbar = useCallback(
    () => (
      <>
        {toolbarComponents.map((component, index) => (
          <div key={`csdk-toolbar-component-${index}`}>{component}</div>
        ))}
        {menuItems.length > 0 && (
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
      menuItems.length,
      toolbarComponents,
    ],
  );

  return { toolbar };
};

export default useDashboardHeaderToolbar;
