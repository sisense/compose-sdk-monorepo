import { MenuItem } from '@/shared/types/menu-item';

/**
 * Configuration for the filter tile.
 */
export type FilterTileConfig = {
  /**
   * Configurations for the filter tile header.
   */
  header?: {
    /**
     * Configurations for the filter tile header menu.
     */
    menu?: {
      /**
       * List of menu items to be injected into the filter tile header.
       */
      items?: MenuItem[];
    };
  };
  /**
   * Configures the available actions within the filter tile.
   */
  actions?: {
    /**
     * Configuration for locking a filter.
     */
    lockFilter?: {
      /**
       * Determines whether the possibility to lock a filter is enabled.
       *
       * If not specified, the default value is `false`.
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
  };
};
