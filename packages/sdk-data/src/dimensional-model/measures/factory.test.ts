/* eslint-disable vitest/expect-expect */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable vitest/no-identical-title */
import { DimensionalAttribute } from '../attributes.js';
import { DimensionalBaseMeasure, DimensionalCalculatedMeasure } from './measures.js';
import { createDimension } from '../dimensions.js';
import { AggregationTypes } from '../types.js';
import { CalculatedMeasure, Element, Measure, MeasureContext } from '../interfaces.js';
import { normalizeName } from '../base.js';
import * as filters from '../filters/factory.js';
import * as measures from './factory.js';

const sampleAttribute = new DimensionalAttribute('Cost', '[Commerce.Cost]', 'numeric-attribute');
const sampleMeasureName = 'measure name';
const sampleMeasureFormat = '00.00';
const sampleMeasure1 = new DimensionalBaseMeasure(
  'measure 1',
  sampleAttribute,
  AggregationTypes.Sum,
);
const sampleMeasure2 = new DimensionalBaseMeasure(
  'measure 2',
  sampleAttribute,
  AggregationTypes.Average,
);

const getContextName = (target: Element) => {
  return `[${normalizeName(target.name)}]`;
};

const verifyMeasure = (m: Measure, expectedAggregationType: string) => {
  expect(m).toBeInstanceOf(DimensionalBaseMeasure);
  expect(m).toHaveProperty('aggregation', expectedAggregationType);
  expect(m).toHaveProperty('attribute', sampleAttribute);
  expect(m).toHaveProperty('name', sampleMeasureName);
  expect(m.getFormat()).toBe(sampleMeasureFormat);
};

const verifyCalculatedMeasure = (
  m: CalculatedMeasure,
  expectedExpression: string,
  expectedContext: MeasureContext,
  expectedName?: string,
) => {
  expect(m).toBeInstanceOf(DimensionalCalculatedMeasure);
  expect(m).toHaveProperty('expression', expectedExpression);
  expect(m).toHaveProperty('context', expectedContext);
  expect(m).toHaveProperty('name', expectedName ?? sampleMeasureName);
};

