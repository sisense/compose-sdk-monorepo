import { act, renderHook } from '@testing-library/react';

import { CalendarHeatmapChartData } from '../../../data.js';
import { MonthData } from '../../helpers/view-helpers.js';
import { useCalendarHeatmapPagination } from '../use-calendar-heatmap-pagination.js';

describe('useCalendarHeatmapPagination', () => {
  const mockChartData: CalendarHeatmapChartData = {
    type: 'calendar-heatmap',
    values: [
      {
        date: new Date('2023-01-15'),
        value: 100,
      },
      {
        date: new Date('2023-02-20'),
        value: 200,
      },
    ],
  };

  const emptyChartData: CalendarHeatmapChartData = {
    type: 'calendar-heatmap',
    values: [],
  };

  describe('initialization', () => {
    it('should initialize with startMonth when provided', () => {
      const startMonth = new Date('2023-06-15');
      const { result } = renderHook(() =>
        useCalendarHeatmapPagination({
          chartData: mockChartData,
          startMonth,
        }),
      );

      expect(result.current.currentMonth).toEqual({
        year: 2023,
        month: 5, // June is month 5 (0-based)
      });
    });

    it('should initialize with first data date when no startMonth provided', () => {
      const { result } = renderHook(() =>
        useCalendarHeatmapPagination({
          chartData: mockChartData,
        }),
      );

      expect(result.current.currentMonth).toEqual({
        year: 2023,
        month: 0, // January is month 0
      });
    });

    it('should initialize with current date when no data', () => {
      const currentDate = new Date();
      const { result } = renderHook(() =>
        useCalendarHeatmapPagination({
          chartData: emptyChartData,
        }),
      );

      expect(result.current.currentMonth).toEqual({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
      });
    });
  });

  describe('state updates', () => {
    it('should update currentMonth when startMonth changes', () => {
      const initialStartMonth = new Date('2023-01-01');
      const { result, rerender } = renderHook(
        ({ startMonth }: { startMonth?: Date }) =>
          useCalendarHeatmapPagination({
            chartData: mockChartData,
            startMonth,
          }),
        {
          initialProps: { startMonth: initialStartMonth as Date | undefined },
        },
      );

      expect(result.current.currentMonth).toEqual({
        year: 2023,
        month: 0,
      });

      // Update startMonth
      const newStartMonth = new Date('2023-07-01');
      rerender({ startMonth: newStartMonth });

      expect(result.current.currentMonth).toEqual({
        year: 2023,
        month: 6, // July is month 6
      });
    });
  });

  describe('manual state management', () => {
    it('should allow manual updates to currentMonth', () => {
      const { result } = renderHook(() =>
        useCalendarHeatmapPagination({
          chartData: mockChartData,
        }),
      );

      const newMonth: MonthData = { year: 2024, month: 5 };

      act(() => {
        result.current.setCurrentMonth(newMonth);
      });

      expect(result.current.currentMonth).toEqual(newMonth);
    });

    it('should be overridden by startMonth changes', () => {
      const initialStartMonth = new Date('2023-01-01');
      const { result, rerender } = renderHook(
        ({ startMonth }: { startMonth?: Date }) =>
          useCalendarHeatmapPagination({
            chartData: mockChartData,
            startMonth,
          }),
        {
          initialProps: { startMonth: initialStartMonth as Date | undefined },
        },
      );

      // Manual update
      const manualMonth: MonthData = { year: 2024, month: 8 };
      act(() => {
        result.current.setCurrentMonth(manualMonth);
      });

      expect(result.current.currentMonth).toEqual(manualMonth);

      // startMonth change should override manual update
      const newStartMonth = new Date('2023-12-01');
      rerender({ startMonth: newStartMonth });

      expect(result.current.currentMonth).toEqual({
        year: 2023,
        month: 11,
      });
    });
  });
});
