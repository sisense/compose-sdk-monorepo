import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service.js';
import { BuildContext } from '../../../types.js';
import {
  CALENDAR_LAYOUT,
  CALENDAR_TYPOGRAPHY,
  CALENDAR_HEATMAP_DEFAULTS,
} from '../../constants.js';

/**
 * Calculates axis font size based on cell size
 *
 * @param cellSize - The size of each calendar cell
 * @returns Calculated font size for axis labels
 *
 * @internal
 */
function calculateAxisFontSize(cellSize: number): number {
  const calculatedSize = cellSize * CALENDAR_TYPOGRAPHY.AXIS_FONT_SIZE_RATIO;
  return Math.max(CALENDAR_TYPOGRAPHY.MIN_AXIS_FONT_SIZE, calculatedSize);
}

/**
 * Calculates axis offset based on cell size
 *
 * @param cellSize - The size of each calendar cell
 * @returns Calculated offset for axis positioning
 *
 * @internal
 */
function calculateAxisOffset(cellSize: number): number {
  return Math.max(20, cellSize * CALENDAR_TYPOGRAPHY.AXIS_OFFSET_RATIO);
}

/**
 * Calculates label Y position based on cell size
 *
 * @param cellSize - The size of each calendar cell
 * @returns Calculated Y position for axis labels
 *
 * @internal
 */
function calculateLabelYPosition(cellSize: number): number {
  return Math.max(15, cellSize * CALENDAR_TYPOGRAPHY.AXIS_LABEL_Y_RATIO);
}

/**
 * Prepares the Highcharts's axes options for calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Axes configuration object with xAxis and yAxis
 */
export function getAxesOptions(ctx: BuildContext<'calendar-heatmap'>): {
  xAxis: HighchartsOptionsInternal['xAxis'];
  yAxis: HighchartsOptionsInternal['yAxis'];
} {
  const cellSize = ctx.designOptions.cellSize || CALENDAR_HEATMAP_DEFAULTS.CELL_SIZE;
  const axisFontSize = calculateAxisFontSize(cellSize);
  const axisOffset = calculateAxisOffset(cellSize);
  const labelYPosition = calculateLabelYPosition(cellSize);

  return {
    xAxis: [
      {
        categories: [...CALENDAR_LAYOUT.WEEKDAY_LABELS],
        opposite: true,
        lineWidth: 0, // Remove axis line
        offset: axisOffset,
        labels: {
          rotation: 0,
          y: labelYPosition,
          style: {
            fontSize: `${axisFontSize}px`,
          },
        },
        accessibility: {
          description: 'weekdays',
          rangeDescription: 'X Axis is showing all 7 days of the week, starting with Sunday.',
        },
      },
    ],
    yAxis: [
      {
        min: 0,
        max: 5,
        tickInterval: 1, // Ensure proper grid spacing
        gridLineWidth: 0, // Remove grid lines for cleaner look
        accessibility: {
          description: 'weeks',
        },
        visible: false,
      },
    ],
  };
}
