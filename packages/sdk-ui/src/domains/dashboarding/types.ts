import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import { DashboardHeaderConfig } from '@/domains/dashboarding/components/dashboard-header/dashboard-header-config';
import {
  DashboardStyleOptions,
  WidgetsOptions,
  WidgetsPanelLayout,
} from '@/domains/dashboarding/dashboard-model';
import { TabbersConfig } from '@/domains/dashboarding/hooks/use-tabber';
import { FiltersPanelConfig } from '@/domains/filters/components/filters-panel/types';
import { HeaderItem } from '@/domains/shared/header';
import { WidgetProps } from '@/domains/widgets/components/widget/types';

import type { DashboardPersistenceManager } from './persistence/types.js';

export type {
  DashboardStyleOptions,
  SpecificWidgetOptions,
  WidgetsPanelColumnLayout,
  WidgetsPanelLayout,
  WidgetsPanelCell,
  WidgetsPanelRow,
  WidgetsPanelColumn,
} from '@/domains/dashboarding/dashboard-model';

export type {
  TabbersConfig,
  TabberConfig,
  TabberTabConfig,
} from '@/domains/dashboarding/hooks/use-tabber';

/**
 * Event triggered when dashboard filters are updated.
 */
export interface DashboardFiltersUpdatedEvent {
  /** Event type */
  type: 'filters/updated';
  /** New filters or filter relations after the update*/
  payload: Filter[] | FilterRelations;
}

/**
 * Event triggered when the filters panel collapsed state changes.
 */
export interface DashboardFiltersPanelCollapseChangedEvent {
  /** Event type */
  type: 'filtersPanel/collapse/changed';
  /** Is the filters panel collapsed? */
  payload: boolean;
}

/**
 * Event triggered when the widgets panel layout is updated.
 *
 * @remarks
 * When `config.widgetsPanel.editMode.applyChangesAsBatch.enabled` is `true` (default),
 * this event is only triggered when the user applies changes (clicks "Apply"),
 * not during the editing process. When `false`, this event is triggered immediately
 * after each layout change.
 */
export interface DashboardWidgetsPanelLayoutUpdatedEvent {
  /** Event type */
  type: 'widgetsPanel/layout/updated';
  /** The new widgets panel layout */
  payload: WidgetsPanelLayout;
}

/**
 * Event triggered when the edit mode state changes.
 */
export interface DashboardWidgetsPanelIsEditingChangedEvent {
  /** Event type */
  type: 'widgetsPanel/editMode/isEditing/changed';
  /** Is the widgets panel layout in editing state? */
  payload: boolean;
}

/**
 * Event triggered when widgets are deleted from the dashboard.
 *
 * @remarks
 * When `config.widgetsPanel.editMode.applyChangesAsBatch.enabled` is `true` (default),
 * this event is only triggered when the user applies changes (clicks "Apply"),
 * not during the editing process. When `false`, this event is triggered immediately
 * after widgets are deleted.
 */
export interface DashboardWidgetsDeletedEvent {
  /**
   * Event type */
  type: 'widgets/deleted';
  /** The oids of the widgets deleted */
  payload: string[];
}

/**
 * Event triggered when a FilterWidget's date granularity is changed on the dashboard.
 * Lets an embedding host sync the widget's stored dimension metadata to the new level.
 *
 * @beta
 */
export interface DashboardWidgetDateLevelChangedEvent {
  /** Event type */
  type: 'widget/dateLevelChanged';
  /** Widget oid and the JAQL level descriptor of the new granularity */
  payload: {
    /** The oid of the changed widget */
    widgetId: string;
    /** JAQL of the attribute at the new date level */
    levelJaql: {
      /** Dimension expression (e.g. `[Commerce.Date (Calendar)]`) */
      dim?: string;
      /** Date level of aggregated datetime attributes (e.g. `years`) */
      level?: string;
      /** Date level of non-aggregated datetime attributes */
      dateTimeLevel?: string;
      /** Bucket size in minutes for the `minutes` level */
      bucket?: string;
    } & Record<string, unknown>;
  };
}

/**
 * Events that can be triggered by the Dashboard component
 *
 * @example
 *
 * Example of a filters update event:
 *
 * ```ts
 * { type: 'filters/updated', payload: filters }
 * ```
 */
export type DashboardChangeEvent =
  | DashboardFiltersUpdatedEvent
  | DashboardFiltersPanelCollapseChangedEvent
  | DashboardWidgetsPanelLayoutUpdatedEvent
  | DashboardWidgetsPanelIsEditingChangedEvent
  | DashboardWidgetsDeletedEvent
  | DashboardWidgetDateLevelChangedEvent;

/**
 * Props of the {@link DashboardById} component.
 */
export interface DashboardByIdProps {
  /**
   * The OID of the dashboard to render.
   */
  dashboardOid: string;

  /**
   * The configuration for the dashboard
   */
  config?: DashboardByIdConfig;
}

/**
 * Props for the DashboardContainer component
 */
