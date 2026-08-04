import { KpiChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { BaseDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/base-design-options.js';
import { KpiChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options.js';
import { ChartStyleOptions, KpiStyleOptions } from '@/types';

/**
 * Translates KPI style options to design options.
 *
 * @param styleOptions - User-provided KPI style options
 * @param dataOptionsInternal - Translated data options, used to resolve data-dependent defaults
 * @returns Translated design options for internal use
 * @internal
 */
export function translateKpiStyleOptionsToDesignOptions(
  styleOptions: KpiStyleOptions,
  dataOptionsInternal: KpiChartDataOptionsInternal,
): KpiChartDesignOptions {
  return {
    ...BaseDesignOptions,
    width: styleOptions.width,
    height: styleOptions.height,
    layout: styleOptions.layout ?? 'standard',
    value: {
      textSize: styleOptions.value?.textSize ?? 'auto',
      noDataText: styleOptions.value?.noDataText,
      conditionalIcons: styleOptions.value?.conditionalIcons,
    },
    title: {
      enabled: styleOptions.title?.enabled ?? true,
      text: styleOptions.title?.text,
      showValueTitle: styleOptions.title?.showValueTitle ?? true,
      showCategoryTitle: styleOptions.title?.showCategoryTitle ?? true,
    },
    card: {
      backgroundColor: styleOptions.card?.backgroundColor,
      textAlign: styleOptions.card?.textAlign ?? 'left',
      showBorder: styleOptions.card?.showBorder ?? false,
      cornerRadius: styleOptions.card?.cornerRadius ?? 8,
    },
    sparkline: {
      // Sparkline can only be shown when a category dimension is present; an explicit opt-out
      // is always honored, but an explicit opt-in cannot force it on without category data.
      enabled: (styleOptions.sparkline?.enabled ?? true) && !!dataOptionsInternal.category,
      chartType: styleOptions.sparkline?.chartType ?? 'area',
    },
    comparison: {
      display: styleOptions.comparison?.display ?? 'percent',
      label: styleOptions.comparison?.label,
      ofGoalText: styleOptions.comparison?.ofGoalText,
      toGoText: styleOptions.comparison?.toGoText,
      // No default is injected here: `undefined` signals the renderer to apply its
      // sign-based default (positive delta green, negative red).
      color: styleOptions.comparison?.color,
      showIcon: styleOptions.comparison?.showIcon ?? true,
      conditionalIcons: styleOptions.comparison?.conditionalIcons,
    },
  };
}

/**
 * Checks whether the given style options are valid for KPI charts.
 *
 * @param styleOptions - Style options to validate
 * @returns True if the style options are valid for KPI charts
 * @internal
 */
export function isKpiStyleOptions(
  styleOptions: ChartStyleOptions,
): styleOptions is KpiStyleOptions {
  return typeof styleOptions === 'object' && styleOptions !== null && !('subtype' in styleOptions);
}

/**
 * Gets the default style options for KPI charts.
 *
 * Data-dependent defaults (like sparkline visibility) are intentionally left unset here so that
 * feeding this result back into {@link translateKpiStyleOptionsToDesignOptions} alongside the
 * actual {@link KpiChartDataOptionsInternal} resolves them the same way as an empty object would.
 *
 * @returns Default KPI style options
 * @internal
 */
export function getDefaultKpiStyleOptions(): KpiStyleOptions {
  return {
    layout: 'standard',
    title: {
      enabled: true,
      showValueTitle: true,
      showCategoryTitle: true,
    },
    value: {
      textSize: 'auto',
    },
    comparison: {
      display: 'percent',
      showIcon: true,
    },
    sparkline: {
      chartType: 'area',
    },
    card: {
      textAlign: 'left',
      showBorder: false,
      cornerRadius: 8,
    },
  };
}
