import type { FilterEditorConfig } from '../filter-editor-popover/types.js';

/**
 * Configuration for the filters panel
 */
export interface FiltersPanelConfig {
  /**
   * Configures the available actions within the filters panel.
   *
   * When using `DashboardById` or a dashboard model loaded with `useGetDashboardModel` and
   * translated by `dashboardModelTranslator.toDashboardProps()`, each default below will be derived
   * from the current user's permissions on that dashboard, if the Sisense Fusion instance provides
   * it. Otherwise the documented default will be used. Explicit configuration values have the
   * highest precedence, and will override any defaults.
   */
  actions?: {
    /**
     * Configuration for adding a new filter.
     */
    addFilter?: {
      /**
       * Determines whether the possibility to create a new filter is enabled.
       *
       * @default `false`, or the user's permission to create filters on a Fusion dashboard
       */
      enabled?: boolean;
      /**
       * Determines whether the single/multi-selection toggle is shown in the filter editor.
       *
       * @default `true`, or the user's permission to change filter types on a Fusion dashboard
       * @internal
       */
      multiSelect?: {
        visible?: boolean;
      };
      /**
       * Controls whether the ranking conditions — "Top" and "Bottom" — are offered when creating a
       * filter.
       *
       * @default `true`, or the user's permission to change filter types on a Fusion dashboard
       * @internal
       */
      ranking?: {
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
       * This governs the editor for an existing filter, which is a different editor from the one
       * `addFilter` opens. Changing a filter's value from its tile is always available and is not
       * affected by this setting.
       *
       * @default `false`, or `true` on a Fusion dashboard, where opening this editor is not
       * permission-gated and editing a filter changes only the current user's own view of the
       * dashboard
       */
      enabled?: boolean;
      /**
       * Determines whether the single/multi-selection toggle is shown in the filter editor.
       *
       * @default `true`, or the user's permission to change filter types on a Fusion dashboard
       * @internal
       */
      multiSelect?: {
        visible?: boolean;
      };
      /**
       * Controls whether the ranking conditions — "Top" and "Bottom" — are offered by the editor. A
       * ranking condition already used by the edited filter stays available either way, so an
       * existing ranking filter remains editable.
       *
       * @default `true`, or the user's permission to change filter types on a Fusion dashboard
       * @internal
       */
      ranking?: {
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
       * @default `false`, or the user's permission to delete filters on a Fusion dashboard
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
       * @default `false`, or the user's permission to reorder filters on a Fusion dashboard
       */
      enabled?: boolean;
    };

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
       * In Fusion the lock action additionally requires the dashboard to be in edit mode at the
       * moment of use. This flag reproduces only the permission half of that requirement, so
       * enabling it offers locking in the filters panel even outside edit mode.
       *
       * On a dashboard loaded by `DashboardById` the Fusion permissions are the only thing that
       * grants locking, so it stays off when the instance reports none. A panel or dashboard
       * assembled from props has no permissions to consult and defaults to on.
       *
       * @default `true`, or the user's permissions to both use advanced filters and
       * toggle edit mode on a dashboard loaded by `DashboardById`
       */
      enabled?: boolean;
    };

    /**
     * Configuration for turning a filter on and off from its tile.
     *
     * @internal
     */
    toggleFilter?: {
      /**
       * Determines whether the enable/disable switch is shown on a filter tile.
       *
       * @default `true`, or the user's permission to turn filters on and off on a Fusion dashboard
       */
      visible?: boolean;
    };

    /**
     * Configuration for expanding and collapsing a filter tile.
     *
     * @internal
     */
    expandFilter?: {
      /**
       * Determines whether the expand/collapse control is shown on a filter tile.
       *
       * @default `true`, or the user's permission to expand and collapse filters on a Fusion
       * dashboard
       */
      visible?: boolean;
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
