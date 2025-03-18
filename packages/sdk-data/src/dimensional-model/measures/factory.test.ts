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
import { createDimension } from '../dimensions/index.js';
import { AggregationTypes } from '../types.js';
import { CalculatedMeasure, Element, Measure, MeasureContext } from '../interfaces.js';
import { normalizeName } from '../base.js';
import * as filterFactory from '../filters/factory.js';
import * as measureFactory from './factory.js';

const sampleAttribute = new DimensionalAttribute('Cost', '[Commerce.Cost]', 'numeric-attribute');
const sampleAttribute2 = new DimensionalAttribute(
  'Category',
  '[Category.Category]',
  'text-attribute',
);
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

describe('measureFactory', () => {
  describe('constant', () => {
    test('measureFactory.constant()', () => {
      const m = measureFactory.constant(42);
      verifyCalculatedMeasure(m, '42', {}, '42');
    });
  });
  describe('aggregations', () => {
    test('measureFactory.sum()', () => {
      const m = measureFactory.sum(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Sum);
    });
    test('measureFactory.average()', () => {
      const m = measureFactory.average(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Average);
    });
    test('measureFactory.min()', () => {
      const m = measureFactory.min(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Min);
    });
    test('measureFactory.max()', () => {
      const m = measureFactory.max(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Max);
    });
    test('measureFactory.max()', () => {
      const m = measureFactory.max(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Max);
    });
    test('measureFactory.median()', () => {
      const m = measureFactory.median(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Median);
    });
    test('measureFactory.count()', () => {
      const m = measureFactory.count(sampleAttribute, sampleMeasureName, sampleMeasureFormat);
      verifyMeasure(m, AggregationTypes.Count);
    });
    test('measureFactory.countDistinct()', () => {
      const m = measureFactory.countDistinct(
        sampleAttribute,
        sampleMeasureName,
        sampleMeasureFormat,
      );
      verifyMeasure(m, AggregationTypes.CountDistinct);
    });
  });
  describe('unary formula functions', () => {
    const expectedContext = {
      '[measure1]': sampleMeasure1,
    };

    test('measureFactory.yearToDateSum()', () => {
      const m = measureFactory.yearToDateSum(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'YTDSum([measure1])', expectedContext);
    });
    test('measureFactory.quarterToDateSum()', () => {
      const m = measureFactory.quarterToDateSum(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'QTDSum([measure1])', expectedContext);
    });
    test('measureFactory.monthToDateSum()', () => {
      const m = measureFactory.monthToDateSum(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'MTDSum([measure1])', expectedContext);
    });
    test('measureFactory.weekToDateSum()', () => {
      const m = measureFactory.weekToDateSum(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'WTDSum([measure1])', expectedContext);
    });
    test('measureFactory.runningSum()', () => {
      const m = measureFactory.runningSum(sampleMeasure1, false, sampleMeasureName);
      verifyCalculatedMeasure(m, 'RSum([measure1])', expectedContext);
    });
    test('measureFactory.growth()', () => {
      const m = measureFactory.growth(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'growth([measure1])', expectedContext);
    });
    test('measureFactory.growthRate()', () => {
      const m = measureFactory.growthRate(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'growthrate([measure1])', expectedContext);
    });
    test('measureFactory.growthPastWeek()', () => {
      const m = measureFactory.growthPastWeek(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'growthpastweek([measure1])', expectedContext);
    });
    test('measureFactory.growthPastMonth()', () => {
      const m = measureFactory.growthPastMonth(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'growthpastmonth([measure1])', expectedContext);
    });
    test('measureFactory.growthPastQuarter()', () => {
      const m = measureFactory.growthPastQuarter(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'growthpastquarter([measure1])', expectedContext);
    });
    test('measureFactory.growthPastYear()', () => {
      const m = measureFactory.growthPastYear(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'growthpastyear([measure1])', expectedContext);
    });
    test('measureFactory.difference()', () => {
      const m = measureFactory.difference(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'diffpastperiod([measure1])', expectedContext);
    });
    test('measureFactory.diffPastWeek()', () => {
      const m = measureFactory.diffPastWeek(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'diffpastweek([measure1])', expectedContext);
    });
    test('measureFactory.diffPastMonth()', () => {
      const m = measureFactory.diffPastMonth(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'diffpastmonth([measure1])', expectedContext);
    });
    test('measureFactory.diffPastQuarter()', () => {
      const m = measureFactory.diffPastQuarter(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'diffpastquarter([measure1])', expectedContext);
    });
    test('measureFactory.diffPastYear()', () => {
      const m = measureFactory.diffPastYear(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'diffpastyear([measure1])', expectedContext);
    });
    test('measureFactory.pastDay()', () => {
      const m = measureFactory.pastDay(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'pastday([measure1])', expectedContext);
    });
    test('measureFactory.pastWeek()', () => {
      const m = measureFactory.pastWeek(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'pastweek([measure1])', expectedContext);
    });
    test('measureFactory.pastMonth()', () => {
      const m = measureFactory.pastMonth(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'pastmonth([measure1])', expectedContext);
    });
    test('measureFactory.pastQuarter()', () => {
      const m = measureFactory.pastQuarter(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'pastquarter([measure1])', expectedContext);
    });
    test('measureFactory.pastYear()', () => {
      const m = measureFactory.pastYear(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'pastyear([measure1])', expectedContext);
    });
    test('measureFactory.contribution()', () => {
      const m = measureFactory.contribution(sampleMeasure1, sampleMeasureName);
      verifyCalculatedMeasure(m, 'contribution([measure1])', expectedContext);
    });
  });
  describe('arithmetical formula functions', () => {
    describe('operands: two measures', () => {
      const expectedContext = {
        '[measure1]': sampleMeasure1,
        '[measure2]': sampleMeasure2,
      };

      test('measureFactory.add()', () => {
        const m = measureFactory.add(sampleMeasure1, sampleMeasure2, sampleMeasureName, false);
        verifyCalculatedMeasure(m, '[measure1]+[measure2]', expectedContext);
      });
      test('measureFactory.subtract()', () => {
        const m = measureFactory.subtract(sampleMeasure1, sampleMeasure2, sampleMeasureName, false);
        verifyCalculatedMeasure(m, '[measure1]-[measure2]', expectedContext);
      });
      test('measureFactory.multiply()', () => {
        const m = measureFactory.multiply(sampleMeasure1, sampleMeasure2, sampleMeasureName, false);
        verifyCalculatedMeasure(m, '[measure1]*[measure2]', expectedContext);
      });
      test('measureFactory.divide()', () => {
        const m = measureFactory.divide(sampleMeasure1, sampleMeasure2, sampleMeasureName, false);
        verifyCalculatedMeasure(m, '[measure1]/[measure2]', expectedContext);
      });
    });
    describe('operands: measure and number', () => {
      const expectedContext = {
        '[measure1]': sampleMeasure1,
      };
      const numberOperand = 10;

      test('measureFactory.add()', () => {
        const m = measureFactory.add(sampleMeasure1, numberOperand, sampleMeasureName, true);
        verifyCalculatedMeasure(m, `([measure1]+${numberOperand})`, expectedContext);
      });
      test('measureFactory.subtract()', () => {
        const m = measureFactory.subtract(sampleMeasure1, numberOperand, sampleMeasureName, true);
        verifyCalculatedMeasure(m, `([measure1]-${numberOperand})`, expectedContext);
      });
      test('measureFactory.multiply()', () => {
        const m = measureFactory.multiply(sampleMeasure1, numberOperand, sampleMeasureName, true);
        verifyCalculatedMeasure(m, `([measure1]*${numberOperand})`, expectedContext);
      });
      test('measureFactory.divide()', () => {
        const m = measureFactory.divide(sampleMeasure1, numberOperand, sampleMeasureName, true);
        verifyCalculatedMeasure(m, `([measure1]/${numberOperand})`, expectedContext);
      });
    });
  });
  describe('rank formula function', () => {
    test('measureFactory.rank()', () => {
      const groupByAttribute = new DimensionalAttribute('Age Range', '[Commerce.Age Range]');
      const m = measureFactory.rank(
        sampleMeasure1,
        sampleMeasureName,
        measureFactory.RankingSortTypes.Descending,
        measureFactory.RankingTypes.Dense,
        [groupByAttribute],
      );
      verifyCalculatedMeasure(m, 'rank([measure1],DESC,1223,[AgeRange])', {
        '[measure1]': sampleMeasure1,
        '[AgeRange]': groupByAttribute,
      });
    });
  });
  describe('measuredValue formula function', () => {
    test('measureFactory.measuredValue()', () => {
      const textDimension = createDimension({
        name: 'Age Range',
        type: 'textdimension',
        expression: '[Commerce.Age Range]',
      });
      const filter = filterFactory.equals(textDimension, '65+');
      const m = measureFactory.measuredValue(sampleMeasure1, [filter], sampleMeasureName);
      verifyCalculatedMeasure(m, `([measure1],${getContextName(filter)})`, {
        '[measure1]': sampleMeasure1,
        [getContextName(filter)]: filter,
      });
    });
  });

  describe('advanced analytics functions', () => {
    test('measureFactory.trend() with no options', () => {
      const m = measureFactory.sum(sampleAttribute);
      const mTrend = measureFactory.trend(m);

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

    test('measureFactory.trend() with modelType=advancedSmoothing', () => {
      const m = measureFactory.sum(sampleAttribute);
      const mTrend = measureFactory.trend(m, 'Trend', {
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
          formula: 'trend([sumCost], "modelType=smooth","ignoreAnomalies=true")',
          title: 'Trend',
        },
      });
    });

    test('measureFactory.trend() with modelType=localEstimates', () => {
      const m = measureFactory.sum(sampleAttribute);
      const mTrend = measureFactory.trend(m, 'Trend', {
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
          formula: 'trend([sumCost], "modelType=local")',
          title: 'Trend',
        },
      });
    });
    test('measureFactory.forecast() with no options', () => {
      const m = measureFactory.sum(sampleAttribute);
      const mTrend = measureFactory.forecast(m);

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

    test('measureFactory.forecast() with only modelType', () => {
      const m = measureFactory.sum(sampleAttribute);
      const mTrend = measureFactory.forecast(m, 'Forecast', {
        modelType: 'holtWinters',
      });

      expect(mTrend.jaql()).toStrictEqual({
        jaql: {
          formula: 'forecast([sumCost], "forecastHorizon=3","modelType=holtWinters")',
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

    test('measureFactory.forecast() with all options', () => {
      const m = measureFactory.sum(sampleAttribute);
      const mTrend = measureFactory.forecast(m, 'Forecast', {
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

  test('measureFactory.forecast() with ISO string dates', () => {
    const m = measureFactory.sum(sampleAttribute);
    const mTrend = measureFactory.forecast(m, 'Forecast', {
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

  describe('measureFactory.customFormula()', () => {
    test('with attribute and measure', () => {
      const m = measureFactory.customFormula(
        'Total Attribute',
        'SUM([Attribute]) - [Average Measure]',
        {
          Attribute: sampleAttribute,
          'Average Measure': sampleMeasure2,
        },
      );

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

    test('with measure and filter', () => {
      const m = measureFactory.customFormula(
        'Total Cost with Filter',
        '(SUM([cost]), [categoryFilter])',
        {
          cost: sampleAttribute,
          categoryFilter: filterFactory.members(sampleAttribute2, ['Apple Mac Desktops']),
        },
      );

      expect(m.jaql()).toStrictEqual({
        jaql: {
          title: 'Total Cost with Filter',
          formula: '(SUM([cost]), [categoryFilter])',
          context: {
            '[cost]': {
              title: 'Cost',
              dim: '[Commerce.Cost]',
              datatype: 'numeric',
            },
            '[categoryFilter]': {
              title: 'Category',
              dim: '[Category.Category]',
              datatype: 'text',
              filter: {
                members: ['Apple Mac Desktops'],
              },
            },
          },
        },
      });
    });

    test('with nested formula', () => {
      const nestedMeasure = measureFactory.customFormula(
        'Total Attribute',
        'SUM([Attribute]) - [Average Measure]',
        {
          Attribute: sampleAttribute,
          'Average Measure': sampleMeasure2,
        },
      );

      const m = measureFactory.customFormula('Nested formula', 'RANK([Nested], "ASC", "1224")', {
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
