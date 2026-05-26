import { HttpClient } from '@sisense/sdk-rest-client';

import * as mockGlobals from '@/__mocks__/data/mock-globals.json';
import * as mockSystemSettings from '@/__mocks__/data/mock-system-settings.json';
import { SYSTEM_TENANT_NAME } from '@/shared/const';

import { getSettings } from './settings';

const mockGet = vi.fn().mockImplementation((url) => {
  switch (url) {
    case 'api/globals':
      return Promise.resolve(mockGlobals);
    case 'api/v2/settings/ai':
      return Promise.resolve({
        narration: { enabled: false, sisenseAIEnabled: false },
      });
    case 'api/v1/settings/system':
      return Promise.resolve(mockSystemSettings);
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

    expect(settings.ai.featureFlags.nlqV3Enabled).toBe(true);
    expect(settings.ai.featureFlags.naturalResponseEnabled).toBe(false);
    expect(settings.ai.featureFlags.queryDefinition).toBe(false);
    expect(settings.ai.featureFlags.completionV2).toBe(false);
    expect(settings.ai.quotaNotification).toBe(true);
    expect(settings.ai.featureModelType).toBe('sisense_managed');
    expect(settings.ai.aiStudio.realtime).toBe(false);
    expect(settings.ai.aiStudio.usageDisplay).toBe(false);
    expect(settings.user.firstName).toBe('Test');
    expect(settings.user.lastName).toBe('Test');
    expect(settings.user.email).toBe('admin@sisense.com');
    expect(settings.fusionBrand.documentationUrl).toBeNull();
    expect(settings.fusionDesignSettings).toBeDefined();
    expect(settings.fusionDesignSettings.general.brandColor).toBe('#ffcb05');
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

  it('does not set flattened featureModelType when aiAssistant feature is absent', async () => {
    const globalsWithoutAiAssistant = {
      ...mockGlobals,
      features: mockGlobals.features.filter((f) => f.key !== 'aiAssistant'),
    };

    const settings = await getSettings(
      {},
      {
        get: vi.fn().mockImplementation((url: string) => {
          switch (url) {
            case 'api/globals':
              return Promise.resolve(globalsWithoutAiAssistant);
            case 'api/v2/settings/ai':
              return Promise.resolve({
                narration: { enabled: false, sisenseAIEnabled: false },
              });
            case 'api/v1/settings/system':
              return Promise.resolve(mockSystemSettings);
            case 'api/palettes/Vivid':
              return Promise.resolve({
                colors: ['mockColor1', 'mockColor2'],
              });
            default:
              return null;
          }
        }),
        url: 'http://test.com/',
      },
      false,
    );

    expect(settings.ai.featureModelType).toBeUndefined();
  });

  it('allows consumers to read arbitrary loosely-typed feature flags from ai.featureFlags', async () => {
    const settings = await getSettings({}, mockHttpClient, false);

    // Index-signature access for forward-compat flags not yet known to CSDK.
    // Unknown keys must be readable (typed `boolean | undefined`) without a CSDK type bump.
    expect(settings.ai.featureFlags.someFutureFlag).toBeUndefined();
  });
});
