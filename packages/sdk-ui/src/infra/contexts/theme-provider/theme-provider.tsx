import { useEffect, useMemo, useRef } from 'react';

import { merge } from 'ts-deepmerge';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { ThemeProviderProps } from '@/props';
import { useTracking } from '@/shared/hooks/use-tracking';

import { ThemeConfig } from '../../../types';
import { EmotionCacheProvider } from '../emotion-cache-provider';
import { FontsLoader } from './fonts-loader/fonts-loader';
import { ThemeContext, useThemeContext } from './theme-context';
import { useThemeSettings } from './use-theme-settings';

/**
 * Theme provider, which allows you to adjust the look and feel of child components.
 *
 * Components not wrapped in a theme provider use the current theme from the connected Fusion instance by default.
 *
 * When `theme` is a theme OID that cannot be loaded — for example, a theme that does not exist in
 * the connected Sisense instance — the provider keeps rendering its children with the inherited
 * theme settings and reports the failure as a console warning.
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
  const { themeSettings, error } = useThemeSettings(theme);
  const parentThemeConfig = useThemeContext().config;
  const { tracking } = useSisenseContext();
  const { trackError } = useTracking();
  const reportedError = useRef<Error | null>(null);

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

  const cssSelectorPrefix = config?.cssSelectorPrefix?.enabled
    ? config.cssSelectorPrefix.value
    : undefined;

  // The Sisense context `onError` callback is deliberately not invoked here: its contract lets the
  // host return a React node to replace the failed subtree, which cannot be honored when nothing is
  // broken. Warning to the console keeps that contract intact and matches the Vue provider.
  useEffect(() => {
    if (!error || reportedError.current === error) {
      return;
    }
    reportedError.current = error;

    console.warn(`ThemeProvider: ${error.message}. Falling back to the inherited theme.`);

    if (tracking?.enabled) {
      void trackError({
        packageName: 'sdk-ui',
        packageVersion: __PACKAGE_VERSION__,
        component: 'ThemeProvider',
        error,
      });
    }
  }, [error, tracking?.enabled, trackError]);

  return (
    <EmotionCacheProvider cssSelectorPrefix={cssSelectorPrefix}>
      <ThemeContext.Provider value={{ themeSettings, config }}>
        <FontsLoader>{children}</FontsLoader>
      </ThemeContext.Provider>
    </EmotionCacheProvider>
  );
});
