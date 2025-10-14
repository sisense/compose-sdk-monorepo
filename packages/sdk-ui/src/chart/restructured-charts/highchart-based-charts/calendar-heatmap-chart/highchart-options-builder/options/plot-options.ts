import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service';
import { HighchartsDataPointContext } from '@/chart-options-processor/tooltip';

import { BuildContext } from '../../../types';
import { CALENDAR_HEATMAP_DEFAULTS, CALENDAR_TYPOGRAPHY } from '../../constants';

/**
 * Calculates font size based on cell size
 *
 * @param cellSize - The size of each calendar cell
 * @returns Calculated font size in pixels
 */
function calculateFontSize(cellSize: number): number {
  const calculatedSize = cellSize * CALENDAR_TYPOGRAPHY.FONT_SIZE_RATIO;
  return Math.max(
    CALENDAR_TYPOGRAPHY.MIN_FONT_SIZE,
    Math.min(CALENDAR_TYPOGRAPHY.MAX_FONT_SIZE, calculatedSize),
  );
}

/**
 * Prepares the Highcharts's plot options for calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Plot options object
 */
export function getPlotOptions(
  ctx: BuildContext<'calendar-heatmap'>,
): HighchartsOptionsInternal['plotOptions'] {
  const cellLabels = ctx.designOptions.cellLabels;
  const cellSize = ctx.designOptions?.cellSize ?? 0;
  const fontSize = cellLabels?.style?.fontSize || `${calculateFontSize(cellSize)}px`;
  const fontWeight = cellLabels?.style?.fontWeight ?? 'normal';
  const textOutline = cellLabels?.style?.textOutline ?? 'none';
  const fontFamily =
    cellLabels?.style?.fontFamily ?? ctx.extraConfig.themeSettings?.typography.fontFamily;
  const color = cellLabels?.style?.color || ctx.extraConfig.themeSettings?.chart.textColor;

  return {
    series: {},
    heatmap: {
      dataLabels: {
        enabled:
          cellLabels.enabled &&
          (ctx.designOptions?.width ?? 0) >=
            CALENDAR_HEATMAP_DEFAULTS.SHOW_CELL_LABEL_CHART_SIZE_THRESHOLD,
        style: {
          color,
          fontSize,
          fontWeight,
          textOutline,
          fontFamily,
          ...(cellLabels.style?.fontStyle && { fontStyle: cellLabels.style.fontStyle }),
          ...(cellLabels.style?.pointerEvents && { pointerEvents: cellLabels.style.pointerEvents }),
          ...(cellLabels.style?.textOverflow && { textOverflow: cellLabels.style.textOverflow }),
        },
        formatter: function (this: HighchartsDataPointContext) {
          const point = this.point;
          return point.custom && point.custom.monthDay ? point.custom.monthDay.toString() : '';
        },
      },
    },
  };
}
