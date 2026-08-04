/**
 * Fields shared by every menu item, whichever kind it is.
 */
interface MenuItemBase {
  /**
   * Unique identifier for the menu item
   */
  id: string;
  /**
   * Caption of the menu item
   */
  caption: string;
}

/**
 * A menu item that invokes a handler when clicked.
 */
export interface MenuActionItem extends MenuItemBase {
  type: 'action';
  /**
   * Handler function to be called when the menu item is clicked
   */
  onClick: () => void;
}

/**
 * A menu item that opens a nested submenu when clicked.
 */
export interface MenuSubmenuItem extends MenuItemBase {
  type: 'submenu';
  /**
   * Items of the nested submenu
   */
  items: MenuItem[];
}

/**
 * Menu item, discriminated by `type`.
 *
 * The renderer resolves each kind differently, so the kind is stated explicitly rather than inferred
 * from which fields happen to be present. New kinds (a named group, a boolean toggle, a divider) join
 * this union without touching the existing ones — see
 * `domains/shared/header/__dev_docs__/header-menu-architecture.md`.
 */
export type MenuItem = MenuActionItem | MenuSubmenuItem;

/**
 * Narrows a {@link MenuItem} to a {@link MenuSubmenuItem}.
 *
 * @param item - The menu item to test.
 * @returns `true` when the item opens a submenu.
 */
export const isMenuSubmenuItem = (item: MenuItem): item is MenuSubmenuItem =>
  item.type === 'submenu';
