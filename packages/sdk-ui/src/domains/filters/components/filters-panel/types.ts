import type { FilterEditorConfig } from '../filter-editor-popover/types.js';

/**
 * Configuration for the filters panel
 */
export interface FiltersPanelConfig {
  /**
   * Configures the available actions within the filters panel.
   */
  actions?: {
    /**
     * Configuration for adding a new filter.
     */
    addFilter?: {
      /**
       * Determines whether the possibility to create a new filter is enabled.
       *
       * If not specified, the default value is `false`.
       */
      enabled?: boolean;
      /** @internal */
      multiSelect?: {
        visible?: boolean;
      };
    };
    /**
     * Configuration for editing an existing filter.
     */
    editFilter?: {
      /**
       * Determines whether the possibility to edit an existing filter is enabled.
       *
       * If not specified, the default value is `false`.
       */
      enabled?: boolean;
      /** @internal */
      multiSelect?: {
        visible?: boolean;
      };
    };
    /**
     * Configuration for deleting a filter.
     */
    deleteFilter?: {
      /**
       * Determines whether the possibility to delete a filter is enabled.
       *
       * If not specified, the default value is `false`.
       */
      enabled?: boolean;
    };

    /**
     * Configuration for drag and drop reordering filters.
     *
     * @internal
     */
    reorderFilters?: {
      /**
       * Determines whether the possibility to reorder a filter is enabled.
       *
       * If not specified, the default value is `false`.
       */
      enabled?: boolean;
    };
  };
}

/** @internal */
export type UseExistingFilterEditingConfig = FilterEditorConfig & {
  enabled?: boolean;
};

/** @internal */
export type UseNewFilterCreationConfig = FilterEditorConfig & {
  enabled?: boolean;
};
