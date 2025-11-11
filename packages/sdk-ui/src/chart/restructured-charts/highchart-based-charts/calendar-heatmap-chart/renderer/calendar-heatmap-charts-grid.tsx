/* eslint-disable sonarjs/no-duplicate-string */
import React, { CSSProperties, useMemo } from 'react';

import styled from '@emotion/styled';

import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service';
import { ContainerSize } from '@/dynamic-size-container/dynamic-size-container';
import { HighchartsReactMemoized } from '@/highcharts-memorized';
import { useThemeContext } from '@/theme-provider/theme-context';
import { CalendarHeatmapSubtype, CalendarHeatmapViewType, TextStyle } from '@/types';

import { CALENDAR_HEATMAP_SIZING } from '../constants.js';
import { ViewType } from '../types.js';
import { getViewGridInfo } from './helpers/sizing-helpers.js';
import {
  getDisplayMonths,
  MonthData,
  MonthInfo,
  shouldUseShortMonthNames,
} from './helpers/view-helpers.js';

export const ChartsContainer = styled.div<{
  viewType: CalendarHeatmapViewType;
  gridCols: number;
  gridRows: number;
}>`
  display: grid;
  column-gap: 30px;
  row-gap: 10px;
  grid-template-columns: repeat(${(props) => props.gridCols}, 1fr);
  grid-template-rows: repeat(${(props) => props.gridRows}, 1fr);
  background-color: transparent;
  place-items: center; /* Center each grid item horizontally and vertically */
`;

export const ChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ChartTitle = styled.h3`
  font-size: 13px;
  font-weight: 400;
  color: #333;
  text-align: center;
  text-transform: capitalize;
  margin: 0;
  height: ${CALENDAR_HEATMAP_SIZING.TITLE_HEIGHT}px;
`;

interface CalendarHeatmapChartsGridProps {
  monthCharts: (HighchartsOptionsInternal | null)[];
  availableMonths: MonthInfo[];
  currentMonth: MonthData;
  subtype: CalendarHeatmapSubtype;
  viewType: CalendarHeatmapViewType;
  size: ContainerSize;
  monthLabels?: {
    enabled?: boolean;
    style?: TextStyle;
  };
}

export const CalendarHeatmapChartsGrid: React.FC<CalendarHeatmapChartsGridProps> = ({
  monthCharts,
  availableMonths,
  currentMonth,
  subtype,
  viewType,
  monthLabels,
  size,
}) => {
  const { themeSettings } = useThemeContext();

  // Calculate responsive grid layout
  const gridInfo = useMemo(() => {
    return getViewGridInfo(viewType, size, subtype);
  }, [viewType, subtype, size]);

  if (availableMonths.length === 0) return null;

  const monthsToDisplay = getDisplayMonths(availableMonths, currentMonth, viewType);

  return (
    <ChartsContainer viewType={viewType} gridCols={gridInfo.cols} gridRows={gridInfo.rows}>
      {monthCharts.map((chartOptions, index) => {
        if (!chartOptions) return null;

        const month = monthsToDisplay[index];
        if (!month) return null;

        // Determine whether to use short month names based on chart width
        const shouldUseShortMonthName = shouldUseShortMonthNames(chartOptions.chart.width ?? 0);

        return (
          <ChartWrapper key={`${month.year}-${month.month}`}>
            {monthLabels?.enabled &&
              viewType !== ViewType.MONTH &&
              subtype === 'calendar-heatmap/split' && (
                <ChartTitle
                  style={
                    {
                      ...monthLabels.style,
                      color: monthLabels.style?.color || themeSettings?.chart.textColor,
                      fontFamily:
                        monthLabels.style?.fontFamily || themeSettings?.typography.fontFamily,
                    } as CSSProperties
                  }
                >
                  {shouldUseShortMonthName ? month.shortMonthName : month.monthName}
                </ChartTitle>
              )}
            <HighchartsReactMemoized options={chartOptions} />
          </ChartWrapper>
        );
      })}
    </ChartsContainer>
  );
};
