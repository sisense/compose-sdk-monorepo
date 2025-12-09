import { chartSubtypeToDesignOptions } from '@/chart-options-processor/subtype-to-design-options';
import { BaseDesignOptions } from '@/chart-options-processor/translations/base-design-options';
import { PieType } from '@/chart-options-processor/translations/pie-plot-options';
import { ChartStyleOptions, PieSeriesLabels } from '@/types';

import { PieChartDesignOptions, PieChartStyleOptions } from '../types';

const DefaultPieType = 'classic';
const DefaultPieSeriesLabels: PieSeriesLabels = {
  enabled: true,
  showCategory: true,
  showValue: false,
  percentageLabels: {
    enabled: true,
    showDecimals: false,
  },
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
  const { legend, labels, subtype, seriesLabels, semiCircle } = styleOptions;

  // Determine pie type from subtype, falling back to default
  const subtypeDesignOptions = subtype ? chartSubtypeToDesignOptions[subtype] : undefined;
  const pieType: PieType = subtypeDesignOptions?.pieType || DefaultPieType;

  const convolution = styleOptions?.convolution ? styleOptions.convolution : { enabled: false };

  const dataLimits = getDataLimits(styleOptions);

  return {
    ...BaseDesignOptions,
    seriesLabels: {
      ...seriesLabels,
      enabled: seriesLabels?.enabled ?? labels?.enabled ?? DefaultPieSeriesLabels.enabled,
      showCategory:
        seriesLabels?.showCategory ?? labels?.categories ?? DefaultPieSeriesLabels.showCategory,
      showValue: seriesLabels?.showValue ?? labels?.value ?? DefaultPieSeriesLabels.showValue,
      percentageLabels: {
        ...seriesLabels?.percentageLabels,
        enabled:
          seriesLabels?.percentageLabels?.enabled ??
          labels?.percent ??
          DefaultPieSeriesLabels.percentageLabels!.enabled,
        showDecimals:
          seriesLabels?.percentageLabels?.showDecimals ??
          labels?.decimals ??
          DefaultPieSeriesLabels.percentageLabels!.showDecimals!,
      },
    },
    pieType,
    convolution,
    legend,
    dataLimits,
    semiCircle,
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

export function getDefaultStyleOptions(): PieChartStyleOptions {
  return {
    legend: {
      enabled: true,
      position: 'bottom',
    },
    labels: {
      enabled: true,
      categories: true,
      percent: true,
      decimals: false,
      value: false,
    },
  };
}

/**
 * Design options translators for pie charts.
 */
export const designOptionsTranslators = {
  translateStyleOptionsToDesignOptions,
  isCorrectStyleOptions,
  getDefaultStyleOptions,
};
