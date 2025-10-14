import { CalendarHeatmapChartData } from '../../data.js';

// Helper function to filter chart data for a specific month
export function filterChartDataForMonth(
  chartData: CalendarHeatmapChartData,
  targetYear: number,
  targetMonth: number,
): CalendarHeatmapChartData {
  if (!chartData.values || chartData.values.length === 0) {
    // For empty chart data, create a minimal structure for the target month
    // This ensures empty months still render a calendar grid
    return {
      ...chartData,
      values: [
        {
          date: new Date(targetYear, targetMonth, 1),
          // No value property - this creates an empty month
        },
      ],
    };
  }

  // Filter data points that match the target month/year
  const filteredData = chartData.values.filter((dataValue) => {
    return dataValue.date.getFullYear() === targetYear && dataValue.date.getMonth() === targetMonth;
  });

  // If no data found for this month, create empty month data
  if (filteredData.length === 0) {
    return {
      ...chartData,
      values: [
        {
          date: new Date(targetYear, targetMonth, 1),
          // No value property - this creates an empty month
        },
      ],
    };
  }

  return {
    ...chartData,
    values: filteredData,
  };
}
