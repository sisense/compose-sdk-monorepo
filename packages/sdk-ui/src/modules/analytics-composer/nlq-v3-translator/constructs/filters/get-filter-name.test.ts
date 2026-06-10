import { describe, expect, it } from 'vitest';

import { getFilterName } from './get-filter-name.js';

describe('getFilterName', () => {
  it('returns dimension path without DM. for attribute-based filters', () => {
    expect(
      getFilterName({
        function: 'filterFactory.equals',
        args: ['DM.Commerce.Country', 'USA'],
      }),
    ).toBe('Commerce.Country');
  });

  it('returns measure display name when the first arg is a measure FunctionCall', () => {
    expect(
      getFilterName({
        function: 'filterFactory.measureGreaterThan',
        args: [
          {
            function: 'measureFactory.sum',
            args: ['DM.Commerce.Revenue'],
          },
          1000,
        ],
      }),
    ).toBe('Commerce.Revenue');
  });

  it('returns the logic combinator suffix for filterFactory.logic.* calls', () => {
    expect(
      getFilterName({
        function: 'filterFactory.logic.and',
        args: [
          {
            function: 'filterFactory.members',
            args: ['DM.Commerce.Country', ['USA']],
          },
          {
            function: 'filterFactory.members',
            args: ['DM.Brand.Brand', ['Brand A']],
          },
        ],
      }),
    ).toBe('and');
  });
});
