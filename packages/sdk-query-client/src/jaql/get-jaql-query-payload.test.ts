/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  DataSource,
  DateLevels,
  DimensionalAttribute,
  DimensionalBaseMeasure,
  DimensionalLevelAttribute,
  filterFactory,
  measureFactory,
} from '@sisense/sdk-data';
import type { FilterRelationsJaql } from '@sisense/sdk-data';

import { PivotQueryDescription, QueryDescription } from '../types.js';
import { QueryOptions } from '../types.js';
import {
  getJaqlQueryPayload,
  getPivotJaqlQueryPayload,
  prepareQueryOptions,
} from './get-jaql-query-payload.js';

const dataSource: DataSource = 'Sample ECommerce';

const ageRangeAttribute = new DimensionalAttribute('AgeRange', '[Commerce.Age Range]', 'attribute');
const categoryAttribute = new DimensionalAttribute('Category', '[Category.Category]', 'attribute');
const costAttribute = new DimensionalAttribute('Cost', '[Commerce.Cost]', 'numeric-attribute');
const dateDaysAttribute = new DimensionalLevelAttribute(
  'Days',
  '[Commerce.Date (Calendar)]',
  DateLevels.Days,
  'yyyy-MM-dd',
);

describe('prepareQueryOptions', () => {
  it('should return query options with default values', () => {
    const queryOptions: QueryOptions = prepareQueryOptions(dataSource);

    expect(queryOptions).toEqual({
      by: 'ComposeSDK',
      datasource: { title: dataSource, live: false },
      queryGuid: expect.any(String),
    });
  });

  it('should return query options with specified values', () => {
    const count = 10;
    const offset = 5;
    const includeUngroup = true;

    const queryOptions = prepareQueryOptions(dataSource, count, offset, includeUngroup);

    expect(queryOptions).toEqual({
      by: 'ComposeSDK',
      datasource: { title: dataSource, live: false },
      queryGuid: expect.any(String),
      count,
      offset,
      ungroup: true,
    });
  });
});

