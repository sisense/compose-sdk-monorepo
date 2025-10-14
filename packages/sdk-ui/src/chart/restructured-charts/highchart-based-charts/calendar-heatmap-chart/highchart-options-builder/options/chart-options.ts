import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service.js';

import { BuildContext } from '../../../types.js';
import { CALENDAR_HEATMAP_DEFAULTS } from '../../constants.js';

/**
 * Prepares the Highcharts's chart options for calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Highchart's chart options object
 */
export function getChartOptions(
  ctx: BuildContext<'calendar-heatmap'>,
): HighchartsOptionsInternal['chart'] {
  const cellSize = ctx.designOptions.cellSize ?? 0;
  const height = ctx.designOptions.height ?? 0;
  const shouldShowDayLabels =
    (ctx.designOptions.width ?? 0) >= CALENDAR_HEATMAP_DEFAULTS.SHOW_DAY_LABEL_CHART_SIZE_THRESHOLD;

  return {
    type: 'heatmap' as const,
    plotBorderWidth: CALENDAR_HEATMAP_DEFAULTS.BORDER_WIDTH,
    backgroundColor: 'transparent',
    marginTop: shouldShowDayLabels ? cellSize : 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    spacing: [0, 0, 0, 0], // Remove default spacing to use calculated margins
    width: ctx.designOptions.width,
    // If day labels are not shown, we need to subtract the cell size from the height
    height: shouldShowDayLabels ? height : height - cellSize,
    polar: false,
  };
}
