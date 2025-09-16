import { HighchartsOptionsBuilder } from '../../types.js';
import {
  getAxesOptions,
  getChartOptions,
  getExtrasOptions,
  getLegendOptions,
  getPlotOptions,
  getSeriesOptions,
  getTooltipOptions,
} from './options';

/**
 * Main Highcharts options builder for calendar heatmap charts
 *
 * Combines all individual configuration builders to create complete
 * Highcharts options for calendar heatmap visualization.
 */
export const calendarHeatmapHighchartsOptionsBuilder: HighchartsOptionsBuilder<'calendar-heatmap'> =
  {
    getChart: getChartOptions,
    getSeries: getSeriesOptions,
    getAxes: getAxesOptions,
    getLegend: getLegendOptions,
    getPlotOptions: getPlotOptions,
    getTooltip: getTooltipOptions,
    getExtras: getExtrasOptions,
  };
