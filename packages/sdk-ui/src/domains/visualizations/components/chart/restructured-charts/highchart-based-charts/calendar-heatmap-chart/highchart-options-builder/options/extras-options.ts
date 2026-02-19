import { HighchartsOptionsInternal } from '@/domains/visualizations/core/chart-options-processor/chart-options-service.js';

/**
 * Prepares the Highcharts's extras options (title, colorAxis, accessibility) for calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Extras options object
 */
export function getExtrasOptions(): Partial<HighchartsOptionsInternal> {
  return {
    title: {
      text: null,
    },
    accessibility: {
      landmarkVerbosity: 'one' as const,
    },
  };
}
