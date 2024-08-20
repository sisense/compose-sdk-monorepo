import { DashboardStyleOptions, Layout, WidgetFilterOptions, WidgetModel } from '@/models';
import { DataSource, Filter } from '@sisense/sdk-data';

export type { DashboardStyleOptions, Layout } from '@/models';

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
 * Props for the DashboardLayout component
 */
export interface DashboardLayoutProps {
  title: string;
  layout: Layout;
  widgets: WidgetModel[];
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
  defaultDataSource?: DataSource;
}

/**
 * Props for the Dashboard component
 */
export interface DashboardProps {
  /** The title of the dashboard */
  title: string;
  /** The layout of the dashboard */
  layout: Layout;
  /** The widgets to render in the dashboard */
  widgets: WidgetModel[];
  /** The dashboard filters to be applied to each of the widgets based on the widget filter options */
  filters: Filter[];
  /** The default data source to use for the dashboard */
  defaultDataSource?: DataSource;
  /** The filter options for each of the widgets */
  widgetFilterOptions?: WidgetFilterOptions;
  /** The style options for the dashboard */
  styleOptions: DashboardStyleOptions;
}

/**
 * Props for the Dashboard Header component
 *
 * @internal
 */
export interface DashboardHeaderProps {
  title: string;
}
