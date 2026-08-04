import { isMenuSubmenuItem, type MenuActionItem, type MenuItem } from '@/shared/types/menu-item.js';

/**
 * Walks a path of item ids through a menu tree, descending into submenus.
 *
 * @param items - The menu items to search.
 * @param ids - Ids to follow, outermost first (e.g. `Download`, `DownloadCsv`).
 * @returns The item at the end of the path, or `undefined` if any hop is missing.
 */
export function findMenuItemByPath(
  items: readonly MenuItem[] | undefined,
  ...ids: string[]
): MenuItem | undefined {
  const [head, ...rest] = ids;
  const match = items?.find((item) => item.id === head);

  if (!match || !rest.length) return match;
  return isMenuSubmenuItem(match) ? findMenuItemByPath(match.items, ...rest) : undefined;
}

/**
 * Same as {@link findMenuItemByPath}, narrowed to an action item so its `onClick` is accessible.
 *
 * @param items - The menu items to search.
 * @param ids - Ids to follow, outermost first.
 * @returns The action at the end of the path, or `undefined` when missing or not an action.
 */
export function findMenuActionByPath(
  items: readonly MenuItem[] | undefined,
  ...ids: string[]
): MenuActionItem | undefined {
  const match = findMenuItemByPath(items, ...ids);
  return match && !isMenuSubmenuItem(match) ? match : undefined;
}
