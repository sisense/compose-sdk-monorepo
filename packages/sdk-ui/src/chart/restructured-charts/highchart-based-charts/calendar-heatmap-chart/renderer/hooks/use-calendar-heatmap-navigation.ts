import { useCallback, useState } from 'react';
import { MonthInfo, getMonthsPerView } from '../helpers/view-helpers.js';
import { CalendarHeatmapViewType } from '@/types.js';

export interface CalendarHeatmapNavigationResult {
  currentViewIndex: number;
  setCurrentViewIndex: (index: number) => void;
  goToFirstView: () => void;
  goToPreviousView: () => void;
  goToNextView: () => void;
  goToLastView: () => void;
  goToPreviousGroup: () => void;
  goToNextGroup: () => void;
}

/**
 * Custom hook for managing calendar navigation state and actions.
 *
 * Provides navigation functionality for calendar views including:
 * - Basic view navigation (first, previous, next, last) - moves by 1 month
 * - Group-level navigation - jumps by viewType amount (1, 3, 6, or 12 months)
 * - Current view index management
 *
 * @param availableMonths - Array of all available months
 * @param viewType - The current view type that determines jump size
 * @returns Navigation state and action functions
 *
 * @example
 * ```typescript
 * const { currentViewIndex, goToNextView, goToPreviousGroup } = useCalendarNavigation(
 *   availableMonths,
 *   viewType
 * );
 * ```
 */
export function useCalendarHeatmapNavigation(
  availableMonths: MonthInfo[],
  viewType: CalendarHeatmapViewType,
): CalendarHeatmapNavigationResult {
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  const goToFirstView = useCallback(() => {
    setCurrentViewIndex(0);
  }, []);

  const goToPreviousView = useCallback(() => {
    setCurrentViewIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNextView = useCallback(() => {
    const monthsPerView = getMonthsPerView(viewType);
    // For multi-month views, limit navigation to ensure we can always show a full group
    const maxIndex =
      monthsPerView === 1
        ? availableMonths.length - 1
        : Math.max(0, availableMonths.length - monthsPerView);
    setCurrentViewIndex((prev) => Math.min(maxIndex, prev + 1));
  }, [availableMonths.length, viewType]);

  const goToLastView = useCallback(() => {
    const monthsPerView = getMonthsPerView(viewType);
    // For multi-month views, go to the position where the last month is visible
    const lastIndex =
      monthsPerView === 1
        ? availableMonths.length - 1
        : Math.max(0, availableMonths.length - monthsPerView);
    setCurrentViewIndex(lastIndex);
  }, [availableMonths.length, viewType]);

  const goToPreviousGroup = useCallback(() => {
    const navigationStep = getMonthsPerView(viewType);
    setCurrentViewIndex((prev) => Math.max(0, prev - navigationStep));
  }, [viewType]);

  const goToNextGroup = useCallback(() => {
    const navigationStep = getMonthsPerView(viewType);
    const monthsPerView = getMonthsPerView(viewType);
    // For multi-month views, limit navigation to ensure we can always show a full group
    const maxIndex =
      monthsPerView === 1
        ? availableMonths.length - 1
        : Math.max(0, availableMonths.length - monthsPerView);
    setCurrentViewIndex((prev) => Math.min(maxIndex, prev + navigationStep));
  }, [viewType, availableMonths.length]);

  return {
    currentViewIndex,
    setCurrentViewIndex,
    goToFirstView,
    goToPreviousView,
    goToNextView,
    goToLastView,
    goToPreviousGroup,
    goToNextGroup,
  };
}
