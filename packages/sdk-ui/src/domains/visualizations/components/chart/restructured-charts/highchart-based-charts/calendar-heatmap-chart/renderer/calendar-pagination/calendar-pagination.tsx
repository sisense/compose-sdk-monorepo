import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { ArrowIcon } from '@/domains/filters/components/icons/arrow-icon.js';
import { DoubleArrowIcon } from '@/domains/filters/components/icons/double-arrow-icon.js';
import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context';
import { Themable } from '@/infra/contexts/theme-provider/types.js';
import styled from '@/infra/styled/index.js';
import { DoubleArrowEndIcon } from '@/shared/icons/double-arrow-end-icon.js';
import { CalendarHeatmapViewType, TextStyle } from '@/types.js';

import { CALENDAR_HEATMAP_SIZING } from '../../constants.js';
import { ViewType } from '../../types.js';
import {
  compareMonthData,
  getMonthsPerView,
  MonthData,
  MonthInfo,
} from '../helpers/view-helpers.js';
import { formatViewTitle } from './helpers.js';

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  background-color: transparent;
  height: ${CALENDAR_HEATMAP_SIZING.PAGINATION_HEIGHT}px;
  opacity: 1;
  transition: opacity 0.3s ease;
  box-sizing: border-box;
`;

export const NavigationButton = styled.button<{ disabled: boolean }>`
  padding: 0;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: ${(props) => (props.disabled ? 0.3 : 1)};

  &:hover {
    background-color: ${(props) => (props.disabled ? 'transparent' : 'rgba(0, 0, 0, 0.05)')};
  }
`;

export const ViewDisplay = styled.div<Themable>`
  font-size: 15px;
  font-weight: 400;
  color: ${({ theme }) => theme.chart.textColor};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  min-width: 110px;
  text-align: center;
  margin: 0 10px;
  text-transform: capitalize;
