import { HttpClient } from '@sisense/sdk-rest-client';
import { RestApi } from '../../api/rest-api.js';
import { dashboardModelTranslator } from '@/models';
import { dedupe } from '@/utils/dedupe.js';

export interface GetDashboardModelsOptions {
  /**
   * Dashboard title to search by
   *
   * Dashboard titles are not necessarily unique, so the result may contain multiple dashboards.
   */
  searchByTitle?: string;
  /**
   * {@inheritDoc GetDashboardModelOptions.includeWidgets}
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

  if (!dashboards) return [];

  // Remove duplicated dashboards due to co-authoring
  // The deduplication algorithm iterates forward through the array elements.
  // It retains the leading elements, which are assumed to be the owner's dashboards,
  // and removes duplicate copies of co-owned or shared dashboards.
  const dedupedDashboards = dedupe(dashboards, (m) => m.oid);

  if (dedupedDashboards.length !== dashboards.length) {
    console.warn('Removing detected duplicate dashboard(s)');
  }

  return dedupedDashboards.map((dashboard) => dashboardModelTranslator.fromDashboardDto(dashboard));
}
