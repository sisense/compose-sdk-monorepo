import merge from 'ts-deepmerge';
import { HighchartsOptionsInternal } from './chart-options-service';

// Highcharts default is 1000ms
export const DEFAULT_ANIMATION_DURATION_MS_INIT = 600;

// Highcharts default is 500ms
export const DEFAULT_ANIMATION_DURATION_MS_UPDATE = 300;

/*
 * Applies common highcharts options to the chart.
 */
export const applyCommonHighchartsOptions = (
  chartOptions: HighchartsOptionsInternal,
  accessibilityEnabled: boolean,
): HighchartsOptionsInternal => {
  return merge(chartOptions, {
    accessibility: { enabled: accessibilityEnabled },
    chart: { animation: { duration: DEFAULT_ANIMATION_DURATION_MS_UPDATE } },
    plotOptions: {
      series: { animation: { duration: DEFAULT_ANIMATION_DURATION_MS_INIT } },
    },
    boost: { useGPUTranslations: true, usePreAllocated: true },
  });
};
