import { Layout, WidgetFilterOptions, WidgetModel } from '@/models';
import { DataSource, Filter } from '@sisense/sdk-data';

/**
 * Props for the DashboardById component
 *
 * @internal
 */
export interface DashboardByIdProps {
  dashboardOid: string;
}

/**
 * Props for the DashboardLayout component
 *
 * @internal
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
 *
 * @internal
 */
export interface DashboardProps {
  title: string;
  layout: Layout;
  widgets: WidgetModel[];
  filters: Filter[];
  defaultDataSource?: DataSource;
  widgetFilterOptions?: WidgetFilterOptions;
}

/**
 * Props for the Dashboard Header component
 *
 * @internal
 */
export interface DashboardHeaderProps {
  title: string;
}