describe('getPivotJaqlQueryPayload', () => {
  const basePivotQueryDescription: PivotQueryDescription = {
    dataSource,
    rowsAttributes: [ageRangeAttribute],
    columnsAttributes: [],
    measures: [],
    grandTotals: {},
    filters: [],
    highlights: [],
  };

  describe('PivotAttribute functionality', () => {
    it('should include subtotals format when includeSubTotals is true', () => {
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [
          {
            attribute: ageRangeAttribute,
            includeSubTotals: true,
          },
        ],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata[0].format?.subtotal).toBe(true);
    });

    it('should not include subtotals format when includeSubTotals is false', () => {
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [
          {
            attribute: ageRangeAttribute,
            includeSubTotals: false,
          },
        ],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata[0].format?.subtotal).toBeUndefined();
    });

    it('should include sort options when sort direction is provided for row attributes', () => {
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [
          {
            attribute: ageRangeAttribute,
            sort: {
              direction: 'sortAsc',
            },
          },
        ],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata[0].jaql.sort).toBeDefined();
      expect(payload.metadata[0].jaql.sortDetails).toBeDefined();
      expect(payload.metadata[0].jaql.sortDetails?.dir).toBe('asc');
    });

    it('should handle descending sort direction', () => {
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [
          {
            attribute: ageRangeAttribute,
            sort: {
              direction: 'sortDesc',
            },
          },
        ],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata[0].jaql.sortDetails?.dir).toBe('desc');
    });

    it('should handle complex sorting with valuesIndex', () => {
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [
          {
            attribute: ageRangeAttribute,
            sort: {
              direction: 'sortAsc',
              by: {
                valuesIndex: 0,
              },
            },
          },
        ],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      // Field calculation: rowsCount + columnsCount + valuesIndex
      // In this case: 1 (row) + 0 (columns) + 0 (valuesIndex) = 1
      expect(payload.metadata[0].jaql.sortDetails).toBeDefined();
      expect(payload.metadata[0].jaql.sortDetails?.field).toBe(1);
    });

    it('should handle complex sorting with columnsMembersPath', () => {
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [
          {
            attribute: ageRangeAttribute,
            sort: {
              direction: 'sortDesc',
              by: {
                valuesIndex: 0,
                columnsMembersPath: ['Male', '0-18'],
              },
            },
          },
        ],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      // Field calculation: rowsCount + columnsCount + valuesIndex
      // In this case: 1 (row) + 0 (columns) + 0 (valuesIndex) = 1
      expect(payload.metadata[0].jaql.sortDetails).toBeDefined();
      expect(payload.metadata[0].jaql.sortDetails?.field).toBe(1);
      expect(payload.metadata[0].jaql.sortDetails?.measurePath).toBeDefined();
    });
  });

  describe('PivotMeasure functionality', () => {
    it('should include totalsCalculation in jaql', () => {
      const measure = new DimensionalBaseMeasure('sum Cost', costAttribute, 'sum');
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [],
        measures: [
          {
            measure,
            totalsCalculation: 'sum',
          },
        ],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect((payload.metadata[0]?.jaql as { subtotalAgg?: string })?.subtotalAgg).toBe('sum');
    });

    it('should support different totalsCalculation values', () => {
      const measure = new DimensionalBaseMeasure('sum Cost', costAttribute, 'sum');

      const totalsCalculations: Array<'sum' | 'max' | 'min' | 'avg' | 'median'> = [
        'sum',
        'max',
        'min',
        'avg',
        'median',
      ];

      totalsCalculations.forEach((calculation) => {
        const queryDescription: PivotQueryDescription = {
          ...basePivotQueryDescription,
          rowsAttributes: [],
          measures: [
            {
              measure,
              totalsCalculation: calculation,
            },
          ],
        };

        const payload = getPivotJaqlQueryPayload(queryDescription, false);

        expect((payload.metadata[0]?.jaql as { subtotalAgg?: string })?.subtotalAgg).toBe(
          calculation,
        );
      });
    });

    it('should include dataBars format when dataBars is true', () => {
      const measure = new DimensionalBaseMeasure('sum Cost', costAttribute, 'sum');
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [],
        measures: [
          {
            measure,
            dataBars: true,
          },
        ],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata[0].format?.databars).toBe(true);
    });

    it('should include range color format when shouldRequestMinMax is true', () => {
      const measure = new DimensionalBaseMeasure('sum Cost', costAttribute, 'sum');
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [],
        measures: [
          {
            measure,
            shouldRequestMinMax: true,
          },
        ],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata[0].format?.color?.type).toBe('range');
    });

    it('should handle regular Measure (not wrapped in PivotMeasure)', () => {
      const measure = new DimensionalBaseMeasure('sum Cost', costAttribute, 'sum');
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [],
        measures: [measure],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata[0].jaql.agg).toBe('sum');
      expect(payload.metadata[0].panel).toBe('measures');
    });

    describe('date measures', () => {
      const maxDate = measureFactory.max(dateDaysAttribute, 'Max Date');

      /** The single measure item the given measures produce. */
      const measureItem = (measures: PivotQueryDescription['measures']) =>
        getPivotJaqlQueryPayload(
          { ...basePivotQueryDescription, rowsAttributes: [], measures },
          false,
        ).metadata[0];

      /** The jaql of that item. */
      const measureJaql = (measures: PivotQueryDescription['measures']) =>
        measureItem(measures).jaql as Record<string, unknown>;

      const subDayAttribute = (granularity: string) =>
        new DimensionalLevelAttribute('Time', '[Commerce.Date (Calendar)]', granularity, 'HH:mm');

      const weekOfYearAttribute = new DimensionalLevelAttribute(
        'Week of year',
        '[Commerce.Date (Calendar)]',
        DateLevels.WeekOfYear,
      );

      it('keeps datetime and the level on a PivotMeasure over a date measure', () => {
        const jaql = measureJaql([{ measure: maxDate }]);

        expect(jaql.datatype).toBe('datetime');
        expect(jaql.level).toBe('days');
      });

      it('keeps datetime and the level on a plain Measure over a date measure', () => {
        const jaql = measureJaql([maxDate]);

        expect(jaql.datatype).toBe('datetime');
        expect(jaql.level).toBe('days');
      });

      it('still sends numeric for a numeric measure', () => {
        expect(measureJaql([measureFactory.sum(costAttribute, 'Total Cost')]).datatype).toBe(
          'numeric',
        );
      });

      it('still sends numeric for a min over a text attribute', () => {
        const textAttribute = new DimensionalAttribute(
          'Category',
          '[Category.Category]',
          'text-attribute',
        );

        expect(measureJaql([measureFactory.min(textAttribute, 'First Category')]).datatype).toBe(
          'numeric',
        );
      });

      it('still sends numeric for a formula measure with no stamped datatype', () => {
        const formula = measureFactory.customFormula('Total', 'SUM([Cost])', {
          Cost: costAttribute,
        });

        expect(measureJaql([formula]).datatype).toBe('numeric');
      });

      it.each([
        DateLevels.Hours,
        DateLevels.Minutes,
        DateLevels.AggHours,
        DateLevels.AggMinutesRoundTo1,
      ])(
        'keeps datetime on %s, a sub-day level that still answers with a datetime',
        (granularity) => {
          // a sub-day min/max comes back as a datetime, so it gets the same datatype as any other
          // level; sdk-ui formats it as a day
          const jaql = measureJaql([measureFactory.max(subDayAttribute(granularity), 'Max Time')]);

          expect(jaql.datatype).toBe('datetime');
        },
      );

      /* A wrapper names no aggregation of its own, so the subtotal has to come from the operand.
         Without that the payload carries `subtotalAgg: undefined` on a datetime item and the
         warning that would report it is gated on the same value being truthy. */
      it.each([
        ['pastYear', () => measureFactory.pastYear(maxDate, 'Last year')],
        ['trend', () => measureFactory.trend(maxDate, 'Trend')],
        ['measuredValue', () => measureFactory.measuredValue(maxDate, [], 'Filtered')],
      ])('keeps the subtotal aggregation through %s', (_name, build) => {
        const jaql = measureJaql([{ measure: build(), totalsCalculation: 'max' }]);

        expect(jaql.subtotalAgg).toBe('max');
      });

      it('still sends numeric for a date part, which answers with an ordinal and no date', () => {
        const jaql = measureJaql([measureFactory.max(weekOfYearAttribute, 'Max Week')]);

        expect(jaql.datatype).toBe('numeric');
        expect(jaql.dateTimePart).toBe('weeks');
      });

      it('drops the data bars and the range colour a caller asked for on a date measure', () => {
        const item = measureItem([{ measure: maxDate, dataBars: true, shouldRequestMinMax: true }]);

        expect(item.format?.databars).toBe(false);
        expect(item.format?.color).toBeUndefined();
      });

      it('keeps the data bars and the range colour on a granularity that stays numeric', () => {
        const maxWeek = measureFactory.max(weekOfYearAttribute, 'Max Week');
        const measures = [
          { measure: maxWeek, dataBars: true, shouldRequestMinMax: true, totalsCalculation: 'sum' },
        ] satisfies PivotQueryDescription['measures'];

        expect(measureItem(measures).format?.databars).toBe(true);
        expect(measureItem(measures).format?.color).toEqual({ type: 'range' });
        // the caller's totals calculation survives too, because nothing about this item is a date
        expect(measureJaql(measures).subtotalAgg).toBe('sum');
      });

      it.each(['sum', 'avg', 'median'] as const)(
        'overrides a totalsCalculation of %s on a date measure with the measure aggregation',
        (totalsCalculation) => {
          expect(measureJaql([{ measure: maxDate, totalsCalculation }]).subtotalAgg).toBe('max');
        },
      );

      it("replaces a caller's 'min' totals calculation with the measure aggregation", () => {
        expect(measureJaql([{ measure: maxDate, totalsCalculation: 'min' }]).subtotalAgg).toBe(
          'max',
        );
      });

      it('keeps a totalsCalculation that already matches the measure aggregation', () => {
        expect(measureJaql([{ measure: maxDate, totalsCalculation: 'max' }]).subtotalAgg).toBe(
          'max',
        );
      });

      it.each(['sum', 'min'] as const)(
        'overrides a totalsCalculation of %s on a date measure written as a formula',
        (totalsCalculation) => {
          // Fusion saves a date min/max as a formula, so the min or max lives in the expression
          // and there is no `agg` on the jaql to fall back on
          const maxDateFormula = measureFactory.customFormula('Max Date', 'MAX([Date])', {
            Date: dateDaysAttribute,
          });

          const jaql = measureJaql([{ measure: maxDateFormula, totalsCalculation }]);

          expect(jaql.datatype).toBe('datetime');
          expect(jaql.subtotalAgg).toBe('max');
        },
      );

      it('leaves a numeric measure totalsCalculation untouched', () => {
        const totalCost = measureFactory.sum(costAttribute, 'Total Cost');

        expect(measureJaql([{ measure: totalCost, totalsCalculation: 'sum' }]).subtotalAgg).toBe(
          'sum',
        );
      });

      it('leaves a numeric measure item unchanged as a whole', () => {
        const jaql = measureJaql([{ measure: measureFactory.sum(costAttribute, 'Total Cost') }]);

        expect(jaql).toStrictEqual({
          title: 'Total Cost',
          dim: '[Commerce.Cost]',
          datatype: 'numeric',
          agg: 'sum',
          subtotalAgg: undefined,
        });
      });

      it('leaves a date dimension on rows unchanged', () => {
        const payload = getPivotJaqlQueryPayload(
          {
            ...basePivotQueryDescription,
            rowsAttributes: [dateDaysAttribute],
            measures: [],
          },
          false,
        );

        expect(payload.metadata[0].jaql).toStrictEqual({
          title: 'Days',
          dim: '[Commerce.Date (Calendar)]',
          datatype: 'datetime',
          level: 'days',
        });
        // a pivot row item carries no format today, because the builder keeps only the nested jaql
        expect(payload.metadata[0].format).toBeUndefined();
      });
    });
  });

  describe('Regular Attribute (not PivotAttribute)', () => {
    it('should handle direct Attribute usage without wrapping', () => {
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata[0].jaql.title).toBe('AgeRange');
      expect(payload.metadata[0].panel).toBe('rows');
      expect(payload.metadata[0].format?.subtotal).toBeUndefined();
    });
  });

  describe('Pivot Query Options', () => {
    it('should include grand totals configuration', () => {
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        grandTotals: {
          rows: true,
          columns: true,
        },
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.grandTotals?.rows).toBe(true);
      expect(payload.grandTotals?.columns).toBe(true);
    });

    it('should use default grand totals when not specified', () => {
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.grandTotals).toBeDefined();
    });

    it('should include count and offset in query options', () => {
      const count = 100;
      const offset = 50;
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        count,
        offset,
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.count).toBe(count);
      expect(payload.offset).toBe(offset);
    });

    it('should include filterRelations when provided', () => {
      const filter = filterFactory.members(ageRangeAttribute, ['Value1']);
      const filterRelations: FilterRelationsJaql = {
        left: { instanceid: filter.config.guid },
        right: { instanceid: filter.config.guid },
        operator: 'AND',
      };
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        filterRelations,
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.filterRelations).toBe(filterRelations);
    });

    it('should include pivot-specific query options', () => {
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.dashboard).toBe('ComposeSDK');
      expect(payload.widget).toBe('ComposeSDK');
      expect(payload.format).toBe('pivot');
      expect(payload.by).toBe('ComposeSDK');
      expect(payload.queryGuid).toBeDefined();
      expect(payload.datasource).toEqual({ title: dataSource, live: false });
    });
  });

  describe('name property support', () => {
    it('should use custom name for PivotAttribute in rows', () => {
      const customName = 'Custom Row Name';
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [
          {
            attribute: ageRangeAttribute,
            name: customName,
          },
        ],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata[0].jaql.title).toBe(customName);
      expect(payload.metadata[0].panel).toBe('rows');
    });

    it('should use custom name for PivotAttribute in columns', () => {
      const customName = 'Custom Column Name';
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [],
        columnsAttributes: [
          {
            attribute: categoryAttribute,
            name: customName,
          },
        ],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata[0].jaql.title).toBe(customName);
      expect(payload.metadata[0].panel).toBe('columns');
    });

    it('should use default name when custom name is not provided', () => {
      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata[0].jaql.title).toBe('AgeRange');
    });

    it('should handle multiple attributes with custom names and measures', () => {
      const measure = new DimensionalBaseMeasure('sum Cost', costAttribute, 'sum');

      const queryDescription: PivotQueryDescription = {
        ...basePivotQueryDescription,
        rowsAttributes: [
          {
            attribute: ageRangeAttribute,
            name: 'Custom Row Name',
          },
        ],
        columnsAttributes: [
          {
            attribute: categoryAttribute,
            name: 'Custom Column Name',
          },
        ],
        measures: [
          {
            measure,
            totalsCalculation: 'sum',
          },
        ],
      };

      const payload = getPivotJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata[0].jaql.title).toBe('Custom Row Name');
      expect(payload.metadata[1].jaql.title).toBe('Custom Column Name');
      expect(payload.metadata[2].jaql.title).toBe('sum Cost');
    });
  });
});

