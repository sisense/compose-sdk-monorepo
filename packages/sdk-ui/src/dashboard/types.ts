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

export type { DashboardStyleOptions, WidgetsPanelColumnLayout } from '@/models';

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
  widgetsPanel?: {
    /**
     * If true adjust layout based on available width of widgets panel.
     *
     * If not specified, the default value is `false`.
     */
    responsive?: boolean;
  };
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
   * - As an alpha feature, currently only changes to dashboard filters are persisted.
   *
   * @alpha
   */
  persist?: boolean;
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
}
