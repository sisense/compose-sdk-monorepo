import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service.js';

import { BuildContext } from '../../../../types.js';
import { CALENDAR_HEATMAP_DEFAULTS } from '../../../constants.js';
import {
  generateContinuousCalendarChartData,
  generateSplitCalendarChartData,
} from './calendar-data-generator.js';

/**
 * Prepares the Highcharts's series options for split calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Array of series options
 */
export function getSplitSeriesOptions(
  ctx: BuildContext<'calendar-heatmap'>,
): HighchartsOptionsInternal['series'] {
  const startOfWeek = ctx.designOptions.startOfWeek;
  const weekends = ctx.designOptions.weekends;

  // Generate split calendar chart data
  const calendarChartData = generateSplitCalendarChartData(
    ctx.chartData,
    ctx.extraConfig.dateFormatter,
    startOfWeek,
    weekends,
  );

  return [
    {
      name: 'Calendar Heatmap',
      type: 'heatmap',
      keys: ['x', 'y', 'value', 'date', 'color', 'custom'],
      data: calendarChartData,
      nullColor: CALENDAR_HEATMAP_DEFAULTS.NO_DATA_COLOR,
      borderWidth: CALENDAR_HEATMAP_DEFAULTS.BORDER_WIDTH,
      borderColor: 'transparent',
      colsize: 1, // Each cell spans 1 unit on x-axis
      rowsize: 1, // Each cell spans 1 unit on y-axis
    },
  ];
}

/**
 * Prepares the Highcharts's series options for continuous calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Array of series options
 */
export function getContinuousSeriesOptions(
  ctx: BuildContext<'calendar-heatmap'>,
): HighchartsOptionsInternal['series'] {
  const startOfWeek = ctx.designOptions.startOfWeek;
  const weekends = ctx.designOptions.weekends;

  // Generate continuous calendar chart data
  const calendarChartData = generateContinuousCalendarChartData(
    ctx.chartData,
    ctx.extraConfig.dateFormatter,
    startOfWeek,
    weekends,
  );

  return [
    {
      name: 'Calendar Heatmap',
      type: 'heatmap',
      keys: ['x', 'y', 'value', 'date', 'color', 'custom'],
      data: calendarChartData,
      nullColor: CALENDAR_HEATMAP_DEFAULTS.NO_DATA_COLOR,
      borderWidth: 1,
      borderColor: 'white',
      colsize: 1, // Each cell spans 1 unit on x-axis
      rowsize: 1, // Each cell spans 1 unit on y-axis
    },
  ];
}