describe('getJaqlQueryPayload (regular query)', () => {
  const baseQueryDescription: QueryDescription = {
    dataSource,
    attributes: [ageRangeAttribute],
    measures: [],
    filters: [],
    highlights: [],
  };

  describe('regular query functionality', () => {
    it('should generate payload for regular query', () => {
      const measure = new DimensionalBaseMeasure('sum Cost', costAttribute, 'sum');
      const queryDescription: QueryDescription = {
        ...baseQueryDescription,
        measures: [measure],
      };

      const payload = getJaqlQueryPayload(queryDescription, false);

      expect(payload.metadata.length).toBeGreaterThan(0);
      expect(payload.by).toBe('ComposeSDK');
      expect(payload.datasource).toEqual({ title: dataSource, live: false });
      expect(payload.format).toBeUndefined();
      expect(payload.dashboard).toBeUndefined();
    });

    it('should include ungroup when specified', () => {
      const queryDescription: QueryDescription = {
        ...baseQueryDescription,
        ungroup: true,
      };

      const payload = getJaqlQueryPayload(queryDescription, false);

      expect(payload.ungroup).toBe(true);
    });

    it('should include ungroup when specified even with measures present', () => {
      const measure = new DimensionalBaseMeasure('sum Cost', costAttribute, 'sum');
      const queryDescription: QueryDescription = {
        ...baseQueryDescription,
        measures: [measure],
        ungroup: true,
      };

      const payload = getJaqlQueryPayload(queryDescription, false);

      expect(payload.ungroup).toBe(true);
    });

    it('should not include ungroup when not specified', () => {
      const measure = new DimensionalBaseMeasure('sum Cost', costAttribute, 'sum');
      const queryDescription: QueryDescription = {
        ...baseQueryDescription,
        measures: [measure],
      };

      const payload = getJaqlQueryPayload(queryDescription, false);

      expect(payload.ungroup).toBeUndefined();
    });

    it('should include filterRelations when provided', () => {
      const filter = filterFactory.members(ageRangeAttribute, ['Value1']);
      const filterRelations: FilterRelationsJaql = {
        left: { instanceid: filter.config.guid },
        right: { instanceid: filter.config.guid },
        operator: 'AND' as const,
      };
      const queryDescription: QueryDescription = {
        ...baseQueryDescription,
        filterRelations,
      };

      const payload = getJaqlQueryPayload(queryDescription, false);

      expect(payload.filterRelations).toBe(filterRelations);
    });

    it('should include count and offset when provided', () => {
      const count = 50;
      const offset = 10;
      const queryDescription: QueryDescription = {
        ...baseQueryDescription,
        count,
        offset,
      };

      const payload = getJaqlQueryPayload(queryDescription, false);

      expect(payload.count).toBe(count);
      expect(payload.offset).toBe(offset);
    });
  });
});
