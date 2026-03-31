import type { MenuItemSection } from '@/types';

import type { MenuItem } from '../types/menu-item.js';

type SectionItem = NonNullable<MenuItemSection['items']>[number];

/**
 * Recursively converts a {@link MenuItem} into
 * the item within the `MenuItemSection` expected by the context-menu infrastructure.
 *
 * @param menuItem - The menu item to convert.
 * @returns The equivalent context-menu section item.
 */
export function convertMenuItemToLegacySectionItem(menuItem: MenuItem): SectionItem {
  return {
    key: menuItem.id,
    caption: menuItem.caption,
    onClick: menuItem.onClick,
    subItems: menuItem.items?.length
      ? [{ items: menuItem.items.map(convertMenuItemToLegacySectionItem) }]
      : undefined,
  };
}
