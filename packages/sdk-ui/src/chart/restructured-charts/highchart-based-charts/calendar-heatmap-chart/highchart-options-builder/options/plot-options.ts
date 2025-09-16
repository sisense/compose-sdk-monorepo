import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service';
import {
  CALENDAR_HEATMAP_COLORS,
  CALENDAR_HEATMAP_DEFAULTS,
  CALENDAR_TYPOGRAPHY,
} from '../../constants';
import { BuildContext } from '../../../types';
import { HighchartsDataPointContext } from '@/chart-options-processor/tooltip';

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
  const cellSize = ctx.designOptions?.cellSize || CALENDAR_HEATMAP_DEFAULTS.CELL_SIZE;
  const fontSize = calculateFontSize(cellSize);

  return {
    series: {},
    heatmap: {
      dataLabels: {
        enabled: cellSize >= CALENDAR_HEATMAP_DEFAULTS.MIN_CELL_SIZE_FOR_LABELS,
        style: {
          textOutline: 'none',
          fontWeight: 'normal',
          fontSize: `${fontSize}px`,
          color: CALENDAR_HEATMAP_COLORS.TEXT_COLOR,
        },
        y: cellSize * CALENDAR_TYPOGRAPHY.LABEL_Y_OFFSET_RATIO,
        formatter: function (this: HighchartsDataPointContext) {
          const point = this.point;
          // Show day number for all month days, empty string for empty tiles
          if (point.custom && point.custom.empty) {
            return '';
          }
          return point.custom && point.custom.monthDay ? point.custom.monthDay.toString() : '';
        },
      },
    },
  };
}
