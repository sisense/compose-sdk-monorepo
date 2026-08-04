import type { MenuItemSection } from '@/types';

import { isMenuSubmenuItem, type MenuItem } from '../types/menu-item.js';

type SectionItem = NonNullable<MenuItemSection['items']>[number];

/**
 * Recursively converts a {@link MenuItem} into
 * the item within the `MenuItemSection` expected by the context-menu infrastructure.
 *
 * @param menuItem - The menu item to convert.
 * @returns The equivalent context-menu section item.
 */
export function convertMenuItemToLegacySectionItem(menuItem: MenuItem): SectionItem {
  const { id: key, caption } = menuItem;

  return isMenuSubmenuItem(menuItem)
    ? {
        key,
        caption,
        subItems: [{ items: menuItem.items.map(convertMenuItemToLegacySectionItem) }],
      }
    : { key, caption, onClick: menuItem.onClick };
}
