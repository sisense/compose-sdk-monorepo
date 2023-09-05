import merge from 'ts-deepmerge';
import { HighchartsOptionsInternal } from './chart_options_service';

// Highcharts default is 1000ms
export const DEFAULT_ANIMATION_DURATION_MS_INIT = 600;

// Highcharts default is 500ms
export const DEFAULT_ANIMATION_DURATION_MS_UPDATE = 300;

/*
 * Applies common highcharts options to the chart.
 */
export const applyCommonHighchartsOptions = (
  chartOptions: HighchartsOptionsInternal,
): HighchartsOptionsInternal => {
  return merge(chartOptions, {
    // TODO - Disable accessibility for now until we review the options
    accessibility: { enabled: false },
    chart: { animation: { duration: DEFAULT_ANIMATION_DURATION_MS_UPDATE } },
    plotOptions: {
      series: { animation: { duration: DEFAULT_ANIMATION_DURATION_MS_INIT } },
    },
    boost: { useGPUTranslations: true, usePreAllocated: true },
  });
};
