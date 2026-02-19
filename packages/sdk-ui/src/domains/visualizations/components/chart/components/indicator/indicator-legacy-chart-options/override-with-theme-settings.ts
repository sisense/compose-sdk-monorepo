import { overrideWithCustomSettings } from '@/shared/utils/override-with-custom-settings';
import { ThemeSettings } from '@/types';

import { LegacyIndicatorChartOptions } from '../types.js';

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
