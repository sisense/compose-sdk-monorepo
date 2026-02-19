import { HttpClient } from '@sisense/sdk-rest-client';
import merge from 'ts-deepmerge';

import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings.js';
import { TranslatableError } from '@/infra/translation/translatable-error.js';
import { QUERY_DEFAULT_LIMIT, SYSTEM_TENANT_NAME } from '@/shared/const.js';

import { defaultDateConfig } from '../../../domains/query-execution/core/date-formats/index.js';
import { getBaseDateFnsLocale } from '../../../domains/visualizations/core/chart-data-processor/data-table-date-period.js';
import { AppConfig, ThemeSettings } from '../../../types';
import {
  convertToThemeSettings,
  getPaletteName,
  LegacyPalette,
} from '../../themes/legacy-design-settings.js';
import { getLegacyPalette } from '../../themes/theme-loader';
import { GlobalsObject } from './types';
import { FeatureMap, Features } from './types/features.js';

/**
 * Application settings
 */
export type AppSettings = Required<ConfigurableAppSettings> & ServerSettings;

/**
 * Application settings that can be overridden by the user
 */
type ConfigurableAppSettings = AppConfig;

/**
 * User role permissions
 * @internal
 */
type RoleManifest = {
  dashboards?: {
    create: boolean;
    delete: boolean;
    move: boolean;
    rename: boolean;
    duplicate: boolean;
    change_owner: boolean;
    toggle_edit_mode: boolean;
    edit_layout: boolean;
    edit_script: boolean;
    export_dash: boolean;
    export_jpeg: boolean;
    export_image: boolean;
    export_pdf: boolean;
    share: boolean;
    restore: boolean;
    copy_to_server: boolean;
    import: boolean;
    select_palette: boolean;
    replace_datasource: boolean;
    undo_import_dash: boolean;
    toggleDataExploration: boolean;
    filters: {
      create: boolean;
      delete: boolean;
      save: boolean;
      on_off: boolean;
      toggle_expansion: boolean;
      modify: boolean;
      reorder: boolean;
      modify_type: boolean;
      toggle_auto_update: boolean;
      set_defaults: boolean;
      advanced: boolean;
      use_starred: boolean;
      modify_filter_relationship: boolean;
    };
  };
};

/**
 * Fusion platform settings
 */
type ServerSettings = {
  serverThemeSettings: ThemeSettings;
  serverLanguage: string;
  serverVersion: string;
  serverFeatures: FeatureMap;
  isUnifiedNarrationEnabled?: boolean;
  user: {
    tenant: {
      name: string;
    };
    /**
     * User role permissions
     * @internal
     */
    permissions: RoleManifest;
  };
};

const defaultLoadingIndicatorConfig = {
  enabled: true,
  delay: 500, // default value is 500 to avoid flickering between re-renders
};

const defaultAppConfig: Required<ConfigurableAppSettings> = {
  locale: getBaseDateFnsLocale(),
  dateConfig: defaultDateConfig,
  loadingIndicatorConfig: defaultLoadingIndicatorConfig,
  translationConfig: {
    language: 'en-US',
    customTranslations: [],
  },
  queryCacheConfig: {
    enabled: false,
  },
  queryLimit: QUERY_DEFAULT_LIMIT,
  tabberConfig: {
    enabled: true,
  },
  accessibilityConfig: {
    enabled: false,
  },
  errorBoundaryConfig: {
    alwaysShowErrorText: false,
  },
  trackingConfig: {
    enabled: true,
  },
  jumpToDashboardConfig: {
    enabled: true,
  },
  chartConfig: {
    tabular: {
      htmlContent: {
        enabled: true,
        sanitizeContents: true,
      },
    },
  },
};

/**
 * Gets the application settings
 *
 * @param customConfig - Custom application configuration
 * @param httpClient - Sisense REST API client
 * @param isWat - Whether the application is running with WAT authentication
 * @returns - Application settings
 */
export async function getSettings(
  customConfig: ConfigurableAppSettings,
  httpClient: Pick<HttpClient, 'get' | 'url'>,
  useDefaultPalette?: boolean,
): Promise<AppSettings> {
  const serverSettings = await loadServerSettings(httpClient, useDefaultPalette);
  return merge.withOptions(
    { mergeArrays: false },
    defaultAppConfig,
    serverSettings,
    {
      translationConfig: {
        language: serverSettings.serverLanguage,
      },
      locale: getBaseDateFnsLocale(
        customConfig?.translationConfig?.language ?? serverSettings.serverLanguage,
      ),
    },
    customConfig,
  ) as AppSettings;
}

/**
 * Translate Features to FeatureMap
 *
 * @param features - Features to be mapped
 * @returns FeatureMap
 */
function mapFeatures(features: Features): FeatureMap {
  const map = {};

  features.forEach((feature) => {
    map[feature.key] = feature;
  });

  return map as FeatureMap;
}

/**
 * Loads the server settings
 *
 * @param httpClient - Sisense REST API client
 * @param isWat - Whether the application is running with WAT authentication
 * @returns - Server settings
 */
async function loadServerSettings(
  httpClient: Pick<HttpClient, 'get' | 'url'>,
  useDefaultPalette = false,
) {
  const globals = await httpClient.get<GlobalsObject>('api/globals');
  if (!globals) {
    throw new TranslatableError('errors.serverSettingsNotLoaded');
  }
  const palette = useDefaultPalette
    ? ({ colors: getDefaultThemeSettings().palette.variantColors } as LegacyPalette)
    : await getLegacyPalette(getPaletteName(globals.designSettings), httpClient);
  const serverSettings: ServerSettings = {
    serverThemeSettings: convertToThemeSettings(globals.designSettings, palette, httpClient.url),
    serverLanguage: globals.language,
    serverVersion: globals.version,
    serverFeatures: mapFeatures(globals.features),
    isUnifiedNarrationEnabled: globals.props?.narrationUnified === true,
    user: {
      tenant: {
        name: globals.user?.tenant?.name || SYSTEM_TENANT_NAME,
      },
      permissions: {
        dashboards: globals?.user?.userAuth?.dashboards,
      },
    },
  };
  return serverSettings;
}
