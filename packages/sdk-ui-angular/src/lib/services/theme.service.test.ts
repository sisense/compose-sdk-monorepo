/* eslint-disable @typescript-eslint/unbound-method */
/** @vitest-environment jsdom */

import {
  ClientApplication,
  CompleteThemeSettings,
  getDefaultThemeSettings,
  getThemeSettingsByOid,
} from '@sisense/sdk-ui-preact';
import { firstValueFrom, take, toArray } from 'rxjs';
import { Mock, Mocked } from 'vitest';

import { ThemeService } from '.';
import { SisenseContextService } from './sisense-context.service';

vi.mock('../decorators/trackable.decorator', () => ({
  TrackableService: (_target: any, _key: string, descriptor: PropertyDescriptor) => descriptor,
}));

vi.mock('@sisense/sdk-ui-preact', () => ({
  getDefaultThemeSettings: vi.fn().mockReturnValue({}),
  getThemeSettingsByOid: vi.fn().mockResolvedValue({}),
}));

const getDefaultThemeSettingsMock = getDefaultThemeSettings as Mock<typeof getDefaultThemeSettings>;

const getThemeSettingsByOidMock = getThemeSettingsByOid as Mock<typeof getThemeSettingsByOid>;

describe('ThemeService', () => {
  let themeService: ThemeService;
  let sisenseContextServiceMock: Mocked<SisenseContextService>;

  beforeEach(() => {
    getDefaultThemeSettingsMock.mockClear();
    getThemeSettingsByOidMock.mockClear();

    sisenseContextServiceMock = {
      getApp: vi.fn().mockResolvedValue({
        settings: {
          serverThemeSettings: {},
        },
      }),
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
      await new Promise((resolve) => setTimeout(resolve, 0));

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
});
