/* eslint-disable sonarjs/no-duplicate-string */
import { ContainerSize } from '@/dynamic-size-container/dynamic-size-container';
import { CalendarHeatmapSubtype, CalendarHeatmapViewType } from '@/types.js';

import { CALENDAR_HEATMAP_DEFAULTS, CALENDAR_HEATMAP_SIZING } from '../../constants';
import { CalendarHeatmapChartData } from '../../data';
import { ViewType } from '../../types';
import { CalendarDayOfWeek, getDayOfWeekIndex } from '../../utils';

export interface CalendarSize extends ContainerSize {
  cellSize: number;
}

/**
 * Grid dimensions for calendar layout
 */
interface GridDimensions {
  rows: number;
  cols: number;
}

/**
 * Calculate grid dimensions based on subtype and view type
 *
 * @param subtype - Calendar heatmap subtype
 * @param viewType - View type that determines layout
 * @returns Grid dimensions (rows and columns)
 */
function getCalendarGridDimensions(
  subtype: CalendarHeatmapSubtype,
  viewType: CalendarHeatmapViewType,
): GridDimensions {
  if (subtype === 'calendar-heatmap/continuous') {
    // For continuous subtype, calculate based on expected months per chart
    let monthsPerChart: number;
    switch (viewType) {
      case ViewType.MONTH:
        monthsPerChart = 1;
        break;
      case ViewType.QUARTER:
        monthsPerChart = 3;
        break;
      case ViewType.HALF_YEAR:
        monthsPerChart = 6;
        break;
      case ViewType.YEAR:
        monthsPerChart = 6; // Year view uses 2 chart instances with 6 months each
        break;
      default:
        monthsPerChart = 1;
    }

    // Estimate the number of weeks needed for the continuous layout
    // Each month can span 4-6 weeks, so we use an average of 5 weeks per month
    const estimatedWeeksPerChart = Math.ceil(monthsPerChart * 5);

    // For continuous layout: rows = 7 (days of week), cols = estimated weeks
    return {
      rows: CALENDAR_HEATMAP_SIZING.ROWS,
      cols: estimatedWeeksPerChart,
    };
  } else {
    // Split subtype: 7x7 grid per month
    return {
      rows: CALENDAR_HEATMAP_SIZING.ROWS,
      cols: CALENDAR_HEATMAP_SIZING.COLUMNS,
    };
  }
}

// Get grid layout info for different view types with responsive support
export function getViewGridInfo(
  viewType: CalendarHeatmapViewType,
  size: ContainerSize,
  subtype?: CalendarHeatmapSubtype,
) {
  // For continuous subtype, the grid layout is different
  if (subtype === 'calendar-heatmap/continuous') {
    if (viewType === ViewType.YEAR) {
      // Year view in continuous mode uses 2 chart instances stacked vertically
      return { cols: 1, rows: 2 };
    }
    // All other view types use 1 chart instance
    return { cols: 1, rows: 1 };
  }

  // Split subtype: responsive layouts based on container aspect ratio
  const isPortrait = size.height > size.width;

  switch (viewType) {
    case ViewType.MONTH:
      return { cols: 1, rows: 1 };

    case ViewType.QUARTER:
      // 3 charts total
      return isPortrait
        ? { cols: 1, rows: 3 } // Portrait: 1 col, 3 rows
        : { cols: 3, rows: 1 }; // Landscape: 1 row, 3 cols

    case ViewType.HALF_YEAR:
      // 6 charts total
      return isPortrait
        ? { cols: 2, rows: 3 } // Portrait: 2 cols, 3 rows
        : { cols: 3, rows: 2 }; // Landscape: 3 cols, 2 rows

    case ViewType.YEAR:
      // 12 charts total
      if (isPortrait) {
        return { cols: 3, rows: 4 }; // Portrait: 3 cols, 4 rows
      } else {
        // For very wide containers, use 2 rows x 6 cols, otherwise 3 rows x 4 cols
        const aspectRatio = size.width / size.height;
        return aspectRatio > 2.5
          ? { cols: 6, rows: 2 } // Very wide: 6 cols, 2 rows
          : { cols: 4, rows: 3 }; // Normal landscape: 4 cols, 3 rows
      }

    default:
      return { cols: 1, rows: 1 };
  }
}

/**
 * Calculate optimal calendar size based on available container space
 * Ensures calendar cells are perfectly square (width = height)
 */
