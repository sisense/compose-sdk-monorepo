import { getPaginationFooterLayout } from './pagination-footer-layout';

/** Ranges as the English resources render them, for a 25-row page. */
const SHORT_RANGE = 'Rows 1-25';
const LONG_RANGE = 'Rows 3176-3200';
const TOTAL_ROWS = 'Total: 3,200 rows';

describe('getPaginationFooterLayout', () => {
  it('keeps the full control and both labels on a wide table', () => {
    const layout = getPaginationFooterLayout({
      width: 900,
      pagesCount: 128,
      widestRowsRangeText: LONG_RANGE,
      totalRowsText: TOTAL_ROWS,
    });

    expect(layout).toEqual({
      paginationSize: 'medium',
      boundaryCount: 2,
      siblingCount: 1,
      showTotalRows: true,
      showRowsRange: true,
    });
  });

  it('shows the row range on a single-page table, where the control is at its narrowest', () => {
    // One page renders as previous, 1, next, and the range can only ever be "Rows 1-25" — the
    // label must not be held to the width a four-digit range would need.
    const layout = getPaginationFooterLayout({
      width: 320,
      pagesCount: 1,
      widestRowsRangeText: SHORT_RANGE,
    });

    expect(layout.showRowsRange).toBe(true);
    expect(layout.paginationSize).toBe('medium');
  });

  it('sizes the row-range label from its own text, not a worst case', () => {
    const options = { width: 320, pagesCount: 1 };

    // Same table width and control; only the label's text differs.
    expect(
      getPaginationFooterLayout({ ...options, widestRowsRangeText: SHORT_RANGE }).showRowsRange,
    ).toBe(true);
    expect(
      getPaginationFooterLayout({
        ...options,
        widestRowsRangeText: 'Totaal aantal rijen: 9.876.543',
      }).showRowsRange,
    ).toBe(false);
  });

  it('drops the labels before compacting the control', () => {
    // 400px holds the full 9-item control (342px) but leaves only 13px either side of it.
    const layout = getPaginationFooterLayout({
      width: 400,
      pagesCount: 128,
      widestRowsRangeText: LONG_RANGE,
    });

    expect(layout.paginationSize).toBe('medium');
    expect(layout.siblingCount).toBe(1);
    expect(layout.showRowsRange).toBe(false);
    expect(layout.showTotalRows).toBe(false);
  });

  it('compacts the control once the full one no longer fits', () => {
    const layout = getPaginationFooterLayout({
      width: 340,
      pagesCount: 128,
      widestRowsRangeText: LONG_RANGE,
    });

    expect(layout).toEqual({
      paginationSize: 'small',
      boundaryCount: 1,
      siblingCount: 0,
      showTotalRows: false,
      showRowsRange: false,
    });
  });

  it('compacts earlier when the total row count widens the control boundaries', () => {
    const options = { width: 400, pagesCount: 128, widestRowsRangeText: LONG_RANGE };

    // 11 items (418px) with a row count; 9 items (342px) without, which still fits.
    expect(
      getPaginationFooterLayout({ ...options, totalRowsText: TOTAL_ROWS }).paginationSize,
    ).toBe('small');
    expect(getPaginationFooterLayout(options).paginationSize).toBe('medium');
  });

  it('never claims the total-rows label when the row count is unknown', () => {
    const layout = getPaginationFooterLayout({
      width: 2000,
      pagesCount: 2,
      widestRowsRangeText: SHORT_RANGE,
    });

    expect(layout.showTotalRows).toBe(false);
    expect(layout.showRowsRange).toBe(true);
  });

  it('degrades without going negative on a table narrower than the control', () => {
    const layout = getPaginationFooterLayout({
      width: 120,
      pagesCount: 128,
      widestRowsRangeText: LONG_RANGE,
      totalRowsText: TOTAL_ROWS,
    });

    expect(layout.paginationSize).toBe('small');
    expect(layout.showTotalRows).toBe(false);
    expect(layout.showRowsRange).toBe(false);
  });

  it('shows the row-range label at every width at or above its threshold', () => {
    // The label must not flicker back off as the table grows.
    const widths = Array.from({ length: 40 }, (_, i) => 300 + i * 25);
    const shown = widths.map(
      (width) =>
        getPaginationFooterLayout({ width, pagesCount: 128, widestRowsRangeText: LONG_RANGE })
          .showRowsRange,
    );

    expect(shown).toEqual([...shown].sort((a, b) => Number(a) - Number(b)));
  });
});
