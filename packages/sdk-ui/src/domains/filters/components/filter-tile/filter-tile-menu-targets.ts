/**
 * Ids of the built-in filter tile menu items.
 *
 * Built-in items are contributed by the tile itself when the corresponding feature is enabled and
 * are always listed before custom items. Their ids are reserved: the `id` of a custom
 * {@link FilterTileMenuItem} must not match any of them.
 */
export const FilterTileMenuTargets = {
  /**
   * The "Lock"/"Unlock" menu item.
   *
   * A cascading filter tile uses this same id for its "Lock Group"/"Unlock Group" item — the two
   * are never present in the same menu, since a tile is either cascading or it is not.
   */
  Lock: 'filter-tile-menu-lock',
} as const;

/**
 * Union of the built-in filter tile menu item ids.
 */
export type FilterTileMenuTarget =
  (typeof FilterTileMenuTargets)[keyof typeof FilterTileMenuTargets];
