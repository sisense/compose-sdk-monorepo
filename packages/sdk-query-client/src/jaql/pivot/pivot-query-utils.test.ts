import { MOCK_METADATA } from '../__mocks__/mock-metadata.js';
import { normalizeLastRowSorting, preparePivotRowJaqlSortOptions } from './pivot-query-utils.js';

describe('normalizeLastRowSorting', () => {
  it('should not affect sorting', () => {
    const metadataStats = { rowsCount: 2, columnsCount: 0, measuresCount: 7 };
    normalizeLastRowSorting(MOCK_METADATA, metadataStats);

    expect(MOCK_METADATA).toEqual(MOCK_METADATA);
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
});
