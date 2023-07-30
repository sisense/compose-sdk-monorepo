import type { HttpClient } from '@sisense/sdk-rest-client';
import { getThemeSettingsByOid } from './theme-loader';
import { PwcDesignSettings, PwcPalette } from './pwc-design-settings';
import { ThemeOid, ThemeSettings } from '../../types';
import {
  corporatePalette,
  redPwcDesignSettings,
  redThemeSettings,
} from './__mocks__/pwc-design-settings.mock';

describe('getThemeSettingsByOid', () => {
  const httpClientMock: jest.Mocked<Pick<HttpClient, 'get'>> = {
    get: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the converted theme settings when successful', async () => {
    const pwcDesignSettings: PwcDesignSettings = redPwcDesignSettings;
    const themeOid: ThemeOid = pwcDesignSettings.oid;

    const pwcPalette: PwcPalette = corporatePalette;
    const paletteName = pwcPalette.name;

    const expectedThemeSettings: ThemeSettings = redThemeSettings;

    httpClientMock.get.mockResolvedValueOnce(pwcDesignSettings);
    httpClientMock.get.mockResolvedValueOnce(pwcPalette);

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
    const pwcDesignSettings: PwcDesignSettings = redPwcDesignSettings;
    const themeOid: ThemeOid = pwcDesignSettings.oid;

    const errorResponse = {
      status: 'error',
      message: 'Palette not found',
    };

    httpClientMock.get.mockResolvedValueOnce(pwcDesignSettings);
    httpClientMock.get.mockResolvedValueOnce(errorResponse);

    return expect(getThemeSettingsByOid(themeOid, httpClientMock)).rejects.toThrow(/not found/);
  });
});
