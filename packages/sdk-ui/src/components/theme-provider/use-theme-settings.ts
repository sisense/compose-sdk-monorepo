import { isEqual } from 'lodash';
import merge from 'ts-deepmerge';
import { useState, useEffect } from 'react';
import { ThemeOid, ThemeSettings, isThemeOid, CompleteThemeSettings } from '../../types';
import { useThemeContext } from './theme-provider';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { getThemeSettingsByOid } from '../../themes/theme-loader';
import { getDefaultThemeSettings } from '../../chart-options-processor/theme-option-service';

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
  const currentThemeSettings = useThemeContext().themeSettings;
  const [userThemeSettings, setUserThemeSettings] = useState<ThemeSettings>(
    getDefaultThemeSettings(),
  );
  const [themeError, setThemeError] = useState<Error | null>(null);
  const httpClient = useSisenseContext().app?.httpClient;

  useEffect(() => {
    if (!userTheme) {
      return;
    }
    if (!isThemeOid(userTheme)) {
      setUserThemeSettings(userTheme);
    } else {
      if (httpClient) {
        void getThemeSettingsByOid(userTheme, httpClient)
          .then(setUserThemeSettings)
          .catch(setThemeError);
      }
    }
  }, [userTheme, httpClient]);

  if (themeError) {
    return [null, themeError];
  }

  if (isEqual(currentThemeSettings, userThemeSettings)) {
    return [currentThemeSettings, null];
  }

  const mergedThemeSettings = merge.withOptions(
    { mergeArrays: false },
    currentThemeSettings,
    userThemeSettings,
  ) as CompleteThemeSettings;
  return [mergedThemeSettings, null];
}
