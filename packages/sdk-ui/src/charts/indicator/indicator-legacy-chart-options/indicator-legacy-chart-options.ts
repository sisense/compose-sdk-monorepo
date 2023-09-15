import {
  IndicatorStyleType,
  NumericIndicatorSubType,
} from '../../../chart-options-processor/translations/design-options';
import { IndicatorDataOptions, ThemeSettings } from '../../../types';
import { LegacyIndicatorChartOptions } from '../types';
import {
  defaultGaugeOptions,
  defaultNumericBarOptions,
  defaultNumericSimpleOptions,
} from './default-options.js';
import { overrideWithThemeSettings } from './override-with-theme-settings';
import { legacyOptionsToThemeSettingsDictionary } from './legacy-chart-options-to-theme-settings-dictionary';
import { IndicatorChartData } from '../../../chart-data/types';
import { getValueColorOptions, overrideWithValueColor } from './override-with-value-color';

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
