/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable vitest/expect-expect */
import { describe } from 'vitest';
import { Filter, LevelAttribute } from '../../interfaces.js';
import { createFilterFromJaqlInternal } from './filter-from-jaql-util.js';
import * as filterFactory from '../factory.js';
import { ConditionFilterType, DatetimeLevel, FilterJaqlInternal } from './types.js';
import {
  createAttributeFromFilterJaql,
  createMeasureFromFilterJaql,
  createMeasureFromRankingFilterJaql,
} from './attribute-measure-util.js';
import { createAttributeFilterFromConditionFilterJaql } from './condition-filter-util.js';
import { DateRangeFilter, ExcludeFilter } from '../filters.js';

describe('filter-from-jaql-util', () => {
  describe('createFilterFromJaqlInternal', () => {
    const instanceid = 'instanceid';

    const expectEqualFilters = (actual: Filter, expected: Filter) => {
      // delete code
      delete actual.composeCode;
      // match guid first before comparison
      expect({ ...actual, guid: instanceid }).toEqual({ ...expected, guid: instanceid });

      expect(actual.id).toEqual(expected.id);
      expect(actual.serializable()).toBeDefined();
    };

    describe('MembersFilter', () => {
      it('should handle include all', () => {
        const jaql = {
          table: 'Category',
          column: 'Category',
          dim: '[Category.Category]',
          datatype: 'text',
          filter: {
            explicit: true,
            multiSelection: true,
            all: true,
          },
          title: 'Category',
        };

        const filter = createFilterFromJaqlInternal(jaql, instanceid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.members(attribute, []);
        expectEqualFilters(filter, expectedFilter);
      });

      it('should handle members text', () => {
        const jaql = {
          table: 'Category',
          column: 'Category',
          dim: '[Category.Category]',
          datatype: 'text',
          filter: {
            explicit: true,
            multiSelection: true,
            members: ['Cell Phones', 'GPS Devices'],
          },
          title: 'Category',
        };

        const filter = createFilterFromJaqlInternal(jaql, instanceid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.members(attribute, jaql.filter.members);
        expectEqualFilters(filter, expectedFilter);
      });

      test('should handle members datetime', () => {
        const jaql = {
          title: 'Years',
          table: 'Commerce',
          column: 'Date',
          dim: '[Commerce.Date (Calendar)]',
          datatype: 'datetime',
          level: 'years' as DatetimeLevel,
          filter: {
            explicit: true,
            multiSelection: true,
            members: ['2013-01-01T00:00:00', '2011-01-01T00:00:00'],
          },
        };

        const filter = createFilterFromJaqlInternal(jaql, instanceid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.members(attribute, jaql.filter.members);
        expectEqualFilters(filter, expectedFilter);
      });
    });

    describe('NumericFilter', () => {
      test('should handle unary operator', () => {
        [
          { operator: ConditionFilterType.GREATER_THAN, factoryFunc: filterFactory.greaterThan },
          {
            operator: ConditionFilterType.GREATER_THAN_OR_EQUAL,
            factoryFunc: filterFactory.greaterThanOrEqual,
          },
          { operator: ConditionFilterType.EQUALS, factoryFunc: filterFactory.equals },
          { operator: ConditionFilterType.LESS_THAN, factoryFunc: filterFactory.lessThan },
          {
            operator: ConditionFilterType.LESS_THAN_OR_EQUAL,
            factoryFunc: filterFactory.lessThanOrEqual,
          },
        ].forEach((test) => {
          const jaql = {
            table: 'Commerce',
            column: 'Revenue',
            datatype: 'numeric',
            dim: '[Commerce.Revenue]',
            title: 'Revenue',
            filter: {
              [test.operator]: 1000,
            },
          };

          const filter = createFilterFromJaqlInternal(jaql, instanceid);
          const attribute = createAttributeFromFilterJaql(jaql);
          const expectedFilter = test.factoryFunc(attribute, jaql.filter[test.operator]);
          expectEqualFilters(filter, expectedFilter);
        });
      });

      test('should handle binary operator', () => {
        [{ operator: ConditionFilterType.BETWEEN, factoryFunc: filterFactory.between }].forEach(
          (test) => {
            const jaql = {
              table: 'Commerce',
              column: 'Revenue',
              datatype: 'numeric',
              dim: '[Commerce.Revenue]',
              title: 'Revenue',
              filter: {
                from: 1000,
                to: 2000,
              },
            };

            const filter = createFilterFromJaqlInternal(jaql, instanceid);
            const attribute = createAttributeFromFilterJaql(jaql);
            const expectedFilter = test.factoryFunc(attribute, jaql.filter.from, jaql.filter.to);
            expectEqualFilters(filter, expectedFilter);
          },
        );
      });

      test('should handle not between operator', () => {
        const jaql = {
          table: 'Commerce',
          column: 'Revenue',
          datatype: 'numeric',
          dim: '[Commerce.Revenue]',
          title: 'Revenue',
          filter: {
            exclude: {
              from: 1000,
              to: 2000,
            },
          },
        };

        const filter = createFilterFromJaqlInternal(jaql, instanceid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.exclude(
          filterFactory.between(attribute, jaql.filter.exclude.from, jaql.filter.exclude.to),
        );
        expectEqualFilters(
          (filter as ExcludeFilter).filter,
          (expectedFilter as ExcludeFilter).filter,
        );
        expect(filter.serializable()).toBeDefined();
        expect(filter.id).toEqual(expectedFilter.id);
      });
    });

    describe('RelativeDateFilter', () => {
      test('should handle dateRelativeFrom', () => {
        [
          {
            jaql: {
              title: 'Years',
              table: 'Commerce',
              column: 'Date',
              dim: '[Commerce.Date (Calendar)]',
              datatype: 'datetime',
              level: 'months' as DatetimeLevel,
              filter: {
                next: {
                  count: 18,
                  offset: 0,
                  anchor: '2011-01',
                },
              },
            },
            factoryFunc: filterFactory.dateRelativeFrom,
          },
        ].forEach(({ jaql, factoryFunc }) => {
          const filter = createFilterFromJaqlInternal(jaql, instanceid);
          const attribute = createAttributeFromFilterJaql(jaql);
          const expectedFilter = factoryFunc(
            attribute as LevelAttribute,
            jaql.filter.next.offset,
            jaql.filter.next.count,
            jaql.filter.next.anchor,
          );
          expectEqualFilters(filter, expectedFilter);
          expect(filter.serializable()).toBeDefined();
          expect(filter.jaql()).toEqual(expectedFilter.jaql());
        });
      });

      test('should handle dateRelativeTo', () => {
        [
          {
            jaql: {
              title: 'Years',
              table: 'Commerce',
              column: 'Date',
              dim: '[Commerce.Date (Calendar)]',
              datatype: 'datetime',
              level: 'months' as DatetimeLevel,
              filter: {
                last: {
                  count: 18,
                  offset: 0,
                  anchor: '2011-01',
                },
              },
            },
            factoryFunc: filterFactory.dateRelativeTo,
          },
        ].forEach(({ jaql, factoryFunc }) => {
          const filter = createFilterFromJaqlInternal(jaql, instanceid);
          const attribute = createAttributeFromFilterJaql(jaql);
          const expectedFilter = factoryFunc(
            attribute as LevelAttribute,
            jaql.filter.last.offset,
            jaql.filter.last.count,
            jaql.filter.last.anchor,
          );
          expectEqualFilters(filter, expectedFilter);
        });
      });
    });

    describe('DateRangeFilter', () => {
      test('should handle', () => {
        const jaql = {
          title: 'Years',
          table: 'Commerce',
          column: 'Date',
          dim: '[Commerce.Date (Calendar)]',
          datatype: 'datetime',
          level: 'years' as DatetimeLevel,
          filter: {
            from: '2010-01-01',
            to: '2012-01-01',
          },
        };

        const filter = createFilterFromJaqlInternal(jaql, instanceid);
        const attribute = createAttributeFromFilterJaql(jaql) as LevelAttribute;
        const expectedFilter = filterFactory.dateRange(attribute, '2010-01-01', '2012-01-01');
        expectEqualFilters(filter, expectedFilter);
        expect((filter as DateRangeFilter).from).toBeDefined();
        expect((filter as DateRangeFilter).to).toBeDefined();
        expect((filter as DateRangeFilter).level).toBeDefined();
      });
    });

    describe('RankingFilter', () => {
      it('should handle top', () => {
        const jaql = {
          table: 'Brand',
          column: 'Brand',
          datatype: 'text',
          title: 'Top 10 Brand by Total Revenue',
          dim: '[Brand.Brand]',
          filter: {
            top: 10,
            by: {
              table: 'Commerce',
              column: 'Revenue',
              datatype: 'numeric',
              title: 'sum Revenue',
              dim: '[Commerce.Revenue]',
              agg: 'sum',
            },
          },
        };

        const filter = createFilterFromJaqlInternal(jaql, instanceid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const measure = createMeasureFromRankingFilterJaql(jaql.filter.by);
        const expectedFilter = filterFactory.topRanking(attribute, measure, jaql.filter.top);
        expectEqualFilters(filter, expectedFilter);
      });
    });

    describe('LogicalAttributeFilter', () => {
      it('should handle and/or', () => {
        const jaql = {
          table: 'Brand',
          column: 'Brand',
          datatype: 'text',
          title: 'Brand',
          dim: '[Brand.Brand]',
          filter: {
            or: [
              {
                startsWith: 'A',
              },
              {
                endsWith: 's',
              },
            ],
          },
        };

        const filter = createFilterFromJaqlInternal(jaql, instanceid);

        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.union(
          jaql.filter.or.map((c) => createAttributeFilterFromConditionFilterJaql(attribute, c)),
        );
        expect(filter.type).toEqual(expectedFilter.type);
        expect(filter.id).toEqual(expectedFilter.id);
        expect(filter.serializable()).toBeDefined();
      });
    });

    describe('MeasureFilter', () => {
      it('should handle unary operation', () => {
        [
          {
            operator: ConditionFilterType.GREATER_THAN,
            factoryFunc: filterFactory.measureGreaterThan,
          },
          {
            operator: ConditionFilterType.GREATER_THAN_OR_EQUAL,
            factoryFunc: filterFactory.measureGreaterThanOrEqual,
          },
          { operator: ConditionFilterType.EQUALS, factoryFunc: filterFactory.measureEquals },
          { operator: ConditionFilterType.LESS_THAN, factoryFunc: filterFactory.measureLessThan },
          {
            operator: ConditionFilterType.LESS_THAN_OR_EQUAL,
            factoryFunc: filterFactory.measureLessThanOrEqual,
          },
        ].forEach((test) => {
          const jaql = {
            table: 'Commerce',
            column: 'Revenue',
            datatype: 'numeric',
            title: 'sum Revenue',
            dim: '[Commerce.Revenue]',
            agg: 'sum',
            filter: {
              [test.operator]: 2000,
            },
          };

          const filter = createFilterFromJaqlInternal(jaql, instanceid);
          const measure = createMeasureFromFilterJaql(jaql);
          expect(measure).toBeDefined();
          if (!measure) return;
          const expectedFilter = test.factoryFunc(measure, jaql.filter[test.operator]);
          expectEqualFilters(filter, expectedFilter);
        });
      });
    });

    describe('Generic filter (pass-through JAQL)', () => {
      test('should fall back to generic filter (pass-through JAQL)', () => {
        [
          // ADVANCED FILTER TYPE
          {
            table: 'Commerce',
            column: 'Revenue',
            datatype: 'numeric',
            title: 'sum Revenue',
            filter: {
              isAdvanced: true,
            },
          },
          // SIMULATE INVALID FILTER TYPE
          {
            table: 'Commerce',
            column: 'Revenue',
            datatype: 'numeric',
            title: 'sum Revenue',
            filter: {
              filterType: 'INVALID',
            },
          },
          {
            type: 'measure',
            formula: 'QUARTILE([042C4-365], 2)',
            context: {
              '[042C4-365]': {
                table: 'Commerce',
                column: 'Revenue',
                dim: '[Commerce.Revenue]',
                datatype: 'numeric',
                title: 'Revenue',
              },
            },
            title: 'QUARTILE([Revenue], 2)',
            datatype: 'numeric',
            filter: {
              fromNotEqual: '500',
            },
          },
          {
            table: 'Brand',
            column: 'Brand',
            dim: '[Brand.Brand]',
            datatype: 'text',
            merged: true,
            title: 'Brand',
            filter: {
              top: 10,
              by: {
                type: 'measure',
                formula: 'QUARTILE([042C4-365], 2)',
                context: {
                  '[042C4-365]': {
                    table: 'Commerce',
                    column: 'Revenue',
                    dim: '[Commerce.Revenue]',
                    datatype: 'numeric',
                    title: 'Revenue',
                  },
                },
                title: 'QUARTILE([Revenue], 2)',
                datatype: 'numeric',
              },
              rankingMessage: 'QUARTILE([Revenue], 2)',
            },
          },
        ].forEach((item) => {
          const jaql = item as unknown as FilterJaqlInternal;

          const filter = createFilterFromJaqlInternal(jaql, instanceid);
          const expectedFilter = filterFactory.customFilter(jaql, instanceid);
          expect(filter.jaql()).toEqual(expectedFilter.jaql());
          expect(filter.jaql(true)).toEqual(expectedFilter.jaql(true));
          expect(filter.serializable()).toBeDefined();
          expect(filter.toJSON()).toBeDefined();
        });
      });
    });
  });
});