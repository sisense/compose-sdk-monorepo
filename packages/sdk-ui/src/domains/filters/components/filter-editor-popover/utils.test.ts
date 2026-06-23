import { filterFactory, isRankingFilter, measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { isSupportedByFilterEditor } from './utils.js';

describe('filter-editor-popover utils', () => {
  it('supports ranking filters in the filter editor', () => {
    const measure = measureFactory.sum(DM.Commerce.Revenue);
    const filter = filterFactory.topRanking(DM.Commerce.AgeRange, measure, 5);

    expect(isRankingFilter(filter)).toBe(true);
    expect(isSupportedByFilterEditor(filter)).toBe(true);
  });
});
