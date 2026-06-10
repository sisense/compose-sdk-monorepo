import { describe, expect, it } from 'vitest';

import { getMeasureName } from './get-measure-name.js';

describe('getMeasureName', () => {
  it('uses isName arg when provided', () => {
    expect(
      getMeasureName({
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue', 'Total Revenue'],
      }),
    ).toBe('Total Revenue');
  });

  it('falls back to dimension path without DM. when name is omitted', () => {
    expect(
      getMeasureName({
        function: 'measureFactory.sum',
        args: ['DM.Commerce.Revenue'],
      }),
    ).toBe('Commerce.Revenue');
  });

  it('resolves nested measure with isName at args[1]', () => {
    expect(
      getMeasureName({
        function: 'measureFactory.pastDay',
        args: [
          { function: 'measureFactory.sum', args: ['DM.Commerce.Cost'] },
          'Total Cost Previous Day',
        ],
      }),
    ).toBe('Total Cost Previous Day');
  });

  it('uses isName at args[1] for rank', () => {
    expect(
      getMeasureName({
        function: 'measureFactory.rank',
        args: [{ function: 'measureFactory.sum', args: ['DM.Commerce.Cost'] }, 'Cost Rank'],
      }),
    ).toBe('Cost Rank');
  });

  it('uses isName at args[0] for customFormula title', () => {
    expect(
      getMeasureName({
        function: 'measureFactory.customFormula',
        args: ['Profitability Ratio', 'a / b', {}],
      }),
    ).toBe('Profitability Ratio');
  });

  it('falls back to function suffix for constant', () => {
    expect(
      getMeasureName({
        function: 'measureFactory.constant',
        args: [42],
      }),
    ).toBe('constant');
  });
});
