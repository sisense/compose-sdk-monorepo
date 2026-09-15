/**
 * Layout arithmetic for the table's pagination footer.
 *
 * The footer's height is fixed at `PAGINATION_HEIGHT`: the table body is sized as
 * `height - PAGINATION_HEIGHT` and `calcTableContentHeight` assumes the same, so anything that
 * wraps onto a second line spills out of the footer and over the rows above it. The control and
 * the labels are therefore pinned to a single line in CSS, and these helpers decide what still
 * fits, so content is dropped rather than clipped as the table narrows.
 */

/** Width of one MUI pagination item, including its horizontal margins. */
const PAGINATION_ITEM_WIDTH = {
  /** 32px min-width + 2 x 3px margin. */
  medium: 38,
  /** 26px min-width + 2 x 1px margin. */
  small: 28,
} as const;

/** Horizontal padding of the footer, applied to each side. */
export const PAGINATION_FOOTER_PADDING = 16;

/** Font size of the row-range label. */
export const ROWS_RANGE_FONT_SIZE = 13;

/** Font size of the total-rows label. */
export const TOTAL_ROWS_FONT_SIZE = 12;

/**
 * Average character width, as a fraction of the font size. Measured across every translation of
 * both footer labels, where it runs from 0.45 for the longer Latin phrasings to 0.66 for Japanese,
 * whose full-width glyphs are the widest; this sits above all but the CJK end of that range.
 *
 * Estimating from the label's own text keeps a short range (`Rows 1-25`, all a single-page table
 * can ever show) from reserving the space a four-digit one would need. Where the estimate does
 * fall short the label is clipped inside its own column, never drawn over the control.
 */
const AVERAGE_CHARACTER_WIDTH_RATIO = 0.6;

/** Rough rendered width of a label. Deliberately an estimate: measuring would need a layout pass. */
const estimateLabelWidth = (text: string, fontSize: number): number =>
  text.length * fontSize * AVERAGE_CHARACTER_WIDTH_RATIO;

/** How many page-number links to show at each boundary when the total row count is known. */
const BOUNDARY_COUNT_WITH_ROW_COUNT = 2;

/** MUI's own defaults, restated so the width arithmetic below matches what it renders. */
const DEFAULT_BOUNDARY_COUNT = 1;
const DEFAULT_SIBLING_COUNT = 1;

/** Dropping the sibling links is the narrowest the control gets while still offering every jump. */
const COMPACT_SIBLING_COUNT = 0;

export type PaginationSize = 'medium' | 'small';

export type PaginationFooterLayout = {
  paginationSize: PaginationSize;
  boundaryCount: number;
  siblingCount: number;
  showTotalRows: boolean;
  showRowsRange: boolean;
};

type PaginationWidthOptions = {
  pagesCount: number;
  boundaryCount: number;
  siblingCount: number;
  size: PaginationSize;
};

/**
 * Widest the pagination control gets for `pagesCount`.
 *
 * Mirrors the item list MUI's `usePagination` builds: every page at once for a short table,
 * otherwise previous and next, both boundaries, the current page with its siblings, and one item
 * bridging each remaining gap.
 */
const getPaginationWidth = ({
  pagesCount,
  boundaryCount,
  siblingCount,
  size,
}: PaginationWidthOptions): number => {
  const maxItemCount = 2 * boundaryCount + 2 * siblingCount + 5;
  const itemWidth = size === 'small' ? PAGINATION_ITEM_WIDTH.small : PAGINATION_ITEM_WIDTH.medium;
  return Math.min(pagesCount + 2, maxItemCount) * itemWidth;
};

type PaginationFooterLayoutOptions = {
  /** Width of the table, as measured by its `DynamicSizeContainer`. */
  width: number;
  pagesCount: number;
  /**
   * Widest text the row-range label renders for this table, which is its last page. Sized from
   * the last page rather than the current one so the label doesn't appear and vanish while paging.
   */
  widestRowsRangeText: string;
  /**
   * Text of the total-rows label, or `undefined` when the query's total row count is unknown.
   * Knowing the count also widens the control, which then shows both boundaries.
   */
  totalRowsText?: string;
};

/**
 * Decides how much of the pagination footer fits in `width`.
 *
 * Navigation outranks the labels: the control is compacted before anything is dropped, and the
 * labels are dropped once the space the control leaves them is too small to hold them on one line.
 *
 * @param options - Table width, page count and whether the total row count is known.
 * @returns The pagination props and label visibility the footer should render with.
 * @internal
 */
export const getPaginationFooterLayout = ({
  width,
  pagesCount,
  widestRowsRangeText,
  totalRowsText,
}: PaginationFooterLayoutOptions): PaginationFooterLayout => {
  const availableWidth = width - 2 * PAGINATION_FOOTER_PADDING;
  const fullBoundaryCount =
    totalRowsText !== undefined ? BOUNDARY_COUNT_WITH_ROW_COUNT : DEFAULT_BOUNDARY_COUNT;
  const fullWidth = getPaginationWidth({
    pagesCount,
    boundaryCount: fullBoundaryCount,
    siblingCount: DEFAULT_SIBLING_COUNT,
    size: 'medium',
  });
  const isCompact = fullWidth > availableWidth;

  const boundaryCount = isCompact ? DEFAULT_BOUNDARY_COUNT : fullBoundaryCount;
  const siblingCount = isCompact ? COMPACT_SIBLING_COUNT : DEFAULT_SIBLING_COUNT;
  const paginationSize: PaginationSize = isCompact ? 'small' : 'medium';
  const paginationWidth = isCompact
    ? getPaginationWidth({ pagesCount, boundaryCount, siblingCount, size: 'small' })
    : fullWidth;

  // The footer is a three-column grid with equal side columns, so each label gets half of whatever
  // the control leaves — the control stays centred no matter which labels end up rendered.
  const labelWidth = Math.max((availableWidth - paginationWidth) / 2, 0);

  return {
    paginationSize,
    boundaryCount,
    siblingCount,
    showTotalRows:
      totalRowsText !== undefined &&
      labelWidth >= estimateLabelWidth(totalRowsText, TOTAL_ROWS_FONT_SIZE),
    showRowsRange: labelWidth >= estimateLabelWidth(widestRowsRangeText, ROWS_RANGE_FONT_SIZE),
  };
};
