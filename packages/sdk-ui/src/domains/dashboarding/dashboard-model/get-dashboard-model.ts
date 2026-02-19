import { HttpClient } from '@sisense/sdk-rest-client';

import { DashboardModel, dashboardModelTranslator } from '@/domains/dashboarding/dashboard-model';
import { WidgetDto } from '@/domains/widgets/components/widget-by-id/types';
import { RestApi } from '@/infra/api/rest-api';
import { DashboardDto } from '@/infra/api/types/dashboard-dto';
import { PaletteDto } from '@/infra/api/types/palette-dto';
import { AppSettings } from '@/infra/app/settings/settings';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { getWidgetIdsFromDashboard } from '@/shared/utils/extract-widget-ids';
import { CompleteThemeSettings } from '@/types';

import { withSharedFormulas } from './translate-dashboard-utils';

export interface GetDashboardModelOptions {
  /**
   * Boolean flag whether to include widgets in the dashboard model
   *
   * If not specified, the default value is `false`
   */
  includeWidgets?: boolean;

  /**
   * Boolean flag whether to include filters in the dashboard model
   *
   * If not specified, the default value is `false`
   */
  includeFilters?: boolean;

  /**
   * Whether to load the dashboard in shared mode (co-authoring feature).
   *
   * @default false
   * @internal
   */
  sharedMode?: boolean;

  /**
   * Whether to use the legacy API version for the dashboard model
   * For example, when 'expand' query parameter is needed to retrieve userAuth
   *
   * @default false
   * @internal
   */
  useLegacyApiVersion?: boolean;
}

/**
 * Retrieves a dashboard model by its OID.
 *
 * @param http - The HTTP client
 * @param dashboardOid - The OID of the dashboard
 * @param options - The options to include widgets and filters in the dashboard model
 * @param themeSettings - Optional theme settings
 * @param appSettings - Optional application settings
 * @returns The dashboard model
 * @internal
 */
export async function getDashboardModel(
  http: HttpClient,
  dashboardOid: string,
  options: GetDashboardModelOptions = {},
  themeSettings?: CompleteThemeSettings,
  appSettings?: AppSettings,
): Promise<DashboardModel> {
  const { includeWidgets, includeFilters, sharedMode, useLegacyApiVersion } = options;
  const api = new RestApi(http);

  let dashboard: DashboardDto | undefined;

  if (!useLegacyApiVersion) {
    const fields = ['oid', 'title', 'datasource', 'style', 'settings', 'userId', 'shares'];

    const isWat = http.auth?.type === 'wat';

    if (includeWidgets) {
      fields.push('layout');
    }

    if (includeFilters) {
      fields.push('filters');
      fields.push('filterRelations');
    }

    dashboard = await api.getDashboard(dashboardOid, { fields, sharedMode });

    if (!dashboard) {
      throw new TranslatableError('errors.dashboardInvalidIdentifier', { dashboardOid });
    }

    if (includeWidgets) {
      let widgets: WidgetDto[];

      if (isWat) {
        // WAT (Web Access Token) authentication method restricts direct access to the
        // API endpoint `api/v1/dashboards/${dashboardOid}/widgets`.
        // As a workaround, widgets are fetched individually based on their references in the dashboard layout.
        const widgetIds = getWidgetIdsFromDashboard(dashboard);
        const fetchedWidgets = await Promise.all(
          widgetIds.map((id) => api.getWidget(id, dashboard!.oid)),
        );
        widgets = fetchedWidgets.filter((widget): widget is WidgetDto => widget !== undefined);
      } else {
        // Fetch all widgets at once
        widgets = (await api.getDashboardWidgets(dashboardOid, sharedMode)) || [];
      }

      dashboard.widgets = widgets;
    }

    // Next could be replaced in future with expand 'style' in '/dashboards/' request
    // when lowest supported Sisense API version will support it.
    // Currently, expand 'style' work only from l2024.2.0 and cause crash in older.
    if (dashboard.style?.paletteId && !dashboard.style.palette) {
      let palettesDto: PaletteDto[] = [];
      try {
        palettesDto = (await api.getPalettes()) ?? [];
      } catch (e) {
        console.warn(
          'Loading palettes failed, palettes will not be translated to dashboard model.',
        );
      }
      const paletteDto = palettesDto.find(({ _id }) => _id === dashboard!.style?.paletteId);
      if (paletteDto) {
        dashboard.style.palette = {
          name: paletteDto.name,
          colors: paletteDto.colors,
        };
      }
    }
  } else {
    dashboard = await api.getDashboardLegacy(dashboardOid);

    if (!dashboard) {
      throw new TranslatableError('errors.dashboardInvalidIdentifier', { dashboardOid });
    }
  }

  const dashboardDto = await withSharedFormulas(dashboard, api);

  return dashboardModelTranslator.fromDashboardDto(dashboardDto, themeSettings, appSettings);
}
