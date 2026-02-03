import { PivotQueryClient } from '@sisense/sdk-pivot-query-client';
import { DimensionalQueryClient } from '@sisense/sdk-query-client';
import { getAuthenticator, HttpClient } from '@sisense/sdk-rest-client';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { TranslatableError } from '../translation/translatable-error';
import { createClientApplication } from './client-application';
import { getSettings } from './settings/settings';

vi.mock('@sisense/sdk-rest-client', () => {
  return {
    HttpClient: vi.fn(),
    getAuthenticator: vi.fn(),
    isWatAuthenticator: vi.fn(),
  };
});

vi.mock('@sisense/sdk-query-client', () => ({
  DimensionalQueryClient: vi.fn(),
}));

vi.mock('@sisense/sdk-pivot-query-client', () => ({
  PivotQueryClient: vi.fn(),
}));

vi.mock('./settings/settings', () => ({
  getSettings: vi.fn(),
}));

vi.mock('@/domains/query-execution/core/execute-query', () => ({
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

  it('should create HttpClient, PivotQueryClient, and QueryClient instances', async () => {
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
    expect(PivotQueryClient).toHaveBeenCalledWith(
      expect.stringContaining(defaultParams.url),
      authMock,
    );
    expect(DimensionalQueryClient).toHaveBeenCalledWith(expect.anything(), expect.anything());
    expect(clientApp).toHaveProperty('httpClient');
    expect(clientApp).toHaveProperty('pivotQueryClient');
    expect(clientApp).toHaveProperty('queryClient');
  });

  it('should create PivotClient with URL without tenant sub path', async () => {
    const tenantName = 'tenant1';
    const authMock = {};
    (HttpClient as Mock).mockReturnValue({ login: vi.fn().mockResolvedValue(true) });
    (getSettings as Mock).mockResolvedValue({ user: { tenant: { name: tenantName } } });
    (getAuthenticator as Mock).mockReturnValue(authMock);

    await createClientApplication({ ...defaultParams, url: `${defaultParams.url}${tenantName}/` });

    expect(PivotQueryClient).toHaveBeenCalledWith(defaultParams.url, authMock);
  });
});
