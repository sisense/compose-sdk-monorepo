import { getPaletteColor } from '@/domains/visualizations/core/chart-data-options/coloring/utils.js';
import { createDataColoringFunction } from '@/domains/visualizations/core/chart-data/data-coloring/create-data-coloring-function.js';
import { scaleBrightness } from '@/shared/utils/color/color-interpolation.js';
import { CompleteThemeSettings, DataColorOptions, RangeDataColorOptions } from '@/types';

import { CALENDAR_HEATMAP_COLORS } from '../constants.js';
import { CalendarHeatmapChartData, CalendarHeatmapDataValue } from '../data.js';

/**
 * Returns the default color options for calendar heatmap chart
 *
 * @param themeSettings - Theme settings
 * @returns Default color options
 */
export function getCalendarHeatmapDefaultColorOptions(
  themeSettings: CompleteThemeSettings,
): RangeDataColorOptions {
  const baseColor = getPaletteColor(themeSettings.palette.variantColors, 0);
  const minColor = scaleBrightness(baseColor, CALENDAR_HEATMAP_COLORS.MIN_COLOR_BRIGHTNESS_PERCENT);
  const maxColor = scaleBrightness(minColor, CALENDAR_HEATMAP_COLORS.MAX_COLOR_BRIGHTNESS_PERCENT);

  return {
    type: 'range',
    minColor,
    maxColor,
  };
}

/**
 * Creates a decorator function that applies data-driven coloring to calendar heatmap data values.
 * Uses a decorator pattern where the function accepts color options and returns a data transformer.
 *
 * @param colorOptions - Data color options configuration
 * @returns A decorator function that colors calendar heatmap data values
 */
export function withCalendarHeatmapDataColoring(
  colorOptions?: DataColorOptions,
): (data: CalendarHeatmapChartData) => CalendarHeatmapChartData {
  // Return identity function if no color options provided
  if (!colorOptions) {
    return (data: CalendarHeatmapChartData) => data;
  }

  const applyColoring = createDataColoringFunction({
    getValueFromDataStructure: (dataValue: CalendarHeatmapDataValue) => dataValue.value ?? 0,
    applyColorToDataStructure: (dataValue: CalendarHeatmapDataValue, color?: string) => ({
      ...dataValue,
      // Only apply generated color if no existing color (data table colors take priority)
      color: dataValue.color || color,
    }),
  });

  // Return the decorator function
  return (data: CalendarHeatmapChartData) => {
    return {
      ...data,
      values: applyColoring(data.values, colorOptions),
    };
  };
}
