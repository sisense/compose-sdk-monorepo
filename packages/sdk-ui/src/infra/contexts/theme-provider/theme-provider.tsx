import { useMemo } from 'react';

import merge from 'ts-deepmerge';

import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { ThemeProviderProps } from '@/props';

import { ThemeConfig } from '../../../types';
import { FontsLoader } from './fonts-loader/fonts-loader';
import { ThemeContext, useThemeContext } from './theme-context';
import { useThemeSettings } from './use-theme-settings';

/**
 * Theme provider, which allows you to adjust the look and feel of child components.
 *
 * Components not wrapped in a theme provider use the current theme from the connected Fusion instance by default.
 *
 * @example
 * Example of a theme provider, which changes the colors and font of the nested indicator chart:
 * ```tsx
 * <ThemeProvider
 *   theme={{
 *     chart: {
 *       backgroundColor: '#333333',
 *       textColor: 'orange',
 *       secondaryTextColor: 'purple',
 *     },
 *     typography: {
 *       fontFamily: 'impact',
 *     },
 *   }}
 * >
 *   <IndicatorChart {...chartOptions} />
 * </ThemeProvider>
 * ```
 *
 * Indicator chart with custom theme settings:
 *
 * <img src="media://indicator-chart-example-2.png" width="400px" />
 *
 *
 *
 * For comparison, indicator chart with default theme settings:
 *
 * <img src="media://indicator-chart-example-1.png" width="400px" />
 * @see {@link ThemeSettings} and IndicatorChart
 * @param props - Theme provider props
 * @returns A Theme Provider component
 * @group Contexts
 */
export const ThemeProvider = asSisenseComponent({
  componentName: 'ThemeProvider',
  trackingConfig: {
    skip: (props: ThemeProviderProps) => !!props.skipTracking,
    transparent: true,
  },
  shouldSkipSisenseContextWaiting: true,
})((props: ThemeProviderProps) => {
  const { theme, children, config: userConfig } = props;
  const [themeSettings, error] = useThemeSettings(theme);
  const parentThemeConfig = useThemeContext().config;

  // Merges the user config with the parent config
  const config = useMemo(() => {
    if (userConfig && parentThemeConfig) {
      return merge.withOptions(
        { mergeArrays: false },
        parentThemeConfig,
        userConfig,
      ) as ThemeConfig;
    }
    if (userConfig) {
      return userConfig;
    }
    return parentThemeConfig;
  }, [parentThemeConfig, userConfig]);

  if (error) {
    throw error;
  }
  return (
    <>
      {themeSettings && (
        <ThemeContext.Provider value={{ themeSettings: themeSettings, config }}>
          <FontsLoader>{children}</FontsLoader>
        </ThemeContext.Provider>
      )}
    </>
  );
});
