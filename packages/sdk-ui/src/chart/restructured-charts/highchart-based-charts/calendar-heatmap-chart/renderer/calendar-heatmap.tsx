import React, { useMemo } from 'react';

import styled from '@emotion/styled';

import { ChartRendererProps } from '@/chart/types.js';
import { useDateFormatter } from '@/common/hooks/useDateFormatter.js';
import { useThemeContext } from '@/theme-provider/index.js';
import { Themable } from '@/theme-provider/types.js';
import { CalendarHeatmapViewType } from '@/types.js';

import { HighchartsBasedChartRendererProps } from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer.js';
import { isCalendarHeatmapChartDataOptionsInternal } from '../data-options';
import { isCalendarHeatmapChartData } from '../data.js';
import { CalendarHeatmapChartsGrid } from './calendar-heatmap-charts-grid.js';
import { CalendarPagination } from './calendar-pagination/index.js';
import { calculateCalendarSize } from './helpers/sizing-helpers.js';
import { getAvailableMonths, shouldUseShortMonthNames } from './helpers/view-helpers.js';
import { useCalendarHeatmapChartOptions, useCalendarHeatmapPagination } from './hooks/index.js';

export const ChartRootContainer = styled.div<Themable>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.chart.backgroundColor};
`;

export const ChartsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

export type CalendarHeatmapProps = HighchartsBasedChartRendererProps<'calendar-heatmap'>;

export function CalendarHeatmap({
  chartData,
  dataOptions,
  designOptions,
  onDataPointClick,
  onDataPointContextMenu,
  onDataPointsSelected,
  onBeforeRender,
  size,
}: CalendarHeatmapProps) {
  const { themeSettings } = useThemeContext();
  const dateFormatter = useDateFormatter();

  // Get viewType from design options
  const viewType: CalendarHeatmapViewType = designOptions.viewType;

  // Calculate common chart size for each chart in the layout
  const chartSize = useMemo(() => {
    return calculateCalendarSize(size, viewType);
  }, [size, viewType]);

  const { currentMonth, setCurrentMonth } = useCalendarHeatmapPagination({
    chartData,
    startMonth: designOptions.pagination?.startMonth,
  });

  // Get available months from data (with short names if chart is small)
  const availableMonths = useMemo(() => {
    const useShortNames = shouldUseShortMonthNames(chartSize);
    return getAvailableMonths(chartData, dateFormatter, useShortNames, currentMonth, viewType);
  }, [chartData, dateFormatter, chartSize, currentMonth, viewType]);

  // Generate chart options
  const chartOptionsPerMonth = useCalendarHeatmapChartOptions({
    chartData,
    dataOptions,
    designOptions,
    availableMonths,
    currentMonth,
    viewType,
    chartSize,
    eventHandlers: {
      onDataPointClick,
      onDataPointContextMenu,
      onDataPointsSelected,
    },
    onBeforeRender,
  });

  return (
    <ChartRootContainer theme={themeSettings}>
      {availableMonths.length > 0 && designOptions.pagination?.enabled && (
        <CalendarPagination
          value={currentMonth}
          availableMonths={availableMonths}
          viewType={viewType}
          onChange={setCurrentMonth}
          labelStyle={designOptions.pagination?.style}
        />
      )}

      <ChartsWrapper>
        <CalendarHeatmapChartsGrid
          monthCharts={chartOptionsPerMonth}
          availableMonths={availableMonths}
          currentMonth={currentMonth}
          viewType={viewType}
          monthLabels={designOptions.monthLabels}
          size={size}
        />
      </ChartsWrapper>
    </ChartRootContainer>
  );
}

export const isCalendarHeatmapProps = (props: ChartRendererProps): props is CalendarHeatmapProps =>
  !!props.chartData &&
  isCalendarHeatmapChartData(props.chartData) &&
  isCalendarHeatmapChartDataOptionsInternal(props.dataOptions);
