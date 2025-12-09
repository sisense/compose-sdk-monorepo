import { createContext, useContext } from 'react';

import { CompleteThemeSettings, ThemeConfig } from '@/types';

import { getDefaultThemeSettings } from './default-theme-settings';

export const ThemeContext = createContext<{
  themeSettings: CompleteThemeSettings;
  config?: ThemeConfig;
}>({
  themeSettings: getDefaultThemeSettings(),
});

/**
 * Hook to get the current theme settings.
 *
 * @returns The current theme settings
 * @internal
 */
export const useThemeContext = () => useContext(ThemeContext);
