/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable vitest/expect-expect */
import { describe } from 'vitest';

import { Filter, LevelAttribute } from '../../interfaces.js';
import * as filterFactory from '../factory.js';
import { DateRangeFilter, ExcludeFilter } from '../filters.js';
import {
  createAttributeFromFilterJaql,
  createMeasureFromFilterJaql,
  createMeasureFromRankingFilterJaql,
} from './attribute-measure-util.js';
import { createAttributeFilterFromConditionFilterJaql } from './condition-filter-util.js';
import { createFilterFromJaqlInternal } from './filter-from-jaql-util.js';
import { createGenericFilter } from './filter-from-jaql-util.js';
import { ConditionFilterType, DatetimeLevel, FilterJaqlInternal } from './types.js';

describe('filter-from-jaql-util', () => {
  describe('createFilterFromJaqlInternal', () => {
    const guid = 'instanceid';

    const expectEqualFilters = (actual: Filter, expected: Filter) => {
      expect(actual).toStrictEqual(expected);
      expect(actual.serialize()).toBeDefined();
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

        const filter = createFilterFromJaqlInternal(jaql, guid);
        const attribute = createAttributeFromFilterJaql(jaql);
        // empty members array is interpreted by server as all members are included
        const expectedFilter = filterFactory.members(attribute, [], { guid });
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

        const filter = createFilterFromJaqlInternal(jaql, guid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.members(attribute, jaql.filter.members, { guid });
        expectEqualFilters(filter, expectedFilter);
      });

      test('should handle members datetime', () => {
        [
          {
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
          },
          {
            datasource: {
              title: 'Sample ECommerce',
              fullname: 'LocalHost/Sample ECommerce',
              id: 'localhost_aSampleIAAaECommerce',
              address: 'LocalHost',
              database: 'aSampleIAAaECommerce',
            },
            column: 'Date',
            dim: '[Commerce.Date (Calendar)]',
            datatype: 'datetime',
            level: 'years' as DatetimeLevel,
            title: 'YEARS',
            collapsed: true,
            isDashboardFilter: true,
            filter: {
              explicit: true,
              multiSelection: true,
              members: ['2013-01-01T00:00:00'],
            },
          },
        ].forEach((jaql) => {
          const filter = createFilterFromJaqlInternal(jaql, guid);
          const attribute = createAttributeFromFilterJaql(jaql);
          const expectedFilter = filterFactory.members(attribute, jaql.filter.members, { guid });
          expectEqualFilters(filter, expectedFilter);
        });
      });

      test('should handle JAQL without table name', () => {
        const jaql = {
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

        const filter = createFilterFromJaqlInternal(jaql, guid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.members(attribute, jaql.filter.members, { guid });
        expectEqualFilters(filter, expectedFilter);
      });

      it('should handle deactivated members', () => {
        const jaql = {
          datasource: {
            title: 'Sample ECommerce',
            fullname: 'LocalHost/Sample ECommerce',
            id: 'localhost_aSampleIAAaECommerce',
            address: 'LocalHost',
            database: 'aSampleIAAaECommerce',
          },
          column: 'Country',
          dim: '[country.Country]',
          datatype: 'text',
          title: 'COUNTRY',
          collapsed: true,
          isDashboardFilter: true,
          filter: {
            explicit: true,
            multiSelection: true,
            members: ['Albania', 'Algeria', 'Angola'],
            filter: {
              turnedOff: true,
              exclude: {
                members: ['Angola'],
              },
            },
          },
        };

        const filter = createFilterFromJaqlInternal(jaql, guid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.members(attribute, ['Albania', 'Algeria'], {
          guid,
          deactivatedMembers: ['Angola'],
        });
        expectEqualFilters(filter, expectedFilter);
      });

      it('should handle empty members', () => {
        const jaql = {
          table: 'Commerce',
          column: 'Age Range',
          dim: '[Commerce.Age Range]',
          datatype: 'text',
          merged: true,
          datasource: {
            address: 'LocalHost',
            title: 'Sample ECommerce',
            id: 'localhost_aSampleIAAaECommerce',
            database: 'aSampleIAAaECommerce',
            fullname: 'localhost/Sample ECommerce',
            live: false,
          },
          firstday: 'mon',
          locale: 'en-us',
          title: 'Age Range',
          collapsed: false,
          isDashboardFilter: true,
          filter: {
            explicit: true,
            multiSelection: true,
            members: [],
          },
        };

        const filter = createFilterFromJaqlInternal(jaql, guid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.members(attribute, [], { guid });
        expectEqualFilters(filter, expectedFilter);
      });

      it('should handle exclude members', () => {
        const jaql = {
          table: 'Country',
          column: 'Country',
          datatype: 'text',
          title: 'exclude Turkey from Country',
          dim: '[Country.Country]',
          filter: {
            exclude: {
              members: ['Turkey'],
            },
          },
        };

        const filter = createFilterFromJaqlInternal(jaql, guid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.members(attribute, jaql.filter.exclude.members, {
          guid,
          excludeMembers: true,
        });
        expectEqualFilters(filter, expectedFilter);
      });
    });

    describe('NumericFilter', () => {
      test('should handle unary operator for number', () => {
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
          {
            operator: ConditionFilterType.DOESNT_EQUAL,
            factoryFunc: filterFactory.doesntEqual,
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

          const filter = createFilterFromJaqlInternal(jaql, guid);
          const attribute = createAttributeFromFilterJaql(jaql);
          const expectedFilter = test.factoryFunc(attribute, jaql.filter[test.operator], { guid });
          expectEqualFilters(filter, expectedFilter);
        });
      });

      test('should handle unary operator for string', () => {
        [
          { operator: ConditionFilterType.EQUALS, factoryFunc: filterFactory.equals },
          { operator: ConditionFilterType.STARTS_WITH, factoryFunc: filterFactory.startsWith },
          {
            operator: ConditionFilterType.DOESNT_START_WITH,
            factoryFunc: filterFactory.doesntStartWith,
          },
          {
            operator: ConditionFilterType.ENDS_WITH,
            factoryFunc: filterFactory.endsWith,
          },
          {
            operator: ConditionFilterType.DOESNT_END_WITH,
            factoryFunc: filterFactory.doesntEndWith,
          },
          {
            operator: ConditionFilterType.CONTAINS,
            factoryFunc: filterFactory.contains,
          },
          {
            operator: ConditionFilterType.DOESNT_CONTAIN,
            factoryFunc: filterFactory.doesntContain,
          },
        ].forEach((test) => {
          const jaql = {
            table: 'Country',
            column: 'Country',
            datatype: 'text',
            dim: '[Country.Country]',
            title: 'Country',
            filter: {
              [test.operator]: 'ABC',
            },
          };

          const filter = createFilterFromJaqlInternal(jaql, guid);
          const attribute = createAttributeFromFilterJaql(jaql);
          const expectedFilter = test.factoryFunc(attribute, jaql.filter[test.operator], { guid });
          expectEqualFilters(filter, expectedFilter);
        });
      });

      test('should handle between operator', () => {
        [
          {
            table: 'Commerce',
            column: 'Revenue',
            datatype: 'numeric',
            dim: '[Commerce.Revenue]',
            title: 'Revenue',
            filter: {
              isBetween: true,
              from: 1000,
              to: 2000,
            },
          },
          // NOTE: without isBetween in filter jaql, the filter type is NUMERIC_RANGE
          // the same filterFactory.between will be used regardless of isBetween
          {
            table: 'Commerce',
            column: 'Revenue',
            datatype: 'numeric',
            dim: '[Commerce.Revenue]',
            title: 'Revenue',
            filter: {
              from: 1000,
              to: 2000,
            },
          },
        ].forEach((jaql) => {
          const filter = createFilterFromJaqlInternal(jaql, guid);
          const attribute = createAttributeFromFilterJaql(jaql);
          const expectedFilter = filterFactory.between(
            attribute,
            jaql.filter.from,
            jaql.filter.to,
            {
              guid,
            },
          );
          expectEqualFilters(filter, expectedFilter);
        });
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

        const filter = createFilterFromJaqlInternal(jaql, guid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.exclude(
          filterFactory.between(attribute, jaql.filter.exclude.from, jaql.filter.exclude.to, {
            guid,
          }),
          undefined,
          { guid },
        );
        expectEqualFilters(
          (filter as ExcludeFilter).filter,
          (expectedFilter as ExcludeFilter).filter,
        );
        expect(filter.serialize()).toBeDefined();
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
          const filter = createFilterFromJaqlInternal(jaql, guid);
          const attribute = createAttributeFromFilterJaql(jaql);
          const expectedFilter = factoryFunc(
            attribute as LevelAttribute,
            jaql.filter.next.offset,
            jaql.filter.next.count,
            jaql.filter.next.anchor,
            { guid },
          );
          expectEqualFilters(filter, expectedFilter);
          expect(filter.serialize()).toBeDefined();
          expect(filter.jaql().jaql).toEqual(expectedFilter.jaql().jaql);
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
          const filter = createFilterFromJaqlInternal(jaql, guid);
          const attribute = createAttributeFromFilterJaql(jaql);
          const expectedFilter = factoryFunc(
            attribute as LevelAttribute,
            jaql.filter.last.offset,
            jaql.filter.last.count,
            jaql.filter.last.anchor,
            { guid },
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

        const filter = createFilterFromJaqlInternal(jaql, guid);
        const attribute = createAttributeFromFilterJaql(jaql) as LevelAttribute;
        const expectedFilter = filterFactory.dateRange(attribute, '2010-01-01', '2012-01-01', {
          guid,
        });
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

        const filter = createFilterFromJaqlInternal(jaql, guid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const measure = createMeasureFromRankingFilterJaql(jaql.filter.by);
        const expectedFilter = filterFactory.topRanking(attribute, measure, jaql.filter.top, {
          guid,
        });
        expectEqualFilters(filter, expectedFilter);
      });

      it('should handle bottom', () => {
        const jaql = {
          table: 'Brand',
          column: 'Brand',
          datatype: 'text',
          title: 'Bottom 10 Brand by Total Revenue',
          dim: '[Brand.Brand]',
          filter: {
            bottom: 10,
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

        const filter = createFilterFromJaqlInternal(jaql, guid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const measure = createMeasureFromRankingFilterJaql(jaql.filter.by);
        const expectedFilter = filterFactory.bottomRanking(attribute, measure, jaql.filter.bottom, {
          guid,
        });
        expectEqualFilters(filter, expectedFilter);
      });
    });

    describe('LogicalAttributeFilter', () => {
      it('should handle or', () => {
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

        const filter = createFilterFromJaqlInternal(jaql, guid);

        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.union(
          jaql.filter.or.map((c) =>
            createAttributeFilterFromConditionFilterJaql(attribute, c, guid),
          ),
          { guid },
        );
        expect(filter.type).toEqual(expectedFilter.type);
        expect(filter.id).toEqual(expectedFilter.id);
        expect(filter.serialize()).toBeDefined();
      });

      it('should handle and', () => {
        const jaql = {
          table: 'Brand',
          column: 'Brand',
          datatype: 'text',
          title: 'Brand',
          dim: '[Brand.Brand]',
          filter: {
            and: [
              {
                startsWith: 'A',
              },
              {
                endsWith: 's',
              },
            ],
          },
        };

        const filter = createFilterFromJaqlInternal(jaql, guid);

        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.intersection(
          jaql.filter.and.map((c) =>
            createAttributeFilterFromConditionFilterJaql(attribute, c, guid),
          ),
          { guid },
        );
        expect(filter.type).toEqual(expectedFilter.type);
        expect(filter.id).toEqual(expectedFilter.id);
        expect(filter.serialize()).toBeDefined();
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
            datasource: {
              address: 'LocalHost',
              title: 'Sample ECommerce',
              id: 'localhost_aSampleIAAaECommerce',
              database: 'aSampleIAAaECommerce',
            },
          };

          const filter = createFilterFromJaqlInternal(jaql, guid);
          const measure = createMeasureFromFilterJaql(jaql);
          expect(measure).toBeDefined();
          if (!measure) return;
          const expectedFilter = test.factoryFunc(measure, jaql.filter[test.operator], { guid });
          expectEqualFilters(filter, expectedFilter);
        });
      });

      it('should handle between operator', () => {
        const jaql = {
          table: 'Commerce',
          column: 'Revenue',
          datatype: 'numeric',
          title: 'sum Revenue',
          dim: '[Commerce.Revenue]',
          agg: 'sum',
          filter: {
            isBetween: true,
            from: 1000,
            to: 2000,
          },
          datasource: {
            address: 'LocalHost',
            title: 'Sample ECommerce',
            id: 'localhost_aSampleIAAaECommerce',
            database: 'aSampleIAAaECommerce',
          },
        };

        const filter = createFilterFromJaqlInternal(jaql, guid);
        const measure = createMeasureFromFilterJaql(jaql);
        expect(measure).toBeDefined();
        if (!measure) return;
        const expectedFilter = filterFactory.measureBetween(
          measure,
          jaql.filter.from,
          jaql.filter.to,
          {
            guid,
          },
        );
        expectEqualFilters(filter, expectedFilter);
      });

      it('should handle not between operator', () => {
        const jaql = {
          table: 'Commerce',
          column: 'Revenue',
          datatype: 'numeric',
          title: 'sum Revenue',
          dim: '[Commerce.Revenue]',
          agg: 'sum',
          filter: {
            exclude: {
              from: 1000,
              to: 2000,
            },
          },
          datasource: {
            address: 'LocalHost',
            title: 'Sample ECommerce',
            id: 'localhost_aSampleIAAaECommerce',
            database: 'aSampleIAAaECommerce',
          },
        };

        const filter = createFilterFromJaqlInternal(jaql, guid);
        const measure = createMeasureFromFilterJaql(jaql);
        expect(measure).toBeDefined();
        if (!measure) return;
        const expectedFilter = filterFactory.exclude(
          filterFactory.measureBetween(measure, jaql.filter.exclude.from, jaql.filter.exclude.to, {
            guid,
          }),
          undefined,
          { guid },
        );
        expectEqualFilters(filter, expectedFilter);
      });
    });

    describe('Advanced filter (pass-through JAQL)', () => {
      test('should handle', () => {
        const jaql: FilterJaqlInternal = {
          table: 'Commerce',
          column: 'Revenue',
          dim: '[Commerce.Revenue]',
          datatype: 'numeric',
          title: 'sum Revenue',
          filter: {
            custom: true,
            isAdvanced: true,
          },
        };
        const filter = createFilterFromJaqlInternal(jaql, guid);
        const attribute = createAttributeFromFilterJaql(jaql);
        const expectedFilter = filterFactory.customFilter(attribute, jaql.filter, { guid });
        expect(filter.jaql()).toEqual(expectedFilter.jaql());
        expect(filter.jaql(true)).toEqual(expectedFilter.jaql(true));
        expect(filter.serialize()).toBeDefined();
        expect(filter.toJSON()).toBeDefined();
      });
    });

    describe('Generic filter (pass-through JAQL)', () => {
      test('should fall back to generic filter (pass-through JAQL)', () => {
        [
          // SIMULATE INVALID FILTER TYPE
          {
            table: 'Commerce',
            column: 'Revenue',
            datatype: 'numeric',
            title: 'sum Revenue',
            filter: {
              filterType: 'INVALID',
            },
            datasource: {
              address: 'LocalHost',
              title: 'Sample ECommerce',
              id: 'localhost_aSampleIAAaECommerce',
              database: 'aSampleIAAaECommerce',
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
            datasource: {
              address: 'LocalHost',
              title: 'Sample ECommerce',
              id: 'localhost_aSampleIAAaECommerce',
              database: 'aSampleIAAaECommerce',
            },
          },
        ].forEach((item) => {
          const jaql = item as unknown as FilterJaqlInternal;

          const filter = createFilterFromJaqlInternal(jaql, guid);
          const expectedFilter = createGenericFilter(jaql, guid);
          expect(filter.jaql()).toEqual(expectedFilter.jaql());
          expect(filter.jaql(true)).toEqual(expectedFilter.jaql(true));
        });
      });
    });
  });
});
