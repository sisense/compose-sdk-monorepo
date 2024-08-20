/** @vitest-environment jsdom */
import {
  createContextProviderRenderer,
  CustomSisenseContextProvider,
  CustomThemeProvider,
  type CustomThemeProviderProps,
} from '@sisense/sdk-ui-preact';
import { Mock, Mocked } from 'vitest';
import { firstValueFrom, of, type Observable } from 'rxjs';
import { createSisenseContextConnector, createThemeContextConnector } from './context-connectors';
import { type SisenseContextService } from '../services/sisense-context.service';
import { ThemeService } from '../services';

const contextProviderRendererMock = vi.fn();

vi.mock('@sisense/sdk-ui-preact', () => ({
  createContextProviderRenderer: vi.fn(() => contextProviderRendererMock),
  CustomSisenseContextProvider: vi.fn(),
  CustomThemeProvider: vi.fn(),
}));

const createContextProviderRendererMock = createContextProviderRenderer as Mock<
  Parameters<typeof createContextProviderRenderer>,
  ReturnType<typeof createContextProviderRenderer>
>;

describe('createSisenseContextConnector', () => {
  const sisenseContextConfigMock = {
    showRuntimeErrors: false,
    appConfig: {
      trackingConfig: {
        enabled: true,
      },
    },
  };
  const appMock = {};
  let sisenseContextService: Mocked<SisenseContextService>;

  beforeEach(() => {
    createContextProviderRendererMock.mockClear();
    sisenseContextService = {
      getApp: vi.fn().mockResolvedValue(appMock),
      getConfig: vi.fn().mockReturnValue(sisenseContextConfigMock),
    } as unknown as Mocked<SisenseContextService>;
  });

  it('should return sisense context connector', () => {
    const connector = createSisenseContextConnector(sisenseContextService);

    expect(connector).toBeTruthy();
    expect(connector.prepareContext).toBeTruthy();
    expect(connector.renderContextProvider).toBeTruthy();
  });

  it('should prepare correct sisense context', async () => {
    const connector = createSisenseContextConnector(sisenseContextService);
    const preparedContext = await connector.prepareContext();

    expect(preparedContext).toStrictEqual({
      app: appMock,
      isInitialized: true,
      showRuntimeErrors: sisenseContextConfigMock.showRuntimeErrors,
      tracking: {
        enabled: true,
        packageName: 'sdk-ui-angular',
      },
    });
  });

  it('should render correct custom sisense context provider', () => {
    const connector = createSisenseContextConnector(sisenseContextService);

    expect(connector.renderContextProvider).toBe(contextProviderRendererMock);
    expect(createContextProviderRenderer).toHaveBeenCalledWith(CustomSisenseContextProvider);
  });
});

describe('createThemeContextConnector', () => {
  const themeSettingsMock = {
    someThemeProp: 'someThemeValue',
  };
  let themeService: Mocked<ThemeService>;

  beforeEach(() => {
    createContextProviderRendererMock.mockClear();
    themeService = {
      getThemeSettings: vi.fn().mockReturnValue(of(themeSettingsMock)),
    } as unknown as Mocked<ThemeService>;
  });

  it('should return theme context connector', () => {
    const connector = createThemeContextConnector(themeService);

    expect(connector).toBeTruthy();
    expect(connector.prepareContext).toBeTruthy();
    expect(connector.renderContextProvider).toBeTruthy();
  });

  it('should prepare correct theme context', async () => {
    const connector = createThemeContextConnector(themeService);
    const preparedContext = await firstValueFrom(
      connector.prepareContext() as Observable<CustomThemeProviderProps['context']>,
    );

    expect(preparedContext).toStrictEqual({
      skipTracking: true,
      themeSettings: themeSettingsMock,
    });
  });

  it('should render correct custom theme context provider', () => {
    const connector = createThemeContextConnector(themeService);

    expect(connector.renderContextProvider).toBe(contextProviderRendererMock);
    expect(createContextProviderRenderer).toHaveBeenCalledWith(CustomThemeProvider);
  });
});
