import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service.js';
import { BuildContext } from '../../../types.js';
import { CALENDAR_HEATMAP_DEFAULTS, CALENDAR_LAYOUT } from '../../constants.js';

/**
 * Calculates optimal margins for the calendar chart based on cell size
 *
 * @param cellSize - The size of each calendar cell in pixels
 * @returns Calculated margins for top, bottom, left, and right
 */
function calculateMargins(cellSize: number) {
  return {
    top: Math.max(CALENDAR_LAYOUT.MIN_MARGINS.TOP, cellSize * CALENDAR_LAYOUT.MARGIN_RATIOS.TOP),
    bottom: Math.max(
      CALENDAR_LAYOUT.MIN_MARGINS.BOTTOM,
      cellSize * CALENDAR_LAYOUT.MARGIN_RATIOS.BOTTOM,
    ),
    left: Math.max(CALENDAR_LAYOUT.MIN_MARGINS.LEFT, cellSize * CALENDAR_LAYOUT.MARGIN_RATIOS.LEFT),
    right: Math.max(
      CALENDAR_LAYOUT.MIN_MARGINS.RIGHT,
      cellSize * CALENDAR_LAYOUT.MARGIN_RATIOS.RIGHT,
    ),
  };
}

/**
 * Prepares the Highcharts's chart options for calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Highchart's chart options object
 */
export function getChartOptions(
  ctx: BuildContext<'calendar-heatmap'>,
): HighchartsOptionsInternal['chart'] {
  const cellSize = ctx.designOptions.cellSize || CALENDAR_HEATMAP_DEFAULTS.CELL_SIZE;
  const margins = calculateMargins(cellSize);

  return {
    type: 'heatmap' as const,
    plotBorderWidth: CALENDAR_HEATMAP_DEFAULTS.BORDER_WIDTH,
    backgroundColor: CALENDAR_HEATMAP_DEFAULTS.BACKGROUND_COLOR,
    marginTop: margins.top,
    marginBottom: margins.bottom,
    marginLeft: margins.left,
    marginRight: margins.right,
    spacing: [0, 0, 0, 0], // Remove default spacing to use calculated margins
    width: ctx.designOptions.width,
    height: ctx.designOptions.height,
    polar: false,
  };
}
