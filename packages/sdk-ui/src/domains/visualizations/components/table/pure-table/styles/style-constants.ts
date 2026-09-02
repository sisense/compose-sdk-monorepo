// fixed-data-table2 vertical definitions
export const HEADER_HEIGHT = 26;
export const ROW_HEIGHT = 26;
export const DEFAULT_PADDING = 8;

// Height of the pagination footer rendered below the table body. Shared so that auto-height
// arithmetic and the table layout cannot drift apart.
export const PAGINATION_HEIGHT = 32;

// Thickness of a fixed-data-table scrollbar, mirroring its own `--scrollbar-size` CSS variable
// (`Scrollbar.SIZE = parseInt(cssVar('--scrollbar-size'))`). fixed-data-table subtracts this from the
// height available to rows whenever a horizontal scrollbar is shown, so auto-height must reserve it.
// Note this is NOT `getScrollbarWidth()`, which measures the *page* scrollbar and is usually 0.
export const SCROLLBAR_SIZE = 15;

// configurations for column width calculations
export const HEADER_PADDING = 36;
export const HEADER_TYPE_ICON_SPACING = 29;
export const DATA_PADDING = 24;
export const MAX_WIDTH = 350;
export const MIN_WIDTH = 120;

// temp until we have column adjustment
export const HEADER_ELLIPSIZED_LENGTH = 38;
export const DATA_ELLIPSIZED_LENGTH = 55;
