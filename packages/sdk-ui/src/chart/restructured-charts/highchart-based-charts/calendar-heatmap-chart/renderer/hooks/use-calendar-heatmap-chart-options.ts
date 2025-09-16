import { useMemo } from 'react';
import { CalendarHeatmapChartDataOptionsInternal } from '@/chart-data-options/types';
import { CalendarHeatmapChartDesignOptions } from '@/chart-options-processor/translations/design-options';
import { BeforeRenderHandler } from '@/props';
import { buildHighchartsOptions } from '../../../highcharts-based-chart-renderer/build-highchart-options.js';
import { calendarHeatmapHighchartsOptionsBuilder } from '../../highchart-options-builder/index.js';
import { filterChartDataForMonth } from '../helpers/data-helpers.js';
import { MonthInfo, getDisplayMonths } from '../helpers/view-helpers.js';
import { CalendarSize } from '../helpers/sizing-helpers.js';
import { CalendarHeatmapViewType } from '@/types.js';
import { useExtraConfig } from '../../../highcharts-based-chart-renderer/use-extra-config.js';
import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service';
import { CalendarHeatmapChartData } from '../../data.js';
import { CalendarHeatmapChartEventProps } from '@/props.jsx';
import {
  SisenseChartDataPointEventHandler,
  SisenseChartDataPointsEventHandler,
} from '@/sisense-chart/types.js';

export interface UseCalendarHeatmapChartOptionsParams {
  chartData: CalendarHeatmapChartData;
  dataOptions: CalendarHeatmapChartDataOptionsInternal;
  designOptions: CalendarHeatmapChartDesignOptions;
  availableMonths: MonthInfo[];
  currentViewIndex: number;
  viewType: CalendarHeatmapViewType;
  chartSize: CalendarSize;
  eventHandlers: Pick<
    CalendarHeatmapChartEventProps,
    'onDataPointClick' | 'onDataPointContextMenu' | 'onDataPointsSelected'
  >;
  onBeforeRender?: BeforeRenderHandler;
}

/**
 * Custom hook for generating Highcharts options for calendar heatmap charts.
 *
 * Transforms chart data, design options, and event handlers into Highcharts configuration
 * objects for each month in the current view. Each month gets its own chart instance
 * with filtered data and appropriate sizing.
 *
 * @param params - Configuration object containing all required parameters
 * @param params.chartData - The complete calendar heatmap chart data
 * @param params.dataOptions - Internal data options configuration
 * @param params.designOptions - Design and styling options for the chart
 * @param params.availableMonths - Array of all available months
 * @param params.currentViewIndex - Current view index
 * @param params.viewType - View type that determines how many months to display
 * @param params.chartSizes - Array of size configurations for each chart
 * @param params.eventHandlers - Event handlers for data point interactions
 * @param params.onBeforeRender - Optional callback executed before chart rendering
 * @returns Array of Highcharts options objects, one for each month in the current view
 *
 * @example
 * ```typescript
 * const chartOptionsPerMonth = useCalendarHeatmapChartOptions({
 *   chartData,
 *   dataOptions,
 *   designOptions,
 *   availableMonths,
 *   currentViewIndex,
 *   viewType,
 *   chartSize,
 *   eventHandlers: { onDataPointClick: handleClick },
 *   onBeforeRender
 * });
 * ```
 */
export function useCalendarHeatmapChartOptions({
  chartData,
  dataOptions,
  designOptions,
  availableMonths,
  currentViewIndex,
  viewType,
  chartSize,
  eventHandlers,
  onBeforeRender,
}: UseCalendarHeatmapChartOptionsParams): HighchartsOptionsInternal[] {
  const extraConfig = useExtraConfig();

  // Generate chart options for each month to display
  return useMemo(() => {
    if (availableMonths.length === 0) return [];

    const monthsToDisplay = getDisplayMonths(availableMonths, currentViewIndex, viewType);

    return monthsToDisplay.map((month) => {
      const monthData = filterChartDataForMonth(chartData, month.year, month.month);

      return buildHighchartsOptions({
        highchartsOptionsBuilder: calendarHeatmapHighchartsOptionsBuilder,
        chartData: monthData,
        dataOptions,
        designOptions: {
          ...designOptions,
          width: chartSize.width,
          height: chartSize.height,
          cellSize: chartSize.cellSize,
        },
        dataPointsEventHandlers: {
          onDataPointClick: eventHandlers.onDataPointClick as SisenseChartDataPointEventHandler,
          onDataPointContextMenu:
            eventHandlers.onDataPointContextMenu as SisenseChartDataPointEventHandler,
          onDataPointsSelected:
            eventHandlers.onDataPointsSelected as SisenseChartDataPointsEventHandler,
        },
        extraConfig,
        onBeforeRender,
      });
    });
  }, [
    availableMonths,
    currentViewIndex,
    viewType,
    chartData,
    dataOptions,
    designOptions,
    chartSize,
    eventHandlers.onDataPointClick,
    eventHandlers.onDataPointContextMenu,
    eventHandlers.onDataPointsSelected,
    extraConfig,
    onBeforeRender,
  ]);
}
