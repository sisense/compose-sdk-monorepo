import { isMenuSubmenuItem, MenuItem } from '@/shared/types/menu-item';

/**
 * Internal header-menu configuration consumed by the resolver. Components expose their own public
 * config type (e.g. `WidgetHeaderMenuConfig`) that is structurally assignable to this.
 */
export interface HeaderMenuConfig {
  /** Whether the menu is enabled. Defaults to `true`. */
  enabled?: boolean;
  /** Items to show in the menu. */
  items?: MenuItem[];
}

/**
 * Drops submenus that have nothing left to show, recursively.
 *
 * The `type` discriminant states each item's kind, but it cannot express "a submenu is non-empty"
 * without making the item list a non-empty tuple, which would break `Array.filter` ergonomics for
 * callers. So emptiness is pruned here instead — otherwise an empty submenu renders as an arrow that
 * opens onto nothing.
 */
const withoutEmptySubmenus = (items: readonly MenuItem[]): MenuItem[] =>
  items.reduce<MenuItem[]>((result, item) => {
    if (!isMenuSubmenuItem(item)) {
      return [...result, item];
    }
    const nestedItems = withoutEmptySubmenus(item.items);
    return nestedItems.length ? [...result, { ...item, items: nestedItems }] : result;
  }, []);

/**
 * Resolves the final list of items to render in a component's header menu.
 *
 * This is the single seam every header menu goes through, so ordering and visibility rules stay
 * identical across components. Relative positioning and an `onBeforeRender` transform are planned to
 * land here — see `__dev_docs__/header-menu-architecture.md`.
 *
 * @param config - The component's header menu configuration.
 * @returns The items to render, empty when the menu is disabled.
 */
export const resolveHeaderMenuItems = (config?: HeaderMenuConfig): MenuItem[] =>
  config?.enabled === false ? [] : withoutEmptySubmenus(config?.items ?? []);
