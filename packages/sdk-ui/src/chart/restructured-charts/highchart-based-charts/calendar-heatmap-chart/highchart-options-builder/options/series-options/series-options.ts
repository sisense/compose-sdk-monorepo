import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service.js';
import { BuildContext } from '../../../../types.js';
import { CALENDAR_HEATMAP_DEFAULTS } from '../../../constants.js';
import { generateCalendarChartData } from './calendar-data-generator.js';

/**
 * Prepares the Highcharts's series options for calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Array of series options
 */
export function getSeriesOptions(
  ctx: BuildContext<'calendar-heatmap'>,
): HighchartsOptionsInternal['series'] {
  const startOfWeek = ctx.designOptions?.startOfWeek;
  const weekends = ctx.designOptions.weekends;

  const calendarChartData = generateCalendarChartData(
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
