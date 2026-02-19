import type { HttpClient } from '@sisense/sdk-rest-client';

import type { CompleteThemeSettings, ThemeOid } from '../../types';
import { TranslatableError } from '../translation/translatable-error';
import {
  convertToThemeSettings,
  getPaletteName,
  type LegacyDesignSettings,
  type LegacyPalette,
  type LegacyPaletteError,
} from './legacy-design-settings';

/**
 * Fetches theme settings from the Sisense instance and converts them to CompleteThemeSettings.
 *
 * @param themeOid - Theme oid.
 * @param httpClient - Sisense REST API client.
 * @returns CompleteThemeSettings from server.
 * @internal
 */
export async function getThemeSettingsByOid(
  themeOid: ThemeOid,
  httpClient: Pick<HttpClient, 'get' | 'url'>,
): Promise<CompleteThemeSettings> {
  const legacyDesignSettings = await getLegacyDesignSettings(themeOid, httpClient);

  if (!legacyDesignSettings) {
    throw new TranslatableError('errors.themeNotFound', { themeOid });
  }

  const paletteName = getPaletteName(legacyDesignSettings);
  const legacyPalette = await getLegacyPalette(paletteName, httpClient);
  return convertToThemeSettings(legacyDesignSettings, legacyPalette, httpClient.url);
}

async function getLegacyDesignSettings(themeOid: ThemeOid, httpClient: Pick<HttpClient, 'get'>) {
  return httpClient.get<LegacyDesignSettings>(`api/v1/themes/${themeOid}`).catch(() => {
    throw new TranslatableError('errors.themeNotFound', { themeOid });
  });
}

export async function getLegacyPalette(paletteName: string, httpClient: Pick<HttpClient, 'get'>) {
  const legacyPalette = await httpClient.get<LegacyPalette | LegacyPaletteError>(
    `api/palettes/${paletteName}`,
  );
  if (legacyPalette && 'status' in legacyPalette && legacyPalette.status === 'error') {
    throw new TranslatableError('errors.paletteNotFound', { paletteName });
  }
  return legacyPalette as LegacyPalette;
}
