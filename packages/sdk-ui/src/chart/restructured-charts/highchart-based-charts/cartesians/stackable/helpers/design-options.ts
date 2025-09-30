import { CartesianChartDataOptionsInternal } from '@/chart-data-options/types';
import { getDefaultStyleOptions } from '@/chart-options-processor/chart-options-service';
import {
  extendStyleOptionsWithDefaults,
  getDesignOptionsPerSeries,
} from '@/chart-options-processor/style-to-design-options-translator/prepare-design-options';
import {
  DefaultStackType,
  getCartesianChartStyle,
} from '@/chart-options-processor/style-to-design-options-translator/translate-to-highcharts-options';
import { StackableChartDesignOptions } from '@/chart-options-processor/translations/design-options';
import { StackType } from '@/chart-options-processor/translations/translations-to-highcharts';
import { ChartStyleOptions, StackableStyleOptions, StackableSubtype } from '@/types';
import { shouldHaveY2Axis } from '../../helpers/data-options';

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
    showTotal: styleOptions.totalLabels?.enabled ?? false,
    totalLabelRotation: styleOptions.totalLabels?.rotation ?? 0,
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
