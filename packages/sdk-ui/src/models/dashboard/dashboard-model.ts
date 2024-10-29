import { DataSource, Filter } from '@sisense/sdk-data';
import { DashboardStyleOptions, WidgetModel } from '@/models';
import { type WidgetsOptions } from './types';
import { DashboardLayoutOptions } from '@/dashboard';

/**
 * Model of Sisense Fusion dashboard defined in the abstractions of Compose SDK.
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
export interface DashboardModel {
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
   * Dashboard widget models.
   */
  widgets: WidgetModel[];

  /**
   * Dashboard layout options.
   *
   * @internal
   */
  layoutOptions: DashboardLayoutOptions;

  /**
   * Dashboard style options.
   *
   * @internal
   */
  styleOptions: DashboardStyleOptions;

  /**
   * Dashboard filters.
   *
   * @internal
   */
  filters: Filter[];

  /**
   * Dashboard options for each of the widgets.
   *
   * @internal
   */
  widgetsOptions: WidgetsOptions;
}
