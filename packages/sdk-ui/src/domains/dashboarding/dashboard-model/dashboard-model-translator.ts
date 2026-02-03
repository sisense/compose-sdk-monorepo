import { convertDataSource, DataSource } from '@sisense/sdk-data';

import { DashboardProps } from '@/domains/dashboarding/index.js';
import { widgetModelTranslator } from '@/domains/widgets/widget-model';
import { DashboardDto } from '@/infra/api/types/dashboard-dto.js';
import { AppSettings } from '@/infra/app/settings/settings.js';
import { CompleteThemeSettings } from '@/types.js';

import { DashboardModel } from './dashboard-model.js';
import {
  extractDashboardFilters,
  translateLayout,
  translateTabbersOptions,
  translateWidgetsOptions,
} from './translate-dashboard-utils.js';

/**
 * Translates {@link DashboardModel} to {@link DashboardProps}.
 *
 * @example
 * ```tsx
 * <Dashboard {...dashboardModelTranslator.toDashboardProps(dashboardModel)} />
 * ```
 */
export function toDashboardProps(dashboardModel: DashboardModel): DashboardProps {
  const {
    title,
    dataSource,
    widgets: widgetModels,
    layoutOptions,
    filters,
    widgetsOptions,
    config,
    styleOptions,
  } = dashboardModel;
  return {
    title,
    defaultDataSource: dataSource,
    widgets: widgetModels.map(widgetModelTranslator.toWidgetProps),
    layoutOptions,
    config: {
      tabbers: config.tabbers,
    },
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
    datasource: jaqlDataSource,
    widgets: widgetDtoList,
    layout: layoutDto,
    filters: filterDtoList,
    filterRelations: filterRelationsDtoOptions,
    style,
    settings,
    userAuth,
  } = dashboardDto;

  const dataSource: DataSource = convertDataSource(jaqlDataSource);

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
    widgetDtoList?.map((widgetDto) =>
      widgetModelTranslator.fromWidgetDto(widgetDto, mergedThemeSettings, appSettings),
    ) || [];
  const widgetsPanelLayout = layoutDto ? translateLayout(layoutDto) : { columns: [] };
  const filterRelationsModel = filterRelationsDtoOptions?.[0]?.filterRelations;
  const filters = extractDashboardFilters(filterDtoList || [], filterRelationsModel);
  const widgetsOptions = translateWidgetsOptions(widgetDtoList);
  const tabbersConfig = translateTabbersOptions(widgetDtoList);

  const dashboardModel: DashboardModel = {
    oid,
    title,
    dataSource,
    styleOptions,
    widgets,
    layoutOptions: { widgetsPanel: widgetsPanelLayout },
    filters,
    widgetsOptions,
    config: {
      tabbers: tabbersConfig,
    },
    settings,
    userAuth,
  };

  return dashboardModel;
}
