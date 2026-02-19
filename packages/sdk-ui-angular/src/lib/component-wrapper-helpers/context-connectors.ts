import {
  ContextConnector,
  CustomSisenseContextProvider,
  CustomSisenseContextProviderProps,
  CustomThemeProvider,
  CustomThemeProviderProps,
  CustomWidgetsProviderAdapter,
  CustomWidgetsProviderAdapterProps,
  DataObserver,
} from '@sisense/sdk-ui-preact';

import { CustomWidgetsService } from '../services/custom-widgets.service';
import { SisenseContextService } from '../services/sisense-context.service';
import { ThemeService } from '../services/theme.service';

/**
 * Creates theme context connector
 *
 * @param themeService - The theme service
 * @internal
 */
export const createThemeContextConnector = (
  themeService: ThemeService,
): ContextConnector<CustomThemeProviderProps> => {
  const themeSettings$ = themeService.getThemeSettings();
  const propsObserver = new DataObserver<CustomThemeProviderProps>();

  themeSettings$.subscribe({
    next: (themeSettings) => {
      propsObserver.setValue({
        context: {
          skipTracking: true,
          themeSettings,
        },
      });
    },
    error: (error: Error) => {
      propsObserver.setValue({
        error,
      });
    },
  });

  return {
    propsObserver,
    providerComponent: CustomThemeProvider,
  };
};

function getBaseSisenseContext(sisenseContextService: SisenseContextService) {
  const { showRuntimeErrors, appConfig } = sisenseContextService.getConfig() ?? {};
  return {
    isInitialized: sisenseContextService.isInitialized,
    tracking: {
      // if tracking is configured in appConfig, use it
      // if none is set, default to true
      enabled: appConfig?.trackingConfig?.enabled ?? true,
      packageName: 'sdk-ui-angular',
    },
    errorBoundary: {
      showErrorBox: showRuntimeErrors ?? true,
    },
  };
}

/**
 * Creates Sisense context connector
 *
 * @param sisenseContextService - The Sisense context service
 * @internal
 */
export const createSisenseContextConnector = (
  sisenseContextService: SisenseContextService,
): ContextConnector<CustomSisenseContextProviderProps> => {
  const propsObserver = new DataObserver<CustomSisenseContextProviderProps>({
    context: getBaseSisenseContext(sisenseContextService),
  });

  sisenseContextService.getApp$().subscribe({
    next: ({ app, error }) => {
      if (error) {
        propsObserver.setValue({
          error,
        });
        return;
      }
      propsObserver.setValue({
        context: {
          ...getBaseSisenseContext(sisenseContextService),
          app,
        },
      });
    },
    error: (error: Error) => {
      propsObserver.setValue({
        error,
      });
    },
  });

  return {
    propsObserver,
    providerComponent: CustomSisenseContextProvider,
  };
};

/**
 * Creates custom widgets context connector
 *
 * @param customWidgetsService - The custom widgets service
 * @internal
 */
export const createCustomWidgetsContextConnector = (
  customWidgetsService: CustomWidgetsService,
): ContextConnector<CustomWidgetsProviderAdapterProps> => {
  const { customWidgetsMap$ } = customWidgetsService;
  const propsObserver = new DataObserver<CustomWidgetsProviderAdapterProps>();

  customWidgetsMap$.subscribe({
    next: (customWidgetsMap) => {
      propsObserver.setValue({
        context: {
          customWidgetsMap: customWidgetsMap,
        },
      });
    },
    error: (error: Error) => {
      propsObserver.setValue({
        error,
      });
    },
  });

  return {
    propsObserver,
    providerComponent: CustomWidgetsProviderAdapter,
  };
};
