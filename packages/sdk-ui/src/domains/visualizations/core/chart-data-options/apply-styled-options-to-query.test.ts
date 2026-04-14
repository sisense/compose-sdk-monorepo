import { measureFactory, Sort } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import {
  adaptDimensionsForQuery,
  adaptMeasuresForQuery,
  FORECAST_PREFIX,
  isForecastMeasure,
  isTrendMeasure,
  TREND_PREFIX,
} from './apply-styled-options-to-query.js';

describe('adaptMeasuresForQuery', () => {
  it('appends trend and forecast companion measures with prefixed names', () => {
    const base = measureFactory.sum(DM.Commerce.Revenue, 'Revenue');
    const measures = adaptMeasuresForQuery([
      {
        measure: base,
        style: {
          trend: {},
          forecast: { modelType: 'holtWinters' },
        },
      },
    ]);
    expect(measures).toHaveLength(3);
    expect(measures[0]).toBe(base);
    expect(measures[1].name).toBe(`${TREND_PREFIX}_Revenue`);
    expect(isTrendMeasure(measures[1])).toBe(true);
    expect(measures[2].name).toBe(`${FORECAST_PREFIX}_Revenue`);
    expect(isForecastMeasure(measures[2])).toBe(true);
  });

  it('omits trend and forecast companions when ignoreTrendAndForecast is true', () => {
    const base = measureFactory.sum(DM.Commerce.Revenue, 'Revenue');
    const measures = adaptMeasuresForQuery(
      [
        {
          measure: base,
          style: {
            trend: {},
            forecast: { modelType: 'holtWinters' },
          },
        },
      ],
      { ignoreTrendAndForecast: true },
    );
    expect(measures).toHaveLength(1);
    expect(measures[0]).toBe(base);
  });
});

describe('adaptDimensionsForQuery', () => {
  it('applies sort from style.sortType', () => {
    const attr = DM.Commerce.Date.Months;
    const [sorted] = adaptDimensionsForQuery([
      { attribute: attr, style: { sortType: 'sortDesc' } },
    ]);
    expect(sorted.getSort()).toBe(Sort.Descending);
  });
});
