import { useMemo } from 'react';

import { CalendarHeatmapChartDataOptionsInternal } from '@/chart-data-options/types';
import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service';
import { CalendarHeatmapChartDesignOptions } from '@/chart-options-processor/translations/design-options';
import { ContainerSize } from '@/dynamic-size-container/dynamic-size-container';
import { BeforeRenderHandler } from '@/props';
import { CalendarHeatmapChartEventProps } from '@/props.jsx';
import {
  SisenseChartDataPointEventHandler,
  SisenseChartDataPointsEventHandler,
} from '@/sisense-chart/types.js';
import { CalendarHeatmapSubtype, CalendarHeatmapViewType } from '@/types.js';

import { buildHighchartsOptions } from '../../../highcharts-based-chart-renderer/build-highchart-options.js';
import { useExtraConfig } from '../../../highcharts-based-chart-renderer/use-extra-config.js';
import { CalendarHeatmapChartData } from '../../data.js';
import { getCalendarHeatmapHighchartsOptionsBuilder } from '../../highchart-options-builder/index.js';
import {
  getCalendarHeatmapDefaultColorOptions,
  withCalendarHeatmapDataColoring,
} from '../../utils/with-calendar-heatmap-data-coloring.js';
import { getDataPerChartInstance } from '../helpers/data-per-chart-instance.js';
import { calculateChartInstanceSize } from '../helpers/sizing-helpers.js';
import { getDisplayMonths, MonthData, MonthInfo } from '../helpers/view-helpers.js';

/**
 * Custom hook for generating extra config for calendar heatmap chart.
 *
 * @returns Extra config object
 */
const useCalendarHeatmapExtraConfig = () => {
  const extraConfig = useExtraConfig();
  return useMemo(
    () => ({
      ...extraConfig,
      themeSettings: {
        ...extraConfig.themeSettings,
        chart: {
          ...extraConfig.themeSettings.chart,
          animation: {
            ...extraConfig.themeSettings.chart.animation,
            redraw: {
              ...extraConfig.themeSettings.chart.animation.redraw,
              // Disable errorneous "redraw" animation for calendar heatmap chart
              duration: 0,
            },
          },
        },
      },
    }),
    [extraConfig],
  );
};

export interface UseCalendarHeatmapChartOptionsParams {
  chartData: CalendarHeatmapChartData;
  dataOptions: CalendarHeatmapChartDataOptionsInternal;
  designOptions: CalendarHeatmapChartDesignOptions;
  availableMonths: MonthInfo[];
  currentMonth: MonthData;
  subtype: CalendarHeatmapSubtype;
  viewType: CalendarHeatmapViewType;
  containerSize: ContainerSize;
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
 * @param params.currentMonth - Current month
 * @param params.viewType - View type that determines how many months to display
 * @param params.containerSize - Container size for calculating optimal chart dimensions
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
 *   currentMonth,
 *   viewType,
 *   containerSize,
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
  currentMonth,
  subtype,
  viewType,
  containerSize,
  eventHandlers,
  onBeforeRender,
}: UseCalendarHeatmapChartOptionsParams): HighchartsOptionsInternal[] {
  const extraConfig = useCalendarHeatmapExtraConfig();

  // Coloring should be applied to entire chart data, not just month data
  const chartDataWithColoring = useMemo(() => {
    const colorOptions =
      dataOptions.value.color ?? getCalendarHeatmapDefaultColorOptions(extraConfig.themeSettings);
    return withCalendarHeatmapDataColoring(colorOptions)(chartData);
  }, [chartData, dataOptions.value.color, extraConfig.themeSettings]);

  // Generate chart options for each chart instance
  return useMemo(() => {
    if (availableMonths.length === 0) return [];

    const monthsToDisplay = getDisplayMonths(availableMonths, currentMonth, viewType);
    const dataPerChartInstance = getDataPerChartInstance(
      subtype,
      viewType,
      monthsToDisplay,
      chartDataWithColoring,
    );

    return dataPerChartInstance.map((data) => {
      // Calculate chart size for this specific chart instance
      const chartSize = calculateChartInstanceSize(
        containerSize,
        subtype,
        viewType,
        data,
        designOptions.startOfWeek,
      );

      const highchartsOptionsBuilder = getCalendarHeatmapHighchartsOptionsBuilder(subtype);

      return buildHighchartsOptions({
        highchartsOptionsBuilder,
        chartData: data,
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
    currentMonth,
    viewType,
    subtype,
    chartDataWithColoring,
    dataOptions,
    designOptions,
    containerSize,
    eventHandlers.onDataPointClick,
    eventHandlers.onDataPointContextMenu,
    eventHandlers.onDataPointsSelected,
    extraConfig,
    onBeforeRender,
  ]);
}
