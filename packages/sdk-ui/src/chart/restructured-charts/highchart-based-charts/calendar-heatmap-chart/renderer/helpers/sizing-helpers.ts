import { CalendarHeatmapViewType } from '@/types.js';
import { ViewType } from '../../types';
import { CALENDAR_HEATMAP_SIZING } from '../../constants';
import { ContainerSize } from '@/dynamic-size-container/dynamic-size-container';

export interface CalendarSize extends ContainerSize {
  cellSize: number;
}

// Get grid layout info for different view types with responsive support
export function getViewGridInfo(viewType: CalendarHeatmapViewType, size: ContainerSize) {
  // Responsive layouts based on container aspect ratio
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
  viewType: CalendarHeatmapViewType,
): CalendarSize {
  const viewGrid = getViewGridInfo(viewType, containerSize);

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

  // Calculate optimal cell size to fit the 7x7 grid
  const cellSizeByWidth = chartSpaceWidth / CALENDAR_HEATMAP_SIZING.COLUMNS;
  const cellSizeByHeight = chartContentHeight / CALENDAR_HEATMAP_SIZING.ROWS;

  // Use the smaller dimension to ensure the grid fits, and ensure square cells
  let cellSize = Math.min(cellSizeByWidth, cellSizeByHeight);

  // Apply min/max constraints
  cellSize = Math.max(
    CALENDAR_HEATMAP_SIZING.MIN_CELL_SIZE,
    Math.min(CALENDAR_HEATMAP_SIZING.MAX_CELL_SIZE, cellSize),
  );

  // Calculate final chart size based on optimal cell size
  const calendarWidth = CALENDAR_HEATMAP_SIZING.COLUMNS * cellSize;
  const calendarHeight = CALENDAR_HEATMAP_SIZING.ROWS * cellSize;

  const baseChartSize = Math.floor(Math.min(calendarWidth, calendarHeight));

  return {
    width: baseChartSize,
    height: baseChartSize,
    cellSize: Math.floor(cellSize),
  };
}