export function calculateCalendarSize(
  containerSize: ContainerSize,
  subtype: CalendarHeatmapSubtype,
  viewType: CalendarHeatmapViewType,
): CalendarSize {
  const viewGrid = getViewGridInfo(viewType, containerSize, subtype);

  // Calculate available space for charts (excluding pagination)
  const availableWidth = containerSize.width;
  const availableHeight = containerSize.height - CALENDAR_HEATMAP_SIZING.PAGINATION_HEIGHT;

  // Calculate space per chart in the grid
  const gapWidth = (viewGrid.cols - 1) * CALENDAR_HEATMAP_SIZING.GAP_WIDTH;
  const gapHeight = (viewGrid.rows - 1) * CALENDAR_HEATMAP_SIZING.GAP_HEIGHT;

  // For multi-chart layouts, subtract padding
  const chartSpaceWidth =
    (availableWidth -
      gapWidth -
      CALENDAR_HEATMAP_SIZING.MARGINS.RIGHT -
      CALENDAR_HEATMAP_SIZING.MARGINS.LEFT) /
    viewGrid.cols;
  const chartSpaceHeight =
    (availableHeight -
      gapHeight -
      CALENDAR_HEATMAP_SIZING.MARGINS.TOP -
      CALENDAR_HEATMAP_SIZING.MARGINS.BOTTOM) /
    viewGrid.rows;

  // Reserve space for chart title in multi-chart layouts
  const titleHeight = viewType !== ViewType.MONTH ? CALENDAR_HEATMAP_SIZING.TITLE_HEIGHT : 0;
  const chartContentHeight = chartSpaceHeight - titleHeight;

  // Get grid dimensions based on subtype and view type
  const gridDimensions = getCalendarGridDimensions(subtype, viewType);

  // Calculate optimal cell size based on available space
  const cellSizeByWidth = chartSpaceWidth / gridDimensions.cols;
  const cellSizeByHeight = chartContentHeight / gridDimensions.rows;

  // Use the smaller dimension to ensure square cells
  let cellSize = Math.min(cellSizeByWidth, cellSizeByHeight);

  // Apply min/max constraints
  cellSize = Math.max(
    CALENDAR_HEATMAP_SIZING.MIN_CELL_SIZE,
    Math.min(CALENDAR_HEATMAP_SIZING.MAX_CELL_SIZE, cellSize),
  );

  // Calculate final chart size based on optimal cell size
  const calendarWidth = gridDimensions.cols * cellSize;
  const calendarHeight = gridDimensions.rows * cellSize;

  if (subtype === 'calendar-heatmap/continuous') {
    // For continuous subtype, use calculated dimensions directly
    return {
      width: Math.floor(calendarWidth),
      height: Math.floor(calendarHeight),
      cellSize: Math.floor(cellSize),
    };
  } else {
    // For split subtype, ensure square charts
    const baseChartSize = Math.floor(Math.min(calendarWidth, calendarHeight));
    return {
      width: baseChartSize,
      height: baseChartSize,
      cellSize: Math.floor(cellSize),
    };
  }
}

/**
 * Calculates available space for a single chart within the layout
 */
function calculateChartSpace(
  containerSize: ContainerSize,
  viewType: CalendarHeatmapViewType,
  subtype: CalendarHeatmapSubtype,
): { width: number; height: number } {
  const viewGrid = getViewGridInfo(viewType, containerSize, subtype);
  const availableHeight = containerSize.height - CALENDAR_HEATMAP_SIZING.PAGINATION_HEIGHT;

  const gapWidth = (viewGrid.cols - 1) * CALENDAR_HEATMAP_SIZING.GAP_WIDTH;
  const gapHeight = (viewGrid.rows - 1) * CALENDAR_HEATMAP_SIZING.GAP_HEIGHT;

  const chartSpaceWidth =
    (containerSize.width -
      gapWidth -
      CALENDAR_HEATMAP_SIZING.MARGINS.LEFT -
      CALENDAR_HEATMAP_SIZING.MARGINS.RIGHT) /
    viewGrid.cols;

  const titleHeight = viewType !== ViewType.MONTH ? CALENDAR_HEATMAP_SIZING.TITLE_HEIGHT : 0;
  const chartSpaceHeight =
    (availableHeight -
      gapHeight -
      CALENDAR_HEATMAP_SIZING.MARGINS.TOP -
      CALENDAR_HEATMAP_SIZING.MARGINS.BOTTOM) /
      viewGrid.rows -
    titleHeight;

  return { width: chartSpaceWidth, height: chartSpaceHeight };
}

/**
 * Calculates grid dimensions for continuous subtype based on chart data
 */
