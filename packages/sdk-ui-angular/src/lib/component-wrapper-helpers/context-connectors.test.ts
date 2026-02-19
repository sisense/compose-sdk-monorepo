/** @vitest-environment jsdom */
import {
  ClientApplication,
  CustomSisenseContext,
  CustomSisenseContextProvider,
  CustomThemeProvider,
} from '@sisense/sdk-ui-preact';
import { of } from 'rxjs';
import { Mocked } from 'vitest';

import { ThemeService } from '../services';
import { type SisenseContextService } from '../services/sisense-context.service';
import { createSisenseContextConnector, createThemeContextConnector } from './context-connectors';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    sisenseContextService = {
      getApp: vi.fn().mockResolvedValue(appMock),
      getApp$: vi.fn().mockReturnValue(of({ app: appMock })),
      getConfig: vi.fn().mockReturnValue(sisenseContextConfigMock),
      isInitialized: true,
    } as unknown as Mocked<SisenseContextService>;
  });

  it('should return sisense context connector', () => {
    const connector = createSisenseContextConnector(sisenseContextService);

    expect(connector).toBeTruthy();
    expect(connector.propsObserver).toBeTruthy();
    expect(connector.providerComponent).toBeTruthy();
  });

  it('should prepare correct sisense context provider props', async () => {
    const connector = createSisenseContextConnector(sisenseContextService);
    const expectedContext: CustomSisenseContext = {
      app: appMock as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: true,
        packageName: 'sdk-ui-angular',
      },
      errorBoundary: {
        showErrorBox: sisenseContextConfigMock.showRuntimeErrors,
      },
    };

    // Wait for the promise to resolve
    await delay(0);

    expect(connector.propsObserver.getValue()?.context).toStrictEqual(expectedContext);
  });

  it('should render correct custom sisense context provider', () => {
    const connector = createSisenseContextConnector(sisenseContextService);

    expect(connector.providerComponent).toBe(CustomSisenseContextProvider);
  });
});

describe('createThemeContextConnector', () => {
  const themeSettingsMock = {
    someThemeProp: 'someThemeValue',
  };
  let themeService: Mocked<ThemeService>;

  beforeEach(() => {
    themeService = {
      getThemeSettings: vi.fn().mockReturnValue(of(themeSettingsMock)),
    } as unknown as Mocked<ThemeService>;
  });

  it('should return theme context connector', () => {
    const connector = createThemeContextConnector(themeService);

    expect(connector).toBeTruthy();
    expect(connector.propsObserver).toBeTruthy();
    expect(connector.providerComponent).toBeTruthy();
  });

  it('should prepare correct theme context props', async () => {
    const connector = createThemeContextConnector(themeService);

    // Wait for the observable to emit
    await delay(0);

    expect(connector.propsObserver.getValue()?.context).toStrictEqual({
      skipTracking: true,
      themeSettings: themeSettingsMock,
    });
  });

  it('should render correct custom theme context provider', () => {
    const connector = createThemeContextConnector(themeService);

    expect(connector.providerComponent).toBe(CustomThemeProvider);
  });
});
