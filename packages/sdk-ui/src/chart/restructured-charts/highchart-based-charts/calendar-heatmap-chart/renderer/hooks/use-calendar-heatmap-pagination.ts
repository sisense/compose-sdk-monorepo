import { useEffect, useState } from 'react';

import { usePrevious } from '@/common/hooks/use-previous.js';

import { CalendarHeatmapChartData } from '../../data.js';
import { convertDateToMonthData, MonthData } from '../helpers/view-helpers.js';

type UseCalendarHeatmapPaginationParams = {
  chartData: CalendarHeatmapChartData;
  startMonth?: Date;
};

type UseCalendarHeatmapPaginationResult = {
  currentMonth: MonthData;
  setCurrentMonth: (month: MonthData) => void;
};

/**
 * Custom hook for managing calendar pagination state and actions.
 *
 * Provides pagination functionality for calendar views including:
 * - Current month management
 *
 * @param params - The parameters for the hook
 * @param params.chartData - The calendar heatmap chart data
 * @param params.startMonth - Optional start month to display initially
 * @returns The result of the hook
 */
export const useCalendarHeatmapPagination = (
  params: UseCalendarHeatmapPaginationParams,
): UseCalendarHeatmapPaginationResult => {
  const { chartData, startMonth } = params;
  const prevStartMonth = usePrevious(startMonth);

  // Convert start month or first data date to MonthData
  const initialMonth = startMonth
    ? convertDateToMonthData(startMonth)
    : chartData.values.length > 0
    ? convertDateToMonthData(chartData.values[0].date)
    : { year: new Date().getFullYear(), month: new Date().getMonth() };

  const [currentMonth, setCurrentMonth] = useState<MonthData>(initialMonth);

  // Update current view date when start month changes
  useEffect(() => {
    if (!startMonth) return;

    if (!prevStartMonth || startMonth.getTime() !== prevStartMonth.getTime()) {
      setCurrentMonth(convertDateToMonthData(startMonth));
    }
  }, [startMonth, prevStartMonth, setCurrentMonth]);

  return {
    currentMonth,
    setCurrentMonth,
  };
};
