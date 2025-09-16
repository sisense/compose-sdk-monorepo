import { CalendarHeatmapViewType } from '@/types.js';
import { ViewType } from '../../types';

export interface CalendarSize {
  width: number;
  height: number;
  cellSize: number;
  chartMargins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ContainerSize {
  width: number;
  height: number;
}

// Calendar grid constants
const CALENDAR_GRID = {
  COLUMNS: 7, // Days of week
  ROWS: 6, // Maximum weeks in a month
  MIN_CELL_SIZE: 6,
  MAX_CELL_SIZE: 100,
  DEFAULT_MARGINS: {
    top: 60, // Space for month title and weekday labels
    right: 20,
    bottom: 30,
    left: 20,
  },
  TITLE_HEIGHT: 30, // Height for individual chart titles in multi-chart layouts
  PAGINATION_HEIGHT: 50, // Height reserved for pagination controls
};

// Get grid layout info for different view types
function getViewGridInfo(viewType: CalendarHeatmapViewType) {
  switch (viewType) {
    case ViewType.MONTH:
      return { cols: 1, rows: 1 };
    case ViewType.QUARTER:
      return { cols: 3, rows: 1 };
    case ViewType.HALF_YEAR:
      return { cols: 3, rows: 2 };
    case ViewType.YEAR:
      return { cols: 4, rows: 3 };
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
  viewType: CalendarHeatmapViewType,
): CalendarSize {
  const gap = calculateOptimalGap(containerSize, viewType);
  const viewGrid = getViewGridInfo(viewType);

  // Calculate available space for charts (excluding pagination)
  const availableWidth = containerSize.width;
  const availableHeight = containerSize.height - CALENDAR_GRID.PAGINATION_HEIGHT;

  // Calculate space per chart in the grid
  const gapWidth = (viewGrid.cols - 1) * gap;
  const gapHeight = (viewGrid.rows - 1) * gap;

  // For multi-chart layouts, subtract padding
  const containerPadding = viewType !== ViewType.MONTH ? 40 : 0; // 20px padding on each side
  const chartSpaceWidth = (availableWidth - gapWidth - containerPadding) / viewGrid.cols;
  const chartSpaceHeight = (availableHeight - gapHeight - containerPadding) / viewGrid.rows;

  // Reserve space for chart title in multi-chart layouts
  const titleHeight = viewType !== ViewType.MONTH ? CALENDAR_GRID.TITLE_HEIGHT : 0;
  const chartContentHeight = chartSpaceHeight - titleHeight;

  // Calculate the calendar grid space (excluding margins)
  const calendarGridWidth =
    chartSpaceWidth - CALENDAR_GRID.DEFAULT_MARGINS.left - CALENDAR_GRID.DEFAULT_MARGINS.right;
  const calendarGridHeight =
    chartContentHeight - CALENDAR_GRID.DEFAULT_MARGINS.top - CALENDAR_GRID.DEFAULT_MARGINS.bottom;

  // Calculate optimal cell size to fit the 7x6 grid
  const cellSizeByWidth = calendarGridWidth / CALENDAR_GRID.COLUMNS;
  const cellSizeByHeight = calendarGridHeight / CALENDAR_GRID.ROWS;

  // Use the smaller dimension to ensure the grid fits, and ensure square cells
  let cellSize = Math.min(cellSizeByWidth, cellSizeByHeight);

  // Apply min/max constraints
  cellSize = Math.max(CALENDAR_GRID.MIN_CELL_SIZE, Math.min(CALENDAR_GRID.MAX_CELL_SIZE, cellSize));

  // Calculate final chart size based on optimal cell size
  const calendarWidth = CALENDAR_GRID.COLUMNS * cellSize;
  const calendarHeight = CALENDAR_GRID.ROWS * cellSize;

  const chartWidth =
    calendarWidth + CALENDAR_GRID.DEFAULT_MARGINS.left + CALENDAR_GRID.DEFAULT_MARGINS.right;
  const chartHeight =
    calendarHeight + CALENDAR_GRID.DEFAULT_MARGINS.top + CALENDAR_GRID.DEFAULT_MARGINS.bottom;

  return {
    width: Math.floor(chartWidth),
    height: Math.floor(chartHeight),
    cellSize: Math.floor(cellSize),
    chartMargins: CALENDAR_GRID.DEFAULT_MARGINS,
  };
}

/**
 * Get optimal gap size based on container size and view type
 */
export function calculateOptimalGap(
  containerSize: ContainerSize,
  viewType: CalendarHeatmapViewType,
): number {
  // For single month, no gap needed
  if (viewType === ViewType.MONTH) return 0;

  // Calculate gap as a percentage of available space, with min/max limits
  const minGap = 10;
  const maxGap = 30;
  const gapRatio = 0.02; // 2% of container width

  const calculatedGap = containerSize.width * gapRatio;
  return Math.max(minGap, Math.min(maxGap, calculatedGap));
}
