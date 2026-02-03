import { CalendarHeatmapSubtype, CalendarHeatmapViewType } from '@/types.js';

import { CalendarHeatmapChartData } from '../../data.js';
import { prepareChartDataForMonth } from './data-helpers.js';
import { MonthInfo } from './view-helpers.js';

/**
 * Generates data per chart instance based on subtype and view type
 *
 * @param subtype - Calendar heatmap subtype
 * @param viewType - View type that determines how many months to display
 * @param monthsToDisplay - Array of months to display
 * @param chartData - Full chart data
 * @returns Array of chart data objects, one for each chart instance
 */
export function getDataPerChartInstance(
  subtype: CalendarHeatmapSubtype,
  viewType: CalendarHeatmapViewType,
  monthsToDisplay: MonthInfo[],
  chartData: CalendarHeatmapChartData,
): CalendarHeatmapChartData[] {
  if (subtype === 'calendar-heatmap/continuous') {
    // For calendar-heatmap/continuous, group months into chart instances based on viewType
    let chartInstances: MonthInfo[][] = [];

    switch (viewType) {
      case 'month':
        // 1 chart instance with 1 month
        chartInstances = [monthsToDisplay.slice(0, 1)];
        break;
      case 'quarter':
        // 1 chart instance with 3 months
        chartInstances = [monthsToDisplay.slice(0, 3)];
        break;
      case 'half-year':
        // 1 chart instance with 6 months
        chartInstances = [monthsToDisplay.slice(0, 6)];
        break;
      case 'year':
        // 2 chart instances with 6 months each
        chartInstances = [monthsToDisplay.slice(0, 6), monthsToDisplay.slice(6, 12)].filter(
          (group) => group.length > 0,
        );
        break;
      default:
        chartInstances = [monthsToDisplay];
    }

    return chartInstances.map((monthGroup) => {
      // Combine data from all months in this group
      return monthGroup.reduce(
        (acc, month) => {
          const monthData = prepareChartDataForMonth(chartData, month);
          return {
            ...acc,
            values: [...acc.values, ...monthData.values],
          };
        },
        { type: 'calendar-heatmap' as const, values: [] as typeof chartData.values },
      );
    });
  } else {
    // For calendar-heatmap/split, create separate charts for each month
    return monthsToDisplay.map((month) => {
      return prepareChartDataForMonth(chartData, month);
    });
  }
}
