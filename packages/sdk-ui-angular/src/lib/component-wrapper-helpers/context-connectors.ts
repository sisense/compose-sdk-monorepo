import {
  ContextConnector,
  createContextProviderRenderer,
  CustomSisenseContext,
  CustomSisenseContextProvider,
  CustomThemeProvider,
  CustomThemeProviderProps,
} from '@sisense/sdk-ui-preact';
import { map } from 'rxjs';
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
): ContextConnector<CustomThemeProviderProps['context']> => {
  return {
    prepareContext() {
      return themeService.getThemeSettings().pipe(
        map((themeSettings) => ({
          themeSettings,
          skipTracking: true,
        })),
      );
    },
    renderContextProvider: createContextProviderRenderer(CustomThemeProvider),
  };
};

/**
 * Creates Sisense context connector
 *
 * @param sisenseContextService - The Sisense context service
 * @internal
 */
export const createSisenseContextConnector = (
  sisenseContextService: SisenseContextService,
): ContextConnector<CustomSisenseContext> => {
  return {
    async prepareContext() {
      const { enableTracking, showRuntimeErrors, appConfig } = sisenseContextService.getConfig();
      const app = await sisenseContextService.getApp();
      return {
        app,
        isInitialized: true,
        showRuntimeErrors,
        tracking: {
          // if tracking is configured in appConfig, use it, otherwise use enableTracking
          // if none is set, default to true
          enabled:
            appConfig?.trackingConfig?.enabled !== undefined
              ? appConfig.trackingConfig.enabled
              : enableTracking ?? true,
          packageName: 'sdk-ui-angular',
        },
      } as CustomSisenseContext;
    },
    renderContextProvider: createContextProviderRenderer(CustomSisenseContextProvider),
  };
};
