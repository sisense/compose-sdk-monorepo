import { CalendarHeatmapChartData, CalendarHeatmapDataValue } from '../../data.js';
import { MonthData } from './view-helpers.js';

/**
 * Filters and extends chart data for a specific month
 *
 * @param chartData - Original chart data (may have missing days)
 * @param targetYear - Target year
 * @param targetMonth - Target month (0-based)
 * @returns Chart data with all days in the month included
 */
function filterAndExtendChartForMonth(
  chartData: CalendarHeatmapChartData,
  targetMonth: MonthData,
): CalendarHeatmapChartData {
  // Create a map of existing data for quick lookup
  const existingDataMap = new Map<string, CalendarHeatmapDataValue>();

  // Filter and map existing data for the target month
  chartData.values.forEach((dataValue) => {
    if (
      dataValue.date.getFullYear() === targetMonth.year &&
      dataValue.date.getMonth() === targetMonth.month
    ) {
      // Use date string as key for consistent lookup
      const dateKey = `${targetMonth.year}-${targetMonth.month}-${dataValue.date.getDate()}`;
      existingDataMap.set(dateKey, dataValue);
    }
  });

  // Calculate the number of days in the target month
  const daysInMonth = new Date(targetMonth.year, targetMonth.month + 1, 0).getDate();

  // Generate all days in the month
  const allDaysData: CalendarHeatmapDataValue[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${targetMonth.year}-${targetMonth.month}-${day}`;
    const existingData = existingDataMap.get(dateKey);

    if (existingData) {
      // Use existing data if available
      allDaysData.push(existingData);
    } else {
      // Create placeholder data for missing days
      allDaysData.push({
        date: new Date(Date.UTC(targetMonth.year, targetMonth.month, day)),
        // No value property - represents missing data
      });
    }
  }

  return {
    ...chartData,
    values: allDaysData,
  };
}

// Helper function to filter chart data for a specific month and extend with all days
export function prepareChartDataForMonth(
  chartData: CalendarHeatmapChartData,
  targetMonth: MonthData,
): CalendarHeatmapChartData {
  if (!chartData.values || chartData.values.length === 0) {
    // For empty chart data, create chart data with all days in the month
    const emptyChartData: CalendarHeatmapChartData = {
      ...chartData,
      values: [],
    };
    return filterAndExtendChartForMonth(emptyChartData, targetMonth);
  }

  // Extend the chart data to include all days in the target month
  // This will filter existing data for the month and add missing days
  return filterAndExtendChartForMonth(chartData, targetMonth);
}
