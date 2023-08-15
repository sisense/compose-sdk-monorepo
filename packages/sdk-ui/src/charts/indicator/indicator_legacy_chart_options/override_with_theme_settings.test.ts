import { overrideWithThemeSettings } from './override_with_theme_settings';
import { ThemeSettings } from '../../../types';
import { defaultNumericSimpleOptions } from './default_options';
import { darkThemeSettings } from './__mocks__/theme_settings';
import { numericSimpleLegacyChartOptionsWithDarkTheme } from './__mocks__/legacy_chart_options';
import { legacyOptionsToThemeSettingsDictionary } from './legacy_chart_options_to_theme_settings_dictionary';

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
