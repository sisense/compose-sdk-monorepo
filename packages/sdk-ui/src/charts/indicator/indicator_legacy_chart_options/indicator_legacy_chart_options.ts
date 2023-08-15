import {
  IndicatorStyleType,
  NumericIndicatorSubType,
} from '../../../chart-options-processor/translations/design_options';
import { IndicatorDataOptions, ThemeSettings } from '../../../types';
import { LegacyIndicatorChartOptions } from '../types';
import {
  defaultGaugeOptions,
  defaultNumericBarOptions,
  defaultNumericSimpleOptions,
} from './default_options.js';
import { overrideWithThemeSettings } from './override_with_theme_settings';
import { legacyOptionsToThemeSettingsDictionary } from './legacy_chart_options_to_theme_settings_dictionary';
import { IndicatorChartData } from '../../../chart-data/types';
import { getValueColorOptions, overrideWithValueColor } from './override_with_value_color';

export type ChartRenderingOptions = {
  chartData: IndicatorChartData;
  dataOptions: IndicatorDataOptions;
  themeSettings?: ThemeSettings;
};

export type IndicatorTypeOptions =
  | {
      type: Exclude<IndicatorStyleType, 'numeric'>;
    }
  | {
      type: 'numeric';
      numericSubtype?: NumericIndicatorSubType;
    };

export const createIndicatorLegacyChartOptions = (
  typeOptions: IndicatorTypeOptions,
  chartRenderingOptions: ChartRenderingOptions,
): LegacyIndicatorChartOptions => {
  const { chartData, dataOptions, themeSettings } = chartRenderingOptions;
  const { type } = typeOptions;
  let legacyChartOptions: LegacyIndicatorChartOptions;
  switch (type) {
    case 'gauge':
      legacyChartOptions = defaultGaugeOptions;
      break;
    case 'numeric':
      if (typeOptions.numericSubtype === 'numericBar') {
        legacyChartOptions = defaultNumericBarOptions;
      } else {
        legacyChartOptions = defaultNumericSimpleOptions;
      }
      break;
    default:
      legacyChartOptions = defaultNumericSimpleOptions;
  }
  if (themeSettings) {
    legacyChartOptions = overrideWithThemeSettings(
      themeSettings,
      legacyOptionsToThemeSettingsDictionary,
      legacyChartOptions,
    );
  }

  const customColorOptions = getValueColorOptions(dataOptions);
  if (customColorOptions && chartData.value) {
    legacyChartOptions = overrideWithValueColor(
      customColorOptions,
      chartData.value,
      legacyChartOptions,
      typeOptions,
    );
  }
  return legacyChartOptions;
};
