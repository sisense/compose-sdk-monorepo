import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { HighchartsBasedChartRendererProps } from '../../highcharts-based-chart-renderer/highcharts-based-chart-renderer.js';
import { CalendarPagination } from './calendar-pagination/index.js';
import { CalendarHeatmapChartsGrid } from './calendar-heatmap-charts-grid.js';
import { useCalendarHeatmapChartOptions, useCalendarHeatmapNavigation } from './hooks/index.js';
import { ChartRendererProps } from '@/chart/types.js';
import { isCalendarHeatmapChartDataOptionsInternal } from '../data-options';
import { isCalendarHeatmapChartData } from '../data.js';
import { CalendarHeatmapViewType } from '@/types.js';
import { calculateCalendarSize } from './helpers/sizing-helpers.js';
import { useDateFormatter } from '@/common/hooks/useDateFormatter.js';
import { getAvailableMonths, shouldUseShortMonthNames } from './helpers/view-helpers.js';
import { Themable } from '@/theme-provider/types.js';
import { useThemeContext } from '@/theme-provider/index.js';

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

  // Get available months from data (with short names if chart is small)
  const availableMonths = useMemo(() => {
    const useShortNames = shouldUseShortMonthNames(chartSize);
    return getAvailableMonths(chartData, dateFormatter, useShortNames);
  }, [chartData, dateFormatter, chartSize]);

  // Initialize navigation
  const {
    currentViewIndex,
    goToFirstView,
    goToPreviousView,
    goToNextView,
    goToLastView,
    goToPreviousGroup,
    goToNextGroup,
  } = useCalendarHeatmapNavigation(availableMonths, viewType);

  // Generate chart options
  const chartOptionsPerMonth = useCalendarHeatmapChartOptions({
    chartData,
    dataOptions,
    designOptions,
    availableMonths,
    currentViewIndex,
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
      {availableMonths.length > 0 && (
        <CalendarPagination
          currentViewIndex={currentViewIndex}
          availableMonths={availableMonths}
          viewType={viewType}
          onGoToFirst={goToFirstView}
          onGoToPrevious={goToPreviousView}
          onGoToNext={goToNextView}
          onGoToLast={goToLastView}
          onGoToPreviousGroup={goToPreviousGroup}
          onGoToNextGroup={goToNextGroup}
        />
      )}

      <ChartsWrapper>
        <CalendarHeatmapChartsGrid
          monthCharts={chartOptionsPerMonth}
          availableMonths={availableMonths}
          currentViewIndex={currentViewIndex}
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
