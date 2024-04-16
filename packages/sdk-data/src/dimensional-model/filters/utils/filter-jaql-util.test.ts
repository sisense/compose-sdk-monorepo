/* eslint-disable vitest/expect-expect */
import { describe } from 'vitest';
import { Filter, LevelAttribute } from '../../interfaces.js';
import {
  createAttributeFromFilterJaql,
  createFilterFromJaqlInternal,
  createGenericFilter,
} from './filter-jaql-util.js';
import * as filterFactory from '../factory.js';
import { ConditionTypes, DatetimeLevel } from './modern-analytics-filters/types.js';

describe('filter-jaql-util', () => {
  describe('createFilterFromJaqlInternal', () => {
    const instanceid = 'instanceid';

    const expectEqualFilters = (actual: Filter, expected: Filter) => {
      // delete code
      delete actual.composeCode;
      // match guid first before comparison
      expect({ ...actual, guid: instanceid }).toEqual({ ...expected, guid: instanceid });
    };

    test('MembersFilter include all', () => {
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

    test('MembersFilter members text', () => {
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

    test('MembersFilter members datetime', () => {
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

    test('NumericFilter', () => {
      [
        { operator: ConditionTypes.GREATER_THAN, factoryFunc: filterFactory.greaterThan },
        {
          operator: ConditionTypes.GREATER_THAN_OR_EQUAL,
          factoryFunc: filterFactory.greaterThanOrEqual,
        },
        { operator: ConditionTypes.EQUALS, factoryFunc: filterFactory.equals },
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

    test('DateRangeFilter', () => {
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
    });

    test('Generic filter (pass-through JAQL)', () => {
      const jaql = {
        table: 'Commerce',
        column: 'AgeRange',
        title: 'AgeRange',
        dim: '[Commerce.Age Range]',
        datatype: 'text',
        filter: {
          or: [
            {
              contains: '3',
            },
            {
              startsWith: '4',
            },
            {
              endsWith: '8',
            },
          ],
        },
      };

      const filter = createFilterFromJaqlInternal(jaql, instanceid);
      const expectedFilter = createGenericFilter(jaql, instanceid);
      expect(filter.jaql()).toEqual(expectedFilter.jaql());
    });
  });
});
