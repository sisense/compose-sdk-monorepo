import { describe } from 'vitest';

import * as DM from './__test-helpers__/sample-ecommerce.js';
import * as filterFactory from './dimensional-model/filters/factory.js';
import { MembersFilter } from './dimensional-model/filters/filters.js';
import { createAttributeFromFilterJaql } from './dimensional-model/filters/utils/attribute-measure-util.js';
import { FilterRelations, SortDirection } from './dimensional-model/interfaces.js';
import * as measureFactory from './dimensional-model/measures/factory.js';
import { AggregationTypes, DataType, FormulaJaql, Sort } from './dimensional-model/types.js';
import { DataSource, DataSourceInfo } from './interfaces.js';
import {
  convertJaqlDataSourceForDto,
  convertSortDirectionToSort,
  createAttributeHelper,
  createCalculatedMeasureHelper,
  createFilterFromJaql,
  createMeasureHelper,
  getDataSourceName,
  getFilterListAndRelationsJaql,
  guidFast,
  isDataSourceInfo,
} from './utils.js';

const filter1 = filterFactory.members(DM.Category.Category, ['Cell Phones', 'GPS Devices']);
const filter2 = filterFactory.exclude(filterFactory.contains(DM.Country.Country, 'A'));
const filter3 = filterFactory.members(DM.Commerce.Gender, ['Male']);

const mockSimpleFilterRelations: FilterRelations = {
  operator: 'OR' as const,
  left: filter1,
  right: filter2,
  composeCode: 'some compose code',
};

const mockNestedFilterRelations: FilterRelations = {
  operator: 'AND' as const,
  left: filter1,
  right: mockSimpleFilterRelations,
  composeCode: 'some compose code',
};

const simpleFilterRelationsResult = {
  operator: 'OR' as const,
  left: { instanceid: filter1.config.guid },
  right: { instanceid: filter2.config.guid },
};

const nestedFilterRelationsResult = {
  operator: 'AND' as const,
  left: { instanceid: filter1.config.guid },
  right: simpleFilterRelationsResult,
};

