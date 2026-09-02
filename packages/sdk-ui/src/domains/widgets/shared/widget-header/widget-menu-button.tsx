import { type MouseEvent, useCallback } from 'react';

import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu';
import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context.js';
import { MenuButton } from '@/shared/components/menu/menu-button.js';
import type { MenuItem } from '@/shared/types/menu-item';
import { convertMenuItemToLegacySectionItem } from '@/shared/utils/menu-item-converters.js';

export interface WidgetMenuButtonProps {
  /** Resolved menu items to show when the button is clicked. */
  menuItems: MenuItem[];
  /** Size (px) of the button. Falls back to the {@link MenuButton} default. */
  size?: number;
}

/**
 * Renders the widget header's "⋮" menu button, opening the resolved menu items on click.
 */
export const WidgetMenuButton = ({ menuItems, size }: WidgetMenuButtonProps) => {
  const { themeSettings } = useThemeContext();
  const { openMenu } = useMenu();
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const menuButtonRect = event.currentTarget.getBoundingClientRect();

      if (!menuItems.length) return;
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
    [menuItems, openMenu],
  );
  return (
    <MenuButton
      onClick={handleClick}
      ariaLabel="widget header menu"
      color={themeSettings.widget.header.titleTextColor}
      size={size}
    />
  );
};
