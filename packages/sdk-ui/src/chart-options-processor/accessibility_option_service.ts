import merge from 'ts-deepmerge';
import { HighchartsOptionsInternal } from './chart_options_service';

/*
 * Applies highcharts accessibility options to the chart.
 */
export const applyAccessibilityToChart = (
  chartOptions: HighchartsOptionsInternal,
): HighchartsOptionsInternal => {
  // TODO - Disable accessibility for now until we review the options
  return merge(chartOptions, { accessibility: { enabled: false } });
};