describe('measures factory', () => {
  describe('constant', () => {
    test('measure.constant()', () => {
      const m = measures.constant(42);
      verifyCalculatedMeasure(m, '42', {}, '42');
    });
  });
  describe('aggregations', () => {
    test('measures.sum()', () => {
      const m = measures.sum(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Sum);
    });
    test('measures.average()', () => {
      const m = measures.average(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Average);
    });
    test('measures.min()', () => {
      const m = measures.min(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Min);
    });
    test('measures.max()', () => {
      const m = measures.max(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Max);
    });
    test('measures.max()', () => {
      const m = measures.max(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Max);
    });
    test('measures.median()', () => {
      const m = measures.median(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Median);
    });
    test('measures.count()', () => {
      const m = measures.count(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Count);
    });
    test('measures.countDistinct()', () => {
      const m = measures.countDistinct(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.CountDistinct);
    });
  });
  describe('unary formula functions', () => {
    const expectedContext = {
      '[measure1]': sampleMeasure1,
    };

    test('measures.yearToDateSum()', () => {
      const m = measures.yearToDateSum(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'YTDSum([measure1])', expectedContext);
    });
    test('measures.quarterToDateSum()', () => {
      const m = measures.quarterToDateSum(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'QTDSum([measure1])', expectedContext);
    });
    test('measures.monthToDateSum()', () => {
      const m = measures.monthToDateSum(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'MTDSum([measure1])', expectedContext);
    });
    test('measures.weekToDateSum()', () => {
      const m = measures.weekToDateSum(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'WTDSum([measure1])', expectedContext);
    });
    test('measures.runningSum()', () => {
      const m = measures.runningSum(sampleMeasure1, false, sampleMeasureName);
      verifyCalculatedMeasure(m, 'RSum([measure1])', expectedContext);
    });
    test('measures.growth()', () => {
      const m = measures.growth(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'growth([measure1])', expectedContext);
    });
    test('measures.growthRate()', () => {
      const m = measures.growthRate(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'growthrate([measure1])', expectedContext);
    });
    test('measures.growthPastWeek()', () => {
      const m = measures.growthPastWeek(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'growthpastweek([measure1])', expectedContext);
    });
    test('measures.growthPastMonth()', () => {
      const m = measures.growthPastMonth(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'growthpastmonth([measure1])', expectedContext);
    });
    test('measures.growthPastQuarter()', () => {
      const m = measures.growthPastQuarter(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'growthpastquarter([measure1])', expectedContext);
    });
    test('measures.growthPastYear()', () => {
      const m = measures.growthPastYear(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'growthpastyear([measure1])', expectedContext);
    });
    test('measures.difference()', () => {
      const m = measures.difference(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'diffpastperiod([measure1])', expectedContext);
    });
    test('measures.diffPastWeek()', () => {
      const m = measures.diffPastWeek(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'diffpastweek([measure1])', expectedContext);
    });
    test('measures.diffPastMonth()', () => {
      const m = measures.diffPastMonth(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'diffpastmonth([measure1])', expectedContext);
    });
    test('measures.diffPastQuarter()', () => {
      const m = measures.diffPastQuarter(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'diffpastquarter([measure1])', expectedContext);
    });
    test('measures.diffPastYear()', () => {
      const m = measures.diffPastYear(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'diffpastyear([measure1])', expectedContext);
    });
    test('measures.pastDay()', () => {
      const m = measures.pastDay(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'pastday([measure1])', expectedContext);
    });
    test('measures.pastWeek()', () => {
      const m = measures.pastWeek(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'pastweek([measure1])', expectedContext);
    });
    test('measures.pastMonth()', () => {
      const m = measures.pastMonth(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'pastmonth([measure1])', expectedContext);
    });
    test('measures.pastQuarter()', () => {
      const m = measures.pastQuarter(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'pastquarter([measure1])', expectedContext);
    });
    test('measures.pastYear()', () => {
      const m = measures.pastYear(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'pastyear([measure1])', expectedContext);
    });
    test('measures.contribution()', () => {
      const m = measures.contribution(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'contribution([measure1])', expectedContext);
    });
  });
  describe('arithmetical formula functions', () => {
    describe('operands: two measures', () => {
      const expectedContext = {
        '[measure1]': sampleMeasure1,
        '[measure2]': sampleMeasure2,
      };

      test('measures.add()', () => {
        const m = measures.add(sampleMeasure1, sampleMeasure2, sampleMeasureName, false);
        verifyCalculatedMeasure(m, '[measure1]+[measure2]', expectedContext);
      });
      test('measures.subtract()', () => {
        const m = measures.subtract(sampleMeasure1, sampleMeasure2, sampleMeasureName, false);
        verifyCalculatedMeasure(m, '[measure1]-[measure2]', expectedContext);
      });
      test('measures.multiply()', () => {
        const m = measures.multiply(sampleMeasure1, sampleMeasure2, sampleMeasureName, false);
        verifyCalculatedMeasure(m, '[measure1]*[measure2]', expectedContext);
      });
      test('measures.divide()', () => {
        const m = measures.divide(sampleMeasure1, sampleMeasure2, sampleMeasureName, false);
        verifyCalculatedMeasure(m, '[measure1]/[measure2]', expectedContext);
      });
    });
    describe('operands: measure and number', () => {
      const expectedContext = {
        '[measure1]': sampleMeasure1,
      };
      const numberOperand = 10;

      test('measures.add()', () => {
        const m = measures.add(sampleMeasure1, numberOperand, sampleMeasureName, true);
        verifyCalculatedMeasure(m, `([measure1]+${numberOperand})`, expectedContext);
      });
      test('measures.subtract()', () => {
        const m = measures.subtract(sampleMeasure1, numberOperand, sampleMeasureName, true);
        verifyCalculatedMeasure(m, `([measure1]-${numberOperand})`, expectedContext);
      });
      test('measures.multiply()', () => {
        const m = measures.multiply(sampleMeasure1, numberOperand, sampleMeasureName, true);
        verifyCalculatedMeasure(m, `([measure1]*${numberOperand})`, expectedContext);
      });
      test('measures.divide()', () => {
        const m = measures.divide(sampleMeasure1, numberOperand, sampleMeasureName, true);
        verifyCalculatedMeasure(m, `([measure1]/${numberOperand})`, expectedContext);
      });
    });
  });
  describe('rank formula function', () => {
    test('measures.rank()', () => {
      const groupByAttribute = new DimensionalAttribute('Age Range', '[Commerce.Age Range]');
      const m = measures.rank(
        sampleMeasure1,
        sampleMeasureName,
        measures.RankingSortTypes.Descending,
        measures.RankingTypes.Dense,
        [groupByAttribute],
      );
      verifyCalculatedMeasure(m, 'rank([measure1],DESC,1223,[AgeRange])', {
        '[measure1]': sampleMeasure1,
        '[AgeRange]': groupByAttribute,
      });
    });
  });
  describe('measuredValue formula function', () => {
    test('measures.measuredValue()', () => {
      const textDimension = createDimension({
        name: 'Age Range',
        type: 'textdimension',
        expression: '[Commerce.Age Range]',
      });
      const filter = filters.equals(textDimension, '65+');
      const m = measures.measuredValue(sampleMeasure1, [filter], sampleMeasureName);
      verifyCalculatedMeasure(m, `([measure1],${getContextName(filter)})`, {
        '[measure1]': sampleMeasure1,
        [getContextName(filter)]: filter,
      });
    });
  });

  describe('advanced analytics functions', () => {
    test('measures.trend() with no options', () => {
      const m = measures.sum(sampleAttribute);
      const mTrend = measures.trend(m);

      expect(mTrend.jaql()).toStrictEqual({
        jaql: {
          title: 'sum Cost Trend',
          formula: 'trend([sumCost])',
          context: {
            '[sumCost]': {
              title: 'sum Cost',
              dim: '[Commerce.Cost]',
              datatype: 'numeric',
              agg: 'sum',
            },
          },
        },
      });
    });

    test('measures.trend() with modelType=advancedSmoothing', () => {
      const m = measures.sum(sampleAttribute);
      const mTrend = measures.trend(m, 'Trend', {
        modelType: 'advancedSmoothing',
        ignoreAnomalies: true,
      });

      expect(mTrend.jaql()).toStrictEqual({
        jaql: {
          context: {
            '[sumCost]': {
              agg: 'sum',
              datatype: 'numeric',
              dim: '[Commerce.Cost]',
              title: 'sum Cost',
            },
          },
          formula: 'trend([sumCost], "modelType=Advanced Smoothing","ignoreAnomalies=true")',
          title: 'Trend',
        },
      });
    });

    test('measures.trend() with modelType=localEstimates', () => {
      const m = measures.sum(sampleAttribute);
      const mTrend = measures.trend(m, 'Trend', {
        modelType: 'localEstimates',
      });

      expect(mTrend.jaql()).toStrictEqual({
        jaql: {
          context: {
            '[sumCost]': {
              agg: 'sum',
              datatype: 'numeric',
              dim: '[Commerce.Cost]',
              title: 'sum Cost',
            },
          },
          formula: 'trend([sumCost], "modelType=Local Estimates")',
          title: 'Trend',
        },
      });
    });
    test('measures.forecast() with no options', () => {
      const m = measures.sum(sampleAttribute);
      const mTrend = measures.forecast(m);

      expect(mTrend.jaql()).toStrictEqual({
        jaql: {
          formula: 'forecast([sumCost], "forecastHorizon=3")',
          title: 'sum Cost Forecast',
          context: {
            '[sumCost]': {
              title: 'sum Cost',
              dim: '[Commerce.Cost]',
              datatype: 'numeric',
              agg: 'sum',
            },
          },
        },
      });
    });

    test('measures.forecast() with all options', () => {
      const m = measures.sum(sampleAttribute);
      const mTrend = measures.forecast(m, 'Forecast', {
        forecastHorizon: 6,
        modelType: 'holtWinters',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-06-01'),
        confidenceInterval: 0.9,
        lowerBound: 1000,
        upperBound: 100000,
        roundToInt: true,
      });

      expect(mTrend.jaql()).toStrictEqual({
        jaql: {
          formula:
            'forecast([sumCost], "forecastHorizon=6","modelType=holtWinters","startDate=2023-01-01T00:00:00","endDate=2023-06-01T00:00:00","confidenceInterval=0.9","lowerBound=1000","upperBound=100000","roundToInt=true")',
          title: 'Forecast',
          context: {
            '[sumCost]': {
              title: 'sum Cost',
              dim: '[Commerce.Cost]',
              datatype: 'numeric',
              agg: 'sum',
            },
          },
        },
      });
    });
  });

  test('measures.forecast() with ISO string dates', () => {
    const m = measures.sum(sampleAttribute);
    const mTrend = measures.forecast(m, 'Forecast', {
      forecastHorizon: 6,
      modelType: 'holtWinters',
      startDate: '2023-01-01',
      endDate: '2023-06-01',
      confidenceInterval: 0.9,
      lowerBound: 1000,
      upperBound: 100000,
      roundToInt: true,
    });

    expect(mTrend.jaql()).toStrictEqual({
      jaql: {
        formula:
          'forecast([sumCost], "forecastHorizon=6","modelType=holtWinters","startDate=2023-01-01T00:00:00","endDate=2023-06-01T00:00:00","confidenceInterval=0.9","lowerBound=1000","upperBound=100000","roundToInt=true")',
        title: 'Forecast',
        context: {
          '[sumCost]': {
            title: 'sum Cost',
            dim: '[Commerce.Cost]',
            datatype: 'numeric',
            agg: 'sum',
          },
        },
      },
    });
  });

  describe('measures.customFormula()', () => {
    test('with atrribute and measure', () => {
      const m = measures.customFormula('Total Attribute', 'SUM([Attribute]) - [Average Measure]', {
        Attribute: sampleAttribute,
        'Average Measure': sampleMeasure2,
      });

      expect(m.jaql()).toStrictEqual({
        jaql: {
          context: {
            '[Attribute]': {
              datatype: 'numeric',
              dim: '[Commerce.Cost]',
              title: 'Cost',
            },
            '[Average Measure]': {
              agg: 'avg',
              datatype: 'numeric',
              dim: '[Commerce.Cost]',
              title: 'measure 2',
            },
          },
          formula: 'SUM([Attribute]) - [Average Measure]',
          title: 'Total Attribute',
        },
      });
    });

    test('with nested formula', () => {
      const nestedMeasure = measures.customFormula(
        'Total Attribute',
        'SUM([Attribute]) - [Average Measure]',
        {
          Attribute: sampleAttribute,
          'Average Measure': sampleMeasure2,
        },
      );

      const m = measures.customFormula('Nested formula', 'RANK([Nested], "ASC", "1224")', {
        Nested: nestedMeasure,
      });

      expect(m.jaql()).toStrictEqual({
        jaql: {
          context: {
            '[Nested]': {
              context: {
                '[Attribute]': {
                  datatype: 'numeric',
                  dim: '[Commerce.Cost]',
                  title: 'Cost',
                },
                '[Average Measure]': {
                  agg: 'avg',
                  datatype: 'numeric',
                  dim: '[Commerce.Cost]',
                  title: 'measure 2',
                },
              },
              formula: 'SUM([Attribute]) - [Average Measure]',
              title: 'Total Attribute',
            },
          },
          formula: 'RANK([Nested], "ASC", "1224")',
          title: 'Nested formula',
        },
      });
    });
  });
});
