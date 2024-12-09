import { HttpClient } from '@sisense/sdk-rest-client';
import { RestApi } from '../../api/rest-api';
import { DashboardModel, dashboardModelTranslator } from '@/models/dashboard';
import { CompleteThemeSettings } from '../../types';
import { AppSettings } from '@/app/settings/settings';
import { TranslatableError } from '@/translation/translatable-error';
import { getWidgetIdsFromDashboard } from '@/utils/extract-widget-ids';
import { WidgetDto } from '@/widget-by-id/types';

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
  const { includeWidgets, includeFilters } = options;
  const api = new RestApi(http);
  const fields = ['oid', 'title', 'datasource', 'style'];

  const isWat = http.auth?.type === 'wat';

  if (includeWidgets) {
    fields.push('layout');
  }

  if (includeFilters) {
    fields.push('filters');
    fields.push('filterRelations');
  }

  const dashboard = await api.getDashboard(dashboardOid, { fields });

  if (!dashboard) {
    throw new TranslatableError('errors.dashboardWithOidNotFound', { dashboardOid });
  }

  if (includeWidgets) {
    let widgets: WidgetDto[];

    if (isWat) {
      // WAT (Web Access Token) authentication method restricts direct access to the
      // API endpoint `api/v1/dashboards/${dashboardOid}/widgets`.
      // As a workaround, widgets are fetched individually based on their references in the dashboard layout.
      const widgetIds = getWidgetIdsFromDashboard(dashboard);
      const fetchedWidgets = await Promise.all(
        widgetIds.map((id) => api.getWidget(id, dashboard.oid)),
      );
      widgets = fetchedWidgets.filter((widget): widget is WidgetDto => widget !== undefined);
    } else {
      // Fetch all widgets at once
      widgets = (await api.getDashboardWidgets(dashboardOid)) || [];
    }

    dashboard.widgets = widgets;
  }

  // Next could be replaced in future with expand 'style' in '/dashboards/' request
  // when lowest supported Sisense API version will support it.
  // Currently, expand 'style' work only from l2024.2.0 and cause crash in older.
  if (dashboard.style?.paletteId && !dashboard.style.palette) {
    const palettesDto = await api.getPalettes();
    const paletteDto = palettesDto?.find(({ _id }) => _id === dashboard.style?.paletteId);
    if (paletteDto) {
      dashboard.style.palette = {
        name: paletteDto.name,
        colors: paletteDto.colors,
      };
    }
  }

  return dashboardModelTranslator.fromDashboardDto(dashboard, themeSettings, appSettings);
}
