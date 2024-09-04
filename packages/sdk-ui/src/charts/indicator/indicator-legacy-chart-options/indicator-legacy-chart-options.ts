import {
  IndicatorStyleType,
  NumericIndicatorSubType,
} from '../../../chart-options-processor/translations/design-options';
import { IndicatorChartDataOptions, ThemeSettings } from '../../../types';
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
import isNumber from 'lodash-es/isNumber';

export type ChartRenderingOptions = {
  chartData: IndicatorChartData;
  dataOptions: IndicatorChartDataOptions;
  themeSettings?: ThemeSettings;
};

export type IndicatorTypeOptions =
  | {
      type: Exclude<IndicatorStyleType, 'numeric'>;
      forceTickerView: boolean;
      tickerBarHeight?: number;
    }
  | {
      type: 'numeric';
      numericSubtype?: NumericIndicatorSubType;
      forceTickerView: boolean;
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
  if (customColorOptions && chartData.value && isNumber(chartData.value)) {
    legacyChartOptions = overrideWithValueColor(
      customColorOptions,
      chartData.value,
      legacyChartOptions,
    );
  }
  return {
    ...legacyChartOptions,
    forceTickerView: typeOptions.forceTickerView,
    ...(typeOptions.type === 'gauge' && typeOptions.tickerBarHeight
      ? { tickerBarHeight: typeOptions.tickerBarHeight }
      : null),
  };
};
