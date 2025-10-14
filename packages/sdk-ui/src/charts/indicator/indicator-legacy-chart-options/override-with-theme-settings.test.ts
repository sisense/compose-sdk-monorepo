import { ThemeSettings } from '../../../types';
import { numericSimpleLegacyChartOptionsWithDarkTheme } from './__mocks__/legacy-chart-options';
import { darkThemeSettings } from './__mocks__/theme-settings';
import { defaultNumericSimpleOptions } from './default-options';
import { legacyOptionsToThemeSettingsDictionary } from './legacy-chart-options-to-theme-settings-dictionary';
import { overrideWithThemeSettings } from './override-with-theme-settings';

describe('overrideWithThemeSettings', () => {
  const themeSettings: ThemeSettings = darkThemeSettings;
  const legacyChartOptions = defaultNumericSimpleOptions;

  it('should override legacy chart options with passed dark theme settings', () => {
    const overriddenOptions = overrideWithThemeSettings(
      themeSettings,
      legacyOptionsToThemeSettingsDictionary,
      legacyChartOptions,
    );
    expect(overriddenOptions).toEqual(numericSimpleLegacyChartOptionsWithDarkTheme);
  });
});
