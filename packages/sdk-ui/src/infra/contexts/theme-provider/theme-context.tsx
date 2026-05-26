import { createContext, useContext } from 'react';

import { CompleteThemeSettingsInternal, ThemeConfig } from '@/types';

import { getDefaultThemeSettings } from './default-theme-settings';

export const ThemeContext = createContext<{
  themeSettings: CompleteThemeSettingsInternal;
  config?: ThemeConfig;
}>({
  themeSettings: getDefaultThemeSettings(),
});

/**
 * Hook to get the current theme settings.
 *
 * @returns The current theme settings
 *
 * @sisenseInternal
 */
export const useThemeContext = () => useContext(ThemeContext);
