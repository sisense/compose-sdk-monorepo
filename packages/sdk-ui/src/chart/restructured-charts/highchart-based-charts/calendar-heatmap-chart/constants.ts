import { ViewType } from './types';

/**
 * Default calendar heatmap chart configuration constants
 */
export const CALENDAR_HEATMAP_DEFAULTS = {
  /** Default cell size in pixels */
  CELL_SIZE: 50,
  /** Default view type */
  VIEW_TYPE: ViewType.MONTH,
  /** Default color for days without data */
  NO_DATA_COLOR: 'rgb(245, 245, 245)',
  /** Transparent color for empty calendar cells */
  EMPTY_CELL_COLOR: 'transparent',
  /** Default chart background color */
  BACKGROUND_COLOR: 'white',
  /** Default border width for cells */
  BORDER_WIDTH: 0,
  /** Minimum cell size for showing data labels */
  MIN_CELL_SIZE_FOR_LABELS: 10,
  /** Total cells in a full calendar grid (6 rows × 7 days) */
  TOTAL_CALENDAR_CELLS: 42,
  /** Days in a week */
  DAYS_IN_WEEK: 7,
  /** Maximum calendar rows */
  MAX_CALENDAR_ROWS: 6,
} as const;

/**
 * Calendar heatmap color scheme configuration
 */
export const CALENDAR_HEATMAP_COLORS = {
  /** Color stops for the heatmap gradient */
  GRADIENT_STOPS: [
    [0, '#f0f0f0'] as [number, string],
    [0.5, '#87CEEB'] as [number, string],
    [1, '#4682B4'] as [number, string],
  ],
  /** Default text color */
  TEXT_COLOR: '#333',
  /** Border color for tooltips */
  TOOLTIP_BORDER_COLOR: '#c0c0c0',
} as const;

/**
 * Calendar layout configuration
 */
export const CALENDAR_LAYOUT = {
  /** Weekday abbreviations for calendar header */
  WEEKDAY_LABELS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  /** Margin calculations based on cell size */
  MARGIN_RATIOS: {
    TOP: 0.8,
    BOTTOM: 0.4,
    LEFT: 0.3,
    RIGHT: 0.3,
  },
  /** Minimum margin values */
  MIN_MARGINS: {
    TOP: 60,
    BOTTOM: 30,
    LEFT: 20,
    RIGHT: 20,
  },
} as const;

/**
 * Font size and spacing calculations
 */
export const CALENDAR_TYPOGRAPHY = {
  /** Font size ratio relative to cell size */
  FONT_SIZE_RATIO: 0.2,
  /** Minimum font size */
  MIN_FONT_SIZE: 10,
  /** Maximum font size */
  MAX_FONT_SIZE: 24,
  /** Label position adjustment ratio */
  LABEL_Y_OFFSET_RATIO: 0.08,
  /** Axis label position ratio */
  AXIS_LABEL_Y_RATIO: 0.3,
  /** Axis offset ratio */
  AXIS_OFFSET_RATIO: 0.4,
  /** Axis label font size ratio */
  AXIS_FONT_SIZE_RATIO: 0.24,
  /** Minimum axis font size */
  MIN_AXIS_FONT_SIZE: 12,
} as const;

/**
 * Calendar heatmap data type
 */
export const CALENDAR_HEATMAP_DATA_TYPE = 'calendar-heatmap' as const;

/**
 * Full month date format
 */
export const FULL_MONTH_DATE_FORMAT = 'MMMM';
