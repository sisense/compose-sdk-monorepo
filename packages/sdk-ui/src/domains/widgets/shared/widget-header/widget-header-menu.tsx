import { resolveHeaderMenuItems } from '@/domains/shared/header';

import { WidgetHeaderMenuConfig } from './widget-header-config.js';
import { WidgetMenuButton } from './widget-menu-button.js';

export interface WidgetHeaderMenuProps {
  /**
   * Configuration options for the widget header menu
   */
  config?: WidgetHeaderMenuConfig;
  /**
   * Size (px) of the menu button, as resolved by the header layout.
   */
  size?: number;
}

/**
 * Renders the widget header menu button, or nothing when the menu is disabled or has no items.
 */
export function WidgetHeaderMenu({ config, size }: WidgetHeaderMenuProps): JSX.Element | null {
  const menuItems = resolveHeaderMenuItems(config);

  if (!menuItems.length) return null;

  return <WidgetMenuButton menuItems={menuItems} size={size} />;
}
