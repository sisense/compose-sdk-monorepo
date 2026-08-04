import type { MenuItem } from '@/shared/types/menu-item';

import type { WidgetProps } from '../components/widget/types';
import type { WidgetHeaderConfig } from '../shared/widget-header/types';
import { WidgetHeaderMenuTargets } from '../shared/widget-header/widget-header-menu-targets';

const BUILT_IN_MENU_ITEM_IDS: ReadonlySet<string> = new Set(Object.values(WidgetHeaderMenuTargets));

const isBuiltInMenuItem = (item: MenuItem): boolean => BUILT_IN_MENU_ITEM_IDS.has(item.id);

/**
 * Inserts a built-in menu item after the existing built-in items and before any custom (user-provided)
 * ones, so built-ins always lead the menu regardless of the order features contribute them.
 *
 * Built-ins are recognized by their reserved ids ({@link WidgetHeaderMenuTargets}), which is what
 * makes the boundary between built-in and custom items computable from a single flat list.
 *
 * @param items - The current menu items.
 * @param builtInItem - The built-in menu item to insert.
 * @returns A new list with the built-in item placed at the end of the built-in block.
 * @internal
 */
export function withBuiltInMenuItem(items: readonly MenuItem[], builtInItem: MenuItem): MenuItem[] {
  return [
    ...items.filter(isBuiltInMenuItem),
    builtInItem,
    ...items.filter((item) => !isBuiltInMenuItem(item)),
  ];
}

/**
 * Transformer: adds a built-in menu item to a header config (pure, non-mutating).
 *
 * @param menuItem - The built-in menu item to add to menu.items.
 * @returns A transformer that maps WidgetHeaderConfig to WidgetHeaderConfig with the menu item added.
 * @internal
 */
export function withMenuItemInHeaderConfig(
  menuItem: MenuItem,
): (headerConfig: WidgetHeaderConfig) => WidgetHeaderConfig {
  return (headerConfig) => ({
    ...headerConfig,
    menu: {
      ...(headerConfig.menu ?? {}),
      items: withBuiltInMenuItem(headerConfig.menu?.items ?? [], menuItem),
    },
  });
}

/**
 * Adds a built-in menu item to the widget header (transforms full WidgetProps).
 *
 * @param menuItem - The built-in menu item to add.
 * @returns A transformer that maps WidgetProps to WidgetProps with the item in config.header.menu.items.
 * @internal
 */
export function withHeaderMenuItem(menuItem: MenuItem): (widget: WidgetProps) => WidgetProps {
  return (props) => ({
    ...props,
    config: {
      ...props.config,
      header: withMenuItemInHeaderConfig(menuItem)(props.config?.header ?? {}),
    },
  });
}
