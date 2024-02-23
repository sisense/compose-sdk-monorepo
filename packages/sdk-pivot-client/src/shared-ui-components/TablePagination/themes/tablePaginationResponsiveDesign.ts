export const RESPONSIVE_TABLE_PAGINATION_CLASS = 'responsive-table-pagination';

// Each breakpoint (a key) matches with a fixed screen width in px:
export const tablePaginationResponsiveWidth = {
  xs: 0,
  sm: 200,
  md: 439,
  lg: 600,
  xl: 1536,
};

export const getCurrentBreakpoint = (width: number): string => {
  if (inRange(tablePaginationResponsiveWidth.xs, tablePaginationResponsiveWidth.sm, width)) {
    return 'xs';
  }

  if (inRange(tablePaginationResponsiveWidth.sm, tablePaginationResponsiveWidth.md, width)) {
    return 'sm';
  }

  if (inRange(tablePaginationResponsiveWidth.md, tablePaginationResponsiveWidth.lg, width)) {
    return 'md';
  }

  if (inRange(tablePaginationResponsiveWidth.lg, tablePaginationResponsiveWidth.xl, width)) {
    return 'lg';
  }

  return 'xl';
};

const inRange = (start: number, end: number, point: number): boolean =>
  point >= start && point < end;
