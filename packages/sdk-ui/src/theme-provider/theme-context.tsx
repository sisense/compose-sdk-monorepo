import { createContext, useContext } from 'react';
import { CompleteThemeSettings } from '@/types';
import { getDefaultThemeSettings } from '@/chart-options-processor/theme-option-service';

export const ThemeContext = createContext<{
  themeSettings: CompleteThemeSettings;
}>({ themeSettings: getDefaultThemeSettings() });

/**
 * Hook to get the current theme settings.
 *
 * @returns The current theme settings
 * @internal
 */
export const useThemeContext = () => useContext(ThemeContext);