function calculateContinuousGridDimensions(
  chartData: CalendarHeatmapChartData,
  startOfWeek: CalendarDayOfWeek,
  subtype: CalendarHeatmapSubtype,
  viewType: CalendarHeatmapViewType,
): { rows: number; cols: number } {
  if (!chartData.values?.length) {
    const fallback = getCalendarGridDimensions(subtype, viewType);
    return { rows: fallback.rows, cols: fallback.cols };
  }

  const dates = chartData.values
    .map((item) => new Date(item.date))
    .sort((a, b) => a.getTime() - b.getTime());
  const firstDate = dates[0];

  const startOfWeekIndex = getDayOfWeekIndex(startOfWeek);
  const firstDateDayOfWeek = firstDate.getDay();
  const initialOffset =
    (firstDateDayOfWeek - startOfWeekIndex + CALENDAR_HEATMAP_DEFAULTS.DAYS_IN_WEEK) %
    CALENDAR_HEATMAP_DEFAULTS.DAYS_IN_WEEK;

  const totalColumns = Math.ceil(
    (dates.length + initialOffset) / CALENDAR_HEATMAP_DEFAULTS.DAYS_IN_WEEK,
  );

  return {
    rows: CALENDAR_HEATMAP_DEFAULTS.DAYS_IN_WEEK,
    cols: totalColumns,
  };
}

/**
 * Calculates internal margins for chart content
 */
function calculateInternalMargins(
  subtype: CalendarHeatmapSubtype,
  containerSize: ContainerSize,
): { left: number; top: number; right: number } {
  if (subtype === 'calendar-heatmap/split') {
    return { left: 0, top: 0, right: 0 };
  }

  const shouldShowLabels =
    containerSize.width >= CALENDAR_HEATMAP_DEFAULTS.SHOW_DAY_LABEL_CHART_SIZE_THRESHOLD;
  return {
    left: shouldShowLabels ? 60 : 0,
    top: shouldShowLabels ? 30 : 0,
    right: 10,
  };
}

/**
 * Calculates optimal cell size within constraints
 */
function calculateOptimalCellSize(
  availableWidth: number,
  availableHeight: number,
  cols: number,
  rows: number,
): number {
  const maxCellWidth = availableWidth / cols;
  const maxCellHeight = availableHeight / rows;
  const optimalSize = Math.min(maxCellWidth, maxCellHeight);

  return Math.max(
    CALENDAR_HEATMAP_SIZING.MIN_CELL_SIZE,
    Math.min(CALENDAR_HEATMAP_SIZING.MAX_CELL_SIZE, optimalSize),
  );
}

/**
 * Calculates chart size for a specific chart instance based on its data
 *
 * @param containerSize - Available container size
 * @param subtype - Calendar heatmap subtype
 * @param viewType - View type that determines layout
 * @param chartData - Chart data for this specific instance
 * @param startOfWeek - Week start preference (CalendarDayOfWeek)
 * @returns Calculated chart size with optimal cell dimensions
 */
export function calculateChartInstanceSize(
  containerSize: ContainerSize,
  subtype: CalendarHeatmapSubtype,
  viewType: CalendarHeatmapViewType,
  chartData: CalendarHeatmapChartData,
  startOfWeek: CalendarDayOfWeek,
): CalendarSize {
  // Calculate available space for this chart
  const chartSpace = calculateChartSpace(containerSize, viewType, subtype);

  // Get grid dimensions based on subtype
  const gridDimensions =
    subtype === 'calendar-heatmap/continuous'
      ? calculateContinuousGridDimensions(chartData, startOfWeek, subtype, viewType)
      : getCalendarGridDimensions(subtype, viewType);

  // Calculate internal margins
  const margins = calculateInternalMargins(subtype, containerSize);

  // Calculate available content space
  const contentWidth = chartSpace.width - margins.left - margins.right;
  const contentHeight = chartSpace.height - margins.top;

  // Calculate optimal cell size
  const cellSize = calculateOptimalCellSize(
    contentWidth,
    contentHeight,
    gridDimensions.cols,
    gridDimensions.rows,
  );

  // Calculate final dimensions
  const chartContentWidth = gridDimensions.cols * cellSize;
  const chartContentHeight = gridDimensions.rows * cellSize;

  const totalWidth = Math.min(contentWidth, chartContentWidth) + margins.left + margins.right;
  const totalHeight = Math.min(contentHeight, chartContentHeight) + margins.top;

  // Apply subtype-specific sizing rules
  if (subtype === 'calendar-heatmap/continuous') {
    return {
      width: Math.floor(totalWidth),
      height: Math.floor(totalHeight),
      cellSize: Math.floor(cellSize),
    };
  }

  const baseSize = Math.floor(Math.min(totalWidth, totalHeight));
  return {
    width: baseSize,
    height: baseSize,
    cellSize: Math.floor(cellSize),
  };
}
