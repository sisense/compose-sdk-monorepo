export const PIVOT = 'sisense-pivot';
export const PIVOT_MULTIGRID = 'sisense-pivot__multi-grid';
export const PIVOT_MULTIGRID_RESIZE_IN_PROGRESS = 'sisense-pivot__multi-grid--resize-in-progress';
export const PIVOT_OVERLAY = 'sisense-pivot__overlay';

export const MULTIGRID = 'multi-grid';
export const MULTIGRID_NEW = 'multi-grid--new';
export const MULTIGRID_NO_ROWS = 'multi-grid--no-rows';
export const MULTIGRID_NO_COLUMNS = 'multi-grid--no-columns';
export const MULTIGRID_NO_CORNER = 'multi-grid--no-corner';
export const MULTIGRID_NO_FIXED_LEFT = 'multi-grid--no-fixed-left';

export const TABLEGRID = 'table-grid';

export const TABLEGRID_DATA = 'table-grid--data';
export const TABLEGRID_ROWS = 'table-grid--rows';
export const TABLEGRID_COLUMNS = 'table-grid--columns';
export const TABLEGRID_CORNER = 'table-grid--corner';

export const TABLEGRID_TOP = 'table-grid--top';
export const TABLEGRID_RIGHT = 'table-grid--right';
export const TABLEGRID_BOTTOM = 'table-grid--bottom';
export const TABLEGRID_LEFT = 'table-grid--left';

export const TABLEGRID_FIXED = 'table-grid--fixed';

export const TABLE = 'table-grid__table table-grid--table-native';
export const COLGROUP = 'table-grid__colgroup';
export const COLUMN = 'table-grid__column';
export const TBODY = 'table-grid__tbody';
export const ROW = 'table-grid__row';

export const CELL = 'table-grid__cell';
export const CELL_SELECTED = 'table-grid__cell--selected';
export const CELL_DRILLED = 'table-grid__cell--drilled';
export const CELL_SORTED = 'table-grid__cell--sorted';
export const CELL_SORTED_INACTIVE = 'table-grid__cell--sorted-inactive';
export const CELL_SORTED_ASC = 'table-grid__cell--sorted--asc';
export const CELL_SORTED_DESC = 'table-grid__cell--sorted--desc';
export const CELL_DEFAULT_SORTED_ASC = 'table-grid__cell--default-sorted--asc';
export const CELL_DEFAULT_SORTED_DESC = 'table-grid__cell--default-sorted--desc';
export const CELL_FIXED_WIDTH = 'table-grid__cell--fixed-width';
export const CELL_CORNER = 'table-grid__cell-corner';
export const CONTENT = 'table-grid__content';
export const CONTENT_WRAPPER = 'table-grid__content__wrapper';
export const CONTENT_INNER = 'table-grid__content__inner';
export const ICON_SORTING_SETTINGS = 'table-grid__sorting-settings-icon'; // this class is always added to all cells where sorting settings can be called
export const ICON_SORTING_SETTINGS_PERSISTENT = 'table-grid__cell--sort-icon-persistent';

export const ROW_INDEX = (index: number) => `${ROW}-${index}`;
export const COLUMN_INDEX = (index: number) => `${COLUMN}-${index}`;
