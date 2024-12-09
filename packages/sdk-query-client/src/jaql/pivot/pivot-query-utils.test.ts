import { MOCK_METADATA } from '../__mocks__/mock-metadata.js';
import { normalizeLastRowSorting } from './pivot-query-utils.js';

describe('normalizeLastRowSorting', () => {
  it('should not affect sorting', () => {
    const metadataStats = { rowsCount: 2, columnsCount: 0, measuresCount: 7 };
    normalizeLastRowSorting(MOCK_METADATA, metadataStats);

    expect(MOCK_METADATA).toEqual(MOCK_METADATA);
  });
});