describe('utils', () => {
  describe('guidFast', () => {
    test('should return a string of default length if length is not provided', () => {
      const guid = guidFast();
      expect(typeof guid).toBe('string');
      expect(guid.length).toBe(20);
    });
    test('should return a string of provided length', () => {
      const guid = guidFast(10);
      expect(typeof guid).toBe('string');
      expect(guid.length).toBe(10);
    });
    test('should return unique uids with no regard to timestamp', () => {
      const guids = Array(2)
        .fill(0)
        .map(() => guidFast(13));
      const timestamps = Array(2)
        .fill(0)
        .map(() => Date.now());
      expect(timestamps[0]).toBe(timestamps[1]);
      expect(guids[0]).not.toBe(guids[1]);
    });
  });
  describe('getFilterListAndRelationsJaql', () => {
    test('should return undefined filters and undefined relations when input is undefined', () => {
      const result = getFilterListAndRelationsJaql(undefined);
      expect(result.filters).toBeUndefined();
      expect(result.relations).toBeUndefined();
    });
    test('should return filter list and undefined relations when input is an empty array', () => {
      const result = getFilterListAndRelationsJaql([]);
      expect(result.filters).toEqual([]);
      expect(result.relations).toBeUndefined();
    });
    test('should return filter list and undefined relations when input is an array of filters', () => {
      const filterArray = [filter1, filter2];
      const result = getFilterListAndRelationsJaql(filterArray);
      expect(result.filters).toEqual(filterArray);
      expect(result.relations).toBeUndefined();
    });
    test('should return filter list and relations when input is a simple FilterRelations', () => {
      const result = getFilterListAndRelationsJaql(mockSimpleFilterRelations);
      expect(result.filters).toEqual([filter1, filter2]);
      expect(result.relations).toEqual(simpleFilterRelationsResult);
    });
    test('should return filter list and relations when input is a nested FilterRelations', () => {
      const result = getFilterListAndRelationsJaql(mockNestedFilterRelations);
      expect(result.filters).toEqual([filter1, filter2]);
      expect(result.relations).toEqual(nestedFilterRelationsResult);
    });
    test('should correctly handle FilterRelations with cascading filters', () => {
      const cascadingFilter = filterFactory.cascading([filter2, filter3]);
      const filterRelationsWithCascading = {
        operator: 'OR' as const,
        left: filter1,
        right: cascadingFilter,
        composeCode: 'some compose code',
      };
      const result = getFilterListAndRelationsJaql(filterRelationsWithCascading);
      expect(result.filters).toEqual([filter1, filter2, filter3]);
      expect(result.relations).toEqual({
        left: { instanceid: filter1.config.guid },
        operator: 'OR',
        right: {
          left: { instanceid: filter2.config.guid },
          operator: 'AND',
          right: { instanceid: filter3.config.guid },
        },
      });
    });
  });

  describe('getDataSourceName', () => {
    test('should return the name of the data source if it is DataSourceInfo', () => {
      const dataSourceName = 'data-source-name';
      const dataSource: DataSourceInfo = {
        type: 'elasticube',
        title: dataSourceName,
      };
      const result = getDataSourceName(dataSource);
      expect(result).toBe(dataSourceName);
    });

    test('should return the data source itself if it is a string', () => {
      const dataSourceName = 'data-source-name';
      const result = getDataSourceName(dataSourceName);
      expect(result).toBe(dataSourceName);
    });
  });

  describe('isDataSourceInfo', () => {
    test('should return true if the provided dataSource is a DataSourceInfo', () => {
      const dataSource: DataSourceInfo = {
        type: 'elasticube',
        title: 'data-source-name',
      };
      const result = isDataSourceInfo(dataSource);
      expect(result).toBe(true);
    });

    test('should return false if the provided dataSource is a string', () => {
      const dataSourceName = 'data-source-name';
      const result = isDataSourceInfo(dataSourceName);
      expect(result).toBe(false);
    });
  });

  describe('convertJaqlDataSourceForDto', () => {
    test('should convert a DataSource string to a JaqlDataSourceForDto object', () => {
      const dataSourceName = 'data-source-name';
      const result = convertJaqlDataSourceForDto(dataSourceName);
      expect(result).toEqual({
        title: dataSourceName,
        id: '',
      });
    });
    test('should convert a DataSourceInfo object to a JaqlDataSourceForDto object', () => {
      const dataSource: DataSource = {
        type: 'elasticube',
        title: 'data-source-name',
        id: 'data-source-id',
        address: 'data-source-address',
      };
      const result = convertJaqlDataSourceForDto(dataSource);
      expect(result).toEqual({
        title: dataSource.title,
        id: dataSource.id,
        live: false,
        address: dataSource.address,
      });
    });
  });

  describe('createFilterFromJaql', () => {
    const instanceid = 'instanceid';

    // just one simple test to cover the function.
    // See more tests in src/dimensional-model/filters/utils/filter-jaql-util.test.ts
    test('MembersFilter members()', () => {
      const jaql = {
        table: 'Category',
        column: 'Category',
        dim: '[Category.Category]',
        datatype: 'text' as DataType,
        filter: {
          explicit: true,
          multiSelection: true,
          members: ['Cell Phones', 'GPS Devices'],
        },
        title: 'Category',
      };

      const filter = createFilterFromJaql(jaql, instanceid);
      const attribute = createAttributeFromFilterJaql(jaql);
      const expectedFilter = filterFactory.members(attribute, jaql.filter.members);
      expect(filter.jaql().jaql).toEqual(expectedFilter.jaql().jaql);
    });

    test('should create MembersFilter with inner background filter', () => {
      const jaql = {
        table: 'Category',
        column: 'Category',
        dim: '[Category.Category]',
        datatype: 'text' as DataType,
        filter: {
          explicit: true,
          multiSelection: true,
          members: ['Cell Phones'],
          filter: {
            members: ['Cell Phones', 'GPS Devices'],
          },
        },
        title: 'Category',
      };

      const filter = createFilterFromJaql(jaql, instanceid) as MembersFilter;
      const attribute = createAttributeFromFilterJaql(jaql);

      const expectedFilter = filterFactory.members(attribute, jaql.filter.members, {
        guid: 'id-123',
        backgroundFilter: filterFactory.members(attribute, jaql.filter.filter.members),
      }) as MembersFilter;

      expect(filter.jaql().jaql).toEqual(expectedFilter.jaql().jaql);
      expect(filter.config.backgroundFilter).toBeDefined();
      expect(expectedFilter.config.backgroundFilter).toBeDefined();
    });
  });
  describe('convertSortDirectionToSort', () => {
    test('should convert SortDirection to Sort', () => {
      [
        ['sortAsc', Sort.Ascending],
        ['sortDesc', Sort.Descending],
        ['sortNone', Sort.None],
      ].forEach(([sortDirection, expected]) => {
        const result = convertSortDirectionToSort(sortDirection as SortDirection);
        expect(result).toBe(expected);
      });
    });
  });

  describe('createMeasureHelper', () => {
    test('should create a measure helper', () => {
      const testCases = [
        AggregationTypes.Sum,
        AggregationTypes.Count,
        AggregationTypes.Average,
        AggregationTypes.CountDistinct,
        AggregationTypes.Median,
        AggregationTypes.Variance,
        AggregationTypes.StandardDeviation,
        'invalid-agg',
      ];

      testCases.forEach((agg) => {
        const baseObject = {
          expression: '[Commerce.Revenue]',
          dataType: 'numeric',
          agg,
        };

        const result = createMeasureHelper(baseObject);
        expect(result).toBeDefined();
      });
    });
  });

  describe('createCalculatedMeasureHelper', () => {
    test('should create a calculated measure helper', () => {
      const jaql = {
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
      } as FormulaJaql;

      const result = createCalculatedMeasureHelper(jaql);
      const attribute = createAttributeHelper({
        expression: '[Commerce.Revenue]',
        dataType: 'numeric',
        title: 'Revenue',
      });
      expect(result).toStrictEqual(
        measureFactory.customFormula('QUARTILE([Revenue], 2)', 'QUARTILE([042C4-365], 2)', {
          '[042C4-365]': attribute,
        }),
      );
    });
  });
});
