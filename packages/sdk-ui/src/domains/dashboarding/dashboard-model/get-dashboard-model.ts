import { HttpClient } from '@sisense/sdk-rest-client';

import { DashboardModel, dashboardModelTranslator } from '@/domains/dashboarding/dashboard-model';
import { WidgetDto } from '@/domains/widgets/components/widget-by-id/types';
import { RestApi } from '@/infra/api/rest-api';
import { DashboardDto } from '@/infra/api/types/dashboard-dto';
import { PaletteDto } from '@/infra/api/types/palette-dto';
import { AppSettings } from '@/infra/app/settings/settings';
import { DashboardUserAuth } from '@/infra/app/settings/types/role-manifest';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { getWidgetIdsFromDashboard } from '@/shared/utils/extract-widget-ids';
import { CompleteThemeSettingsInternal } from '@/types';

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
   * Whether to force the legacy (non-V1) API version for the dashboard model.
   *
   * `userAuth` is now populated by default via the V1 endpoint (with an automatic
   * fallback to the legacy endpoint on older Sisense versions), so this flag is no
   * longer required to retrieve it and is kept for backward compatibility only.
   *
   * @deprecated No longer needed to retrieve `userAuth`. Use `includeWidgets` /
   * `includeFilters` on the default (V1) path instead. This option will be removed
   * once no consumer relies on it.
   * @default false
   * @internal
   */
  useLegacyApiVersion?: boolean;

  /**
   * Whether to fetch the dashboard with admin-level access.
   *
   * @default false
   * @sisenseInternal
   */
  adminAccess?: boolean;
}

/**
 * Fetches `userAuth` from the legacy endpoint as a best-effort fallback for older
 * Sisense versions that omit it on the V1 endpoint.
 *
 * @param api - The REST API instance used to call the legacy endpoint
 * @param dashboardOid - The OID of the dashboard
 * @param adminAccess - Whether to fetch with admin-level access
 * @returns The resolved {@link DashboardUserAuth}, or `undefined` when it is unavailable
 * or the legacy request fails (so the already-successful dashboard load is not aborted)
 * @internal
 */
async function getLegacyUserAuth(
  api: RestApi,
  dashboardOid: string,
  adminAccess?: boolean,
): Promise<DashboardUserAuth | undefined> {
  try {
    const legacyDashboard = await api.getDashboardLegacy(dashboardOid, { adminAccess });
    return legacyDashboard?.userAuth;
  } catch {
    return undefined;
  }
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
 *
 * @internal
 * @sisenseInternal
 */
export async function getDashboardModel(
  http: HttpClient,
  dashboardOid: string,
  options: GetDashboardModelOptions = {},
  themeSettings?: CompleteThemeSettingsInternal,
  appSettings?: AppSettings,
): Promise<DashboardModel> {
  const { includeWidgets, includeFilters, sharedMode, useLegacyApiVersion, adminAccess } = options;
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

    dashboard = await api.getDashboard(dashboardOid, {
      fields,
      expand: ['userAuth'],
      sharedMode,
      adminAccess,
    });

    if (!dashboard) {
      throw new TranslatableError('errors.dashboardInvalidIdentifier', { dashboardOid });
    }

    // Older Sisense versions do not return `userAuth` on the V1 endpoint (even with `expand`).
    // Fall back to the legacy endpoint, which always includes it, so the dashboard model
    // is populated with user authorization by default without requiring `useLegacyApiVersion`.
    if (!dashboard.userAuth) {
      const userAuth = await getLegacyUserAuth(api, dashboardOid, adminAccess);
      if (userAuth) {
        dashboard = { ...dashboard, userAuth };
      }
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
    dashboard = await api.getDashboardLegacy(dashboardOid, { adminAccess });

    if (!dashboard) {
      throw new TranslatableError('errors.dashboardInvalidIdentifier', { dashboardOid });
    }
  }

  const dashboardDto = await withSharedFormulas(dashboard, api);

  return dashboardModelTranslator.fromDashboardDto(dashboardDto, themeSettings, appSettings);
}
