import { Layout, WidgetModel } from '@/models';
import { Filter } from '@sisense/sdk-data';

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
}

/**
 * Props for the Dashboard Header component
 *
 * @internal
 */
export interface DashboardHeaderProps {
  title: string;
}
