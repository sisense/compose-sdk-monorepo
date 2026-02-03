import { CartesianChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { withYAxisNormalizationForPolar } from '@/domains/visualizations/core/chart-options-processor/cartesian/utils/axis/axis-builders';
import { getDefaultStyleOptions } from '@/domains/visualizations/core/chart-options-processor/chart-options-service';
import {
  extendStyleOptionsWithDefaults,
  getDesignOptionsPerSeries,
} from '@/domains/visualizations/core/chart-options-processor/style-to-design-options-translator/prepare-design-options';
import { getCartesianChartStyle } from '@/domains/visualizations/core/chart-options-processor/style-to-design-options-translator/translate-to-highcharts-options';
import { chartSubtypeToDesignOptions } from '@/domains/visualizations/core/chart-options-processor/subtype-to-design-options';
import { PolarChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options';
import { ChartStyleOptions, PolarStyleOptions } from '@/types';

/**
 * Translates style options to design options for polar charts.
 */
export function translateStyleOptionsToDesignOptions(
  styleOptions: PolarStyleOptions,
  dataOptionsInternal: CartesianChartDataOptionsInternal,
): PolarChartDesignOptions {
  const style = getCartesianChartStyle(styleOptions, false);
  const styleOptionsWithDefaults = extendStyleOptionsWithDefaults(
    styleOptions,
    getDefaultStyleOptions(),
  );
  const designPerSeries = getDesignOptionsPerSeries(
    dataOptionsInternal,
    'polar',
    styleOptionsWithDefaults,
  );

  // Get the polar type from the subtype
  const subtype = styleOptions.subtype || 'polar/column';
  const subtypeDesignOptions = chartSubtypeToDesignOptions[subtype];
  const polarType = subtypeDesignOptions?.polarType || 'column';

  const designOptions = {
    ...style,
    polarType,
    designPerSeries,
  };

  // Apply polar-specific Y-axis normalization at design options level
  // This disables Y-axis titles which are not meaningful in polar coordinate system
  return withYAxisNormalizationForPolar(designOptions);
}

/**
 * Checks if the style options are correct for polar charts.
 */
export function isCorrectStyleOptions(
  styleOptions: ChartStyleOptions,
): styleOptions is PolarStyleOptions {
  return (
    typeof styleOptions === 'object' &&
    styleOptions !== null &&
    (!('subtype' in styleOptions) ||
      !styleOptions.subtype ||
      styleOptions.subtype.startsWith('polar/'))
  );
}

/**
 * Design options translators for polar charts.
 */
export const designOptionsTranslators = {
  translateStyleOptionsToDesignOptions,
  isCorrectStyleOptions,
};
