import { Filter } from './index.js';
import { getFilterListAndRelations, guidFast } from './utils.js';

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
});
