import { CartesianChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { getDefaultStyleOptions } from '@/domains/visualizations/core/chart-options-processor/chart-options-service.js';
import {
  extendStyleOptionsWithDefaults,
  getDesignOptionsPerSeries,
} from '@/domains/visualizations/core/chart-options-processor/style-to-design-options-translator/prepare-design-options.js';
import {
  DefaultStackType,
  getCartesianChartStyle,
} from '@/domains/visualizations/core/chart-options-processor/style-to-design-options-translator/translate-to-highcharts-options.js';
import { StackableChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options.js';
import { StackType } from '@/domains/visualizations/core/chart-options-processor/translations/translations-to-highcharts.js';
import { ChartStyleOptions, StackableStyleOptions, StackableSubtype } from '@/types';

import { shouldHaveY2Axis } from '../../helpers/data-options.js';

export function translateStackableStyleOptionsToDesignOptions(
  chartType: 'bar' | 'column',
  styleOptions: StackableStyleOptions,
  dataOptionsInternal: CartesianChartDataOptionsInternal,
): StackableChartDesignOptions {
  const cartesianDesignOptions = getCartesianChartStyle(
    styleOptions,
    shouldHaveY2Axis(dataOptionsInternal),
  );
  const styleOptionsWithDefaults = extendStyleOptionsWithDefaults(
    styleOptions ?? {},
    getDefaultStyleOptions(),
  );
  const designPerSeries = getDesignOptionsPerSeries(
    dataOptionsInternal,
    chartType,
    styleOptionsWithDefaults,
  );
  return {
    ...cartesianDesignOptions,
    designPerSeries,
    stackType: styleOptions.subtype
      ? subtypeToStackTypeDictionary[styleOptions.subtype]
      : DefaultStackType,
    totalLabels: styleOptions.totalLabels,
    itemPadding: styleOptions.series?.padding ?? 0.01,
    groupPadding: styleOptions.series?.groupPadding ?? 0.1,
    borderRadius: styleOptions.series?.borderRadius ?? 0,
  };
}

const subtypeToStackTypeDictionary: Record<StackableSubtype, StackType> = {
  'bar/classic': 'classic',
  'bar/stacked': 'stacked',
  'bar/stacked100': 'stack100',
  'column/classic': 'classic',
  'column/stackedcolumn': 'stacked',
  'column/stackedcolumn100': 'stack100',
};

export function isStackableStyleOptions(
  styleOptions: ChartStyleOptions,
): styleOptions is StackableStyleOptions {
  if ('subtype' in styleOptions && styleOptions.subtype) {
    return Object.keys(subtypeToStackTypeDictionary).includes(styleOptions.subtype);
  }
  return true;
}
