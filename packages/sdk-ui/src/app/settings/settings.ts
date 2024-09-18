import { HttpClient } from '@sisense/sdk-rest-client';
import merge from 'ts-deepmerge';
import { getBaseDateFnsLocale } from '../../chart-data-processor/data-table-date-period.js';

import { defaultDateConfig } from '../../query/date-formats';
import {
  getPaletteName,
  convertToThemeSettings,
  LegacyPalette,
} from '../../themes/legacy-design-settings.js';
import { getLegacyPalette } from '../../themes/theme-loader';
import { AppConfig, ThemeSettings } from '../../types';
import { GlobalsObject } from './types';
import { QUERY_DEFAULT_LIMIT } from '@/const';
import { getDefaultThemeSettings } from '@/theme-provider/default-theme-settings.js';
import { Features, FeatureMap } from './types/features.js';

/**
 * Application settings
 */
export type AppSettings = Required<ConfigurableAppSettings> & ServerSettings;

/**
 * Application settings that can be overridden by the user
 */
type ConfigurableAppSettings = AppConfig;

/**
 * Fusion platform settings
 */
type ServerSettings = {
  serverThemeSettings: ThemeSettings;
  serverLanguage: string;
  serverVersion: string;
  serverFeatures: FeatureMap;
};

const defaultLoadingIndicatorConfig = { enabled: true, delay: 500 };

const defaultAppConfig: Required<ConfigurableAppSettings> = {
  locale: getBaseDateFnsLocale(),
  dateConfig: defaultDateConfig,
  loadingIndicatorConfig: defaultLoadingIndicatorConfig,
  language: 'en',
  queryCacheConfig: {
    enabled: false,
  },
  queryLimit: QUERY_DEFAULT_LIMIT,
  accessibilityConfig: {
    enabled: false,
  },
  errorBoundaryConfig: {
    alwaysShowErrorText: false,
  },
  trackingConfig: {
    enabled: true,
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
    throw new Error('Failed to load server settings');
  }
  const palette = useDefaultPalette
    ? ({ colors: getDefaultThemeSettings().palette.variantColors } as LegacyPalette)
    : await getLegacyPalette(getPaletteName(globals.designSettings), httpClient);
  const serverSettings: ServerSettings = {
    serverThemeSettings: convertToThemeSettings(globals.designSettings, palette, httpClient.url),
    serverLanguage: globals.language,
    serverVersion: globals.version,
    serverFeatures: mapFeatures(globals.features),
  };
  return serverSettings;
}
