import type { DataSource } from '@sisense/sdk-data';
import { convertDataSource } from '@sisense/sdk-data';

import type { DashboardProps } from '@/domains/dashboarding/index.js';
import { withNarrativeDashboardId } from '@/domains/narrative/core/with-narrative-dashboard-id.js';
import { widgetModelTranslator } from '@/domains/widgets/widget-model';
import type { DashboardDto } from '@/infra/api/types/dashboard-dto.js';
import type { AppSettings } from '@/infra/app/settings/settings.js';
import type { CompleteThemeSettingsInternal } from '@/types.js';

import { asPermissionDerivedConfig } from './as-permission-derived-config.js';
import type { DashboardModel } from './dashboard-model.js';
import {
  extractDashboardFilters,
  translateLayout,
  translateTabbersOptions,
  translateWidgetsOptions,
} from './translate-dashboard-utils.js';

/**
 * Translates {@link DashboardModel} to {@link DashboardProps}.
 *
 * Narrative widgets are handed the dashboard's `oid` as their `dashboardId`.
 *
 * @param dashboardModel - The dashboard model to translate.
 * @returns Props for the `Dashboard` component.
 * @example
 * ```tsx
 * <Dashboard {...dashboardModelTranslator.toDashboardProps(dashboardModel)} />
 * ```
 */
export function toDashboardProps(dashboardModel: DashboardModel): DashboardProps {
  const {
    oid,
    title,
    dataSource,
    widgets: widgetModels,
    layoutOptions,
    filters,
    widgetsOptions,
    config,
    styleOptions,
    userAuth,
  } = dashboardModel;
  return {
    id: oid,
    title,
    defaultDataSource: dataSource,
    widgets: withNarrativeDashboardId(oid)(widgetModels.map(widgetModelTranslator.toWidgetProps)),
    layoutOptions,
    config: {
      // Defaults implied by the dashboard's permissions. They sit below the developer's props, which
      // the `Dashboard` component merges on top, so props keep the highest precedence.
      ...asPermissionDerivedConfig(userAuth),
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
 * @param dashboardDto - The dashboard DTO to be converted to a dashboard model.
 * @param themeSettings - Optional theme settings.
 * @param appSettings - Optional application settings.
 * @returns The dashboard model.
 * @internal
 */
export function fromDashboardDto(
  dashboardDto: DashboardDto,
  themeSettings?: CompleteThemeSettingsInternal,
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
  const filters = extractDashboardFilters(filterDtoList || [], filterRelationsDtoOptions);
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
