import { measureFactory, Sort } from '@sisense/sdk-data';
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

  it('keeps sort per wrapper when the same attribute instance is used twice', () => {
    const age = DM.Commerce.AgeRange;
    const { dimensions } = getNarrativeDimensionsAndMeasures(
      {
        category: [{ column: age, sortType: 'sortDesc' }],
        breakBy: [age],
        value: [measureFactory.sum(DM.Commerce.Revenue)],
      },
      'bar',
    );
    expect(dimensions.map((d) => d.name)).toEqual(['Age Range', 'Age Range']);
    expect(dimensions[0].getSort?.()).toBe(Sort.Descending);
    expect(dimensions[1].getSort?.()).toBe(Sort.None);
  });

  it('applies the funnel default sort to the first measure when nothing is sorted', () => {
    const { measures } = getNarrativeDimensionsAndMeasures(
      {
        category: [DM.Commerce.AgeRange],
        value: [measureFactory.sum(DM.Commerce.Revenue, 'Revenue')],
      },
      'funnel',
    );
    expect(measures[0].jaql().jaql.sort).toBe('desc');
  });

  describe('chart types served by a chart builder only', () => {
    it('sankey: every category becomes a dimension, sort and trend survive', () => {
      const { dimensions, measures } = getNarrativeDimensionsAndMeasures(
        {
          category: [{ column: DM.Commerce.AgeRange, sortType: 'sortDesc' }, DM.Commerce.Gender],
          value: { column: measureFactory.sum(DM.Commerce.Revenue, 'Revenue'), trend: {} },
        },
        'sankey',
      );
      expect(dimensions.map((d) => d.name)).toEqual(['Age Range', 'Gender']);
      expect(dimensions[0].getSort?.()).toBeDefined();
      expect(measures.map((m) => m.name)).toEqual(['Revenue', '$trend_Revenue']);
    });

    it('sankey: omits the trend companion when includeTrendAndForecast is false', () => {
      const { measures } = getNarrativeDimensionsAndMeasures(
        {
          category: [DM.Commerce.AgeRange, DM.Commerce.Gender],
          value: { column: measureFactory.sum(DM.Commerce.Revenue, 'Revenue'), trend: {} },
        },
        'sankey',
        { includeTrendAndForecast: false },
      );
      expect(measures.map((m) => m.name)).toEqual(['Revenue']);
    });

    it('kpi: the category is the dimension, the value the measure', () => {
      const { dimensions, measures } = getNarrativeDimensionsAndMeasures(
        {
          value: measureFactory.sum(DM.Commerce.Revenue, 'Revenue'),
          category: DM.Commerce.Date.Months,
        },
        'kpi',
      );
      expect(dimensions.map((d) => d.name)).toEqual(['Months']);
      expect(measures.map((m) => m.name)).toEqual(['Revenue']);
    });

    it('kpi: without a category the query has the value only', () => {
      const { dimensions, measures } = getNarrativeDimensionsAndMeasures(
        { value: measureFactory.sum(DM.Commerce.Revenue, 'Revenue') },
        'kpi',
      );
      expect(dimensions).toEqual([]);
      expect(measures.map((m) => m.name)).toEqual(['Revenue']);
    });

    it('areamap: geo is the dimension, color the measure', () => {
      const { dimensions, measures } = getNarrativeDimensionsAndMeasures(
        {
          geo: [DM.Commerce.AgeRange],
          color: [measureFactory.sum(DM.Commerce.Revenue, 'Revenue')],
        },
        'areamap',
      );
      expect(dimensions.map((d) => d.name)).toEqual(['Age Range']);
      expect(measures.map((m) => m.name)).toEqual(['Revenue']);
    });

    it('calendar-heatmap: date is the dimension, value the measure', () => {
      const { dimensions, measures } = getNarrativeDimensionsAndMeasures(
        { date: DM.Commerce.Date.Days, value: measureFactory.sum(DM.Commerce.Revenue, 'Revenue') },
        'calendar-heatmap',
      );
      expect(dimensions.map((d) => d.name)).toEqual(['Days']);
      expect(measures.map((m) => m.name)).toEqual(['Revenue']);
    });

    it('falls back to the legacy translation when the options do not fit the builder', () => {
      expect(() =>
        getNarrativeDimensionsAndMeasures(
          { value: [measureFactory.sum(DM.Commerce.Revenue)] },
          'sankey',
        ),
      ).toThrow();
    });
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

  it('omits the trend companion when includeTrendAndForecast is false', () => {
    const { measures } = getNarrativeDimensionsAndMeasuresFromTable(
      {
        columns: [
          { column: DM.Commerce.Gender },
          {
            column: measureFactory.sum(DM.Commerce.Revenue, 'Revenue'),
            trend: {},
          },
        ],
      },
      { includeTrendAndForecast: false },
    );
    expect(measures.length).toBe(1);
  });
});
