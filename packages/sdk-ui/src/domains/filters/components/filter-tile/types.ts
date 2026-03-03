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
  };
};
