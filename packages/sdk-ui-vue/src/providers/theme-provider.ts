import { defineComponent, inject, provide, ref, watch } from 'vue';
import type { PropType, InjectionKey, Ref } from 'vue';
import type { CompleteThemeSettings, ThemeProviderProps } from '@sisense/sdk-ui-preact';
import {
  createContextProviderRenderer,
  CustomThemeProvider,
  getDefaultThemeSettings,
  getThemeSettingsByOid,
} from '@sisense/sdk-ui-preact';
import { createSisenseContextConnector } from './sisense-context-provider';
import merge from 'ts-deepmerge';

const themeContextConfigKey = Symbol() as InjectionKey<{
  themeSettings: Ref<CompleteThemeSettings>;
}>;

/**
 * Gets Theme context
 */
export const getThemeContext = () => {
  // TODO needs to review this logic along with that in setup()
  const themeContext = inject(themeContextConfigKey)!;
  return themeContext?.themeSettings?.value ?? getDefaultThemeSettings();
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
    theme: [Object, String] as PropType<ThemeProviderProps['theme'] | string>,
    /**
     * @internal
     */
    skipTracking: Boolean as PropType<ThemeProviderProps['skipTracking']>,
  },

  async setup({ theme: propTheme, skipTracking = false }, { slots }) {
    const themeSettings = ref();
    provide(themeContextConfigKey, { themeSettings: themeSettings });

    watch(
      () => propTheme,
      async (newPropTheme) => {
        if (newPropTheme && typeof newPropTheme === 'object') {
          themeSettings.value = {
            ...getDefaultThemeSettings(),
            ...(newPropTheme as ThemeProviderProps),
          };
        } else if (newPropTheme && typeof newPropTheme === 'string') {
          try {
            const ctx = createSisenseContextConnector();
            const { app } = await ctx.prepareContext();
            const userThemeSettings = await getThemeSettingsByOid(newPropTheme, app.httpClient);
            themeSettings.value = merge.withOptions(
              { mergeArrays: false },
              getDefaultThemeSettings(),
              userThemeSettings,
            ) as CompleteThemeSettings;
          } catch (error) {
            console.error('Vue ThemeProvider failed to fetch theme by id:', error);
          }
        }
      },
      { immediate: true },
    );

    return () => (themeSettings.value ? slots.default?.() : null);
  },
});
