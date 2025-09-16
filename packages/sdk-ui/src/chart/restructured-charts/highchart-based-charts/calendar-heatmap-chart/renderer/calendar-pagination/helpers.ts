import { MonthInfo, getDisplayMonths } from '../helpers/view-helpers.js';
import { CalendarHeatmapViewType } from '@/types.js';

// Helper function to format the title based on viewType and current months
export function formatViewTitle(
  availableMonths: MonthInfo[],
  currentViewIndex: number,
  viewType: CalendarHeatmapViewType,
): string {
  const monthsToDisplay = getDisplayMonths(availableMonths, currentViewIndex, viewType);

  if (viewType === 'month') {
    // For month view - show "Month Year" format
    const month = monthsToDisplay[0];
    return `${month.monthName} ${month.year}`;
  }

  // For other views: determine year range
  const startYear = monthsToDisplay[0].year;
  const endYear = monthsToDisplay[monthsToDisplay.length - 1].year;

  if (startYear === endYear) {
    return `${startYear}`;
  } else {
    return `${startYear} - ${endYear}`;
  }
}
