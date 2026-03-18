import type { MenuItem } from '@/shared/types/menu-item';

import type { WidgetProps } from '../components/widget/types';
import type { WidgetHeaderConfig } from '../shared/widget-header/types';

/**
 * Transformer: adds a menu item to a header config (pure, non-mutating).
 *
 * @param menuItem - The menu item to append to toolbar.menu.items.
 * @returns A transformer that maps WidgetHeaderConfig to WidgetHeaderConfig with the menu item appended.
 * @internal
 */
export function withMenuItemInHeaderConfig(
  menuItem: MenuItem,
): (headerConfig: WidgetHeaderConfig) => WidgetHeaderConfig {
  return (headerConfig) => ({
    ...headerConfig,
    toolbar: {
      ...headerConfig.toolbar,
      menu: {
        ...(headerConfig.toolbar?.menu ?? {}),
        items: [...(headerConfig.toolbar?.menu?.items ?? []), menuItem],
      },
    },
  });
}

/**
 * Adds a menu item to the widget header (transforms full WidgetProps).
 *
 * @param menuItem - The menu item to add.
 * @returns A transformer that maps WidgetProps to WidgetProps with the item in config.header.toolbar.menu.items.
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
