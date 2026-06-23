import { useCallback, useMemo } from 'react';

import { DashboardHeaderTargets } from '@/domains/dashboarding/components/dashboard-header-targets';
import { HeaderItem } from '@/domains/shared/header';
import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { MenuItemSection } from '@/props';
import { MenuButton } from '@/shared/components/menu/menu-button';

/**
 * Builds the built-in dashboard header menu item from the given menu sections.
 *
 * Always returns the item so it can anchor `before`/`after` positioning; it is marked `hidden`
 * (anchor-only, not rendered) when there are no menu sections.
 */
export const useDashboardHeaderMenuItem = (
  menuItemSections: MenuItemSection[] = [],
): HeaderItem => {
  const { themeSettings } = useThemeContext();
  const { openMenu } = useMenu();

  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!menuItemSections.length) return;
      const rect = event.currentTarget.getBoundingClientRect();
      openMenu({
        position: {
          left: rect.right,
          top: rect.bottom,
        },
        itemSections: menuItemSections,
        alignment: { horizontal: 'right' },
      });
    },
    [menuItemSections, openMenu],
  );

  return useMemo<HeaderItem>(
    () => ({
      id: DashboardHeaderTargets.Menu,
      fill: 'content',
      hidden: menuItemSections.length === 0,
      component: () => (
        <MenuButton
          onClick={handleMenuOpen}
          aria-label="dashboard toolbar menu"
          data-testid="dashboard-toolbar-menu"
          color={themeSettings.dashboard.toolbar.primaryTextColor}
        />
      ),
    }),
    [menuItemSections.length, handleMenuOpen, themeSettings.dashboard.toolbar.primaryTextColor],
  );
};
