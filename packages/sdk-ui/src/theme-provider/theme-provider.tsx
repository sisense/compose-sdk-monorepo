import { createContext, useContext } from 'react';
import { getDefaultThemeSettings } from '../chart-options-processor/theme-option-service';
import { ThemeProviderProps } from '../props';
import { CompleteThemeSettings } from '../types';
import { asSisenseComponent } from '../decorators/as-sisense-component';
import { useThemeSettings } from './use-theme-settings';

export const ThemeContext = createContext<{
  themeSettings: CompleteThemeSettings;
}>({ themeSettings: getDefaultThemeSettings() });

export const useThemeContext = () => useContext(ThemeContext);

/**
 * Theme provider, which allows you to adjust the look and feel of child components.
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
 * @see {@link ThemeSettings} and {@link IndicatorChart}
 * @param props - Theme provider props
 * @returns A Theme Provider component
 */
export const ThemeProvider = asSisenseComponent({
  componentName: 'ThemeProvider',
  shouldSkipTracking: (props: ThemeProviderProps) => !!props.skipTracking,
  shouldSkipSisenseContextWaiting: true,
})((props: ThemeProviderProps) => {
  const { theme, children } = props;
  const [themeSettings, error] = useThemeSettings(theme);
  if (error) {
    throw error;
  }
  return (
    <>
      {themeSettings && (
        <ThemeContext.Provider value={{ themeSettings: themeSettings }}>
          {children}
        </ThemeContext.Provider>
      )}
    </>
  );
});