export interface DashboardContainerProps {
  title: string;
  layoutOptions?: DashboardLayoutOptions;
  config?: DashboardConfig;
  editMode: boolean;
  widgets: WidgetProps[];
  filters: Filter[] | FilterRelations;
  onFiltersChange: (filters: Filter[] | FilterRelations) => void;
  defaultDataSource?: DataSource;
  filterPanelCollapsed: boolean;
  onFilterPanelCollapsedChange: (collapsed: boolean) => void;
  /**
   * Callback to receive layout changes
   *
   * @internal
   */
  onLayoutChange: (layout: WidgetsPanelLayout) => void;
  /**
   * Built-in action items rendered in the dashboard header.
   */
  headerItems?: HeaderItem[];
  /**
   * User configuration for the dashboard header items.
   */
  headerConfig?: DashboardHeaderConfig;
  /**
   * Filter guids to pass to FiltersPanel as hidden. Derived from live FilterWidget claims.
   *
   * @internal
   */
  hiddenFilterIds?: string[];
}

/**
 * Dashboard filters panel configuration
 */
export interface DashboardFiltersPanelConfig extends FiltersPanelConfig {
  /**
   * Determines whether the filters panel is visible.
   *
   * If not specified, the default value is `true`.
   */
  visible?: boolean;
  /**
   * Boolean flag that controls the initial "collapsed" state of the filters panel.
   *
   * If not specified, the default value is `false`.
   */
  collapsedInitially?: boolean;
  /**
   * Setting this to `true` will use the isCollapsed state from local storage, if available, and store any changes to local storage.
   * This state is shared across all dashboards.
   * This state has a higher priority than `collapsedInitially` when enabled.
   */
  persistCollapsedStateToLocalStorage?: boolean;
  /**
   * If enabled, the expand/collapse arrow on the divider between the filters panel and the dashboard content will be replaced with a filter toggle icon on the dashboard toolbar.
   *
   * If the dashboard toolbar is configured to be not visible, this setting will be ignored.
   *
   * If not specified, the default value is `false`.
   */
  showFilterIconInToolbar?: boolean;
  /**
   * When `true` (default), filters claimed by a live FilterWidget are hidden from
   * the panel tiles. They still apply to other widgets and block their dimensions.
   * Set to `false` to show them in the panel (useful for debugging).
   *
   * @defaultValue true
   * @alpha
   */
  hideFilterWidgetLinkedFilters?: boolean;
}

/**
 * Widgets panel configuration
 */
export interface WidgetsPanelConfig {
  /**
   * If `true`, adjust layout based on available width of widgets panel.
   *
   * If not specified, the default value is `false`.
   */
  responsive?: boolean;
  /**
   * Edit mode configuration.
   */
  editMode?: EditModeConfig;
  /**
   * Configuration for actions available on all widgets in the panel, such as
   * downloading each widget's data.
   */
  actions?: {
    /**
     * Configuration for the "Download as CSV" action on all widgets in the panel,
     * which adds an item to each widget's header menu that exports the widget's
     * underlying data as a CSV file.
     *
     * @example
     * Enable CSV download for every widget in a dashboard:
     * ```ts
     * const dashboardConfig: DashboardConfig = {
     *   widgetsPanel: {
     *     actions: {
     *       downloadCsv: {
     *         enabled: true,
     *       },
     *     },
     *   },
     * };
     * ```
     */
    downloadCsv?: {
      /**
       * Whether the "Download as CSV" action is enabled for all widgets in the panel.
       *
       * @default false
       */
      enabled?: boolean;
    };
    /**
     * Configuration for downloading widget data as Excel.
     *
     * @sisenseInternal
     */
    downloadExcel?: {
      /**
       * Determines whether the widgets possibility to download Excel is enabled.
       *
       * If not specified, the default value is `false`.
       */
      enabled?: boolean;
    };
  };
}

/**
 * Edit mode configuration
 */
