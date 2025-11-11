import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service.js';

import { BuildContext } from '../../../../types.js';
import { CALENDAR_HEATMAP_DEFAULTS, THREE_LETTER_DAY_DATE_FORMAT } from '../../../constants.js';
import { ViewType } from '../../../types.js';
import { CalendarDayOfWeekEnum, getWeekdayLabels } from '../../../utils/index.js';
import { calculateAxisFontSize, generateContinuousMonthLabels } from './helpers.js';

/**
 * Prepares the Highcharts's axes options for continuous calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Axes configuration object with xAxis and yAxis
 */
export function getContinuousAxesOptions(ctx: BuildContext<'calendar-heatmap'>): {
  xAxis: HighchartsOptionsInternal['xAxis'];
  yAxis: HighchartsOptionsInternal['yAxis'];
} {
  const cellSize = ctx.designOptions.cellSize ?? 0;
  const startOfWeek = ctx.designOptions.startOfWeek;
  const dayLabels = ctx.designOptions.dayLabels;
  const monthLabels = ctx.designOptions.monthLabels;
  const viewType = ctx.designOptions.viewType;

  // Use 3-letter labels for continuous subtype
  const weekdayLabels = getWeekdayLabels(
    startOfWeek,
    ctx.extraConfig.dateFormatter,
    THREE_LETTER_DAY_DATE_FORMAT,
  ).reverse();

  // Day labels styling
  const dayLabelColor = dayLabels.style?.color || ctx.extraConfig.themeSettings?.chart.textColor;
  const dayLabelFontFamily =
    dayLabels.style?.fontFamily || ctx.extraConfig.themeSettings?.typography.fontFamily;
  const dayLabelFontSize = dayLabels.style?.fontSize ?? `${calculateAxisFontSize(cellSize)}px`;

  // Month labels styling
  const monthLabelColor =
    monthLabels.style?.color || ctx.extraConfig.themeSettings?.chart.textColor;
  const monthLabelFontFamily =
    monthLabels.style?.fontFamily || ctx.extraConfig.themeSettings?.typography.fontFamily;
  const monthLabelFontSize = monthLabels.style?.fontSize ?? `${calculateAxisFontSize(cellSize)}px`;

  // Generate month labels as x-axis categories for continuous layout
  const categories = generateContinuousMonthLabels(
    ctx.chartData,
    ctx.extraConfig.dateFormatter,
    startOfWeek,
    ctx.designOptions.cellSize,
  );

  // Continuous layout: weeks/months on x-axis, days of week on y-axis
  return {
    xAxis: [
      {
        categories,
        opposite: true, // Month labels on top
        lineWidth: 0,
        gridLineWidth: 0,
        offset: 0,
        labels: {
          enabled: monthLabels.enabled && viewType !== ViewType.MONTH,
          rotation: 0,
          overflow: 'justify', // Allow labels to extend beyond plot area if needed
          style: {
            fontSize: monthLabelFontSize,
            color: monthLabelColor,
            fontFamily: monthLabelFontFamily,
            textOverflow: 'none',
            ...(monthLabels.style?.fontWeight && { fontWeight: monthLabels.style.fontWeight }),
            ...(monthLabels.style?.fontStyle && { fontStyle: monthLabels.style.fontStyle }),
          },
        },
        accessibility: {
          description: 'months',
          rangeDescription: 'X Axis shows months in chronological order.',
        },
      },
    ],
    yAxis: [
      {
        categories: dayLabels.enabled ? [...weekdayLabels] : [],
        opposite: false,
        lineWidth: 0,
        gridLineWidth: 0,
        offset: 15,
        title: {
          text: null, // Remove the "Values" title
        },
        labels: {
          rotation: 0,
          style: {
            fontSize: dayLabelFontSize,
            color: dayLabelColor,
            fontFamily: dayLabelFontFamily,
            ...(dayLabels.style?.fontWeight && { fontWeight: dayLabels.style.fontWeight }),
            ...(dayLabels.style?.fontStyle && { fontStyle: dayLabels.style.fontStyle }),
            ...(dayLabels.style?.textOutline && { textOutline: dayLabels.style.textOutline }),
            ...(dayLabels.style?.pointerEvents && { pointerEvents: dayLabels.style.pointerEvents }),
            ...(dayLabels.style?.textOverflow && { textOverflow: dayLabels.style.textOverflow }),
          },
          enabled:
            dayLabels.enabled &&
            (ctx.designOptions.height ?? 0) >=
              CALENDAR_HEATMAP_DEFAULTS.SHOW_DAY_LABEL_CHART_SIZE_THRESHOLD,
        },
        accessibility: {
          description: 'days of week',
          rangeDescription: `Y Axis shows days of the week, starting with ${
            startOfWeek === CalendarDayOfWeekEnum.MONDAY ? 'Monday' : 'Sunday'
          }.`,
        },
      },
    ],
  };
}
