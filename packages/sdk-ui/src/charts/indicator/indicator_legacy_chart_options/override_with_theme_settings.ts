import { ThemeSettings } from '../../../types.js';
import { LegacyIndicatorChartOptions } from '../types.js';
import { overrideWithCustomSettings } from './utils/override_with_custom_settings.js';

export function overrideWithThemeSettings(
  themeSettings: ThemeSettings,
  legacyOptionsToThemeSettingsDictionary: Record<string, string>,
  legacyChartOptions: LegacyIndicatorChartOptions,
): LegacyIndicatorChartOptions {
  return overrideWithCustomSettings(
    themeSettings,
    legacyOptionsToThemeSettingsDictionary,
    legacyChartOptions,
  );
}
