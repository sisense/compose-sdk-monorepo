import { ThemeSettings } from '@/types';
import { LegacyIndicatorChartOptions } from '../types';
import { overrideWithCustomSettings } from '@/utils/override-with-custom-settings';

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
