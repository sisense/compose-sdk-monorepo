import isNumber from 'lodash-es/isNumber';
import { BuildContext } from '../../../types.js';
import { CALENDAR_HEATMAP_COLORS } from '../../constants.js';
import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service.js';

/**
 * Calculates min and max values from chart data
 *
 * @param ctx - The highcharts options builder context
 * @returns Object containing minValue and maxValue
 */
function calculateValueRange(ctx: BuildContext<'calendar-heatmap'>) {
  let minValue = 0;
  let maxValue = 100;

  if (ctx.chartData.values && ctx.chartData.values.length > 0) {
    const values = ctx.chartData.values.map((d) => d.value).filter(isNumber);
    if (values.length > 0) {
      minValue = Math.min(...values);
      maxValue = Math.max(...values);
    }
  }

  return { minValue, maxValue };
}

/**
 * Prepares the Highcharts's extras options (title, colorAxis, accessibility) for calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Extras options object
 */
export function getExtrasOptions(
  ctx: BuildContext<'calendar-heatmap'>,
): Partial<HighchartsOptionsInternal> {
  const { minValue, maxValue } = calculateValueRange(ctx);

  return {
    title: {
      text: null,
    },
    accessibility: {
      landmarkVerbosity: 'one' as const,
    },
    colorAxis: {
      min: minValue,
      max: maxValue,
      stops: [...CALENDAR_HEATMAP_COLORS.GRADIENT_STOPS],
    },
  };
}
