import { ViewType } from '../../types';
import { CalendarHeatmapChartData } from '../../data';
import { FULL_MONTH_DATE_FORMAT } from '../../constants';
import { CalendarHeatmapViewType } from '@/types';

export interface MonthInfo {
  year: number;
  month: number;
  monthName: string;
}

// Helper function to get available months from chart data
export function getAvailableMonths(
  chartData: CalendarHeatmapChartData,
  dateFormatter: (date: Date, format: string) => string,
): MonthInfo[] {
  if (!chartData.values || chartData.values.length === 0) return [];

  const monthsSet = new Set<string>();
  const months: MonthInfo[] = [];

  chartData.values.forEach((dataPoint) => {
    const year = dataPoint.date.getFullYear();
    const month = dataPoint.date.getMonth();
    const key = `${year}-${month}`;

    if (!monthsSet.has(key)) {
      monthsSet.add(key);
      months.push({
        year,
        month,
        monthName: dateFormatter(dataPoint.date, FULL_MONTH_DATE_FORMAT),
      });
    }
  });

  // Sort months chronologically
  return months.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

// Get number of months to display simultaneously based on viewType
export function getMonthsPerView(viewType: CalendarHeatmapViewType): number {
  switch (viewType) {
    case ViewType.MONTH:
      return 1;
    case ViewType.QUARTER:
      return 3;
    case ViewType.HALF_YEAR:
      return 6;
    case ViewType.YEAR:
      return 12;
    default:
      return 1;
  }
}

// Get grid layout configuration for different view types
export function getGridLayout(viewType: CalendarHeatmapViewType) {
  switch (viewType) {
    case ViewType.MONTH:
      return { columns: '1fr', rows: '1fr' };
    case ViewType.QUARTER:
      // eslint-disable-next-line sonarjs/no-duplicate-string
      return { columns: 'repeat(3, 1fr)', rows: '1fr' };
    case ViewType.HALF_YEAR:
      return { columns: 'repeat(3, 1fr)', rows: 'repeat(2, 1fr)' };
    case ViewType.YEAR:
      return { columns: 'repeat(4, 1fr)', rows: 'repeat(3, 1fr)' };
    default:
      return { columns: '1fr', rows: '1fr' };
  }
}

// Get the months to display for the current view based on viewType
export function getDisplayMonths(
  availableMonths: MonthInfo[],
  currentViewIndex: number,
  viewType: CalendarHeatmapViewType,
): MonthInfo[] {
  const monthsPerView = getMonthsPerView(viewType);

  // For month view, just return the single month
  if (monthsPerView === 1) {
    return availableMonths.slice(currentViewIndex, currentViewIndex + 1);
  }

  // For multi-month views, ensure we don't have empty months at the end
  // If we're near the end, adjust the start index to show a full group ending with the last month
  let startIndex = currentViewIndex;
  let endIndex = Math.min(startIndex + monthsPerView, availableMonths.length);

  // If we don't have enough months to fill the view, shift the start backwards
  if (endIndex - startIndex < monthsPerView && availableMonths.length >= monthsPerView) {
    startIndex = Math.max(0, availableMonths.length - monthsPerView);
    endIndex = availableMonths.length;
  }

  return availableMonths.slice(startIndex, endIndex);
}
