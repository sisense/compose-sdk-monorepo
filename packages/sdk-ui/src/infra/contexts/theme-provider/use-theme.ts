import omit from 'lodash-es/omit';

import { CompleteThemeSettings } from '@/types';

import { useThemeContext } from './theme-context';

/**
 * Returns the resolved theme from the nearest {@link ThemeProvider}.
 * Falls back to the default theme when no provider is present.
 *
 * @example
 * ```tsx
 * const { palette, typography, widget } = useTheme();
 * ```
 *
 * @returns Resolved {@link CompleteThemeSettings}
 * @group Contexts
 */
export const useTheme = (): CompleteThemeSettings => {
  const { themeSettings } = useThemeContext();
  const { chart, palette, typography, general, widget, filter, aiChat } = themeSettings;

  return {
    chart,
    palette,
    typography,
    general: omit(general, ['popover', 'buttons']),
    widget,
    filter,
    aiChat,
  };
};
