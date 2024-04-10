import { ThemeProviderProps } from '@/props';
import { getDefaultThemeSettings } from '@/chart-options-processor/theme-option-service';

/**
 * Get theme from environment variable
 *
 * @param isDarkMode - Boolean value whether to get theme settings for dark mode
 * @return Theme settings
 */
export const getTheme = (isDarkMode = false): ThemeProviderProps['theme'] => {
  const { VITE_APP_SISENSE_THEME_OID_LIGHT, VITE_APP_SISENSE_THEME_OID_DARK } = import.meta.env;

  return isDarkMode
    ? VITE_APP_SISENSE_THEME_OID_DARK || getDefaultThemeSettings(isDarkMode)
    : VITE_APP_SISENSE_THEME_OID_LIGHT || getDefaultThemeSettings(isDarkMode);
};
