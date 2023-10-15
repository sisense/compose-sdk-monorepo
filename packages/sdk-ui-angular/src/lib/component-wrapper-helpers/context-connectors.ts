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

export const createSisenseContextConnector = (
  sisenseContextService: SisenseContextService,
): ContextConnector<CustomSisenseContext> => {
  return {
    async prepareContext() {
      const { enableTracking, showRuntimeErrors } = sisenseContextService.getConfig();
      const app = await sisenseContextService.getApp();

      return {
        app,
        isInitialized: true,
        enableTracking,
        showRuntimeErrors,
      } as CustomSisenseContext;
    },
    renderContextProvider: createContextProviderRenderer(CustomSisenseContextProvider),
  };
};
