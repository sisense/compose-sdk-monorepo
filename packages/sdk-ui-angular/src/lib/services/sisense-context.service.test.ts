import { ClientApplication, createClientApplication } from '@ethings-os/sdk-ui-preact';
import { firstValueFrom, take, toArray } from 'rxjs';
import { Mock } from 'vitest';

import { SisenseContextConfig, SisenseContextService } from './sisense-context.service';

vi.mock('@ethings-os/sdk-ui-preact', () => ({
  createClientApplication: vi.fn().mockResolvedValue(undefined),
}));

const createClientApplicationMock = createClientApplication as Mock<typeof createClientApplication>;

describe('SisenseContextService', () => {
  let sisenseContextService: SisenseContextService;
  let sisenseConfigMock: SisenseContextConfig;

  beforeEach(() => {
    sisenseConfigMock = {
      url: 'https://example.com/sisense',
      token: 'mocked-token',
      defaultDataSource: 'Sample',
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be created without config', () => {
      sisenseContextService = new SisenseContextService();
      expect(sisenseContextService).toBeTruthy();
      expect(sisenseContextService.isInitialized).toBe(false);
      expect(sisenseContextService.getConfig()).toBeUndefined();
    });

    it('should be created with config and auto-configure', () => {
      sisenseContextService = new SisenseContextService(sisenseConfigMock);
      expect(sisenseContextService).toBeTruthy();
      expect(sisenseContextService.isInitialized).toBe(true);
      expect(sisenseContextService.getConfig()).toEqual({
        ...sisenseConfigMock,
        showRuntimeErrors: true,
      });
    });
  });

  describe('configure', () => {
    beforeEach(() => {
      sisenseContextService = new SisenseContextService();
    });

    it('should configure successfully and emit app state', async () => {
      const mockApp: ClientApplication = { httpClient: {} } as ClientApplication;
      createClientApplicationMock.mockResolvedValue(mockApp);

      await sisenseContextService.setConfig(sisenseConfigMock);

      expect(sisenseContextService.isInitialized).toBe(true);
      expect(createClientApplicationMock).toHaveBeenCalledWith({
        ...sisenseConfigMock,
        showRuntimeErrors: true,
      });

      const app = await sisenseContextService.getApp();
      expect(app).toBe(mockApp);
    });

    it('should handle configuration errors and emit error state', async () => {
      const configError = new Error('Failed to connect to Sisense');
      createClientApplicationMock.mockRejectedValue(configError);

      await sisenseContextService.setConfig(sisenseConfigMock);

      expect(sisenseContextService.isInitialized).toBe(true);

      await expect(sisenseContextService.getApp()).rejects.toThrow('Failed to connect to Sisense');
    });

    it('should set showRuntimeErrors to true by default', async () => {
      const configWithoutRuntimeErrors = {
        url: 'https://example.com/sisense',
        token: 'mocked-token',
        defaultDataSource: 'Sample',
      };

      await sisenseContextService.setConfig(configWithoutRuntimeErrors);

      expect(createClientApplicationMock).toHaveBeenCalledWith({
        ...configWithoutRuntimeErrors,
        showRuntimeErrors: true,
      });
    });

    it('should preserve explicit showRuntimeErrors setting', async () => {
      const configWithRuntimeErrors = {
        ...sisenseConfigMock,
        showRuntimeErrors: false,
      };

      await sisenseContextService.setConfig(configWithRuntimeErrors);

      expect(createClientApplicationMock).toHaveBeenCalledWith(configWithRuntimeErrors);
    });

    it('should allow reconfiguration', async () => {
      const mockApp1 = { httpClient: { baseURL: 'app1' } } as unknown as ClientApplication;
      const mockApp2 = { httpClient: { baseURL: 'app2' } } as unknown as ClientApplication;

      createClientApplicationMock.mockResolvedValueOnce(mockApp1);
      await sisenseContextService.setConfig(sisenseConfigMock);

      const newConfig = {
        url: 'https://new-instance.com/sisense',
        token: 'new-token',
        defaultDataSource: 'NewSample',
      };

      createClientApplicationMock.mockResolvedValueOnce(mockApp2);
      await sisenseContextService.setConfig(newConfig);

      const app = await sisenseContextService.getApp();
      expect(app).toBe(mockApp2);
      expect(createClientApplicationMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('getApp', () => {
    it('should throw error when not initialized', async () => {
      sisenseContextService = new SisenseContextService();

      await expect(sisenseContextService.getApp()).rejects.toThrow(
        'Sisense context is not initialized',
      );
    });

    it('should return app when successfully configured', async () => {
      const mockApp: ClientApplication = { httpClient: {} } as ClientApplication;
      createClientApplicationMock.mockResolvedValue(mockApp);

      sisenseContextService = new SisenseContextService();
      await sisenseContextService.setConfig(sisenseConfigMock);

      const app = await sisenseContextService.getApp();
      expect(app).toBe(mockApp);
    });

    it('should throw error when configuration failed', async () => {
      const configError = new Error('Connection failed');
      createClientApplicationMock.mockRejectedValue(configError);

      sisenseContextService = new SisenseContextService();
      await sisenseContextService.setConfig(sisenseConfigMock);

      await expect(sisenseContextService.getApp()).rejects.toThrow('Connection failed');
    });
  });

  describe('getApp$', () => {
    it('should emit error state when not initialized', async () => {
      sisenseContextService = new SisenseContextService();

      const appState = await firstValueFrom(sisenseContextService.getApp$());

      expect(appState.error).toBeInstanceOf(Error);
      expect(appState.error?.message).toBe('Sisense context is not initialized');
      expect(appState.app).toBeUndefined();
    });

    it('should emit app state when successfully configured', async () => {
      const mockApp: ClientApplication = { httpClient: {} } as ClientApplication;
      createClientApplicationMock.mockResolvedValue(mockApp);

      sisenseContextService = new SisenseContextService();

      const appStatePromise = firstValueFrom(
        sisenseContextService.getApp$().pipe(take(2), toArray()),
      );

      await sisenseContextService.setConfig(sisenseConfigMock);
      const [errorState, successState] = await appStatePromise;

      // First emission should be error (not initialized)
      expect(errorState.error).toBeInstanceOf(Error);
      expect(errorState.error?.message).toBe('Sisense context is not initialized');

      // Second emission should be success
      expect(successState.app).toBe(mockApp);
      expect(successState.error).toBeUndefined();
    });

    it('should emit state changes for reconfiguration', async () => {
      const mockApp1 = { httpClient: { baseURL: 'app1' } } as unknown as ClientApplication;
      const mockApp2 = { httpClient: { baseURL: 'app2' } } as unknown as ClientApplication;

      sisenseContextService = new SisenseContextService();

      const states: any[] = [];
      sisenseContextService.getApp$().subscribe((state) => states.push(state));

      // Initial state should be error
      expect(states).toHaveLength(1);
      expect(states[0].error?.message).toBe('Sisense context is not initialized');

      // First configuration
      createClientApplicationMock.mockResolvedValueOnce(mockApp1);
      await sisenseContextService.setConfig(sisenseConfigMock);

      expect(states).toHaveLength(2);
      expect(states[1].app).toBe(mockApp1);

      // Reconfiguration
      createClientApplicationMock.mockResolvedValueOnce(mockApp2);
      await sisenseContextService.setConfig({
        url: 'https://new-instance.com',
        token: 'new-token',
        defaultDataSource: 'NewSample',
      });

      expect(states).toHaveLength(3);
      expect(states[2].app).toBe(mockApp2);
    });

    it('should provide app state when already initialized', async () => {
      const mockApp: ClientApplication = { httpClient: {} } as ClientApplication;
      createClientApplicationMock.mockResolvedValue(mockApp);

      sisenseContextService = new SisenseContextService();
      await sisenseContextService.setConfig(sisenseConfigMock);

      // Subscribe after initialization
      const appState = await firstValueFrom(sisenseContextService.getApp$());

      expect(appState.app).toBe(mockApp);
      expect(appState.error).toBeUndefined();
    });
  });

  describe('getConfig', () => {
    it('should return normalized config after configuration', async () => {
      sisenseContextService = new SisenseContextService();
      await sisenseContextService.setConfig(sisenseConfigMock);

      const config = sisenseContextService.getConfig();
      expect(config).toEqual({
        ...sisenseConfigMock,
        showRuntimeErrors: true,
      });
    });
  });

  describe('integration scenarios', () => {
    it('should maintain consistent state during error recovery', async () => {
      const mockApp: ClientApplication = { httpClient: {} } as ClientApplication;
      const configError = new Error('Temporary failure');

      createClientApplicationMock.mockRejectedValueOnce(configError).mockResolvedValueOnce(mockApp);

      sisenseContextService = new SisenseContextService();

      // First configuration fails
      await sisenseContextService.setConfig(sisenseConfigMock);
      await expect(sisenseContextService.getApp()).rejects.toThrow('Temporary failure');

      // Second configuration succeeds
      await sisenseContextService.setConfig(sisenseConfigMock);
      const app = await sisenseContextService.getApp();
      expect(app).toBe(mockApp);
    });
  });
});
