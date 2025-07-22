import {
  DashboardStyleOptions,
  TabbersOptions,
  WidgetsOptions,
  WidgetsPanelLayout,
} from '@/models';
import { WidgetProps } from '@/props';
import { DashboardChangeAction } from '@/dashboard/dashboard';
import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import { FiltersPanelConfig } from '@/filters/components/filters-panel/types';
import { ReactNode } from 'react';

export type {
  DashboardStyleOptions,
  WidgetsPanelColumnLayout,
  WidgetsPanelLayout,
  WidgetsPanelCell,
  WidgetsPanelRow,
  WidgetsPanelColumn,
} from '@/models';

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
  widgets: WidgetProps[];
  filters: Filter[] | FilterRelations;
  onFiltersChange: (filters: Filter[] | FilterRelations) => void;
  defaultDataSource?: DataSource;
  /**
   * Callback to receive changes
   *
   * @internal
   */
  onChange?: (action: DashboardChangeAction) => void;
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
     * If not specified, the default value is `false`.
     */
    visible: boolean;
  };
  /**
   * Configuration for the widgets panel
   */
  widgetsPanel?: WidgetsPanelConfig;
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
  /**
   * The Tabber widgets configurations as a single dashboard config
   *
   * @internal
   */
  tabbersOptions?: TabbersOptions;
  /** The style options for the dashboard */
  styleOptions?: DashboardStyleOptions;
  /**
   * Callback to receive changes
   *
   * @internal
   */
  onChange?: (action: DashboardChangeAction) => void;
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
