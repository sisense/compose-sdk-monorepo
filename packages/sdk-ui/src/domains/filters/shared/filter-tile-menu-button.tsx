import { type MouseEvent, useCallback } from 'react';

import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu';
import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context.js';
import { MenuButton } from '@/shared/components/menu/menu-button.js';
import type { MenuItem } from '@/shared/types/menu-item.js';

export interface FilterTileMenuButtonProps {
  /** Menu items to show. Prepared by the filter tile. */
  menuItems: MenuItem[];
}

/**
 * Menu button that opens a context menu with externally provided items.
 * Used by filter tiles; menu items are built and merged with config in each tile.
 */
export const FilterTileMenuButton = ({ menuItems }: FilterTileMenuButtonProps) => {
  const { themeSettings } = useThemeContext();
  const { openMenu } = useMenu();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const menuButtonRect = event.currentTarget.getBoundingClientRect();

      openMenu({
        position: {
          left: menuButtonRect.right,
          top: menuButtonRect.bottom,
        },
        alignment: {
          horizontal: 'right',
        },
        itemSections: [
          {
            items: menuItems.map((item) => ({
              key: item.id,
              caption: item.caption,
              onClick: item.onClick,
            })),
          },
        ],
      });
    },
    [openMenu, menuItems],
  );

  return (
    <MenuButton
      onClick={handleClick}
      ariaLabel={'Filter tile menu'}
      color={themeSettings.typography.primaryTextColor}
      size={24}
    />
  );
};
