import { HttpClient } from '@sisense/sdk-rest-client';
import { RestApi } from '../../api/rest-api';
import { DashboardModel } from '@/models/dashboard/dashboard-model';
import { CompleteThemeSettings } from '../../types';

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

/** @internal */
export async function getDashboardModel(
  http: HttpClient,
  dashboardOid: string,
  options: GetDashboardModelOptions = {},
  themeSettings?: CompleteThemeSettings,
) {
  const { includeWidgets, includeFilters } = options;
  const api = new RestApi(http);
  const fields = ['oid', 'title', 'datasource'];

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

  return new DashboardModel(dashboard, themeSettings);
}
