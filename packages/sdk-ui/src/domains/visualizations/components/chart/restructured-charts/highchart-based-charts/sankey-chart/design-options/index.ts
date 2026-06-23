import { BaseDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/base-design-options';
import { ChartStyleOptions, SankeyStyleOptions } from '@/types';

import { SankeyChartDesignOptions } from '../types';

function resolveSankeyOrientation(styleOptions: SankeyStyleOptions): 'horizontal' | 'vertical' {
  return styleOptions.orientation === 'vertical' ? 'vertical' : 'horizontal';
}

/**
 * Translates SankeyStyleOptions to SankeyChartDesignOptions.
 */
function translateStyleOptionsToDesignOptions(
  styleOptions: SankeyStyleOptions,
): SankeyChartDesignOptions {
  return {
    ...BaseDesignOptions,
    orientation: resolveSankeyOrientation(styleOptions),
    curveFactor: styleOptions.curveFactor,
    linkOpacity: styleOptions.linkOpacity,
    nodeWidth: styleOptions.nodeWidth,
    nodePadding: styleOptions.nodePadding,
    nodeAlignment: styleOptions.nodeAlignment,
    legend: styleOptions.legend ?? { enabled: false },
  };
}

/**
 * Type guard: returns true only for plain (non-null, non-array) objects.
 */
function isCorrectStyleOptions(
  styleOptions: ChartStyleOptions,
): styleOptions is SankeyStyleOptions {
  return styleOptions !== null && !Array.isArray(styleOptions) && typeof styleOptions === 'object';
}

/**
 * Default style options for SankeyChart.
 */
function getDefaultStyleOptions(): SankeyStyleOptions {
  return {
    orientation: 'horizontal',
    nodeAlignment: 'top',
    curveFactor: 0.33,
    linkOpacity: 0.5,
    nodeWidth: 20,
    nodePadding: 10,
    legend: {
      enabled: false,
    },
  };
}

/** Translator bundle for converting between style and design options for the Sankey chart. */
export const designOptionsTranslators = {
  translateStyleOptionsToDesignOptions,
  isCorrectStyleOptions,
  getDefaultStyleOptions,
};
