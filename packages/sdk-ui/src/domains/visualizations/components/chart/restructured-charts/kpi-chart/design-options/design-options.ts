import { KpiChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { BaseDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/base-design-options.js';
import {
  KpiChartDesignOptions,
  KpiTextStyleInternal,
} from '@/domains/visualizations/core/chart-options-processor/translations/design-options.js';
import { ChartStyleOptions, KpiStyleOptions, KpiTextStyle } from '@/types';

/**
 * Default typography of the headline value: bold, upright, no case transform.
 * @internal
 */
export const KPI_VALUE_TEXT_STYLE_DEFAULTS: KpiTextStyleInternal = {
  fontWeight: '700',
  fontStyle: 'normal',
  textTransform: 'none',
};

/**
 * Default typography of the title text: semibold, upright, uppercased (the CSS adds a matching
 * letter-spacing only under `uppercase`).
 * @internal
 */
export const KPI_TITLE_TEXT_STYLE_DEFAULTS: KpiTextStyleInternal = {
  fontWeight: '600',
  fontStyle: 'normal',
  textTransform: 'uppercase',
};

/**
 * Default typography of the comparison's primary readout line: semibold, upright, no transform.
 * @internal
 */
export const KPI_COMPARISON_TEXT_STYLE_DEFAULTS: KpiTextStyleInternal = {
  fontWeight: '600',
  fontStyle: 'normal',
  textTransform: 'none',
};

/**
 * Resolves a user-facing {@link KpiTextStyle} against a section's defaults, field by field.
 * `undefined` user fields never erase a default, and `fontFamily` is only present when the user
 * supplied one (absent means "inherit the theme font").
 *
 * @param textStyle - User-provided text style, if any
 * @param defaults - The section's default typography
 * @returns Fully resolved typography for the renderer
 * @internal
 */
export function resolveKpiTextStyle(
  textStyle: KpiTextStyle | undefined,
  defaults: KpiTextStyleInternal,
): KpiTextStyleInternal {
  return {
    ...defaults,
    ...(textStyle?.fontFamily !== undefined && { fontFamily: textStyle.fontFamily }),
    ...(textStyle?.fontWeight !== undefined && { fontWeight: textStyle.fontWeight }),
    ...(textStyle?.fontStyle !== undefined && { fontStyle: textStyle.fontStyle }),
    ...(textStyle?.textTransform !== undefined && { textTransform: textStyle.textTransform }),
  };
}

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
      textStyle: resolveKpiTextStyle(styleOptions.value?.textStyle, KPI_VALUE_TEXT_STYLE_DEFAULTS),
    },
    title: {
      enabled: styleOptions.title?.enabled ?? true,
      text: styleOptions.title?.text,
      showValueTitle: styleOptions.title?.showValueTitle ?? true,
      showCategoryTitle: styleOptions.title?.showCategoryTitle ?? true,
      align: styleOptions.title?.align ?? 'space-between',
      textStyle: resolveKpiTextStyle(styleOptions.title?.textStyle, KPI_TITLE_TEXT_STYLE_DEFAULTS),
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
      textStyle: resolveKpiTextStyle(
        styleOptions.comparison?.textStyle,
        KPI_COMPARISON_TEXT_STYLE_DEFAULTS,
      ),
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
      align: 'space-between',
      // Spread a copy -- callers get their own object to mutate, so a consumer mutation can
      // never poison the shared module constant for every other caller.
      textStyle: { ...KPI_TITLE_TEXT_STYLE_DEFAULTS },
    },
    value: {
      textSize: 'auto',
      textStyle: { ...KPI_VALUE_TEXT_STYLE_DEFAULTS },
    },
    comparison: {
      display: 'percent',
      showIcon: true,
      textStyle: { ...KPI_COMPARISON_TEXT_STYLE_DEFAULTS },
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
