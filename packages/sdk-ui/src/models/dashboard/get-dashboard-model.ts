import { HttpClient } from '@sisense/sdk-rest-client';
import { RestApi } from '../../api/rest-api';
import { DashboardModel } from '@/models/dashboard/dashboard-model';
import { CompleteThemeSettings } from '../../types';
import { AppSettings } from '@/app/settings/settings';

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
   *
   * @internal
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
) {
  const { includeWidgets, includeFilters } = options;
  const api = new RestApi(http);
  const fields = ['oid', 'title', 'datasource', 'style'];

  if (includeWidgets) {
    fields.push('layout');
  }

  if (includeFilters) {
    fields.push('filters');
  }

  const promises = [
    api.getDashboard(dashboardOid, { fields }),
    includeWidgets ? api.getDashboardWidgets(dashboardOid) : undefined,
  ] as const;

  const [dashboard, widgets] = await Promise.all(promises);
  if (!dashboard) {
    throw new Error(`Dashboard with oid ${dashboardOid} not found`);
  }
  if (widgets) {
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

  return new DashboardModel(dashboard, themeSettings, appSettings);
}
