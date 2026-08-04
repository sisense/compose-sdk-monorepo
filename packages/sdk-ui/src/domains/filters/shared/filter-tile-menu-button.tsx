import { type MouseEvent, useCallback } from 'react';

import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu';
import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context.js';
import { MenuButton } from '@/shared/components/menu/menu-button.js';
import type { MenuItem } from '@/shared/types/menu-item.js';
import { convertMenuItemToLegacySectionItem } from '@/shared/utils/menu-item-converters.js';

export interface FilterTileMenuButtonProps {
  /** Menu items to show. Prepared by the filter tile. */
  menuItems: MenuItem[];
  /** Disables the button (not focusable / not activatable). */
  disabled?: boolean;
}

/**
 * Renders a menu button that opens a context menu with the externally provided items.
 * Used by filter tiles; the menu items are built and merged with config in each tile.
 *
 * @param props - Menu button props: `menuItems` to show and whether the button is `disabled`
 * @returns The menu button element
 */
export const FilterTileMenuButton = ({ menuItems, disabled }: FilterTileMenuButtonProps) => {
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
            items: menuItems.map(convertMenuItemToLegacySectionItem),
          },
        ],
      });
    },
    [openMenu, menuItems],
  );

  return (
    <MenuButton
      onClick={handleClick}
      disabled={disabled}
      ariaLabel={'Filter tile menu'}
      color={themeSettings.typography.primaryTextColor}
      size={24}
    />
  );
};
