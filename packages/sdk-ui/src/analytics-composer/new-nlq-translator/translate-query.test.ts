import { describe, it, expect } from 'vitest';
import {
  MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
  MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
} from '../__mocks__/mock-data-sources.js';
import { translateQueryJSON } from './translate-query.js';
import { withoutGuids } from '@sisense/sdk-data';

describe('translateQuery', () => {
  it('should translate query json', () => {
    const mockQueryJSON = {
      dimensions: ['DM.Category.Category', 'DM.Brand.Brand'],
      measures: [
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Revenue', 'Total Revenue'],
        },
        {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Cost', 'Total Cost'],
        },
      ],
      filters: [
        {
          function: 'filterFactory.members',
          args: ['DM.Commerce.Date.Years', ['2024-01-01T00:00:00']],
        },
        {
          function: 'filterFactory.topRanking',
          args: [
            'DM.Brand.Brand',
            {
              function: 'measureFactory.sum',
              args: ['DM.Commerce.Revenue', 'Total Revenue'],
            },
            5,
          ],
        },
      ],
    };

    const query = translateQueryJSON(
      mockQueryJSON,
      MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE,
      MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE,
    );
    expect({
      ...query,
      ...(query.filters && { filters: withoutGuids(query.filters) }),
    }).toMatchSnapshot();
  });
});
