import { useEffect, useMemo, useState } from 'react';

import merge from 'ts-deepmerge';

import { useSisenseContext } from '@/sisense-context/sisense-context';
import { getThemeSettingsByOid } from '@/themes/theme-loader';
import { CompleteThemeSettings, isThemeOid, ThemeOid, ThemeSettings } from '@/types';

import { useThemeContext } from './theme-context';

/**
 * Returns the theme settings for the given theme OID or theme settings and error if it happened.
 *
 * If the given theme is a theme OID, the theme settings will be fetched from the Sisense instance.
 * If the given theme is a theme settings object, the theme settings will be merged with parent's one and
 * returned as is.
 *
 * @param userTheme Theme OID or theme settings object
 * @returns Theme settings and error if it happened
 */
export function useThemeSettings(
  userTheme?: ThemeOid | ThemeSettings,
): [CompleteThemeSettings, null] | [null, Error] {
  const parentThemeSettings = useThemeContext().themeSettings;
  const [loadedThemeSettings, setLoadedThemeSettings] = useState<CompleteThemeSettings | null>(
    null,
  );
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

  if (themeError) {
    return [null, themeError];
  }

  return [currentThemeSettings, null];
}

function mergeThemeSettings(
  parentThemeSettings: CompleteThemeSettings,
  userTheme: ThemeSettings,
): CompleteThemeSettings {
  return merge.withOptions(
    { mergeArrays: false },
    parentThemeSettings,
    userTheme,
  ) as CompleteThemeSettings;
}
