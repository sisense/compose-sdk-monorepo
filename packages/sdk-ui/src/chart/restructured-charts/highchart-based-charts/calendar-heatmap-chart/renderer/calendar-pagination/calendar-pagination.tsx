import React from 'react';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '@/theme-provider/theme-context';
import { ArrowIcon } from '@/filters/components/icons/arrow-icon';
import { DoubleArrowIcon } from '@/filters/components/icons/double-arrow-icon';
import { DoubleArrowEndIcon } from '@/common/icons/double-arrow-end-icon';
import { MonthInfo, getMonthsPerView } from '../helpers/view-helpers.js';
import { formatViewTitle } from './helpers.js';
import { ViewType } from '../../types.js';
import { CalendarHeatmapViewType } from '@/types.js';

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.95);
  height: 50px;
  opacity: 1;
  transition: opacity 0.3s ease;
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

export const ViewDisplay = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  min-width: 110px;
  text-align: center;
  margin: 0 10px;
  text-transform: capitalize;
`;

interface CalendarPaginationProps {
  currentViewIndex: number;
  availableMonths: MonthInfo[];
  viewType: CalendarHeatmapViewType;
  onGoToFirst: () => void;
  onGoToPrevious: () => void;
  onGoToNext: () => void;
  onGoToLast: () => void;
  onGoToPreviousGroup?: () => void;
  onGoToNextGroup?: () => void;
}

export const CalendarPagination: React.FC<CalendarPaginationProps> = ({
  currentViewIndex,
  availableMonths,
  viewType,
  onGoToFirst,
  onGoToPrevious,
  onGoToNext,
  onGoToLast,
  onGoToPreviousGroup,
  onGoToNextGroup,
}) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();

  const monthsPerView = getMonthsPerView(viewType);

  const isAtFirst = currentViewIndex === 0;
  // For multi-month views, we're at last when we can't show a full group anymore
  const maxViewIndex =
    monthsPerView === 1
      ? availableMonths.length - 1
      : Math.max(0, availableMonths.length - monthsPerView);
  const isAtLast = currentViewIndex >= maxViewIndex;

  const canGoToPrevMonth = currentViewIndex > 0;
  const canGoToNextMonth = currentViewIndex < maxViewIndex;

  const viewTitle = formatViewTitle(availableMonths, currentViewIndex, viewType);

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
        onClick={onGoToFirst}
        title={firstMonthLabel}
        aria-label={firstMonthLabel}
      >
        <DoubleArrowEndIcon
          direction="left"
          disabled={isAtFirst}
          theme={themeSettings}
          width={30}
          height={30}
        />
      </NavigationButton>

      {/* Previous Group Button (only for multi-month views) */}
      {viewType !== ViewType.MONTH && onGoToPreviousGroup && (
        <NavigationButton
          disabled={isAtFirst}
          onClick={onGoToPreviousGroup}
          title={previousGroupLabel}
          aria-label={previousGroupLabel}
        >
          <DoubleArrowIcon
            direction="left"
            disabled={isAtFirst}
            theme={themeSettings}
            width={30}
            height={30}
          />
        </NavigationButton>
      )}

      {/* Previous Button - consolidated for both month and multi-month views */}
      <NavigationButton
        disabled={viewType === ViewType.MONTH ? isAtFirst : !canGoToPrevMonth}
        onClick={onGoToPrevious}
        title={previousMonthLabel}
        aria-label={previousMonthLabel}
      >
        <ArrowIcon
          direction="left"
          disabled={viewType === ViewType.MONTH ? isAtFirst : !canGoToPrevMonth}
          theme={themeSettings}
          width={30}
          height={30}
        />
      </NavigationButton>

      {/* Current View Display */}
      <ViewDisplay>{viewTitle}</ViewDisplay>

      {/* Next Button - consolidated for both month and multi-month views */}
      <NavigationButton
        disabled={viewType === ViewType.MONTH ? isAtLast : !canGoToNextMonth}
        onClick={onGoToNext}
        title={nextMonthLabel}
        aria-label={nextMonthLabel}
      >
        <ArrowIcon
          direction="right"
          disabled={viewType === ViewType.MONTH ? isAtLast : !canGoToNextMonth}
          theme={themeSettings}
          width={30}
          height={30}
        />
      </NavigationButton>

      {/* Next Group Button (only for multi-month views) */}
      {viewType !== ViewType.MONTH && onGoToNextGroup && (
        <NavigationButton
          disabled={isAtLast}
          onClick={onGoToNextGroup}
          title={nextGroupLabel}
          aria-label={nextGroupLabel}
        >
          <DoubleArrowIcon
            direction="right"
            disabled={isAtLast}
            theme={themeSettings}
            width={30}
            height={30}
          />
        </NavigationButton>
      )}

      {/* Last Button */}
      <NavigationButton
        disabled={isAtLast}
        onClick={onGoToLast}
        title={lastMonthLabel}
        aria-label={lastMonthLabel}
      >
        <DoubleArrowEndIcon
          direction="right"
          disabled={isAtLast}
          theme={themeSettings}
          width={30}
          height={30}
        />
      </NavigationButton>
    </PaginationContainer>
  );
};
