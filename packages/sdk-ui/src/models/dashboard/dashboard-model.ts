import { DataSource, Filter } from '@sisense/sdk-data';
import { Layout, translateWidget, WidgetModel } from '@/models';
import type { DashboardDto } from '@/api/types/dashboard-dto';
import {
  extractDashboardFilters,
  translateLayout,
} from '@/models/dashboard/translate-dashboard-utils';

/**
 * Model of Sisense dashboard defined in the abstractions of Compose SDK.
 *
 * @group Fusion Embed
 * @fusionEmbed
 */
export class DashboardModel {
  /**
   * Unique identifier of the dashboard.
   */
  oid: string;

  /**
   * Dashboard title.
   */
  title: string;

  /**
   * Dashboard data source details.
   */
  dataSource: DataSource;

  /**
   * Dashboard widgets.
   */
  widgets: WidgetModel[];

  /**
   * Dashboard layout.
   *
   * @internal
   */
  layout: Layout;

  /**
   * Dashboard filters.
   *
   * @internal
   */
  filters: Filter[];

  /**
   * Creates a new dashboard model.
   *
   * @param dashboardDto - The widget DTO to be converted to a widget model
   * @internal
   */
  constructor(dashboardDto: DashboardDto) {
    const { oid, title, datasource, widgets, layout, filters } = dashboardDto;

    this.oid = oid;
    this.title = title;
    this.dataSource = {
      title: datasource.title,
      type: datasource.live ? 'live' : 'elasticube',
    };
    this.widgets = widgets?.map(translateWidget) || [];
    this.layout = layout ? translateLayout(layout) : { columns: [] };
    this.filters = extractDashboardFilters(filters || []);
  }

  /**
   * Returns the props to be used for rendering a dashboard.
   *
   * @example
   * ```tsx
   * <Dashboard {...dashboard.getDashboardProps()} />
   * ```
   * @internal
   */

  getDashboardProps() {
    return {
      title: this.title,
      dataSource: this.dataSource,
      widgets: this.widgets,
      layout: this.layout,
      filters: this.filters,
    };
  }
}
