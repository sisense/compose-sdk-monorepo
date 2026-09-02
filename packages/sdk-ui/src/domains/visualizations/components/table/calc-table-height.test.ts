import { describe, expect, it } from 'vitest';

import { calcTableContentHeight, MIN_TABLE_HEIGHT } from './calc-table-height';
import {
  HEADER_HEIGHT,
  PAGINATION_HEIGHT,
  ROW_HEIGHT,
  SCROLLBAR_SIZE,
} from './pure-table/styles/style-constants';

describe('calcTableContentHeight', () => {
  // rowsToFit * 26 + header 26 + 2 * padding 8 + pagination 32 + scrollbar 15
  it('sums rows, header, vertical padding, the pagination footer and the scrollbar allowance', () => {
    expect(calcTableContentHeight({ rowsToFit: 25 })).toBe(739);
  });

  // Regression guard for the vertical scrollbar that appeared under the header: the height must
  // leave fixed-data-table enough room for every row *after* it reserves `scrollbarXHeight` for a
  // horizontal scrollbar. table-component gives PureTable `height - PAGINATION_HEIGHT`, and
  // data-table-wrapper then gives the inner table `height - paddingVertical * 2`.
  it('leaves room for all rows even when a horizontal scrollbar is shown', () => {
    const paddingVertical = 8;

    for (const rowsToFit of [2, 5, 25, 100]) {
      const widgetHeight = calcTableContentHeight({ rowsToFit, paddingVertical });
      const innerTableHeight = widgetHeight - PAGINATION_HEIGHT - paddingVertical * 2;
      const availableForRows = innerTableHeight - HEADER_HEIGHT - SCROLLBAR_SIZE;

      expect(availableForRows).toBeGreaterThanOrEqual(rowsToFit * ROW_HEIGHT);
    }
  });

  it('grows by one row height per additional row', () => {
    const ten = calcTableContentHeight({ rowsToFit: 10 });
    const eleven = calcTableContentHeight({ rowsToFit: 11 });

    expect(eleven - ten).toBe(26);
  });

  it('is compact for a result set smaller than a full page', () => {
    expect(calcTableContentHeight({ rowsToFit: 7 })).toBeLessThan(
      calcTableContentHeight({ rowsToFit: 25 }),
    );
  });

  it('applies the minimum height floor when the arithmetic falls below it', () => {
    // 0 rows: 26 header + 16 padding + 32 pagination + 15 scrollbar = 89, below the floor.
    expect(calcTableContentHeight({ rowsToFit: 0 })).toBe(MIN_TABLE_HEIGHT);
  });

  it('does not clamp once the content genuinely exceeds the floor', () => {
    // 1 row: 26 + 26 + 16 + 32 + 15 = 115.
    expect(calcTableContentHeight({ rowsToFit: 1 })).toBe(115);
    expect(calcTableContentHeight({ rowsToFit: 1 })).toBeGreaterThan(MIN_TABLE_HEIGHT);
  });

  it('never returns zero, so the container never falls back to measurement', () => {
    for (const rowsToFit of [0, 1, 2, 5, 25, 100]) {
      expect(calcTableContentHeight({ rowsToFit })).toBeGreaterThan(0);
    }
  });

  it('honours custom padding and row metrics', () => {
    expect(
      calcTableContentHeight({
        rowsToFit: 4,
        paddingVertical: 20,
        rowHeight: 30,
        headerHeight: 40,
      }),
    ).toBe(4 * 30 + 40 + 40 + 32 + SCROLLBAR_SIZE);
  });

  // Fusion emits a height on widget render but not on page change, so the widget must not resize
  // when the user pages onto a shorter last page.
  it('is stable across pages when callers pass min(rowsPerPage, totalRows)', () => {
    const rowsPerPage = 25;
    const totalRows = 53; // last page holds only 3 rows
    const heightFor = (loaded: number) =>
      calcTableContentHeight({ rowsToFit: Math.min(rowsPerPage, loaded) });

    expect(heightFor(totalRows)).toBe(heightFor(rowsPerPage));
  });

  it('fits actual rows when the whole result set is smaller than one page', () => {
    const rowsPerPage = 25;
    const totalRows = 4;

    expect(calcTableContentHeight({ rowsToFit: Math.min(rowsPerPage, totalRows) })).toBe(
      calcTableContentHeight({ rowsToFit: 4 }),
    );
  });
});
