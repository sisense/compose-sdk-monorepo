/**
 * Fields shared by every filter tile menu item, whichever kind it is.
 */
interface FilterTileMenuItemBase {
  /**
   * Unique identifier of the item within the menu.
   *
   * Must not match the id of a built-in item — see {@link FilterTileMenuTargets}.
   */
  id: string;
  /**
   * Text of the item, as shown in the menu.
   */
  caption: string;
}

/**
 * A filter tile menu item that runs an action when clicked.
 */
export interface FilterTileMenuActionItem extends FilterTileMenuItemBase {
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
 * A filter tile menu item that opens a nested submenu when clicked.
 */
export interface FilterTileMenuSubmenuItem extends FilterTileMenuItemBase {
  /**
   * Kind of the item.
   */
  type: 'submenu';
  /**
   * Items of the nested submenu. Submenus may be nested further.
   *
   * A submenu with no items is not rendered.
   */
  items: FilterTileMenuItem[];
}

/**
 * A single item in the filter tile menu, discriminated by its `type`.
 *
 * Items are contributed through {@link FilterTileMenuConfig.items} and are rendered after the
 * built-in items the tile adds itself (for example "Lock").
 */
export type FilterTileMenuItem = FilterTileMenuActionItem | FilterTileMenuSubmenuItem;

/**
 * Configuration for the filter tile menu — the menu opened from the "⋮" button in the tile header.
 */
export interface FilterTileMenuConfig {
  /**
   * Whether the tile menu is enabled.
   *
   * When `false`, the menu button is not rendered even if items are available — the built-in lock
   * item included. When enabled, the menu button is rendered as soon as there is at least one item
   * to show.
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * Custom items to add to the tile menu, listed after the built-in ones.
   *
   * Each item's `id` must be unique within the menu and must not match the id of a built-in item —
   * see {@link FilterTileMenuTargets}.
   *
   * On a cascading filter tile these items are rendered in the menu of every level of the tile,
   * because each level is a tile of its own.
   *
   * @example
   * Add a custom item to the filter tile menu:
   * ```ts
   * const filterTileConfig: FilterTileConfig = {
   *   header: {
   *     menu: {
   *       items: [
   *         {
   *           type: 'action',
   *           id: 'copy-filter-values',
   *           caption: 'Copy filter values',
   *           onClick: () => copyFilterValues(),
   *         },
   *       ],
   *     },
   *   },
   * };
   * ```
   */
  items?: FilterTileMenuItem[];
}

/**
 * Configuration for the filter tile header.
 */
export interface FilterTileHeaderConfig {
  /**
   * Configuration for the filter tile menu.
   */
  menu?: FilterTileMenuConfig;
}

/**
 * Configuration for the actions available within a filter tile.
 */
export interface FilterTileActionsConfig {
  /**
   * Configuration for locking a filter.
   *
   * A locked filter is rendered read-only: its value cannot be changed from the tile, and the
   * tile's edit, delete, and enable/disable controls are hidden. Locked filters are also left
   * untouched by cross-filtering.
   */
  lockFilter?: {
    /**
     * Determines whether the possibility to lock a filter is enabled.
     *
     * Locking a filter reports the new state through the tile's change callback, like any other
     * change made from the tile. Since the caller owns the filter's state, that handler has to pass
     * the filter it receives through as-is — rebuilding it from its value drops the lock.
     *
     * A tile rendered inside a `FiltersPanel` follows the panel's
     * `FiltersPanelConfig.actions.lockFilter.enabled` instead of this setting.
     *
     * @default true
     */
    enabled?: boolean;
  };
  /**
   * Configuration for turning the filter on and off from the tile.
   *
   * @internal
   */
  toggleFilter?: {
    /**
     * Determines whether the enable/disable switch is shown on the tile.
     *
     * If not specified, the default value is `true`.
     */
    visible?: boolean;
  };
  /**
   * Configuration for expanding and collapsing the tile.
   *
   * @internal
   */
  expandFilter?: {
    /**
     * Determines whether the expand/collapse control is shown on the tile.
     *
     * If not specified, the default value is `true`. Hiding the control leaves the tile in the
     * state it would otherwise have started in.
     */
    visible?: boolean;
  };
}

/**
 * Configuration for the filter tile.
 */
export interface FilterTileConfig {
  /**
   * Configuration for the filter tile header.
   */
  header?: FilterTileHeaderConfig;
  /**
   * Configures the available actions within the filter tile.
   */
  actions?: FilterTileActionsConfig;
}
