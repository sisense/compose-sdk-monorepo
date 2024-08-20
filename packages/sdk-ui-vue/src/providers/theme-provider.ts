import { defineComponent, inject, provide, ref, watchEffect } from 'vue';
import type { PropType, InjectionKey, Ref } from 'vue';
import type { CompleteThemeSettings, ThemeProviderProps } from '@sisense/sdk-ui-preact';
import {
  createContextProviderRenderer,
  CustomThemeProvider,
  getDefaultThemeSettings,
  getThemeSettingsByOid,
} from '@sisense/sdk-ui-preact';
import { getSisenseContext } from './sisense-context-provider';
import merge from 'ts-deepmerge';

const themeContextConfigKey = Symbol('themeContextConfigKey') as InjectionKey<
  Ref<CompleteThemeSettings>
>;

/**
 * Gets Theme context
 */
export const getThemeContext = () => {
  // TODO needs to review this logic along with that in setup()
  return inject(themeContextConfigKey);
};

/**
 * Creates theme context connector
 * @internal
 */
export const createThemeContextConnector = (
  themeSettings: CompleteThemeSettings = getDefaultThemeSettings(),
) => {
  return {
    async prepareContext() {
      return {
        themeSettings,
        skipTracking: true,
      };
    },
    renderContextProvider: createContextProviderRenderer(CustomThemeProvider),
  };
};

/**
 * Theme provider, which allows you to adjust the look and feel of child components.
 *
 * Components not wrapped in a theme provider use the current theme from the connected Fusion instance by default.
 *
 * @example
 * Example of a theme provider, which changes the colors and font of the nested indicator chart:
 * ```vue
 * <template>
 *   <ThemeProvider :theme="customTheme">
 *     <IndicatorChart .... />
 *   </ThemeProvider>
 * </template>
 *
 * <script>
 * import { ref } from 'vue';
 * import ThemeProvider from './ThemeProvider.vue';
 *
 * export default {
 *   components: { ThemeProvider },
 *   setup() {
 *     const customTheme = ref({
         chart: {
           backgroundColor: '#333333',
           textColor: 'orange',
           secondaryTextColor: 'purple',
         },
         typography: {
           fontFamily: 'impact',
         },
 *     });
 *
 *     return { customTheme };
 *   }
 * };
 * </script>
 * ```
 *
 * Alternatively, to fetch theme settings based on a theme ID:
 * ```vue
 * <template>
 *   <ThemeProvider :theme="'theme_id_string'">
 *     <!-- Components that will use the fetched theme settings -->
 *   </ThemeProvider>
 * </template>
 * ```
 *
 * Indicator chart with custom theme settings:
 * <img src="media://indicator-chart-example-2.png" width="400px" />
 *
 *
 * For comparison, indicator chart with default theme settings:
 *
 * <img src="media://indicator-chart-example-1.png" width="400px" />
 * @see {@link ThemeSettings} and {@link IndicatorChart}
 * @param props - Theme provider props
 * @returns A Theme Provider component * @prop {Object | String} theme - Theme settings object for custom themes or a string identifier to fetch theme settings. When provided as an object, it merges with the default theme settings. When provided as a string, it attempts to fetch theme settings using the provided ID.
 * @prop {Boolean} skipTracking [internal] - Specifies whether to skip tracking of theme usage. Intended for internal use and debugging purposes.
 * @group Contexts
 */
export const ThemeProvider = defineComponent({
  props: {
    theme: [Object, String] as PropType<ThemeProviderProps['theme'] | string>,
    /**
     * @internal
     */
    skipTracking: Boolean as PropType<ThemeProviderProps['skipTracking']>,
  },

  setup({ theme: propTheme, skipTracking = false }, { slots }) {
    // todo: move the symbol into here so every instance of theme provider has its own symbol and therefor configurations
    const themeSettings = ref();
    const context = getSisenseContext();
    if (propTheme && typeof propTheme === 'object') {
      themeSettings.value = merge.withOptions(
        { mergeArrays: false },
        getDefaultThemeSettings(),
        propTheme,
      ) as CompleteThemeSettings;
    }
    watchEffect(async () => {
      const { app } = context.value;
      if (propTheme && typeof propTheme === 'string' && app) {
        try {
          const userThemeSettings = await getThemeSettingsByOid(propTheme, app.httpClient);
          themeSettings.value = merge.withOptions(
            { mergeArrays: false },
            getDefaultThemeSettings(),
            userThemeSettings,
          ) as unknown as CompleteThemeSettings;
        } catch (error) {
          console.error('Vue ThemeProvider failed to fetch theme by id:', error);
        }
      }
    });

    provide(themeContextConfigKey, themeSettings);

    return () => {
      return slots.default?.();
    };
  },
});