`;

interface CalendarPaginationProps {
  value: MonthData;
  availableMonths: MonthInfo[];
  viewType: CalendarHeatmapViewType;
  onChange: (month: MonthData) => void;
  labelStyle?: TextStyle;
}

export const CalendarPagination: React.FC<CalendarPaginationProps> = ({
  value: currentMonth,
  availableMonths,
  viewType,
  onChange,
  labelStyle,
}) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();

  const monthsPerView = getMonthsPerView(viewType);

  // Calculate current view index based on currentMonth
  const currentViewIndex = availableMonths.findIndex(
    (month) => compareMonthData(month, currentMonth) === 0,
  );

  // Navigation functions that work with MonthData
  const handleGoToFirst = () => {
    const firstMonth = availableMonths[0];
    if (firstMonth) {
      onChange({ year: firstMonth.year, month: firstMonth.month });
    }
  };

  const handleGoToPrevious = () => {
    if (currentViewIndex > 0) {
      const targetMonth = availableMonths[currentViewIndex - 1];
      onChange({ year: targetMonth.year, month: targetMonth.month });
    }
  };

  const handleGoToNext = () => {
    if (currentViewIndex < availableMonths.length - 1) {
      const targetMonth = availableMonths[currentViewIndex + 1];
      onChange({ year: targetMonth.year, month: targetMonth.month });
    }
  };

  const handleGoToLast = () => {
    const targetIndex = Math.max(0, availableMonths.length - monthsPerView);
    const targetMonth = availableMonths[targetIndex];

    if (targetMonth) {
      onChange({ year: targetMonth.year, month: targetMonth.month });
    }
  };

  const handleGoToPreviousGroup = () => {
    const targetIndex = Math.max(0, currentViewIndex - monthsPerView);
    const targetMonth = availableMonths[targetIndex];

    if (targetMonth) {
      onChange({ year: targetMonth.year, month: targetMonth.month });
    }
  };

  const handleGoToNextGroup = () => {
    const targetIndex = Math.min(
      availableMonths.length - monthsPerView,
      currentViewIndex + monthsPerView,
    );
    const targetMonth = availableMonths[targetIndex];

    if (targetMonth) {
      onChange({ year: targetMonth.year, month: targetMonth.month });
    }
  };

  const isAtFirst = currentViewIndex === 0;
  // For multi-month views, we're at last when we can't show a full group anymore
  const maxViewIndex =
    monthsPerView === 1
      ? availableMonths.length - 1
      : Math.max(0, availableMonths.length - monthsPerView);
  const isAtLast = currentViewIndex >= maxViewIndex;

  const canGoToPrevMonth = currentViewIndex > 0;
  const canGoToNextMonth = currentViewIndex < maxViewIndex;

  const viewTitle = formatViewTitle(availableMonths, currentMonth, viewType);

  // Translation keys for navigation buttons
  const firstMonthLabel = t('calendarHeatmap.navigation.firstMonth');
  const lastMonthLabel = t('calendarHeatmap.navigation.lastMonth');
  const previousMonthLabel = t('calendarHeatmap.navigation.previousMonth');
  const nextMonthLabel = t('calendarHeatmap.navigation.nextMonth');
  const previousGroupLabel = t('calendarHeatmap.navigation.previousGroup');
  const nextGroupLabel = t('calendarHeatmap.navigation.nextGroup');

  return (
    <PaginationContainer>
      {/* First Button */}
      <NavigationButton
        disabled={isAtFirst}
        onClick={handleGoToFirst}
        title={firstMonthLabel}
        aria-label={firstMonthLabel}
        theme={themeSettings}
      >
        <DoubleArrowEndIcon
          direction="left"
          disabled={isAtFirst}
          theme={themeSettings}
          fill={themeSettings.chart.secondaryTextColor}
          width={CALENDAR_HEATMAP_SIZING.PAGINATION_BUTTON_SIZE.WIDTH}
          height={CALENDAR_HEATMAP_SIZING.PAGINATION_BUTTON_SIZE.HEIGHT}
        />
      </NavigationButton>

      {/* Previous Group Button (only for multi-month views) */}
      {viewType !== ViewType.MONTH && (
        <NavigationButton
          disabled={isAtFirst}
          onClick={handleGoToPreviousGroup}
          title={previousGroupLabel}
          aria-label={previousGroupLabel}
        >
          <DoubleArrowIcon
            direction="left"
            disabled={isAtFirst}
            theme={themeSettings}
            fill={themeSettings.chart.secondaryTextColor}
            width={CALENDAR_HEATMAP_SIZING.PAGINATION_BUTTON_SIZE.WIDTH}
            height={CALENDAR_HEATMAP_SIZING.PAGINATION_BUTTON_SIZE.HEIGHT}
          />
        </NavigationButton>
      )}

      {/* Previous Button - consolidated for both month and multi-month views */}
      <NavigationButton
        disabled={viewType === ViewType.MONTH ? isAtFirst : !canGoToPrevMonth}
        onClick={handleGoToPrevious}
        title={previousMonthLabel}
        aria-label={previousMonthLabel}
      >
        <ArrowIcon
          direction="left"
          disabled={viewType === ViewType.MONTH ? isAtFirst : !canGoToPrevMonth}
          theme={themeSettings}
          fill={themeSettings.chart.secondaryTextColor}
          width={CALENDAR_HEATMAP_SIZING.PAGINATION_BUTTON_SIZE.WIDTH}
          height={CALENDAR_HEATMAP_SIZING.PAGINATION_BUTTON_SIZE.HEIGHT}
        />
      </NavigationButton>

      {/* Current View Display */}
      <ViewDisplay theme={themeSettings} style={labelStyle as CSSProperties}>
        {viewTitle}
      </ViewDisplay>

      {/* Next Button - consolidated for both month and multi-month views */}
      <NavigationButton
        disabled={viewType === ViewType.MONTH ? isAtLast : !canGoToNextMonth}
        onClick={handleGoToNext}
        title={nextMonthLabel}
        aria-label={nextMonthLabel}
      >
        <ArrowIcon
          direction="right"
          disabled={viewType === ViewType.MONTH ? isAtLast : !canGoToNextMonth}
          theme={themeSettings}
          fill={themeSettings.chart.secondaryTextColor}
          width={CALENDAR_HEATMAP_SIZING.PAGINATION_BUTTON_SIZE.WIDTH}
          height={CALENDAR_HEATMAP_SIZING.PAGINATION_BUTTON_SIZE.HEIGHT}
        />
      </NavigationButton>

      {/* Next Group Button (only for multi-month views) */}
      {viewType !== ViewType.MONTH && (
        <NavigationButton
          disabled={isAtLast}
          onClick={handleGoToNextGroup}
          title={nextGroupLabel}
          aria-label={nextGroupLabel}
        >
          <DoubleArrowIcon
            direction="right"
            disabled={isAtLast}
            theme={themeSettings}
            fill={themeSettings.chart.secondaryTextColor}
            width={CALENDAR_HEATMAP_SIZING.PAGINATION_BUTTON_SIZE.WIDTH}
            height={CALENDAR_HEATMAP_SIZING.PAGINATION_BUTTON_SIZE.HEIGHT}
          />
        </NavigationButton>
      )}

      {/* Last Button */}
      <NavigationButton
        disabled={isAtLast}
        onClick={handleGoToLast}
        title={lastMonthLabel}
        aria-label={lastMonthLabel}
      >
        <DoubleArrowEndIcon
          direction="right"
          disabled={isAtLast}
          theme={themeSettings}
          fill={themeSettings.chart.secondaryTextColor}
          width={CALENDAR_HEATMAP_SIZING.PAGINATION_BUTTON_SIZE.WIDTH}
          height={CALENDAR_HEATMAP_SIZING.PAGINATION_BUTTON_SIZE.HEIGHT}
        />
      </NavigationButton>
    </PaginationContainer>
  );
};
