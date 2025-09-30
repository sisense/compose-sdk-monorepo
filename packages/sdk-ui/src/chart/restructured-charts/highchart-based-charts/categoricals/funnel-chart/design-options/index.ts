import { ChartStyleOptions } from '@/types';
import { FunnelChartStyleOptions, FunnelChartDesignOptions } from '../types';
import { BaseDesignOptions } from '@/chart-options-processor/translations/base-design-options';
import {
  FunnelLabels,
  DefaultFunnelLabels,
  DefaultFunnelSize,
  DefaultFunnelType,
  DefaultFunnelDirection,
} from '@/chart-options-processor/translations/funnel-plot-options';
import { getLegendSettings } from '@/chart-options-processor/translations/legend-section';

/**
 * Gets data limits for funnel charts.
 */
const getDataLimits = (styleOptions: FunnelChartStyleOptions) => {
  const { dataLimits } = styleOptions;
  return {
    categoriesCapacity: dataLimits?.categoriesCapacity ?? 50000,
    seriesCapacity: dataLimits?.seriesCapacity ?? 50000,
  };
};

/**
 * Translates style options to design options for funnel charts.
 */
export function translateStyleOptionsToDesignOptions(
  styleOptions: FunnelChartStyleOptions,
): FunnelChartDesignOptions {
  const {
    funnelType = DefaultFunnelType,
    funnelSize = DefaultFunnelSize,
    funnelDirection = DefaultFunnelDirection,
    legend,
    labels,
  } = styleOptions;

  let funnelLabels: FunnelLabels = DefaultFunnelLabels;
  if (labels) {
    funnelLabels = {
      ...funnelLabels,
      showCategories: labels.categories ?? funnelLabels.showCategories,
      showDecimals: labels.decimals ?? funnelLabels.showDecimals,
      enabled: labels.enabled ?? funnelLabels.enabled,
      showPercent: labels.percent ?? funnelLabels.showPercent,
      showValue: labels.value ?? funnelLabels.showValue,
    };
  }

  const dataLimits = getDataLimits(styleOptions);

  return {
    ...BaseDesignOptions,
    funnelSize,
    funnelType,
    funnelDirection,
    funnelLabels,
    legend: getLegendSettings(legend),
    dataLimits,
  };
}

/**
 * Checks if the style options are correct for funnel charts.
 */
export function isCorrectStyleOptions(
  styleOptions: ChartStyleOptions,
): styleOptions is FunnelChartStyleOptions {
  // Funnel charts should have labels that can contain funnel-specific properties
  return !styleOptions || typeof styleOptions === 'object';
}

/**
 * Design options translators for funnel charts.
 */
export const designOptionsTranslators = {
  translateStyleOptionsToDesignOptions,
  isCorrectStyleOptions,
};
