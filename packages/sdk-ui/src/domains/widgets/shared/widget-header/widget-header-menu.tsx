import { resolveHeaderMenuItems } from '@/domains/shared/header';

import { WidgetHeaderMenuConfig } from './widget-header-config.js';
import { WidgetMenuButton } from './widget-menu-button.js';

export interface WidgetHeaderMenuProps {
  /**
   * Configuration options for the widget header menu
   */
  config?: WidgetHeaderMenuConfig;
}

/**
 * Renders the widget header menu button, or nothing when the menu is disabled or has no items.
 */
export function WidgetHeaderMenu({ config }: WidgetHeaderMenuProps): JSX.Element | null {
  const menuItems = resolveHeaderMenuItems(config);

  if (!menuItems.length) return null;

  return <WidgetMenuButton menuItems={menuItems} />;
}
