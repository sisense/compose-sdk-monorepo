/* eslint-disable @typescript-eslint/unbound-method */
/** @vitest-environment jsdom */

import {
  ClientApplication,
  CompleteThemeSettings,
  getDefaultThemeSettings,
  getThemeSettingsByOid,
} from '@ethings-os/sdk-ui-preact';
import { BehaviorSubject, firstValueFrom, take, toArray } from 'rxjs';
import { Mock, Mocked } from 'vitest';

import { ThemeService } from '.';
import { SisenseContextService } from './sisense-context.service';

vi.mock('../decorators/trackable.decorator', () => ({
  TrackableService: (_target: any, _key: string, descriptor: PropertyDescriptor) => descriptor,
}));

vi.mock('@ethings-os/sdk-ui-preact', () => ({
  getDefaultThemeSettings: vi.fn().mockReturnValue({}),
  getThemeSettingsByOid: vi.fn().mockResolvedValue({}),
}));

const getDefaultThemeSettingsMock = getDefaultThemeSettings as Mock<typeof getDefaultThemeSettings>;

const getThemeSettingsByOidMock = getThemeSettingsByOid as Mock<typeof getThemeSettingsByOid>;

/**
 * Helper utility to create delays in async tests.
 *
 * @param ms - Milliseconds to delay (default: 10ms)
 * @returns Promise that resolves after the specified delay
 */
