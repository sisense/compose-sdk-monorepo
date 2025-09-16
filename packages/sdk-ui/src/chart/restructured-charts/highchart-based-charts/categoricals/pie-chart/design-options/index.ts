import { ChartStyleOptions } from '@/types';
import { PieChartStyleOptions, PieChartDesignOptions } from '../types';
import { BaseDesignOptions } from '@/chart-options-processor/translations/base-design-options';
import { PieLabels, PieType } from '@/chart-options-processor/translations/pie-plot-options';
import { chartSubtypeToDesignOptions } from '@/chart-options-processor/subtype-to-design-options';

const DefaultPieType = 'classic';
const DefaultPieLabels: PieLabels = {
  enabled: true,
  showCategories: true,
  showValue: true,
  showPercent: false,
  showDecimals: false,
};

/**
 * Gets data limits for pie charts.
 */
const getDataLimits = (styleOptions: PieChartStyleOptions) => {
  const { dataLimits } = styleOptions;
  return {
    categoriesCapacity: dataLimits?.categoriesCapacity ?? 50000,
    seriesCapacity: dataLimits?.seriesCapacity ?? 50000,
  };
};

/**
 * Translates style options to design options for pie charts.
 */
export function translateStyleOptionsToDesignOptions(
  styleOptions: PieChartStyleOptions,
): PieChartDesignOptions {
  const { legend, labels, subtype } = styleOptions;

  let pieLabels: PieLabels = DefaultPieLabels;
  if (labels) {
    pieLabels = {
      ...pieLabels,
      showCategories: labels.categories ?? false,
      showDecimals: labels.decimals ?? false,
      enabled: labels.enabled ?? false,
      showPercent: labels.percent ?? false,
      showValue: labels.value ?? false,
    };
  }

  // Determine pie type from subtype, falling back to default
  const subtypeDesignOptions = subtype ? chartSubtypeToDesignOptions[subtype] : undefined;
  const pieType: PieType = subtypeDesignOptions?.pieType || DefaultPieType;

  const convolution = styleOptions?.convolution ? styleOptions.convolution : { enabled: false };

  const dataLimits = getDataLimits(styleOptions);

  return {
    ...BaseDesignOptions,
    pieLabels,
    pieType,
    convolution,
    legend,
    dataLimits,
  };
}

/**
 * Checks if the style options are correct for pie charts.
 */
export function isCorrectStyleOptions(
  styleOptions: ChartStyleOptions,
): styleOptions is PieChartStyleOptions {
  // Pie charts should have labels that can contain pie-specific properties
  return !styleOptions || typeof styleOptions === 'object';
}

/**
 * Design options translators for pie charts.
 */
export const designOptionsTranslators = {
  translateStyleOptionsToDesignOptions,
  isCorrectStyleOptions,
};
