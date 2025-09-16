import { MonthInfo } from './view-helpers.js';
import { CalendarHeatmapChartData } from '../../data.js';

// Helper function to filter chart data for a specific month
export function filterChartDataForMonth(
  chartData: CalendarHeatmapChartData,
  targetYear: number,
  targetMonth: number,
): CalendarHeatmapChartData {
  if (!chartData.values || chartData.values.length === 0) {
    return chartData;
  }

  // Filter data points that match the target month/year
  const filteredData = chartData.values.filter((dataValue) => {
    return dataValue.date.getFullYear() === targetYear && dataValue.date.getMonth() === targetMonth;
  });

  return {
    ...chartData,
    values: filteredData,
  };
}

// Filter chart data for current view (multiple months)
export function filterChartDataForMonths(
  chartData: CalendarHeatmapChartData,
  months: MonthInfo[],
): CalendarHeatmapChartData {
  if (!months || months.length === 0) return chartData;

  // For single month view, use existing logic
  if (months.length === 1) {
    const month = months[0];
    return filterChartDataForMonth(chartData, month.year, month.month);
  }

  // For multi-month views, filter data for all months in the view
  const filteredData = chartData.values.filter((dataValue) => {
    const year = dataValue.date.getFullYear();
    const month = dataValue.date.getMonth();

    // Check if this date falls within any month in the current view
    return months.some(
      (viewMonth: MonthInfo) => viewMonth.year === year && viewMonth.month === month,
    );
  });

  return {
    ...chartData,
    values: filteredData,
  };
}
