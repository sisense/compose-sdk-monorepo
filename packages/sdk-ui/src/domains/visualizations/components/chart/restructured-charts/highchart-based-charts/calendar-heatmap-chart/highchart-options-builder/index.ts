import { CalendarHeatmapSubtype } from '@/types.js';

import { HighchartsOptionsBuilder } from '../../types.js';
import {
  getContinuousAxesOptions,
  getContinuousChartOptions,
  getContinuousSeriesOptions,
  getExtrasOptions,
  getLegendOptions,
  getPlotOptions,
  getSplitAxesOptions,
  getSplitChartOptions,
  getSplitSeriesOptions,
  getTooltipOptions,
} from './options/index.js';

/**
 * Highcharts options builder for split calendar heatmap charts
 *
 * Combines all individual configuration builders to create complete
 * Highcharts options for split calendar heatmap visualization.
 */
const splitCalendarHeatmapHighchartsOptionsBuilder: HighchartsOptionsBuilder<'calendar-heatmap'> = {
  getChart: getSplitChartOptions,
  getSeries: getSplitSeriesOptions,
  getAxes: getSplitAxesOptions,
  getLegend: getLegendOptions,
  getPlotOptions: getPlotOptions,
  getTooltip: getTooltipOptions,
  getExtras: getExtrasOptions,
};

/**
 * Highcharts options builder for continuous calendar heatmap charts
 *
 * Combines all individual configuration builders to create complete
 * Highcharts options for continuous calendar heatmap visualization.
 */
const continuousCalendarHeatmapHighchartsOptionsBuilder: HighchartsOptionsBuilder<'calendar-heatmap'> =
  {
    getChart: getContinuousChartOptions,
    getSeries: getContinuousSeriesOptions,
    getAxes: getContinuousAxesOptions,
    getLegend: getLegendOptions,
    getPlotOptions: getPlotOptions,
    getTooltip: getTooltipOptions,
    getExtras: getExtrasOptions,
  };

/**
 * Returns the appropriate Highcharts options builder based on calendar heatmap subtype
 *
 * @param subtype - Calendar heatmap subtype ('calendar-heatmap/split' or 'calendar-heatmap/continuous')
 * @returns Highcharts options builder for the specified subtype
 */
export function getCalendarHeatmapHighchartsOptionsBuilder(
  subtype: CalendarHeatmapSubtype,
): HighchartsOptionsBuilder<'calendar-heatmap'> {
  return subtype === 'calendar-heatmap/continuous'
    ? continuousCalendarHeatmapHighchartsOptionsBuilder
    : splitCalendarHeatmapHighchartsOptionsBuilder;
}

// Export individual builders for direct access if needed
export { continuousCalendarHeatmapHighchartsOptionsBuilder };
export { splitCalendarHeatmapHighchartsOptionsBuilder };
