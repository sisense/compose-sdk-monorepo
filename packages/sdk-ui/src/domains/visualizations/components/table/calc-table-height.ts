import {
  DEFAULT_PADDING,
  HEADER_HEIGHT,
  PAGINATION_HEIGHT,
  ROW_HEIGHT,
  SCROLLBAR_SIZE,
} from './pure-table/styles/style-constants';

/** Smallest height an auto-height table widget may report. */
export const MIN_TABLE_HEIGHT = 100;

/** Height reported by an auto-height table widget when the query returns no rows. */
export const TABLE_NO_RESULTS_HEIGHT = 200;

/**
 * Inputs for {@link calcTableContentHeight}. All measurements are in pixels.
 *
 * @internal
 */
export interface TableContentHeightOptions {
  /**
   * Number of rows the table should be sized for — normally a full page.
   *
   * Callers should pass `min(rowsPerPage, totalRows)` rather than the current page's row count, so
   * that paging onto a shorter last page does not change the height. See {@link calcTableContentHeight}.
   */
  rowsToFit: number;
  /** Vertical padding applied around the table body. */
  paddingVertical?: number;
  /** Height of a single data row. */
  rowHeight?: number;
  /** Height of the column header row. */
  headerHeight?: number;
}

/**
 * Calculates the height an auto-height table needs in order to render `rowsToFit` rows without an
 * inner vertical scrollbar.
 *
 * The height is intentionally stable across pages: Fusion emits a widget height on render but not on
 * page change — its per-page re-measure is gated on `wordwrap/rows`, which is off by default — so a
 * short last page does not shrink the widget there, and must not here either.
 *
 * A horizontal-scrollbar allowance is always included. fixed-data-table subtracts its
 * `scrollbarXHeight` from the height available to rows whenever horizontal scroll is on, so without
 * the allowance the body ends up exactly that much too short and a vertical scrollbar appears under
 * the header. The allowance is reserved unconditionally, which matches Fusion's own height
 * behaviour. The cost is a small amount of empty space when no horizontal scrollbar is present.
 *
 * The table uses fixed row metrics, so the height is pure arithmetic over the row count — it must
 * never be derived from a measured container size. Doing so would close a feedback loop between the
 * widget's outer container and the table's own {@link DynamicSizeContainer}, which is the failure
 * mode `resolvePivotContainerSize` exists to prevent on the pivot path. Variable row heights
 * (wordwrap) would reintroduce that dependency — which is exactly the condition under which Fusion
 * starts re-measuring per page.
 *
 * @param options - Row count and the metrics the table renders with.
 * @returns The total height in pixels, never below {@link MIN_TABLE_HEIGHT}.
 * @internal
 */
export function calcTableContentHeight({
  rowsToFit,
  paddingVertical = DEFAULT_PADDING,
  rowHeight = ROW_HEIGHT,
  headerHeight = HEADER_HEIGHT,
}: TableContentHeightOptions): number {
  const contentHeight =
    rowsToFit * rowHeight + headerHeight + paddingVertical * 2 + PAGINATION_HEIGHT + SCROLLBAR_SIZE;

  return Math.max(MIN_TABLE_HEIGHT, contentHeight);
}
