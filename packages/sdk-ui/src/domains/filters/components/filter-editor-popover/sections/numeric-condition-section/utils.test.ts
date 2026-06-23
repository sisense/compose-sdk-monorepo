import {
  createAttribute,
  createMeasure,
  filterFactory,
  isRankingFilter,
  measureFactory,
} from '@sisense/sdk-data';
import { assert, describe, expect, it } from 'vitest';

import { FilterOption } from '../../../criteria-filter-tile/criteria-filter-operations.js';
import { createConditionalFilter } from './utils.js';

const attribute = createAttribute({
  name: 'Quantity',
  type: 'numeric-attribute',
  expression: '[Commerce.Quantity]',
  dataSource: { title: 'Sample ECommerce', live: false },
});

const measure = createMeasure(
  measureFactory.sum(
    createAttribute({
      name: 'Revenue',
      type: 'numeric-attribute',
      expression: '[Commerce.Revenue]',
      dataSource: { title: 'Sample ECommerce', live: false },
    }),
  ),
);

describe('numeric condition utils', () => {
  it('creates a top ranking filter from condition data', () => {
    const baseFilter = filterFactory.members(attribute, []);
    const result = createConditionalFilter(baseFilter, {
      condition: FilterOption.TOP,
      value: '',
      selectedMembers: [],
      multiSelectEnabled: true,
      rankingCount: 8,
      rankingMeasure: measure,
    });

    expect(result).not.toBeNull();
    assert(result);
    assert(isRankingFilter(result));
    expect(result.count).toBe(8);
    expect(result.measure.name).toBe(measure.name);
  });

  it('returns null for ranking without measure', () => {
    const baseFilter = filterFactory.members(attribute, []);
    const result = createConditionalFilter(baseFilter, {
      condition: FilterOption.BOTTOM,
      value: '',
      selectedMembers: [],
      multiSelectEnabled: true,
      rankingCount: 5,
      rankingMeasure: null,
    });

    expect(result).toBeNull();
  });
});
