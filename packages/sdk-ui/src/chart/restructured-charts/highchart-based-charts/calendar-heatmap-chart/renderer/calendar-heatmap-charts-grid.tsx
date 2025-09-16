/* eslint-disable sonarjs/no-duplicate-string */
import React from 'react';
import styled from '@emotion/styled';
import { HighchartsReactMemoized } from '@/highcharts-memorized';
import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service';
import { MonthInfo, getDisplayMonths } from './helpers/view-helpers.js';
import { ViewType } from '../types.js';
import { CalendarHeatmapViewType } from '@/types';

export const ChartsContainer = styled.div<{ viewType: CalendarHeatmapViewType }>`
  display: grid;
  grid-template-columns: ${(props) => {
    switch (props.viewType) {
      case ViewType.MONTH:
        return '1fr';
      case ViewType.QUARTER:
        return 'repeat(3, 1fr)';
      case ViewType.HALF_YEAR:
        return 'repeat(3, 1fr)';
      case ViewType.YEAR:
        return 'repeat(4, 1fr)';
      default:
        return '1fr';
    }
  }};
  grid-template-rows: ${(props) => {
    switch (props.viewType) {
      case ViewType.YEAR:
        return 'repeat(3, 1fr)';
      case ViewType.HALF_YEAR:
        return 'repeat(2, 1fr)';
      default:
        return '1fr';
    }
  }};
  background-color: white;
  place-items: center; /* Center each grid item horizontally and vertically */
  width: 100%;
  height: 100%;
`;

export const ChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ChartTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: center;
`;

interface CalendarHeatmapChartsGridProps {
  monthCharts: (HighchartsOptionsInternal | null)[];
  availableMonths: MonthInfo[];
  currentViewIndex: number;
  viewType: CalendarHeatmapViewType;
}

export const CalendarHeatmapChartsGrid: React.FC<CalendarHeatmapChartsGridProps> = ({
  monthCharts,
  availableMonths,
  currentViewIndex,
  viewType,
}) => {
  if (availableMonths.length === 0) return null;

  const monthsToDisplay = getDisplayMonths(availableMonths, currentViewIndex, viewType);

  return (
    <ChartsContainer viewType={viewType}>
      {monthCharts.map((chartOptions, index) => {
        if (!chartOptions) return null;

        const month = monthsToDisplay[index];
        if (!month) return null;

        return (
          <ChartWrapper key={`${month.year}-${month.month}`}>
            {viewType !== ViewType.MONTH && <ChartTitle>{month.monthName}</ChartTitle>}
            <HighchartsReactMemoized options={chartOptions} />
          </ChartWrapper>
        );
      })}
    </ChartsContainer>
  );
};
