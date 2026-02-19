import { DeepPartial } from 'ts-essentials';

import { BaseDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/base-design-options.js';
import {
  DefaultFunnelDirection,
  DefaultFunnelSeriesLabels,
  DefaultFunnelSize,
  DefaultFunnelType,
} from '@/domains/visualizations/core/chart-options-processor/translations/funnel-plot-options.js';
import { omitUndefinedAndEmpty } from '@/shared/utils/omit-undefined';
import { ChartStyleOptions } from '@/types';

import { FunnelChartDesignOptions, FunnelChartStyleOptions } from '../types.js';

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
    seriesLabels,
  } = styleOptions;

  const dataLimits = getDataLimits(styleOptions);

  return {
    ...BaseDesignOptions,
    funnelSize,
    funnelType,
    funnelDirection,
    legend,
    dataLimits,
    seriesLabels: {
      ...(seriesLabels ?? {}),
      enabled: seriesLabels?.enabled ?? DefaultFunnelSeriesLabels.enabled,
      showCategory: seriesLabels?.showCategory ?? DefaultFunnelSeriesLabels.showCategory,
      showValue: seriesLabels?.showValue ?? DefaultFunnelSeriesLabels.showValue,
      showPercentage: seriesLabels?.showPercentage ?? DefaultFunnelSeriesLabels.showPercentage,
      showPercentDecimals:
        seriesLabels?.showPercentDecimals ?? DefaultFunnelSeriesLabels.showPercentDecimals,
    },
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
 * Gets default style options for funnel charts.
 */
export function getDefaultStyleOptions(): FunnelChartStyleOptions {
  return {
    legend: {
      enabled: true,
      position: 'bottom',
    },
    funnelType: DefaultFunnelType,
    funnelSize: DefaultFunnelSize,
    funnelDirection: DefaultFunnelDirection,
    seriesLabels: DefaultFunnelSeriesLabels,
  };
}

/**
 * Translates legacy style options (with deprecated labels property) to modern style options (with seriesLabels).
 *
 * @param legacyStyleOptions - The legacy style options containing the deprecated properties
 * @returns The modern style options without deprecated properties
 */
export function translateLegacyStyleOptionsToModern(
  legacyStyleOptions: DeepPartial<FunnelChartStyleOptions> = {},
): DeepPartial<FunnelChartStyleOptions> {
  const { labels, seriesLabels, ...rest } = legacyStyleOptions;

  return omitUndefinedAndEmpty({
    ...rest,
    seriesLabels: {
      ...(seriesLabels ?? {}),
      enabled: seriesLabels?.enabled ?? labels?.enabled,
      showCategory: seriesLabels?.showCategory ?? labels?.categories,
      showValue: seriesLabels?.showValue ?? labels?.value,
      showPercentage: seriesLabels?.showPercentage ?? labels?.percent,
      showPercentDecimals: seriesLabels?.showPercentDecimals ?? labels?.decimals,
    },
  });
}

/**
 * Design options translators for funnel charts.
 */
export const designOptionsTranslators = {
  translateStyleOptionsToDesignOptions,
  isCorrectStyleOptions,
  getDefaultStyleOptions,
  translateLegacyStyleOptionsToModern,
};