export interface EditModeConfig {
  /**
   * If `true` the editable layout feature is enabled for the end user.
   *
   * If `false` the end user is unable to edit the layout of widgets in the dashboard.
   *
   * When persistence is enabled combined with `editMode` for a Fusion dashboard, changes to the layout will saved to Fusion.
   *
   * @default false
   */
  enabled: boolean;
  /**
   * Indicates whether the dashboard is currently in edit mode.
   *
   * If set, this controls whether editing is currently in progress,
   * which by default is automatically managed from UI interactions with the dashboard toolbar menu/buttons.
   *
   * */
  isEditing?: boolean;
  /**
   * Configuration for the edit mode user experience
   */
  applyChangesAsBatch?: {
    /**
     * If `true`, a history of changes will be accumulated during editing,
     * and users may undo/redo through the history of changes made during the current edit.
     *
     * The current layout state will be applied to the dashboard when the user clicks 'Apply',
     * or discarded when the user clicks 'Cancel'.
     *
     * If `false`, the layout changes will be applied immediately after the user makes each change,
     * without confirmation or the ability to cancel/undo.
     *
     * @default: true
     * */
    enabled: boolean;
    /**
     * The maximum number of history items to keep while applying changes in batch mode.
     *
     * History will be temporarily stored in the browser during editing.
     *
     * @default 20
     */
    historyLimit?: number;
  };
  /**
   * Determines whether the drag handle icon should be displayed on the
   * header of each widget when layout editing is possible.
   *
   * @default true
   */
  showDragHandleIcon?: boolean;
  /**
   * Configuration for the widget duplication feature.
   *
   * @internal
   */
  duplicateWidget?: {
    /**
     * When `true`, adds a "Duplicate widget" menu item to each widget header.
     * On click, clones the widget and updates the layout.
     * Only has effect when edit mode is also enabled (`editMode.enabled`) and batch mode is disabled (`editMode.applyChangesAsBatch.enabled`).
     * If batch mode is enabled, "Duplicate widget" menu item won't be applied because it would not be possible to undo/redo the duplication.
     *
     * If not specified, the default value is `false`.
     * @internal
     */
    enabled: boolean;
  };
  /**
   * Configuration for the widget renaming feature.
   *
   * @internal
   */
  renameWidget?: {
    /**
     * When `true`, adds a "Rename widget" menu item to each widget header.
     * On click, triggers inline title editing of the widget.
     * Only has effect when edit mode is also enabled (`editMode.enabled`).
     *
     * If not specified, the default value is `false`.
     * @internal
     */
    enabled: boolean;
  };
}

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  /**
   * Configuration for the filters panel
   */
  filtersPanel?: DashboardFiltersPanelConfig;
  /**
   * Configuration for the dashboard header.
   */
  header?: DashboardHeaderConfig;
  /**
   * Configuration for the toolbar.
   *
   * @deprecated Use the `header` configuration section instead (`header.visible`).
   */
  toolbar?: {
    /**
     * Determines whether the toolbar is visible.
     *
     * If not specified, the default value is `true`.
     *
     * @deprecated Use `header.visible` instead.
     */
    visible: boolean;
  };
  /**
   * Configuration for the widgets panel
   */
  widgetsPanel?: WidgetsPanelConfig;
  /**
   * Configuration for tabber widgets in the dashboard
   */
  tabbers?: TabbersConfig;
}

/**
 * Dashboard configuration
 */
export interface DashboardByIdConfig extends DashboardConfig {
  /**
   * Boolean flag indicating whether changes to the embedded dashboard should be saved to the dashboard in Fusion.
   *
   * If not specified, the default value is `false`.
   *
   * Limitations:
   * - WAT authentication does not support persistence.
   * - Currently only changes to dashboard filters are persisted.
   */
  persist?: boolean;
  /**
   * Whether to load the dashboard in shared mode (co-authoring feature).
   *
   * @default false
   * @internal
   */
  sharedMode?: boolean;
}

/**
 * Dashboard layout options
 */
export interface DashboardLayoutOptions {
  /**
   * The layout of the dashboard widgets panel
   * If not provided, the widgets will be laid out in one column vertically by default
   */
  widgetsPanel?: WidgetsPanelLayout;
}

export type { DashboardPersistenceManager };

/**
 * Props for the Dashboard component
 */
export interface DashboardProps {
  /**
   * Optional unique identifier of the dashboard.
   *
   * For dashboards loaded from Fusion (for example, via `DashboardById`), this is populated with the dashboard OID
   *
   * @internal
   */
  id?: string;
  /** The title of the dashboard */
  title?: string;
  /**
   * Dashboard layout options
   */
  layoutOptions?: DashboardLayoutOptions;
  /**
   * The configuration for the dashboard
   */
  config?: DashboardConfig;
  /** The widgets to render in the dashboard */
  widgets: WidgetProps[];
  /** The dashboard filters to be applied to each of the widgets based on the widget filter options */
  filters?: Filter[] | FilterRelations;
  /** The default data source to use for the dashboard */
  defaultDataSource?: DataSource;
  /** The options for each of the widgets */
  widgetsOptions?: WidgetsOptions;
  /** The style options for the dashboard */
  styleOptions?: DashboardStyleOptions;
  /**
   * Callback to receive changes
   *
   * This callback is invoked when the dashboard state changes, such as filter updates,
   * layout changes, or widget deletions. See {@link DashboardChangeEvent} for all possible event types.
   *
   * @param event The event that occurred
   */
  onChange?: (event: DashboardChangeEvent) => void;
  /**
   * Persistence manager for the dashboard
   * @sisenseInternal
   */
  persistence?: DashboardPersistenceManager;
}

/**
 * Props for the Dashboard Header component
 *
 * @internal
 */
export interface DashboardHeaderProps {
  /** Built-in header items (title, spacer, edit-mode toolbar, toggles, menu) before user config is merged. */
  items?: HeaderItem[];
  /** User configuration for the header items. */
  config?: DashboardHeaderConfig;
}
