import { HighchartsOptionsInternal } from '@/domains/visualizations/core/chart-options-processor/chart-options-service.js';

import { BuildContext } from '../../../types.js';
import { CALENDAR_HEATMAP_DEFAULTS } from '../../constants.js';

/**
 * Creates base chart options with common configuration
 *
 * @param ctx - The highcharts options builder context
 * @param margins - Margin configuration for the chart
 * @returns Highchart's chart options object
 */
function createBaseChartOptions(
  ctx: BuildContext<'calendar-heatmap'>,
): HighchartsOptionsInternal['chart'] {
  const chartWidth = ctx.designOptions.width ?? 0;
  const chartHeight = ctx.designOptions.height ?? 0;

  return {
    type: 'heatmap' as const,
    plotBorderWidth: CALENDAR_HEATMAP_DEFAULTS.BORDER_WIDTH,
    backgroundColor: 'transparent',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    spacing: [0, 0, 0, 0], // Remove default spacing to use calculated margins
    width: chartWidth,
    height: chartHeight,
    polar: false,
  };
}

/**
 * Prepares the Highcharts's chart options for split calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Highchart's chart options object
 */
export function getSplitChartOptions(
  ctx: BuildContext<'calendar-heatmap'>,
): HighchartsOptionsInternal['chart'] {
  const cellSize = ctx.designOptions.cellSize ?? 0;
  const chartWidth = ctx.designOptions.width ?? 0;
  const shouldShowDayLabels =
    chartWidth >= CALENDAR_HEATMAP_DEFAULTS.SHOW_DAY_LABEL_CHART_SIZE_THRESHOLD;

  return {
    ...createBaseChartOptions(ctx),
    marginTop: shouldShowDayLabels ? cellSize : 0,
  };
}

/**
 * Prepares the Highcharts's chart options for continuous calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Highchart's chart options object
 */
export function getContinuousChartOptions(
  ctx: BuildContext<'calendar-heatmap'>,
): HighchartsOptionsInternal['chart'] {
  const chartWidth = ctx.designOptions.width ?? 0;
  const shouldShowDayLabels =
    chartWidth >= CALENDAR_HEATMAP_DEFAULTS.SHOW_DAY_LABEL_CHART_SIZE_THRESHOLD;

  return {
    ...createBaseChartOptions(ctx),
    marginLeft: shouldShowDayLabels ? 60 : 0, // Space for day labels like "Mon", "Tue", etc.
    marginTop: shouldShowDayLabels ? 30 : 0, // Space for month labels on top
    marginRight: 10, // Extra space to prevent month label cutoff on the right
  };
}
