import { HttpClient } from '@sisense/sdk-rest-client';
import merge from 'ts-deepmerge';
import { getBaseDateFnsLocale } from '../../chart-data-processor/data-table-date-period.js';
import { getDefaultThemeSettings } from '../../chart-options-processor/theme-option-service.js';

import { defaultDateConfig } from '../../query/date-formats';
import {
  getPaletteName,
  convertToThemeSettings,
  LegacyPalette,
} from '../../themes/legacy-design-settings.js';
import { getLegacyPalette } from '../../themes/theme-loader';
import { AppConfig, ThemeSettings } from '../../types';
import { GlobalsObject } from './types';

/**
 * Application settings
 */
export type AppSettings = Required<ConfigurableAppSettings> & ServerSettings;

/**
 * Application settings that can be overridden by the user
 */
type ConfigurableAppSettings = AppConfig;

type ServerSettings = {
  serverThemeSettings: ThemeSettings;
  serverLanguage: string;
  serverVersion: string;
};

const defaultAppConfig = { locale: getBaseDateFnsLocale(), dateConfig: defaultDateConfig };

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
  httpClient: Pick<HttpClient, 'get'>,
  isWat: boolean,
): Promise<AppSettings> {
  const serverSettings = await loadServerSettings(httpClient, isWat);
  return merge.withOptions(
    { mergeArrays: false },
    defaultAppConfig,
    serverSettings,
    customConfig,
  ) as AppSettings;
}

/**
 * Loads the server settings
 *
 * @param httpClient - Sisense REST API client
 * @param isWat - Whether the application is running with WAT authentication
 * @returns - Server settings
 */
async function loadServerSettings(
  httpClient: Pick<HttpClient, 'get'>,
  isWat: boolean,
): Promise<ServerSettings> {
  const globals = await httpClient.get<GlobalsObject>('api/globals');
  // TODO: Remove this once the server will be able to return the palette under the WAT
  const palette = isWat
    ? ({ colors: getDefaultThemeSettings().palette.variantColors } as LegacyPalette)
    : await getLegacyPalette(getPaletteName(globals.designSettings), httpClient);
  const serverSettings: ServerSettings = {
    serverThemeSettings: convertToThemeSettings(globals.designSettings, palette),
    serverLanguage: globals.language,
    serverVersion: globals.version,
  };
  return serverSettings;
}
