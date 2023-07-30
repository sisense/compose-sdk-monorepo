import type { HttpClient } from '@sisense/sdk-rest-client';
import type { ThemeOid, CompleteThemeSettings } from '../../types';
import {
  type PwcDesignSettings,
  type PwcPalette,
  type PwcPaletteError,
  convertToThemeSettings,
  getPaletteName,
} from './pwc-design-settings';

/**
 * Fetches theme settings from the Sisense instance and converts them to CompleteThemeSettings.
 *
 * @param themeOid - Theme oid.
 * @param httpClient - Sisense REST API client.
 * @returns CompleteThemeSettings from server.
 */
export async function getThemeSettingsByOid(
  themeOid: ThemeOid,
  httpClient: Pick<HttpClient, 'get'>,
): Promise<CompleteThemeSettings> {
  const pwcDesignSettings = await httpClient
    .get<PwcDesignSettings>(`api/v1/themes/${themeOid}`)
    .catch(() => {
      throw new Error(`Theme with oid ${themeOid} not found in the Sisense instance`);
    });

  const paletteName = getPaletteName(pwcDesignSettings);
  const pwcPalette = await httpClient.get<PwcPalette | PwcPaletteError>(
    `api/palettes/${paletteName}`,
  );
  if ('status' in pwcPalette && pwcPalette.status === 'error') {
    throw new Error(
      `Palette '${paletteName}' for the theme '${pwcDesignSettings.name}' not found in the Sisense instance`,
    );
  }

  return convertToThemeSettings(pwcDesignSettings, pwcPalette as PwcPalette);
}