const delay = (ms = 10): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe('ThemeService', () => {
  let themeService: ThemeService;
  let sisenseContextServiceMock: Mocked<SisenseContextService>;
  let appStateSubject: BehaviorSubject<any>;

  beforeEach(() => {
    getDefaultThemeSettingsMock.mockClear();
    getThemeSettingsByOidMock.mockClear();

    // Create a BehaviorSubject to simulate app state changes
    appStateSubject = new BehaviorSubject({
      app: {
        settings: {
          serverThemeSettings: {},
        },
      },
    });

    sisenseContextServiceMock = {
      getApp: vi.fn().mockResolvedValue({
        settings: {
          serverThemeSettings: {},
        },
      }),
      getApp$: vi.fn().mockReturnValue(appStateSubject.asObservable()),
    } as unknown as Mocked<SisenseContextService>;
  });

  it('should be created', () => {
    themeService = new ThemeService(sisenseContextServiceMock);
    expect(themeService).toBeTruthy();
  });

  describe('getThemeSettings', () => {
    it('should return default theme settings if server theme setting are empty', async () => {
      const defaultThemeSettingsMock: CompleteThemeSettings = {
        chart: 'chart-settings',
        palette: 'palette-settings',
        typography: 'typography-settings',
        general: 'general-settings',
      } as unknown as CompleteThemeSettings;
      getDefaultThemeSettingsMock.mockReturnValue(defaultThemeSettingsMock);
      themeService = new ThemeService(sisenseContextServiceMock);

      const themeSettingsObservable = themeService.getThemeSettings();
      const themeSettings = await firstValueFrom(themeSettingsObservable);
      expect(themeSettings).toEqual(defaultThemeSettingsMock);
      expect(getDefaultThemeSettingsMock).toHaveBeenCalledTimes(1);
    });

    it('should return server theme setting instead of default if they are present in app.settings', async () => {
      const defaultThemeSettingsMock: CompleteThemeSettings = {
        chart: 'chart-settings',
        palette: 'palette-settings',
        typography: 'typography-settings',
        general: 'general-settings',
      } as unknown as CompleteThemeSettings;
      const serverThemeSettingsMock = {
        chart: 'server-chart-settings',
        palette: 'server-palette-settings',
        typography: 'server-typography-settings',
        general: 'server-general-settings',
      } as unknown as CompleteThemeSettings;

      getDefaultThemeSettingsMock.mockResolvedValue(defaultThemeSettingsMock);
      sisenseContextServiceMock.getApp.mockResolvedValue({
        settings: {
          serverThemeSettings: serverThemeSettingsMock,
        },
      } as unknown as ClientApplication);

      themeService = new ThemeService(sisenseContextServiceMock);

      const themeSettingsObservable = themeService.getThemeSettings();

      const emittedSettings = (await firstValueFrom(
        themeSettingsObservable.pipe(take(2), toArray()),
      )) as unknown as Promise<CompleteThemeSettings>[];

      const [firstThemeSettings, secondThemeSettings] = emittedSettings;

      expect(await firstThemeSettings).toEqual(defaultThemeSettingsMock);
      expect(await secondThemeSettings).toEqual(serverThemeSettingsMock);

      expect(getDefaultThemeSettingsMock).toHaveBeenCalledTimes(1);
      expect(sisenseContextServiceMock.getApp).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateThemeSettings', () => {
    it('should update theme settings', async () => {
      const defaultThemeSettingsMock: CompleteThemeSettings = {
        chart: 'chart-settings',
        palette: 'palette-settings',
        typography: 'typography-settings',
        general: 'general-settings',
      } as unknown as CompleteThemeSettings;
      getDefaultThemeSettingsMock.mockReturnValue(defaultThemeSettingsMock);
      const newThemeSettingsMock: CompleteThemeSettings = {
        chart: 'new-chart-settings',
        palette: 'new-palette-settings',
        typography: 'new-typography-settings',
        general: 'new-general-settings',
      } as unknown as CompleteThemeSettings;
      getThemeSettingsByOidMock.mockResolvedValue(newThemeSettingsMock);

      themeService = new ThemeService(sisenseContextServiceMock);

      const themeSettingsObservable = themeService.getThemeSettings();
      expect(await firstValueFrom(themeSettingsObservable)).toEqual(defaultThemeSettingsMock);
      await themeService.updateThemeSettings('new-theme-oid');
      expect(await firstValueFrom(themeSettingsObservable)).toEqual(newThemeSettingsMock);

      expect(getThemeSettingsByOidMock).toHaveBeenCalledTimes(1);
      expect(getThemeSettingsByOidMock).toHaveBeenCalledWith('new-theme-oid', undefined);
    });

    it('should handle race condition between initialization and manual theme updates', async () => {
      const defaultThemeSettingsMock: CompleteThemeSettings = {
        chart: 'chart-settings',
        palette: 'palette-settings',
        typography: 'typography-settings',
        general: 'general-settings',
      } as unknown as CompleteThemeSettings;
      const serverThemeSettingsMock = {
        chart: 'server-chart-settings',
        palette: 'server-palette-settings',
      } as unknown as CompleteThemeSettings;
      const manualThemeSettingsMock = {
        typography: 'manual-typography-settings',
        general: 'manual-general-settings',
      } as unknown as CompleteThemeSettings;

      getDefaultThemeSettingsMock.mockReturnValue(defaultThemeSettingsMock);

      // Mock a slow getApp to simulate initialization delay
      let resolveGetApp: (value: ClientApplication) => void = () => {};
      const getAppPromise = new Promise<ClientApplication>((resolve) => {
        resolveGetApp = resolve;
      });
      sisenseContextServiceMock.getApp.mockReturnValue(getAppPromise);

      themeService = new ThemeService(sisenseContextServiceMock);

      // Start manual update immediately during initialization (simulates ngOnInit call)
      const updatePromise = themeService.updateThemeSettings(manualThemeSettingsMock);

      // Verify that updateThemeSettings is waiting for initialization to complete
      // At this point, initialization hasn't completed yet, so theme should still be default
      const themeSettingsObservable = themeService.getThemeSettings();
      const initialThemeSettings = await firstValueFrom(themeSettingsObservable);
      expect(initialThemeSettings).toEqual(defaultThemeSettingsMock);

      // Complete initialization by resolving getApp
      resolveGetApp({
        settings: {
          serverThemeSettings: serverThemeSettingsMock,
        },
      } as ClientApplication);

      // Wait for manual update to complete (which waited for initialization)
      await updatePromise;

      // Verify that manual theme settings are applied after initialization
      const finalThemeSettings = await firstValueFrom(themeSettingsObservable);
      expect(finalThemeSettings).toEqual({
        chart: 'server-chart-settings',
        palette: 'server-palette-settings',
        typography: 'manual-typography-settings',
        general: 'manual-general-settings',
      });
    });

    it('should apply theme updates immediately when initialization is already complete', async () => {
      const defaultThemeSettingsMock: CompleteThemeSettings = {
        chart: 'chart-settings',
        palette: 'palette-settings',
        typography: 'typography-settings',
        general: 'general-settings',
      } as unknown as CompleteThemeSettings;
      const manualThemeSettingsMock = {
        typography: 'manual-typography-settings',
        general: 'manual-general-settings',
      } as unknown as CompleteThemeSettings;

      getDefaultThemeSettingsMock.mockReturnValue(defaultThemeSettingsMock);

      themeService = new ThemeService(sisenseContextServiceMock);

      // Wait for initialization to complete
      await delay(0);

      const themeSettingsObservable = themeService.getThemeSettings();

      // Apply manual theme update after initialization
      await themeService.updateThemeSettings(manualThemeSettingsMock);

      // Verify that manual theme settings are applied immediately
      const finalThemeSettings = await firstValueFrom(themeSettingsObservable);
      expect(finalThemeSettings).toEqual({
        chart: 'chart-settings',
        palette: 'palette-settings',
        typography: 'manual-typography-settings',
        general: 'manual-general-settings',
      });
    });
  });

  describe('app state changes', () => {
    it('should trigger theme update when sisenseContextService app changes', async () => {
      const defaultThemeSettingsMock: CompleteThemeSettings = {
        chart: 'chart-settings',
        palette: 'palette-settings',
        typography: 'typography-settings',
        general: 'general-settings',
      } as unknown as CompleteThemeSettings;

      const initialServerThemeSettings = {
        chart: 'initial-server-chart-settings',
        palette: 'initial-server-palette-settings',
      } as unknown as CompleteThemeSettings;

      const newServerThemeSettings = {
        chart: 'new-server-chart-settings',
        palette: 'new-server-palette-settings',
        typography: 'new-server-typography-settings',
      } as unknown as CompleteThemeSettings;

      getDefaultThemeSettingsMock.mockReturnValue(defaultThemeSettingsMock);

      // Set initial app state
      appStateSubject.next({
        app: {
          settings: {
            serverThemeSettings: initialServerThemeSettings,
          },
        },
      });

      sisenseContextServiceMock.getApp.mockResolvedValue({
        settings: {
          serverThemeSettings: initialServerThemeSettings,
        },
      } as ClientApplication);

      themeService = new ThemeService(sisenseContextServiceMock);

      const themeSettingsObservable = themeService.getThemeSettings();

      // Wait for initial theme to be applied
      await delay(0);

      // Verify initial theme settings (default + initial server settings)
      const initialThemeSettings = await firstValueFrom(themeSettingsObservable);
      expect(initialThemeSettings).toEqual({
        chart: 'initial-server-chart-settings',
        palette: 'initial-server-palette-settings',
        typography: 'typography-settings',
        general: 'general-settings',
      });

      // Mock getApp to return new app with different server theme settings
      sisenseContextServiceMock.getApp.mockResolvedValue({
        settings: {
          serverThemeSettings: newServerThemeSettings,
        },
      } as ClientApplication);

      // Simulate app change by emitting new app state (this triggers the skip(1) subscription)
      appStateSubject.next({
        app: {
          settings: {
            serverThemeSettings: newServerThemeSettings,
          },
        },
      });

      // Wait for theme update to be processed
      await delay();

      // Verify that theme settings were updated with new server settings
      const updatedThemeSettings = await firstValueFrom(themeSettingsObservable);
      expect(updatedThemeSettings).toEqual({
        chart: 'new-server-chart-settings',
        palette: 'new-server-palette-settings',
        typography: 'new-server-typography-settings',
        general: 'general-settings',
      });

      // Verify that getApp was called for initial setup and theme update
      expect(sisenseContextServiceMock.getApp).toHaveBeenCalledTimes(3);
    });

    it('should handle postponed updateThemeSettings when app changes during manual update', async () => {
      const defaultThemeSettingsMock: CompleteThemeSettings = {
        chart: 'chart-settings',
        palette: 'palette-settings',
        typography: 'typography-settings',
        general: 'general-settings',
      } as unknown as CompleteThemeSettings;

      const serverThemeSettings = {
        chart: 'server-chart-settings',
      } as unknown as CompleteThemeSettings;

      const newServerThemeSettings = {
        chart: 'new-server-chart-settings',
        palette: 'new-server-palette-settings',
      } as unknown as CompleteThemeSettings;

      const manualThemeSettings = {
        typography: 'manual-typography-settings',
      } as unknown as CompleteThemeSettings;

      getDefaultThemeSettingsMock.mockReturnValue(defaultThemeSettingsMock);

      // Set initial app state
      appStateSubject.next({
        app: {
          settings: {
            serverThemeSettings,
          },
        },
      });

      sisenseContextServiceMock.getApp.mockResolvedValue({
        settings: {
          serverThemeSettings,
        },
      } as ClientApplication);

      themeService = new ThemeService(sisenseContextServiceMock);

      // Wait for initial theme setup
      await delay(0);

      // Start a manual theme update
      const manualUpdatePromise = themeService.updateThemeSettings(manualThemeSettings);

      // While manual update is in progress, simulate app change
      sisenseContextServiceMock.getApp.mockResolvedValue({
        settings: {
          serverThemeSettings: newServerThemeSettings,
        },
      } as ClientApplication);

      appStateSubject.next({
        app: {
          settings: {
            serverThemeSettings: newServerThemeSettings,
          },
        },
      });

      // Wait for both updates to complete
      await manualUpdatePromise;
      await delay();

      // Verify final theme settings include both manual and new server settings
      const themeSettingsObservable = themeService.getThemeSettings();
      const finalThemeSettings = await firstValueFrom(themeSettingsObservable);

      // The final result should have:
      // - Manual typography setting
      // - New server chart and palette settings
      // - Default general settings
      expect(finalThemeSettings).toEqual({
        chart: 'new-server-chart-settings',
        palette: 'new-server-palette-settings',
        typography: 'manual-typography-settings',
        general: 'general-settings',
      });
    });
  });
});
