import { defineComponent, inject, provide } from 'vue';
import type { PropType, InjectionKey } from 'vue';
import type { CompleteThemeSettings, ThemeProviderProps } from '@sisense/sdk-ui-preact';
import {
  createContextProviderRenderer,
  CustomThemeProvider,
  getDefaultThemeSettings,
} from '@sisense/sdk-ui-preact';

const themeContextConfigKey = Symbol() as InjectionKey<{
  themeSettings: CompleteThemeSettings;
}>;

/**
 * Gets Theme context
 */
export const getThemeContext = () => {
  // TODO needs to review this logic along with that in setup()
  const themeContext = inject(themeContextConfigKey)!;
  return themeContext?.themeSettings ?? getDefaultThemeSettings();
};

/**
 * Creates theme context connector
 */
export const createThemeContextConnector = () => {
  return {
    async prepareContext() {
      const themeSettings = getThemeContext();
      return {
        themeSettings,
        skipTracking: true,
      };
    },
    renderContextProvider: createContextProviderRenderer(CustomThemeProvider),
  };
};

/**
 * Theme Provider
 */
export const ThemeProvider = defineComponent({
  props: {
    theme: Object as PropType<ThemeProviderProps['theme']>,
    /**
     * @internal
     */
    skipTracking: Boolean as PropType<ThemeProviderProps['skipTracking']>,
  },

  setup({ theme: propTheme, skipTracking = false }, { slots }) {
    let theme = {
      ...getDefaultThemeSettings(),
    };
    if (propTheme && typeof propTheme === 'object') {
      theme = {
        ...theme,
        ...(propTheme as ThemeProviderProps),
      };
    }
    // TODO: add support for string theme and skip tracking
    else if (propTheme && typeof propTheme === 'string') {
      // make call to get theme settings
      // theme = await getThemeSettingsByOid(theme, app.httpClient);
    }
    provide(themeContextConfigKey, {
      themeSettings: theme,
    });
    return () => slots.default?.();
  },
});
