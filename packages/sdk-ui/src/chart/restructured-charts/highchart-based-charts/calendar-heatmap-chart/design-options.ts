import { CalendarHeatmapStyleOptions, ChartStyleOptions } from '@/types';
import { DesignOptions } from '@/chart-options-processor/translations/types';
import { CALENDAR_HEATMAP_DEFAULTS } from './constants.js';
import { BaseDesignOptions } from '@/chart-options-processor/translations/base-design-options.js';

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
    viewType: styleOptions.viewType || CALENDAR_HEATMAP_DEFAULTS.VIEW_TYPE,
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
