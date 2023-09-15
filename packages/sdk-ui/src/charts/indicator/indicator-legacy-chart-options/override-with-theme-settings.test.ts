import { overrideWithThemeSettings } from './override-with-theme-settings';
import { ThemeSettings } from '../../../types';
import { defaultNumericSimpleOptions } from './default-options';
import { darkThemeSettings } from './__mocks__/theme-settings';
import { numericSimpleLegacyChartOptionsWithDarkTheme } from './__mocks__/legacy-chart-options';
import { legacyOptionsToThemeSettingsDictionary } from './legacy-chart-options-to-theme-settings-dictionary';

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
