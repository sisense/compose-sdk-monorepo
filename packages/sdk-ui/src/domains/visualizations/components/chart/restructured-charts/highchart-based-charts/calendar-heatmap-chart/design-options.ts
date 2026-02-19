import { BaseDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/base-design-options.js';
import { DesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import { CalendarHeatmapStyleOptions, ChartStyleOptions } from '@/types';

import { CALENDAR_HEATMAP_DEFAULTS } from './constants.js';

/**
 * Translates calendar heatmap style options to design options
 *
 * Converts user-provided style options to the internal design options format
 * used by the chart engine, applying default values where necessary.
 *
 * @param styleOptions - User-provided calendar heatmap style options
 * @returns Translated design options for internal use
 */
export function translateCalendarHeatmapStyleOptionsToDesignOptions(
  styleOptions: CalendarHeatmapStyleOptions,
): DesignOptions<'calendar-heatmap'> {
  return {
    ...BaseDesignOptions,
    width: styleOptions.width,
    height: styleOptions.height,
    subtype: styleOptions.subtype || CALENDAR_HEATMAP_DEFAULTS.SUBTYPE,
    viewType: styleOptions.viewType || CALENDAR_HEATMAP_DEFAULTS.VIEW_TYPE,
    startOfWeek: styleOptions.startOfWeek || CALENDAR_HEATMAP_DEFAULTS.START_OF_WEEK,
    cellLabels: {
      enabled: styleOptions.cellLabels?.enabled ?? CALENDAR_HEATMAP_DEFAULTS.SHOW_CELL_LABEL,
      style: styleOptions.cellLabels?.textStyle || styleOptions.cellLabels?.style,
    },
    dayLabels: {
      enabled: styleOptions.dayLabels?.enabled ?? CALENDAR_HEATMAP_DEFAULTS.SHOW_DAY_LABEL,
      style: styleOptions.dayLabels?.textStyle || styleOptions.dayLabels?.style,
    },
    monthLabels: {
      enabled: styleOptions.monthLabels?.enabled ?? CALENDAR_HEATMAP_DEFAULTS.SHOW_MONTH_LABEL,
      style: styleOptions.monthLabels?.textStyle || styleOptions.monthLabels?.style,
    },
    weekends: {
      enabled: styleOptions.weekends?.enabled ?? CALENDAR_HEATMAP_DEFAULTS.WEEKEND_ENABLED,
      days: styleOptions.weekends?.days ?? [...CALENDAR_HEATMAP_DEFAULTS.WEEKEND_DAYS],
      cellColor: styleOptions.weekends?.cellColor ?? CALENDAR_HEATMAP_DEFAULTS.WEEKEND_CELL_COLOR,
      hideValues:
        styleOptions.weekends?.hideValues ?? CALENDAR_HEATMAP_DEFAULTS.WEEKEND_HIDE_VALUES,
    },
    pagination: {
      enabled: styleOptions.pagination?.enabled ?? CALENDAR_HEATMAP_DEFAULTS.SHOW_PAGINATION,
      style: styleOptions.pagination?.textStyle,
      startMonth: styleOptions.pagination?.startMonth,
    },
  };
}

/**
 * Type guard to check if style options are valid for calendar heatmap charts
 *
 * Validates that the provided style options are properly structured for calendar heatmap charts.
 * Since all style options are optional, this primarily checks for basic object structure.
 *
 * @param styleOptions - Style options to validate
 * @returns True if the style options are valid for calendar heatmap charts
 */
export function isCalendarHeatmapStyleOptions(
  styleOptions: ChartStyleOptions,
): styleOptions is CalendarHeatmapStyleOptions {
  // All style options are optional, so we just need to check if it's an object
  return typeof styleOptions === 'object' && styleOptions !== null;
}
