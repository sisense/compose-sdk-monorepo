import { filterFactory } from '@sisense/sdk-data';
import type { FilterRelations } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { translateFiltersAndRelationsToDto } from './utils.js';

describe('translateFiltersAndRelationsToDto', () => {
  it('should translate Filter[] to DTOs', () => {
    const filters = [filterFactory.members(DM.Commerce.Date, ['01/01/2021'])];

    const result = translateFiltersAndRelationsToDto(filters);

    expect(result.filters).toHaveLength(1);
    expect(result.filters[0]).toMatchObject({
      jaql: expect.objectContaining({
        dim: expect.any(String),
        datatype: 'datetime',
      }),
    });
  });

  it('should handle empty filters', () => {
    const result = translateFiltersAndRelationsToDto([]);

    expect(result.filters).toEqual([]);
    expect(result.filterRelations).toBeUndefined();
  });

  it('should handle FilterRelations input', () => {
    const filter1 = filterFactory.members(DM.Commerce.Date, ['01/01/2021']);
    const filter2 = filterFactory.members(DM.Commerce.Gender, ['M']);
    const filterRelations: FilterRelations = filterFactory.logic.and(filter1, filter2);

    const result = translateFiltersAndRelationsToDto(filterRelations);

    expect(result.filters).toHaveLength(2);
  });
});
