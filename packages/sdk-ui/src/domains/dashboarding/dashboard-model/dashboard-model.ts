import { AnyObject, DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import { DashboardLayoutOptions } from '@/domains/dashboarding';
import { DashboardStyleOptions } from '@/domains/dashboarding/dashboard-model';
import { TabbersConfig } from '@/domains/dashboarding/hooks/use-tabber';
import { WidgetModel } from '@/domains/widgets/widget-model';
import { DashboardSettings } from '@/infra/api/types/dashboard-dto';

import { type WidgetsOptions } from './types';

/**
 * Configuration data for a dashboard model.
 *
 * @internal
 */
export interface DashboardModelConfig {
  /**
   * Configuration for tabber widgets in the dashboard.
   */
  tabbers?: TabbersConfig;
}

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
  filters: Filter[] | FilterRelations;

  /**
   * Dashboard options for each of the widgets.
   *
   * @internal
   */
  widgetsOptions: WidgetsOptions;

  /**
   * Dashboard configuration.
   *
   * @internal
   */
  config: DashboardModelConfig;

  /**
   * Dashboard settings.
   *
   * @internal
   */
  settings?: DashboardSettings;

  /**
   * Dashboard user authorization.
   *
   * @internal
   */
  userAuth?: AnyObject;
}
