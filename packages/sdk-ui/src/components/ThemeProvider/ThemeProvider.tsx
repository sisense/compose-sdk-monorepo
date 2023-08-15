import { createContext, useContext } from 'react';
import { getDefaultThemeSettings } from '../../chart-options-processor/theme_option_service';
import { ThemeProviderProps } from '../../props';
import { CompleteThemeSettings } from '../../types';
import { useTrackComponentInit } from '../../useTrackComponentInit';
import ErrorBoundaryBox from '../ErrorBoundary/ErrorBoundaryBox';
import { useThemeSettings } from './use-theme-settings';

const ThemeContext = createContext<{
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
 * ###
 * Indicator chart with custom theme settings:
 *
 * <img src="media://indicator-chart-example-2.png" width="400px" />
 *
 * ###
 *
 * For comparison, indicator chart with default theme settings:
 *
 * <img src="media://indicator-chart-example-1.png" width="400px" />
 * ###
 * @see {@link ThemeSettings}, {@link getDefaultThemeSettings}, {@link IndicatorChart}
 * @param props - Theme provider props
 * @returns A Theme Provider component
 */
export const ThemeProvider = ({ skipTracking = false, ...restProps }: ThemeProviderProps) => {
  useTrackComponentInit('ThemeProvider', restProps, skipTracking);

  const { theme, children } = restProps;
  const [themeSettings, error] = useThemeSettings(theme);
  return (
    <>
      {themeSettings && (
        <ThemeContext.Provider value={{ themeSettings: themeSettings }}>
          {children}
        </ThemeContext.Provider>
      )}
      {error && <ErrorBoundaryBox errorText={error.message} />}
    </>
  );
};
