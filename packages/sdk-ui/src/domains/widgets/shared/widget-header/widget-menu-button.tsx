import { type MouseEvent, useCallback } from 'react';

import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu';
import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context.js';
import { MenuButton } from '@/shared/components/menu/menu-button.js';

import { MenuItem } from './types';

export interface WidgetMenuButtonProps {
  menuItems: MenuItem[];
}

export const WidgetMenuButton = ({ menuItems }: WidgetMenuButtonProps) => {
  const { themeSettings } = useThemeContext();
  const { openMenu } = useMenu();
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      if (!menuItems.length) return;
      openMenu({
        position: {
          left: event.clientX,
          top: event.clientY,
        },
        alignment: {
          horizontal: 'right',
        },
        itemSections: [
          {
            items: menuItems,
          },
        ],
      });
    },
    [menuItems, openMenu],
  );
  return (
    <MenuButton
      onClick={handleClick}
      ariaLabel="widget header toolbar menu"
      color={themeSettings.widget.header.titleTextColor}
    />
  );
};
