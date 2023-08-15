/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  DimensionalBaseMeasure,
  DimensionalCalculatedMeasure,
  DimensionalMeasureTemplate,
} from './measures.js';
import { DimensionalAttribute } from '../attributes.js';
import { AggregationTypes } from '../types.js';

describe('Measures jaql preparations', () => {
  it('must prepare simple measure jaql', () => {
    const result = {
      jaql: { title: 'Cost', agg: 'sum', dim: '[Commerce.Cost]', datatype: 'numeric' },
    };
    const measure = new DimensionalBaseMeasure(
      'Cost',
      new DimensionalAttribute('[Commerce.Cost]', '[Commerce.Cost]', 'numeric-attribute'),
      'sum',
    );

    const jaql = measure.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare constant as jaql', () => {
    const result = {
      jaql: {
        title: '0',
        formula: '0',
        context: {},
      },
    };
    const measure = new DimensionalCalculatedMeasure('0', '0', {});

    const jaql = measure.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare calculated measure jaql', () => {
    const result = {
      jaql: {
        title: 'sum([Cost] + [Total Revenue])',
        formula: 'sum([M1] + [M2])',
        context: {
          '[M1]': { title: 'Revenue', agg: 'sum', dim: '[Commerce.Revenue]', datatype: 'numeric' },
          '[M2]': { title: 'Cost', agg: 'sum', dim: '[Commerce.Cost]', datatype: 'numeric' },
        },
      },
    };
    const measure = new DimensionalCalculatedMeasure(
      'sum([Cost] + [Total Revenue])',
      'sum([M1] + [M2])',
      {
        '[M1]': new DimensionalBaseMeasure(
          'Revenue',
          new DimensionalAttribute('[Commerce.Revenue]', '[Commerce.Revenue]', 'numeric-attribute'),
          'sum',
        ),
        '[M2]': new DimensionalBaseMeasure(
          'Cost',
          new DimensionalAttribute('[Commerce.Cost]', '[Commerce.Cost]', 'numeric-attribute'),
          'sum',
        ),
      },
    );

    const jaql = measure.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare template measure jaql', () => {
    const result = {
      jaql: { title: 'sum CommerceCost', agg: 'sum', dim: '[Commerce.Cost]', datatype: 'numeric' },
    };
    const measure = new DimensionalMeasureTemplate(
      'Count',
      new DimensionalAttribute('[Commerce.Cost]', '[Commerce.Cost]', 'numeric-attribute'),
    );

    const jaql = measure.jaql();

    expect(jaql).toStrictEqual(result);
  });
});

describe('Measures aggregation transformations', () => {
  const aggregationTypesMapping = {
    [AggregationTypes.Sum]: 'sum',
    [AggregationTypes.Average]: 'avg',
    [AggregationTypes.Min]: 'min',
    [AggregationTypes.Max]: 'max',
    [AggregationTypes.Count]: 'countduplicates',
    [AggregationTypes.CountDistinct]: 'count',
    [AggregationTypes.Median]: 'median',
    [AggregationTypes.Variance]: 'var',
    [AggregationTypes.StandardDeviation]: 'stdev',
  };

  it('should correctly extract aggregation from jaql', () => {
    Object.entries(aggregationTypesMapping).forEach(([aggType, jaqlAggType]) => {
      expect(DimensionalBaseMeasure.aggregationFromJAQL(jaqlAggType)).toEqual(aggType);
    });
  });

  it('should correctly convert aggregation to jaql aggregation type', () => {
    Object.entries(aggregationTypesMapping).forEach(([aggType, jaqlAggType]) => {
      expect(DimensionalBaseMeasure.aggregationToJAQL(aggType)).toEqual(jaqlAggType);
    });
  });
});
