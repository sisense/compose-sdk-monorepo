/**
 * Fields shared by every widget header menu item, whichever kind it is.
 */
interface WidgetHeaderMenuItemBase {
  /**
   * Unique identifier of the item within the menu.
   *
   * Must not match the id of a built-in item — see {@link WidgetHeaderMenuTargets}.
   */
  id: string;
  /**
   * Text of the item, as shown in the menu.
   */
  caption: string;
}

/**
 * A widget header menu item that runs an action when clicked.
 */
export interface WidgetHeaderMenuActionItem extends WidgetHeaderMenuItemBase {
  /**
   * Kind of the item.
   */
  type: 'action';
  /**
   * Callback invoked when the item is clicked.
   */
  onClick: () => void;
}

/**
 * A widget header menu item that opens a nested submenu when clicked.
 */
export interface WidgetHeaderMenuSubmenuItem extends WidgetHeaderMenuItemBase {
  /**
   * Kind of the item.
   */
  type: 'submenu';
  /**
   * Items of the nested submenu. Submenus may be nested further.
   *
   * A submenu with no items is not rendered.
   */
  items: WidgetHeaderMenuItem[];
}

/**
 * A single item in the widget header menu, discriminated by its `type`.
 *
 * Items are contributed through {@link WidgetHeaderMenuConfig.items} and are rendered after the
 * built-in items the widget adds itself (for example "Download" or "Rename widget").
 */
export type WidgetHeaderMenuItem = WidgetHeaderMenuActionItem | WidgetHeaderMenuSubmenuItem;

/**
 * Configuration for the widget header menu — the menu opened from the "⋮" button in the widget
 * header.
 */
export interface WidgetHeaderMenuConfig {
  /**
   * Whether the header menu is enabled.
   *
   * When `false`, the menu button is not rendered even if items are available. When enabled, the
   * menu button is rendered as soon as there is at least one item to show.
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * Custom items to add to the header menu, listed after the built-in ones.
   *
   * Each item's `id` must be unique within the menu and must not match the id of a built-in item —
   * see {@link WidgetHeaderMenuTargets}.
   *
   * @example
   * Add a custom item to the widget header menu:
   * ```ts
   * const widgetConfig: WidgetConfig = {
   *   header: {
   *     menu: {
   *       items: [
   *         {
   *           type: 'action',
   *           id: 'open-details',
   *           caption: 'Open details',
   *           onClick: () => openDetails(),
   *         },
   *       ],
   *     },
   *   },
   * };
   * ```
   */
  items?: WidgetHeaderMenuItem[];
}

/**
 * Configuration for the widget title within the header.
 *
 * @alpha
 */
export interface WidgetHeaderTitleConfig {
  /**
   * Configuration for renaming the widget by editing its title in place.
   */
  editing?: {
    /**
     * Whether the widget title editing is enabled.
     *
     * @default false
     */
    enabled?: boolean;
  };
}

/**
 * Configuration for the widget header.
 */
export interface WidgetHeaderConfig {
  /**
   * Configuration for the widget title.
   *
   * @alpha
   */
  title?: WidgetHeaderTitleConfig;
  /**
   * Configuration for the widget header menu.
   */
  menu?: WidgetHeaderMenuConfig;
}
