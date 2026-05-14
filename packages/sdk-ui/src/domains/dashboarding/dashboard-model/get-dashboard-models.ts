import { HttpClient } from '@sisense/sdk-rest-client';

import { dashboardModelTranslator } from '@/domains/dashboarding/dashboard-model';
import { RestApi } from '@/infra/api/rest-api.js';
import { AppSettings } from '@/infra/app/settings/settings';
import { dedupe } from '@/shared/utils/dedupe.js';
import { CompleteThemeSettings } from '@/types';

import { withSharedFormulas } from './translate-dashboard-utils.js';

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
  themeSettings?: CompleteThemeSettings,
  appSettings?: AppSettings,
) {
  const { includeWidgets, searchByTitle } = options;
  const api = new RestApi(http);
  const expand: string[] = [];
  let fields = ['oid', 'title', 'datasource', 'style'];

  if (includeWidgets) {
    // Removes "fields" list due to it's conflict with "expand" parameter => API endpoint issue
    fields = [];
    expand.push('widgets');
  }

  const dashboards = await api.getDashboards({ fields, expand, searchByTitle });

  if (!dashboards) return [];

  // Remove dashboards that do not have an oid
  // prevents invalid request trying to get /api/v1/dashboards/undefined?fields=...
  const validDashboards = dashboards.filter((dashboard) => dashboard.oid);

  // Remove duplicated dashboards due to co-authoring
  // The deduplication algorithm iterates forward through the array elements.
  // It retains the leading elements, which are assumed to be the owner's dashboards,
  // and removes duplicate copies of co-owned or shared dashboards.
  const dedupedDashboards = dedupe(validDashboards, (m) => m.oid);

  if (dedupedDashboards.length !== validDashboards.length) {
    console.warn(
      `Removing ${
        validDashboards.length - dedupedDashboards.length
      } detected duplicate dashboard(s)`,
    );
  }

  // Fetch palettes once for all dashboards that have a paletteId but no resolved palette.
  const dashboardsNeedsPaletteResolution = dedupedDashboards.filter(
    (dashboard) => dashboard.style?.paletteId && !dashboard.style.palette,
  );

  if (dashboardsNeedsPaletteResolution.length > 0) {
    try {
      const palettesDto = (await api.getPalettes()) ?? [];
      for (const dashboard of dashboardsNeedsPaletteResolution) {
        const paletteDto = palettesDto.find(({ _id }) => _id === dashboard.style?.paletteId);
        dashboard.style = {
          ...dashboard.style,
          ...(paletteDto && {
            palette: {
              name: paletteDto.name,
              colors: paletteDto.colors,
            },
          }),
        };
      }
    } catch (e) {
      console.warn('Loading palettes failed, palettes will not be translated to dashboard models.');
    }
  }

  return Promise.all(
    dedupedDashboards.map((dashboard) =>
      withSharedFormulas(dashboard, api).then((dashboardWithSharedFormulas) =>
        dashboardModelTranslator.fromDashboardDto(
          dashboardWithSharedFormulas,
          themeSettings,
          appSettings,
        ),
      ),
    ),
  );
}
