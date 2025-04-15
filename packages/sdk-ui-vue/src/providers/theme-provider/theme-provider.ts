import { defineComponent, provide, ref, watchEffect } from 'vue';
import type { PropType } from 'vue';
import merge from 'ts-deepmerge';
import type {
  CompleteThemeSettings,
  ThemeProviderProps as ThemeProviderPropsPreact,
  ThemeSettings,
} from '@sisense/sdk-ui-preact';
import { getThemeSettingsByOid } from '@sisense/sdk-ui-preact';
import { getSisenseContext } from '../sisense-context-provider/sisense-context';
import { getThemeContext, themeContextConfigKey } from './theme-context';

/**
 * {@inheritDoc @sisense/sdk-ui!ThemeProviderProps}
 */
export interface ThemeProviderProps extends Omit<ThemeProviderPropsPreact, 'children'> {}

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
 *
 * <img src="media://indicator-chart-example-2.png" width="400px" />
 *
 *
 * For comparison, indicator chart with default theme settings:
 *
 * <img src="media://indicator-chart-example-1.png" width="400px" />
 *
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

  setup(props, { slots }) {
    const existingThemeSettings = getThemeContext();
    const context = getSisenseContext();
    const themeSettings = ref(existingThemeSettings?.value);

    watchEffect(async () => {
      const { theme: propTheme = {} } = props;
      const { app } = context.value;
      const isThemeOid = typeof propTheme === 'string';
      let userThemeSettings = propTheme as ThemeSettings;

      if (isThemeOid && app) {
        try {
          userThemeSettings = await getThemeSettingsByOid(propTheme, app.httpClient);
        } catch (error) {
          console.error('Vue ThemeProvider failed to fetch theme by id:', error);
        }
      }

      themeSettings.value = merge.withOptions(
        { mergeArrays: false },
        existingThemeSettings?.value,
        userThemeSettings,
      ) as CompleteThemeSettings;
    });

    provide(themeContextConfigKey, themeSettings);

    return () => {
      return slots.default?.();
    };
  },
});
