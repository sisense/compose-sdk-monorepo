import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service.js';

import { BuildContext } from '../../../../types.js';
import { CALENDAR_HEATMAP_DEFAULTS, SINGLE_LETTER_DAY_DATE_FORMAT } from '../../../constants.js';
import { CalendarDayOfWeekEnum, getWeekdayLabels } from '../../../utils/index.js';
import { calculateAxisFontSize, calculateLabelYPosition } from './helpers.js';

/**
 * Prepares the Highcharts's axes options for split calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Axes configuration object with xAxis and yAxis
 */
export function getSplitAxesOptions(ctx: BuildContext<'calendar-heatmap'>): {
  xAxis: HighchartsOptionsInternal['xAxis'];
  yAxis: HighchartsOptionsInternal['yAxis'];
} {
  const cellSize = ctx.designOptions.cellSize ?? 0;
  const startOfWeek = ctx.designOptions.startOfWeek;
  const dayLabels = ctx.designOptions.dayLabels;
  const labelYPosition = calculateLabelYPosition(cellSize);

  // Use single letter labels for split subtype
  const weekdayLabels = getWeekdayLabels(
    startOfWeek,
    ctx.extraConfig.dateFormatter,
    SINGLE_LETTER_DAY_DATE_FORMAT,
  );

  // Day labels styling
  const color = dayLabels.style?.color || ctx.extraConfig.themeSettings?.chart.textColor;
  const fontFamily =
    dayLabels.style?.fontFamily || ctx.extraConfig.themeSettings?.typography.fontFamily;
  const fontSize = dayLabels.style?.fontSize ?? `${calculateAxisFontSize(cellSize)}px`;

  // Split month layout: days of week on x-axis, weeks on y-axis,
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
        categories: [],
        min: 0,
        max: 5,
        tickInterval: 1,
        gridLineWidth: 0,
        title: {
          text: null, // Remove the "Values" title
        },
        accessibility: {
          description: 'weeks',
        },
        visible: false,
      },
    ],
  };
}
