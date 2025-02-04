import { HttpClient } from '@sisense/sdk-rest-client';
import { getSettings } from './settings';
import * as mockGlobals from '@/__mocks__/data/mock-globals.json';
import { SYSTEM_TENANT_NAME } from '@/const';

const mockGet = vi.fn().mockImplementation((url) => {
  switch (url) {
    case 'api/globals':
      return Promise.resolve(mockGlobals);
    case 'api/palettes/Vivid':
      return Promise.resolve({
        colors: ['mockColor1', 'mockColor2'],
      });
    default:
      return null;
  }
});

const mockHttpClient: Pick<HttpClient, 'get' | 'url'> = {
  get: mockGet,
  url: 'http://test.com/',
};

describe('getSettings function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns merged application settings', async () => {
    const customConfig = {
      dateConfig: {
        isFiscalOn: true,
        fiscalMonth: 0 as const,
        selectedDateLevel: 'days' as const,
        timeZone: 'UTC',
        weekFirstDay: 1 as const,
      },
      loadingIndicatorConfig: {
        enabled: false,
      },
    };
    const useDefaultPalette = false;
    const settings = await getSettings(customConfig, mockHttpClient, useDefaultPalette);

    expect(settings.dateConfig.isFiscalOn).toBe(true);
    expect(settings.loadingIndicatorConfig.enabled).toBe(false);
    expect(settings.serverThemeSettings.palette?.variantColors).toStrictEqual([
      'mockColor1',
      'mockColor2',
    ]);

    // check if all features are present
    expect(Object.keys(settings.serverFeatures)).toStrictEqual(
      mockGlobals.features.map((f) => f.key),
    );

    expect(mockHttpClient.get).toHaveBeenCalledWith('api/globals');
    expect(mockHttpClient.get).toHaveBeenCalledWith('api/palettes/Vivid');
  });

  it('fetches palette if useDefaultPalette is not specified', async () => {
    await getSettings({}, mockHttpClient);
    expect(mockHttpClient.get).toHaveBeenCalledWith('api/palettes/Vivid');
  });

  it('returns merged application settings with default palette', async () => {
    const customConfig = {
      dateConfig: {
        isFiscalOn: true,
        fiscalMonth: 0 as const,
        selectedDateLevel: 'days' as const,
        timeZone: 'UTC',
        weekFirstDay: 1 as const,
      },
      loadingIndicatorConfig: {
        enabled: false,
      },
    };
    const useDefaultPalette = true;
    const settings = await getSettings(customConfig, mockHttpClient, useDefaultPalette);

    expect(settings.dateConfig.isFiscalOn).toBe(true);
    expect(settings.loadingIndicatorConfig.enabled).toBe(false);
    expect(settings.serverThemeSettings.palette?.variantColors).toStrictEqual([
      '#00cee6',
      '#9b9bd7',
      '#6eda55',
      '#fc7570',
      '#fbb755',
      '#218a8c',
    ]);

    expect(mockHttpClient.get).toHaveBeenCalledWith('api/globals');
    expect(mockHttpClient.get).not.toHaveBeenCalledWith('api/palettes/Vivid');
  });

  it('sets tenant name to defult if there is not tenant in globals', async () => {
    const settings = await getSettings(
      {},
      { get: vi.fn().mockResolvedValue({ ...mockGlobals, user: {} }), url: 'http://test.com/' },
    );
    expect(settings.user.tenant.name).toBe(SYSTEM_TENANT_NAME);
  });
});
