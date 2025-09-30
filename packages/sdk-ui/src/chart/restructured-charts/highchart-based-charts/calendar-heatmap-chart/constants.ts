import { ViewType } from './types';

/**
 * Default calendar heatmap chart configuration constants
 */
export const CALENDAR_HEATMAP_DEFAULTS = {
  /** Default view type */
  VIEW_TYPE: ViewType.MONTH,
  /** Default color for days without data */
  NO_DATA_COLOR: '#f5f5f5',
  /** Default border width for cells */
  BORDER_WIDTH: 0,
  /** Minimum cell size for showing data labels */
  MIN_CELL_SIZE_FOR_LABELS: 20,
  /** Total cells in a full calendar grid (6 rows × 7 days) */
  TOTAL_CALENDAR_CELLS: 42,
  /** Days in a week */
  DAYS_IN_WEEK: 7,
  /** Maximum calendar rows */
  MAX_CALENDAR_ROWS: 6,
  /** Show cell labels (day numbers) by default */
  SHOW_CELL_LABEL: true,
  /** Show day labels (weekday names) by default */
  SHOW_DAY_LABEL: true,
  /** Show month labels by default */
  SHOW_MONTH_LABEL: true,
  /** Minimum сhart size threshold for using short month names */
  SHORT_MONTH_NAME_CHART_SIZE_THRESHOLD: 120,
  /** Minimum сhart size threshold for showing day labels */
  SHOW_DAY_LABEL_CHART_SIZE_THRESHOLD: 120,
  /** Minimum сhart size threshold for showing cell labels */
  SHOW_CELL_LABEL_CHART_SIZE_THRESHOLD: 120,
  /** Default weekend enabled state */
  WEEKEND_ENABLED: false,
  /** Default weekend days */
  WEEKEND_DAYS: ['saturday', 'sunday'],
  /** Default weekend cell color */
  WEEKEND_CELL_COLOR: '#e6e6e6',
  /** Default weekend hide values */
  WEEKEND_HIDE_VALUES: true,
  /** Default start of week */
  START_OF_WEEK: 'sunday',
} as const;

/**
 * Calendar heatmap color scheme configuration
 */
export const CALENDAR_HEATMAP_COLORS = {
  /** Default minimum color brightness percent */
  MIN_COLOR_BRIGHTNESS_PERCENT: 0.5,
  /** Default maximum color brightness percent */
  MAX_COLOR_BRIGHTNESS_PERCENT: -0.3,
  /** Default tooltip color brightness percent */
  TOOLTIP_COLOR_BRIGHTNESS_PERCENT: -0.2,
  /** Border color for tooltips */
  TOOLTIP_BORDER_COLOR: '#c0c0c0',
} as const;

export const CALENDAR_HEATMAP_SIZING = {
  /** Default gap width */
  GAP_WIDTH: 30,
  /** Default gap height */
  GAP_HEIGHT: 10,
  /** Default margins */
  MARGINS: {
    TOP: 20,
    RIGHT: 40,
    BOTTOM: 20,
    LEFT: 40,
  },
  COLUMNS: 7, // Days of week
  ROWS: 7, // Maximum weeks in a month + 1 for days of week
  MIN_CELL_SIZE: 4,
  MAX_CELL_SIZE: 80,
  TITLE_HEIGHT: 20, // Height for individual chart titles in multi-chart layouts
  PAGINATION_HEIGHT: 45, // Height reserved for pagination controls
  PAGINATION_BUTTON_SIZE: {
    WIDTH: 30,
    HEIGHT: 30,
  },
  MIN_TOOLTIP_WIDTH: 110,
} as const;

/**
 * Font size and spacing calculations
 */
export const CALENDAR_TYPOGRAPHY = {
  /** Font size ratio relative to cell size for day cell labels */
  FONT_SIZE_RATIO: 0.3,
  /** Minimum font size */
  MIN_FONT_SIZE: 10,
  /** Maximum font size for all labels (except pagination) */
  MAX_FONT_SIZE: 13,
  /** Label position adjustment ratio */
  LABEL_Y_OFFSET_RATIO: 0.08,
  /** Axis label position ratio */
  AXIS_LABEL_Y_RATIO: 0.3,
  /** Axis offset ratio */
  AXIS_OFFSET_RATIO: 0.4,
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

/**
 * Short month date format (3 letters)
 */
export const SHORT_MONTH_DATE_FORMAT = 'MMM';

/**
 * Single letter day abbreviation format
 */
export const SINGLE_LETTER_DAY_DATE_FORMAT = 'EEEEE';

/**
 * Reference Sunday date
 */
export const REFERENCE_SUNDAY_DATE = '2023-01-01T00:00:00Z';
