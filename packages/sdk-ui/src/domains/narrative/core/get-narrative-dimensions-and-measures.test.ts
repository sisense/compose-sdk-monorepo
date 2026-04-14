import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import {
  getNarrativeDimensionsAndMeasures,
  getNarrativeDimensionsAndMeasuresFromTable,
} from './get-narrative-dimensions-and-measures.js';

describe('getNarrativeDimensionsAndMeasures', () => {
  it('includes trend and forecast companion measures from styled value columns', () => {
    const { measures } = getNarrativeDimensionsAndMeasures(
      {
        category: [DM.Commerce.Date.Months],
        value: [
          {
            column: measureFactory.sum(DM.Commerce.Revenue),
            trend: {},
            forecast: { modelType: 'holtWinters' },
          },
        ],
        breakBy: [],
      },
      'bar',
    );
    expect(measures.length).toBe(3);
  });

  it('applies dimension sort from styled category columns', () => {
    const { dimensions } = getNarrativeDimensionsAndMeasures(
      {
        category: [{ column: DM.Commerce.Date.Months, sortType: 'sortDesc' }],
        value: [measureFactory.sum(DM.Commerce.Revenue)],
        breakBy: [],
      },
      'bar',
    );
    expect(dimensions[0].getSort?.()).toBeDefined();
  });
});

describe('getNarrativeDimensionsAndMeasuresFromTable', () => {
  it('includes trend companion when set on a measure column', () => {
    const { measures } = getNarrativeDimensionsAndMeasuresFromTable({
      columns: [
        { column: DM.Commerce.Gender },
        {
          column: measureFactory.sum(DM.Commerce.Revenue, 'Revenue'),
          trend: {},
        },
      ],
    });
    expect(measures.length).toBe(2);
    expect(measures[1].composeCode?.includes('measureFactory.trend')).toBe(true);
  });
});
