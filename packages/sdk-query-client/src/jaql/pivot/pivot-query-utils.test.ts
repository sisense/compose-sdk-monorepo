import { MetadataItem } from '@sisense/sdk-data';

import { MOCK_METADATA } from '../__mocks__/mock-metadata.js';
import { normalizeLastRowSorting, preparePivotRowJaqlSortOptions } from './pivot-query-utils.js';

describe('normalizeLastRowSorting', () => {
  it('should not affect sorting', () => {
    const metadataStats = { rowsCount: 2, columnsCount: 0, measuresCount: 7 };
    normalizeLastRowSorting(MOCK_METADATA, metadataStats);

    expect(MOCK_METADATA).toEqual(MOCK_METADATA);
  });

  it('moves a by-measure last-row sort onto the target measure metadata', () => {
    // 2 row dimensions + 1 measure. The last row (index 1) is sorted by the measure (field 2).
    // The sort configuration must be relocated from the row onto the measure metadata, where the
    // backend expects a by-measure last-dimension sort to live.
    const metadataStats = { rowsCount: 2, columnsCount: 0, measuresCount: 1 };
    const sortDetails = {
      dir: 'desc',
      initialized: true,
      field: 2,
      sortingLastDimension: true,
      measurePath: {},
    };
    const metadata = [
      { jaql: { dim: '[t.a]', title: 'A' }, panel: 'rows' },
      { jaql: { dim: '[t.b]', title: 'B', sort: 'desc', sortDetails }, panel: 'rows' },
      { jaql: { dim: '[t.m]', title: 'M', agg: 'sum' }, panel: 'measures' },
    ] as unknown as MetadataItem[];

    normalizeLastRowSorting(metadata, metadataStats);

    // The sort config is moved onto the measure (index 2)...
    expect(metadata[2].jaql.sortDetails).toEqual(sortDetails);
    expect(metadata[2].jaql.sort).toBe('desc');
    // ...and removed from the last row dimension.
    expect(metadata[1].jaql).not.toHaveProperty('sortDetails');
    expect(metadata[1].jaql).not.toHaveProperty('sort');
  });
});

describe('preparePivotRowJaqlSortOptions', () => {
  it('emits measurePath as {} when sorting a non-last row by measure with no pivot columns', () => {
    // Scenario: 3 row dimensions (Property Name / Unit / Unit Type), 0 columns, 1 measure.
    // Sorting the intermediate "Unit" row (index 1) by the measure (valuesIndex 0 → field 3).
    // The backend requires measurePath to be present even when empty so it recognises this
    // as a by-measure sort; omitting it causes incorrect ordering for non-last dimensions.
    const metadataStats = { rowsCount: 3, columnsCount: 0, measuresCount: 1 };
    const sort = {
      direction: 'sortDesc' as const,
      by: { valuesIndex: 0, columnsMembersPath: [] },
    };

    const result = preparePivotRowJaqlSortOptions(sort, 1, metadataStats);

    expect(result.sortDetails?.measurePath).toEqual({});
  });

  it('does not emit measurePath when sorting the last row by its own data (by-dimension sort)', () => {
    // Scenario: 2 row dimensions, 0 columns, 1 measure. Sorting the last "row" (index 1) by its own
    // values (no `by` → by-dimension sort). Emitting an empty `measurePath` here makes the backend
    // treat it as a by-measure sort, mis-anchor the path, and drop the measure column.
    const metadataStats = { rowsCount: 2, columnsCount: 0, measuresCount: 1 };
    const sort = { direction: 'sortAsc' as const };

    const result = preparePivotRowJaqlSortOptions(sort, 1, metadataStats);

    expect(result.sortDetails?.sortingLastDimension).toBe(true);
    expect(result.sortDetails).not.toHaveProperty('measurePath');
  });

  it('does NOT emit measurePath for a by-measure sort on the last row', () => {
    // Scenario: 2 row dimensions, 0 columns, 1 measure. Sorting the last "row" (index 1) by the
    // measure (valuesIndex 0). This sort is normalised onto the target measure metadata; an empty
    // `measurePath` there makes the backend sort by the FIRST measure instead of the selected one
    // when several measures are present. Fusion omits it for last-dimension by-measure sorts.
    const metadataStats = { rowsCount: 2, columnsCount: 0, measuresCount: 1 };
    const sort = { direction: 'sortDesc' as const, by: { valuesIndex: 0 } };

    const result = preparePivotRowJaqlSortOptions(sort, 1, metadataStats);

    expect(result.sortDetails?.sortingLastDimension).toBe(true);
    // field still points past the rows + columns to the target measure: rowsCount + columnsCount + 0.
    expect(result.sortDetails?.field).toBe(2);
    expect(result.sortDetails).not.toHaveProperty('measurePath');
  });

  it('does NOT emit measurePath for a by-measure last-row sort with multiple measures', () => {
    // 2 rows, 3 measures, sorting the LAST row by the SECOND measure (valuesIndex 1 → field 3).
    // With an empty measurePath the backend ignores `field` and sorts by the first measure.
    const metadataStats = { rowsCount: 2, columnsCount: 0, measuresCount: 3 };
    const sort = {
      direction: 'sortDesc' as const,
      by: { valuesIndex: 1, columnsMembersPath: [] },
    };

    const result = preparePivotRowJaqlSortOptions(sort, 1, metadataStats);

    expect(result.sortDetails?.field).toBe(3); // rowsCount(2) + columnsCount(0) + valuesIndex(1)
    expect(result.sortDetails).not.toHaveProperty('measurePath');
  });

  it('does NOT emit measurePath for a by-dimension sort on a non-last row', () => {
    const metadataStats = { rowsCount: 2, columnsCount: 0, measuresCount: 4 };
    const sort = { direction: 'sortDesc' as const };

    const result = preparePivotRowJaqlSortOptions(sort, 0, metadataStats);

    expect(result.sortDetails?.field).toBe(0); // by-dimension → field is the row index
    expect(result.sortDetails).not.toHaveProperty('measurePath');
  });

  it('does NOT emit measurePath for a single-row by-measure sort', () => {
    const metadataStats = { rowsCount: 1, columnsCount: 0, measuresCount: 1 };
    const sort = {
      direction: 'sortDesc' as const,
      by: { valuesIndex: 0, columnsMembersPath: [] },
    };

    const result = preparePivotRowJaqlSortOptions(sort, 0, metadataStats);

    expect(result.sortDetails).not.toHaveProperty('measurePath');
  });

  it('builds measurePath from columnsMembersPath when sorting a row by a measure under a column member', () => {
    const metadataStats = { rowsCount: 2, columnsCount: 1, measuresCount: 1 };
    const sort = {
      direction: 'sortDesc' as const,
      by: { valuesIndex: 0, columnsMembersPath: ['Female'] },
    };

    const result = preparePivotRowJaqlSortOptions(sort, 0, metadataStats);

    expect(result.sortDetails?.measurePath).toEqual({ 2: 'Female' }); // rowsCount(2) + columnIndex(0)
  });
});
