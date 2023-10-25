import { HttpClient } from '@sisense/sdk-rest-client';
import { RestApi } from '../../api/rest-api.js';
import { translateDashboard } from './translate-dashboard.js';

export interface GetDashboardModelsOptions {
  /**
   * Dashboard title to search by
   *
   * The dashboard title is not unique, therefore, the result may return multiple dashboards.
   */
  searchByTitle?: string;
  /**
   * Boolean flag whether to include widgets in the dashboard model
   *
   * If not specified, the default value is `false`
   */
  includeWidgets?: boolean;
}

/** @internal */
export async function getDashboardModels(
  http: HttpClient,
  options: GetDashboardModelsOptions = {},
) {
  const { includeWidgets, searchByTitle } = options;
  const api = new RestApi(http);
  const expand: string[] = [];
  let fields = ['oid', 'title', 'datasource'];

  if (includeWidgets) {
    // Removes "fields" list due to it's conflict with "expand" parameter => API endpoint issue
    fields = [];
    expand.push('widgets');
  }

  const dashboards = await api.getDashboards({ fields, expand, searchByTitle });

  return dashboards.map((dashboard) => translateDashboard(dashboard));
}
