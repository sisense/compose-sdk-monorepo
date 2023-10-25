import { HttpClient } from '@sisense/sdk-rest-client';
import { RestApi } from '../../api/rest-api';
import { translateDashboard } from './translate-dashboard';

export interface GetDashboardModelOptions {
  /**
   * Boolean flag whether to include widgets in the dashboard model
   *
   * If not specified, the default value is `false`
   */
  includeWidgets?: boolean;
}

/** @internal */
export async function getDashboardModel(
  http: HttpClient,
  dashboardOid: string,
  options: GetDashboardModelOptions = {},
) {
  const { includeWidgets } = options;
  const api = new RestApi(http);
  const expand: string[] = [];
  let fields = ['oid', 'title', 'datasource'];

  if (includeWidgets) {
    // Removes "fields" list due to it's conflict with "expand" parameter => API endpoint issue
    fields = [];
    expand.push('widgets');
  }

  const dashboard = await api.getDashboard(dashboardOid, { fields, expand });

  return translateDashboard(dashboard);
}
