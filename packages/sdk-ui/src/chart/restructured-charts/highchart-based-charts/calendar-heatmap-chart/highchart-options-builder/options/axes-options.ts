import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service.js';

import { BuildContext } from '../../../types.js';
import { CALENDAR_HEATMAP_DEFAULTS, CALENDAR_TYPOGRAPHY } from '../../constants.js';
import { CalendarDayOfWeekEnum, getWeekdayLabels } from '../../utils/index.js';

/**
 * Calculates axis font size based on cell size
 *
 * @param cellSize - The size of each calendar cell
 * @returns Calculated font size for axis labels
 *
 * @internal
 */
function calculateAxisFontSize(cellSize: number): number {
  const calculatedSize = cellSize * CALENDAR_TYPOGRAPHY.FONT_SIZE_RATIO;
  return Math.max(
    CALENDAR_TYPOGRAPHY.MIN_AXIS_FONT_SIZE,
    Math.min(CALENDAR_TYPOGRAPHY.MAX_FONT_SIZE, calculatedSize),
  );
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
  const LABEL_Y_POSITION_RATIO = 0.5;
  const LABEL_Y_POSITION_THRESHOLD = 30;
  return cellSize < LABEL_Y_POSITION_THRESHOLD ? cellSize * LABEL_Y_POSITION_RATIO : 0;
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
  const cellSize = ctx.designOptions.cellSize ?? 0;
  const startOfWeek = ctx.designOptions.startOfWeek;
  const dayLabels = ctx.designOptions.dayLabels;
  const labelYPosition = calculateLabelYPosition(cellSize);
  const weekdayLabels = getWeekdayLabels(startOfWeek, ctx.extraConfig.dateFormatter);
  const color = dayLabels.style?.color || ctx.extraConfig.themeSettings?.chart.textColor;
  const fontFamily =
    dayLabels.style?.fontFamily || ctx.extraConfig.themeSettings?.typography.fontFamily;
  const fontSize = dayLabels.style?.fontSize ?? `${calculateAxisFontSize(cellSize)}px`;

  return {
    xAxis: [
      {
        categories: dayLabels.enabled ? [...weekdayLabels] : [],
        opposite: true,
        lineWidth: 0, // Remove axis line
        offset: 0,
        labels: {
          rotation: 0,
          y: labelYPosition,
          style: {
            fontSize,
            color,
            fontFamily,
            ...(dayLabels.style?.fontWeight && { fontWeight: dayLabels.style.fontWeight }),
            ...(dayLabels.style?.fontStyle && { fontStyle: dayLabels.style.fontStyle }),
            ...(dayLabels.style?.textOutline && { textOutline: dayLabels.style.textOutline }),
            ...(dayLabels.style?.pointerEvents && { pointerEvents: dayLabels.style.pointerEvents }),
            ...(dayLabels.style?.textOverflow && { textOverflow: dayLabels.style.textOverflow }),
          },
          enabled:
            dayLabels.enabled &&
            (ctx.designOptions.width ?? 0) >=
              CALENDAR_HEATMAP_DEFAULTS.SHOW_DAY_LABEL_CHART_SIZE_THRESHOLD,
        },
        accessibility: {
          description: 'weekdays',
          rangeDescription: `X Axis is showing all 7 days of the week, starting with ${
            startOfWeek === CalendarDayOfWeekEnum.MONDAY ? 'Monday' : 'Sunday'
          }.`,
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
