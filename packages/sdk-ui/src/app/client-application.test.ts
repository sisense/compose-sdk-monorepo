import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { getAuthenticator, HttpClient } from '@ethings-os/sdk-rest-client';
import { PivotClient } from '@ethings-os/sdk-pivot-client';
import { DimensionalQueryClient } from '@ethings-os/sdk-query-client';
import { getSettings } from './settings/settings';
import { createClientApplication } from './client-application';
import { TranslatableError } from '../translation/translatable-error';

vi.mock('@ethings-os/sdk-rest-client', () => {
  return {
    HttpClient: vi.fn(),
    getAuthenticator: vi.fn(),
    isWatAuthenticator: vi.fn(),
  };
});

vi.mock('@ethings-os/sdk-query-client', () => ({
  DimensionalQueryClient: vi.fn(),
}));

vi.mock('@ethings-os/sdk-pivot-client', () => ({
  PivotClient: vi.fn(),
}));

vi.mock('./settings/settings', () => ({
  getSettings: vi.fn(),
}));

vi.mock('@/query/execute-query', () => ({
  clearExecuteQueryCache: vi.fn(),
}));

type ClientApplicationParams = Parameters<typeof createClientApplication>[0];

describe('createClientApplication', () => {
  const defaultParams = {
    defaultDataSource: undefined,
    url: 'http://test-url/',
    token: 'test-token',
    wat: null,
    ssoEnabled: false,
    appConfig: {},
    enableSilentPreAuth: false,
    useFusionAuth: false,
  } as ClientApplicationParams;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if url is undefined', async () => {
    await expect(
      createClientApplication({
        ...defaultParams,
        url: undefined,
      } as unknown as ClientApplicationParams),
    ).rejects.toThrow(TranslatableError);
  });

  it('should throw an error if no authenticator is returned', async () => {
    (getAuthenticator as Mock).mockReturnValue(null);

    await expect(createClientApplication(defaultParams)).rejects.toThrow(TranslatableError);
    expect(getAuthenticator).toHaveBeenCalledWith({
      url: defaultParams.url,
      token: defaultParams.token,
      wat: defaultParams.wat,
      ssoEnabled: defaultParams.ssoEnabled,
      enableSilentPreAuth: defaultParams.enableSilentPreAuth,
      useFusionAuth: defaultParams.useFusionAuth,
    });
  });

  it('should create HttpClient, PivotClient, and QueryClient instances', async () => {
    const authMock = {};
    (HttpClient as Mock).mockReturnValue({ login: vi.fn().mockResolvedValue(true) });
    (getSettings as Mock).mockResolvedValue({ user: { tenant: { name: 'system' } } });
    (getAuthenticator as Mock).mockReturnValue(authMock);

    const clientApp = await createClientApplication(defaultParams);

    expect(HttpClient).toHaveBeenCalledWith(
      defaultParams.url,
      authMock,
      expect.stringContaining('sdk-ui'),
    );
    expect(PivotClient).toHaveBeenCalledWith(expect.stringContaining(defaultParams.url), authMock);
    expect(DimensionalQueryClient).toHaveBeenCalledWith(expect.anything(), expect.anything());
    expect(clientApp).toHaveProperty('httpClient');
    expect(clientApp).toHaveProperty('pivotClient');
    expect(clientApp).toHaveProperty('queryClient');
  });

  it('should create PivotClient with URL without tenant sub path', async () => {
    const tenantName = 'tenant1';
    const authMock = {};
    (HttpClient as Mock).mockReturnValue({ login: vi.fn().mockResolvedValue(true) });
    (getSettings as Mock).mockResolvedValue({ user: { tenant: { name: tenantName } } });
    (getAuthenticator as Mock).mockReturnValue(authMock);

    await createClientApplication({ ...defaultParams, url: `${defaultParams.url}${tenantName}/` });

    expect(PivotClient).toHaveBeenCalledWith(defaultParams.url, authMock);
  });
});
