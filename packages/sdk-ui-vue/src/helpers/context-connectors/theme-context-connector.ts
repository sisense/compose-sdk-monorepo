import type { ContextConnector, CustomThemeProviderProps } from '@sisense/sdk-ui-preact';
import { CustomThemeProvider, DataObserver } from '@sisense/sdk-ui-preact';
import { watchEffect } from 'vue';

import { getThemeContext } from '../../providers';

/**
 * Creates theme context connector
 * @internal
 */
export const createThemeContextConnector = (): ContextConnector<CustomThemeProviderProps> => {
  const defaultThemeContext = {
    skipTracking: true,
  };
  const themeContext = getThemeContext();
  const propsObserver = new DataObserver<CustomThemeProviderProps>({
    context: {
      ...defaultThemeContext,
      ...(themeContext.value && {
        themeSettings: themeContext?.value,
      }),
    },
  });

  watchEffect(() => {
    propsObserver.setValue({
      context: {
        ...defaultThemeContext,
        ...(themeContext.value && {
          themeSettings: themeContext.value,
        }),
      },
    });
  });

  return {
    propsObserver,
    providerComponent: CustomThemeProvider,
  };
};
