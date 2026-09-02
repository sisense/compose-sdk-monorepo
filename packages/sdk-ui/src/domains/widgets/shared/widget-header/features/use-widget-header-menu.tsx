import { useMemo } from 'react';

import { asBuiltInHeaderItem, resolveHeaderMenuItems } from '@/domains/shared/header';

import { withHeaderItemsInConfig } from '../../../helpers/header-items-utils.js';
import { WidgetHeaderConfig } from '../types.js';
import { WidgetHeaderMenu } from '../widget-header-menu.js';
import { WidgetHeaderTargets } from '../widget-header-targets.js';

/**
 * Adds the header menu ("⋮") button to a widget's header, when there is a menu to show.
 *
 * Call it **after** every feature that contributes menu entries (renaming, the download actions),
 * since whether the button exists depends on the finished menu. What goes *inside* the menu is a
 * separate model; see `resolveHeaderMenuItems` and `header-menu-architecture.md`.
 *
 * @param headerConfig - The widget's header config so far.
 * @returns The header config carrying the menu button, or unchanged when there is no menu to show.
 * @internal
 */
export const useWidgetHeaderMenu = (
  headerConfig: WidgetHeaderConfig | undefined,
): WidgetHeaderConfig => {
  const menu = headerConfig?.menu;
  const hasItems = resolveHeaderMenuItems(menu).length > 0;

  const menuItem = useMemo(
    () =>
      hasItems
        ? asBuiltInHeaderItem({
            id: WidgetHeaderTargets.Menu,
            component: ({ size }) => <WidgetHeaderMenu config={menu} size={size.height} />,
          })
        : undefined,
    [menu, hasItems],
  );

  return useMemo(
    () => (menuItem ? withHeaderItemsInConfig([menuItem])(headerConfig ?? {}) : headerConfig ?? {}),
    [headerConfig, menuItem],
  );
};
