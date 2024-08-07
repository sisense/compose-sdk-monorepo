import { DataSource, Filter } from '@sisense/sdk-data';
import { DashboardStyleOptions, Layout, translateWidget, WidgetModel } from '@/models';
import type { DashboardDto } from '@/api/types/dashboard-dto';
import {
  extractDashboardFilters,
  translateLayout,
  translateWidgetFilterOptions,
} from '@/models/dashboard/translate-dashboard-utils';
import { DashboardProps } from '@/dashboard/types';
import { type WidgetFilterOptions } from './types';
import { CompleteThemeSettings } from '../../types';
import { AppSettings } from '@/app/settings/settings';

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
   * Dashboard filters options per each widget.
   *
   * @internal
   */
  widgetFilterOptions: WidgetFilterOptions;

  /**
   * Creates a new dashboard model.
   *
   * @param dashboardDto - The widget DTO to be converted to a widget model
   * @param themeSettings - Optional theme settings
   * @param appSettings - Optional application settings
   * @internal
   */
  constructor(
    dashboardDto: DashboardDto,
    themeSettings?: CompleteThemeSettings,
    appSettings?: AppSettings,
  ) {
    const { oid, title, datasource, widgets, layout, filters, style } = dashboardDto;

    this.oid = oid;
    this.title = title;
    this.dataSource = {
      title: datasource.title,
      type: datasource.live ? 'live' : 'elasticube',
    };
    this.styleOptions = {
      ...(style?.palette ? { palette: { variantColors: style?.palette.colors } } : null),
    };

    const mergedThemeSettings = themeSettings
      ? {
          ...themeSettings,
          ...(this.styleOptions.palette ? { palette: this.styleOptions.palette } : null),
        }
      : themeSettings;
    this.widgets =
      widgets?.map((widget) => translateWidget(widget, mergedThemeSettings, appSettings)) || [];
    this.layout = layout ? translateLayout(layout) : { columns: [] };
    this.filters = extractDashboardFilters(filters || []);
    this.widgetFilterOptions = translateWidgetFilterOptions(widgets);
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

  getDashboardProps(): DashboardProps {
    return {
      title: this.title,
      defaultDataSource: this.dataSource,
      widgets: this.widgets,
      layout: this.layout,
      filters: this.filters,
      widgetFilterOptions: this.widgetFilterOptions,
      styleOptions: this.styleOptions,
    };
  }
}
