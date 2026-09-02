import { useEffect, useMemo, useState } from 'react';

import { merge } from 'ts-deepmerge';

import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { getThemeSettingsByOid } from '@/infra/themes/theme-loader';
import { CompleteThemeSettingsInternal, isThemeOid, ThemeOid, ThemeSettings } from '@/types';

import { useThemeContext } from './theme-context';

/**
 * Returns the theme settings for the given theme OID or theme settings, along with a non-fatal
 * error if loading a theme by OID failed.
 *
 * If the given theme is a theme OID, the theme settings will be fetched from the Sisense instance.
 * If the given theme is a theme settings object, the theme settings will be merged with parent's one and
 * returned as is.
 *
 * The returned theme settings are always usable: when loading by OID fails they fall back to the
 * inherited theme settings (the parent provider's, or the default ones at the root), and the failure
 * is surfaced through `error` for the caller to report.
 *
 * @param userTheme Theme OID or theme settings object
 * @returns The effective theme settings, and the theme loading error if one occurred
 */
export function useThemeSettings(userTheme?: ThemeOid | ThemeSettings): {
  themeSettings: CompleteThemeSettingsInternal;
  error: Error | null;
} {
  const parentThemeSettings = useThemeContext().themeSettings;
  const [loadedThemeSettings, setLoadedThemeSettings] =
    useState<CompleteThemeSettingsInternal | null>(null);
  const [themeError, setThemeError] = useState<Error | null>(null);
  const httpClient = useSisenseContext().app?.httpClient;

  // If the user theme is a theme OID, fetch the theme settings from the Sisense instance
  useEffect(() => {
    if (userTheme && isThemeOid(userTheme) && httpClient) {
      void getThemeSettingsByOid(userTheme, httpClient)
        .then((loadedThemeSettings) => {
          setLoadedThemeSettings(loadedThemeSettings);
        })
        .catch(setThemeError);
    }
  }, [httpClient, userTheme]);

  // If the user theme is not a theme OID anymore, reset the loaded theme settings
  useEffect(() => {
    if (!userTheme || !isThemeOid(userTheme)) {
      setLoadedThemeSettings(null);
      setThemeError(null);
    }
  }, [userTheme]);

  // Theme settings for the current level can be:
  // - loaded theme settings if user theme is a theme OID and loaded
  // - user theme settings if user theme is a theme settings
  // - parent theme settings if no user theme is set
  const currentThemeSettings = useMemo(() => {
    if (loadedThemeSettings) {
      return mergeThemeSettings(parentThemeSettings, loadedThemeSettings);
    }
    if (userTheme && !isThemeOid(userTheme)) {
      return mergeThemeSettings(parentThemeSettings, userTheme);
    }
    return parentThemeSettings;
  }, [loadedThemeSettings, parentThemeSettings, userTheme]);

  return { themeSettings: currentThemeSettings, error: themeError };
}

function mergeThemeSettings(
  parentThemeSettings: CompleteThemeSettingsInternal,
  userTheme: ThemeSettings,
): CompleteThemeSettingsInternal {
  return merge.withOptions(
    { mergeArrays: false },
    parentThemeSettings,
    userTheme,
  ) as CompleteThemeSettingsInternal;
}
