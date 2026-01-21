import { ReactNode } from 'react';

import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import { TabbersConfig } from '@/dashboard/hooks/use-tabber';
import { FiltersPanelConfig } from '@/filters/components/filters-panel/types';
import { DashboardStyleOptions, WidgetsOptions, WidgetsPanelLayout } from '@/models';
import { WidgetProps } from '@/props';

export type {
  DashboardStyleOptions,
  WidgetsPanelColumnLayout,
  WidgetsPanelLayout,
  WidgetsPanelCell,
  WidgetsPanelRow,
  WidgetsPanelColumn,
} from '@/models';

export type { TabbersConfig, TabberConfig, TabberTabConfig } from '@/dashboard/hooks/use-tabber';

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
  | DashboardWidgetsDeletedEvent;

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
   * Render the toolbar
   *
   * @internal
   */
  renderToolbar?: () => ReactNode;
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
   * Configuration for the toolbar
   */
  toolbar?: {
    /**
     * Determines whether the toolbar is visible.
     *
     * If not specified, the default value is `true`.
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

/**
 * Props for the Dashboard component
 */
export interface DashboardProps {
  /**
   * Optional identifer of the dashboard
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
}

/**
 * Props for the Dashboard Header component
 *
 * @internal
 */
export interface DashboardHeaderProps {
  title: string;
  toolbar?: () => ReactNode;
}
