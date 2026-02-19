import { ChartBuilder } from '@/domains/visualizations/components/chart/restructured-charts/types.js';

import { loadDataBySingleQuery } from '../../helpers/data-loading.js';
import {
  getCalendarHeatmapAttributes,
  getCalendarHeatmapMeasures,
  isCalendarHeatmapChartDataOptions,
  isCalendarHeatmapChartDataOptionsInternal,
  translateCalendarHeatmapChartDataOptions,
} from './data-options/index.js';
import { getCalendarHeatmapChartData } from './data.js';
import {
  isCalendarHeatmapStyleOptions,
  translateCalendarHeatmapStyleOptionsToDesignOptions,
} from './design-options.js';
import { CalendarHeatmap, isCalendarHeatmapProps } from './renderer/index.js';

/**
 * Calendar heatmap chart builder configuration
 *
 * Provides a complete configuration for building calendar heatmap charts,
 * including data processing, styling, and rendering capabilities.
 */
export const calendarHeatmapChartBuilder: ChartBuilder<'calendar-heatmap'> = {
  dataOptions: {
    translateDataOptionsToInternal: translateCalendarHeatmapChartDataOptions,
    getAttributes: getCalendarHeatmapAttributes,
    getMeasures: getCalendarHeatmapMeasures,
    isCorrectDataOptions: isCalendarHeatmapChartDataOptions,
    isCorrectDataOptionsInternal: isCalendarHeatmapChartDataOptionsInternal,
  },
  data: {
    loadData: loadDataBySingleQuery,
    getChartData: getCalendarHeatmapChartData,
  },
  designOptions: {
    translateStyleOptionsToDesignOptions: translateCalendarHeatmapStyleOptionsToDesignOptions,
    isCorrectStyleOptions: isCalendarHeatmapStyleOptions,
  },
  renderer: {
    ChartRendererComponent: CalendarHeatmap,
    isCorrectRendererProps: isCalendarHeatmapProps,
  },
};
