import type { HttpClient } from '@sisense/sdk-rest-client';
import type { ThemeOid, CompleteThemeSettings } from '../types';
import {
  type LegacyDesignSettings,
  type LegacyPalette,
  type LegacyPaletteError,
  convertToThemeSettings,
  getPaletteName,
} from './legacy-design-settings';

/**
 * Fetches theme settings from the Sisense instance and converts them to CompleteThemeSettings.
 *
 * @param themeOid - Theme oid.
 * @param httpClient - Sisense REST API client.
 * @returns CompleteThemeSettings from server.
 *
 * @internal
 */
export async function getThemeSettingsByOid(
  themeOid: ThemeOid,
  httpClient: Pick<HttpClient, 'get'>,
): Promise<CompleteThemeSettings> {
  const legacyDesignSettings = await getLegacyDesignSettings(themeOid, httpClient);

  const paletteName = getPaletteName(legacyDesignSettings);
  const legacyPalette = await getLegacyPalette(paletteName, httpClient);
  return convertToThemeSettings(legacyDesignSettings, legacyPalette);
}

async function getLegacyDesignSettings(themeOid: ThemeOid, httpClient: Pick<HttpClient, 'get'>) {
  return httpClient.get<LegacyDesignSettings>(`api/v1/themes/${themeOid}`).catch(() => {
    throw new Error(`Theme with oid ${themeOid} not found in the Sisense instance`);
  });
}

export async function getLegacyPalette(paletteName: string, httpClient: Pick<HttpClient, 'get'>) {
  const legacyPalette = await httpClient.get<LegacyPalette | LegacyPaletteError>(
    `api/palettes/${paletteName}`,
  );
  if ('status' in legacyPalette && legacyPalette.status === 'error') {
    throw new Error(`Palette '${paletteName}' not found in the Sisense instance`);
  }
  return legacyPalette as LegacyPalette;
}
