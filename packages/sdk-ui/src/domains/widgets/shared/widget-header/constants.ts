/**
 * Layout constants for the widget header.
 */

/**
 * Default (and minimum) widget header height (px). The header grows beyond this when an item
 * declares a taller size.
 */
export const WIDGET_HEADER_MIN_HEIGHT = 32;

/**
 * Default size (px) for widget header items that don't specify their own size. Matches the built-in
 * menu ("⋮") button, the tallest built-in item.
 */
export const WIDGET_HEADER_ITEM_SIZE = 28;

/**
 * Gap (px) between adjacent widget header items. The widget header is a dense, 32px-tall row whose
 * built-in icon buttons carry their own padding, so items sit flush against each other.
 */
export const WIDGET_HEADER_ITEMS_GAP = 0;
