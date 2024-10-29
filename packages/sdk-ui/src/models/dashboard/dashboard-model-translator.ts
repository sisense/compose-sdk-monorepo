import { DashboardProps } from '@/dashboard';
import { DashboardModel } from './dashboard-model.js';
import { widgetModelTranslator } from '@/models/widget/';
import { DashboardDto } from '@/api/types/dashboard-dto.js';
import { CompleteThemeSettings } from '@/types.js';
import { AppSettings } from '@/app/settings/settings.js';
import {
  extractDashboardFilters,
  translateLayout,
  translateWidgetsOptions,
} from './translate-dashboard-utils.js';
import { DataSource } from '@sisense/sdk-data';

/**
 * Translates {@link DashboardModel} to {@link DashboardProps}.
 *
 * @example
 * ```tsx
 * <Dashboard {...dashboardModelTranslator.toDashboardProps(dashboardModel)} />
 * ```
 * @group Fusion Assets
 * @fusionEmbed
 */
export function toDashboardProps(dashboardModel: DashboardModel): DashboardProps {
  const {
    title,
    dataSource,
    widgets: widgetModels,
    layoutOptions,
    filters,
    widgetsOptions,
    styleOptions,
  } = dashboardModel;
  return {
    title,
    defaultDataSource: dataSource,
    widgets: widgetModels.map(widgetModelTranslator.toWidgetProps),
    layoutOptions,
    config: {},
    filters,
    widgetsOptions,
    styleOptions,
  };
}

/**
 * Creates a new dashboard model from a dashboard DTO.
 *
 * @param dashboardDto - The dashboard DTO to be converted to a dashboard model
 * @param themeSettings - Optional theme settings
 * @param appSettings - Optional application settings
 * @internal
 */
export function fromDashboardDto(
  dashboardDto: DashboardDto,
  themeSettings?: CompleteThemeSettings,
  appSettings?: AppSettings,
): DashboardModel {
  const {
    oid,
    title,
    datasource,
    widgets: widgetDtoList,
    layout: layoutDto,
    filters: filterDtoList,
    style,
  } = dashboardDto;

  const dataSource: DataSource = {
    title: datasource.title,
    type: datasource.live ? 'live' : 'elasticube',
  };
  const styleOptions = {
    ...(style?.palette ? { palette: { variantColors: style?.palette.colors } } : null),
  };

  const mergedThemeSettings = themeSettings
    ? {
        ...themeSettings,
        ...(styleOptions.palette ? { palette: styleOptions.palette } : null),
      }
    : themeSettings;
  const widgets =
    widgetDtoList?.map((widget) =>
      widgetModelTranslator.fromWidgetDto(widget, mergedThemeSettings, appSettings),
    ) || [];
  const widgetsPanelLayout = layoutDto ? translateLayout(layoutDto) : { columns: [] };
  const filters = extractDashboardFilters(filterDtoList || []);
  const widgetsOptions = translateWidgetsOptions(widgetDtoList);

  const dashboardModel: DashboardModel = {
    oid,
    title,
    dataSource,
    styleOptions,
    widgets,
    layoutOptions: { widgetsPanel: widgetsPanelLayout },
    filters,
    widgetsOptions,
  };

  return dashboardModel;
}
