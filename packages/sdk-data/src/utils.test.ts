import { createFilterFromJaql, DataSourceInfo, DataType, Filter } from './index.js';
import {
  getDataSourceName,
  getFilterListAndRelations,
  guidFast,
  isDataSourceInfo,
} from './utils.js';
import { describe } from 'vitest';
import * as filterFactory from './dimensional-model/filters/factory.js';
import { createAttributeFromFilterJaql } from './dimensional-model/filters/utils/filter-jaql-util.js';

const mockFilter1 = { guid: 'filter-1', name: 'Filter 1' } as Filter;
const mockFilter2 = { guid: 'filter-2', name: 'Filter 2' } as Filter;

const mockSimpleFilterRelations = {
  operator: 'OR' as const,
  left: mockFilter1,
  right: mockFilter2,
};

const mockNestedFilterRelations = {
  operator: 'AND' as const,
  left: mockFilter1,
  right: mockSimpleFilterRelations,
};

const simpleFilterRelationsResult = {
  operator: 'OR' as const,
  left: { instanceid: mockFilter1.guid },
  right: { instanceid: mockFilter2.guid },
};

const nestedFilterRelationsResult = {
  operator: 'AND' as const,
  left: { instanceid: mockFilter1.guid },
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
  describe('getFilterListAndRelations', () => {
    test('should return undefined filters and undefined relations when input is undefined', () => {
      const result = getFilterListAndRelations(undefined);
      expect(result.filters).toBeUndefined();
      expect(result.relations).toBeUndefined();
    });
    test('should return filter list and undefined relations when input is an empty array', () => {
      const result = getFilterListAndRelations([]);
      expect(result.filters).toEqual([]);
      expect(result.relations).toBeUndefined();
    });
    test('should return filter list and undefined relations when input is an array of filters', () => {
      const filterArray = [mockFilter1, mockFilter2];
      const result = getFilterListAndRelations(filterArray);
      expect(result.filters).toEqual(filterArray);
      expect(result.relations).toBeUndefined();
    });
    test('should return filter list and relations when input is a simple FilterRelations', () => {
      const result = getFilterListAndRelations(mockSimpleFilterRelations);
      expect(result.filters).toEqual([mockFilter1, mockFilter2]);
      expect(result.relations).toEqual(simpleFilterRelationsResult);
    });
    test('should return filter list and relations when input is a nested FilterRelations', () => {
      const result = getFilterListAndRelations(mockNestedFilterRelations);
      expect(result.filters).toEqual([mockFilter1, mockFilter2]);
      expect(result.relations).toEqual(nestedFilterRelationsResult);
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
      expect(filter.jaql()).toEqual(expectedFilter.jaql());
    });
  });
});
