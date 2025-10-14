import type { HttpClient } from '@sisense/sdk-rest-client';
import { Mocked } from 'vitest';

import { ThemeOid, ThemeSettings } from '../types';
import {
  corporatePalette,
  redLegacyDesignSettings,
  redThemeSettings,
} from './__mocks__/legacy-design-settings.mock.js';
import { LegacyDesignSettings, LegacyPalette } from './legacy-design-settings';
import { getThemeSettingsByOid } from './theme-loader';

describe('getThemeSettingsByOid', () => {
  const httpClientMock: Mocked<Pick<HttpClient, 'get' | 'url'>> = {
    get: vi.fn().mockImplementation(() => {}),
    url: 'http://test.com/',
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return the converted theme settings when successful', async () => {
    const legacyDesignSettings: LegacyDesignSettings = redLegacyDesignSettings;
    const themeOid: ThemeOid = legacyDesignSettings.oid;

    const legacyPalette: LegacyPalette = corporatePalette;
    const paletteName = legacyPalette.name;

    const expectedThemeSettings: ThemeSettings = redThemeSettings;

    httpClientMock.get.mockResolvedValueOnce(legacyDesignSettings);
    httpClientMock.get.mockResolvedValueOnce(legacyPalette);

    const themeSettings = await getThemeSettingsByOid(themeOid, httpClientMock);
    expect(httpClientMock.get).toHaveBeenCalledTimes(2);
    expect(httpClientMock.get).toHaveBeenCalledWith(`api/v1/themes/${themeOid}`);
    expect(httpClientMock.get).toHaveBeenCalledWith(`api/palettes/${paletteName}`);
    expect(themeSettings).toEqual(expectedThemeSettings);
  });

  it('should throw an Error when the theme is not found', () => {
    const themeOid: ThemeOid = 'unexisting-theme-oid';

    httpClientMock.get.mockRejectedValueOnce(new Error('Request failed'));

    return expect(getThemeSettingsByOid(themeOid, httpClientMock)).rejects.toThrow(/not found/);
  });

  it('should throw an Error when the palette is not found', () => {
    const legacyDesignSettings: LegacyDesignSettings = redLegacyDesignSettings;
    const themeOid: ThemeOid = legacyDesignSettings.oid;

    const errorResponse = {
      status: 'error',
      message: 'Palette not found',
    };

    httpClientMock.get.mockResolvedValueOnce(legacyDesignSettings);
    httpClientMock.get.mockResolvedValueOnce(errorResponse);

    return expect(getThemeSettingsByOid(themeOid, httpClientMock)).rejects.toThrow(/not found/);
  });
});
