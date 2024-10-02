import { DashboardStyleOptions, WidgetsOptions, WidgetsPanelLayout } from '@/models';
import { WidgetProps } from '@/props';
import { DataSource, Filter } from '@sisense/sdk-data';

export type { DashboardStyleOptions, WidgetsPanelColumnLayout } from '@/models';

/**
 * Props for the DashboardById component
 */
export interface DashboardByIdProps {
  /**
   * The OID of the dashboard to render.
   */
  dashboardOid: string;
}

/**
 * Props for the DashboardContainer component
 */
export interface DashboardContainerProps {
  title: string;
  layoutOptions?: DashboardLayoutOptions;
  config?: DashboardConfig;
  widgets: WidgetProps[];
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
  defaultDataSource?: DataSource;
}

/**
 * Dashboard configuration
 *
 * @internal
 */
export interface DashboardConfig {
  filtersPanel?: {
    isVisible: boolean;
  };
  toolbar?: {
    isVisible: boolean;
  };
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
   *
   * @internal
   */
  config?: DashboardConfig;
  /** The widgets to render in the dashboard */
  widgets: WidgetProps[];
  /** The dashboard filters to be applied to each of the widgets based on the widget filter options */
  filters?: Filter[];
  /** The default data source to use for the dashboard */
  defaultDataSource?: DataSource;
  /** The options for each of the widgets */
  widgetsOptions?: WidgetsOptions;
  /** The style options for the dashboard */
  styleOptions?: DashboardStyleOptions;
}

/**
 * Props for the Dashboard Header component
 *
 * @internal
 */
export interface DashboardHeaderProps {
  title: string;
}
