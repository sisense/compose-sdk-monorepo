import { describe, expect, it } from 'vitest';

import type { QueryElementItemJSON } from '../types.js';
import { getQueryElementSummary } from './get-query-element-summary.js';

describe('getQueryElementSummary', () => {
  it('resolves plain dimension strings', () => {
    expect(getQueryElementSummary('DM.Commerce.Date.Years')).toEqual({
      name: 'Commerce.Date.Years',
      type: 'dimension',
    });
  });

  it('resolves styled dimensions', () => {
    expect(
      getQueryElementSummary({
        column: 'DM.Commerce.Gender',
        sortType: 'sortAsc',
      }),
    ).toEqual({
      name: 'Commerce.Gender',
      type: 'dimension',
    });
  });

  it('resolves plain measure function calls', () => {
    expect(
      getQueryElementSummary({
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Total Revenue'],
      }),
    ).toEqual({
      name: 'Total Revenue',
      type: 'measure',
    });
  });

  it('resolves styled measures', () => {
    expect(
      getQueryElementSummary({
        column: {
          function: 'measureFactory.sum',
          args: ['DM.Commerce.Cost'],
        },
        sortType: 'sortDesc',
      }),
    ).toEqual({
      name: 'Commerce.Cost',
      type: 'measure',
    });
  });

  it('resolves filters with role filter by default', () => {
    expect(
      getQueryElementSummary({
        function: 'filterFactory.equals',
        args: ['DM.Commerce.Country', 'USA'],
      }),
    ).toEqual({
      name: 'Commerce.Country',
      type: 'filter',
    });
  });

  it('resolves highlights when role is highlight', () => {
    expect(
      getQueryElementSummary(
        {
          function: 'filterFactory.members',
          args: ['DM.Brand.Brand', ['Brand A']],
        },
        { role: 'highlight' },
      ),
    ).toEqual({
      name: 'Brand.Brand',
      type: 'highlight',
    });
  });

  it('classifies non-filterFactory function calls as filter when role is provided', () => {
    expect(
      getQueryElementSummary(
        { function: 'someOtherFactory.op', args: ['DM.Commerce.Country'] },
        { role: 'filter' },
      ),
    ).toEqual({ name: 'Commerce.Country', type: 'filter' });
  });

  it('classifies non-filterFactory function calls as highlight when role is highlight', () => {
    expect(
      getQueryElementSummary(
        { function: 'someOtherFactory.op', args: ['DM.Brand.Brand'] },
        { role: 'highlight' },
      ),
    ).toEqual({ name: 'Brand.Brand', type: 'highlight' });
  });

  it('returns null for unrecognized shapes', () => {
    expect(getQueryElementSummary(null as unknown as QueryElementItemJSON)).toBeNull();
  });
});
