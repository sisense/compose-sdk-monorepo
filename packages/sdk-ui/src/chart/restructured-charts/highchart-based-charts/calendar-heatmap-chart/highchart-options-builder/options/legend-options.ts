import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service';

/**
 * Prepares the Highcharts's legend options for calendar heatmap
 *
 * @param ctx - The highcharts options builder context
 * @returns Legend options object
 */
export function getLegendOptions(): HighchartsOptionsInternal['legend'] {
  return {
    enabled: false, // Disable legend for calendar heatmap
  };
}
