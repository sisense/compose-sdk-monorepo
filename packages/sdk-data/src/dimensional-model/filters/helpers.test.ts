import { DimensionalAttribute } from '../attributes.js';
import { FilterRelations } from '../interfaces.js';
import { ExcludeFilter, MembersFilter, TextFilter, TextOperators } from './filters.js';
import {
  findFilter,
  withAddedFilter,
  withAddedFilters,
  withoutFilter,
  withoutFilters,
  withReplacedFilter,
} from './helpers.js';

const memberGenderFilter = new MembersFilter(
  new DimensionalAttribute('[Commerce.Gender]', '[Commerce.Gender]'),
  ['Female'],
);

const memberCostFilter = new MembersFilter(
  new DimensionalAttribute('[Commerce.Cost]', '[Commerce.Cost]'),
  ['1'],
);

const excludeGenderfilter = new ExcludeFilter(
  new MembersFilter(new DimensionalAttribute('Gender', '[Commerce.Gender]'), ['Female']),
);

const textFilter = new TextFilter(
  new DimensionalAttribute('Gender', '[Commerce.Gender]'),
  TextOperators.Contains,
  'Male',
);

const filterRelations: FilterRelations = {
  left: memberGenderFilter,
  right: memberCostFilter,
  operator: 'AND',
};

// Mock implementations for dependencies from filter-relations.js
vi.mock('./filter-relations.js', () => ({
  splitFiltersAndRelations: vi.fn((relations) => ({
    filters: relations ? [relations.left, relations.right] : [],
    relations,
  })),
  calculateNewRelations: vi.fn((existingFilters, relations) => relations),
  combineFiltersAndRelations: vi.fn((filters, relations) =>
    relations && filters.length > 1 ? { ...relations, filters } : filters,
  ),
  getRelationsWithReplacedFilter: vi.fn((relations) => relations),
  getFiltersArray: vi.fn((relations) => (relations ? [relations.left, relations.right] : [])),
  isFilterRelations: vi.fn((filters) => {
    return (
      !!filters &&
      'operator' in filters &&
      (filters.operator === 'AND' || filters.operator === 'OR') &&
      !!filters.right &&
      !!filters.left
    );
  }),
}));

describe('Filter Utilities', () => {
  describe('withAddedFilter', () => {
    it('should add a filter to an empty array', () => {
      const addFilter = withAddedFilter(excludeGenderfilter);
      const result = addFilter([]);
      expect(result).toEqual([excludeGenderfilter]);
    });
    it('should add a filter to an existing array of filters', () => {
      const addFilter = withAddedFilter(excludeGenderfilter);
      const result = addFilter([memberGenderFilter, memberCostFilter]);
      expect(result).toEqual([memberGenderFilter, memberCostFilter, excludeGenderfilter]);
    });
    it('should add a filter to filter relations', () => {
      const addFilter = withAddedFilter(excludeGenderfilter);
      const result = addFilter(filterRelations);
      expect(result).toEqual({
        ...filterRelations,
        filters: [memberGenderFilter, memberCostFilter, excludeGenderfilter],
      });
    });
    it('should handle undefined input by returning an array with the new filter', () => {
      const addFilter = withAddedFilter(excludeGenderfilter);
      const result = addFilter(undefined);
      expect(result).toEqual([excludeGenderfilter]);
    });

    it('should not modify the original array when adding a filter', () => {
      const originalFilters = [memberGenderFilter, memberCostFilter];
      const addFilter = withAddedFilter(excludeGenderfilter);
      const result = addFilter(originalFilters);
      expect(result).toEqual([memberGenderFilter, memberCostFilter, excludeGenderfilter]);
      expect(originalFilters).toEqual([memberGenderFilter, memberCostFilter]); // Original unchanged
    });
  });

  describe('withAddedFilters', () => {
    it('should add multiple filters to an empty array', () => {
      const addFilters = withAddedFilters([excludeGenderfilter, textFilter]);
      const result = addFilters([]);
      expect(result).toEqual([excludeGenderfilter, textFilter]);
    });

    it('should add multiple filters to an existing array of filters', () => {
      const addFilters = withAddedFilters([excludeGenderfilter, textFilter]);
      const result = addFilters([memberGenderFilter, memberCostFilter]);
      expect(result).toEqual([
        memberGenderFilter,
        memberCostFilter,
        excludeGenderfilter,
        textFilter,
      ]);
    });

    it('should add multiple filters to filter relations', () => {
      const addFilters = withAddedFilters([excludeGenderfilter, textFilter]);
      const result = addFilters(filterRelations);
      expect(result).toEqual({
        ...filterRelations,
        filters: [memberGenderFilter, memberCostFilter, excludeGenderfilter, textFilter],
      });
    });

    it('should handle undefined input by returning an array with the new filters', () => {
      const addFilters = withAddedFilters([excludeGenderfilter, textFilter]);
      const result = addFilters(undefined);
      expect(result).toEqual([excludeGenderfilter, textFilter]);
    });

    it('should handle an empty array of filters to add by returning the original filters', () => {
      const addFilters = withAddedFilters([]);
      const result = addFilters([memberGenderFilter, memberCostFilter]);
      expect(result).toEqual([memberGenderFilter, memberCostFilter]);
    });

    it('should not modify the original array when adding multiple filters', () => {
      const originalFilters = [memberGenderFilter, memberCostFilter];
      const addFilters = withAddedFilters([excludeGenderfilter, textFilter]);
      const result = addFilters(originalFilters);
      expect(result).toEqual([
        memberGenderFilter,
        memberCostFilter,
        excludeGenderfilter,
        textFilter,
      ]);
      expect(originalFilters).toEqual([memberGenderFilter, memberCostFilter]); // Original unchanged
    });
  });

  describe('withoutFilter', () => {
    it('should remove a filter from an array of filters', () => {
      const removeFilter = withoutFilter(memberCostFilter);
      const result = removeFilter([memberGenderFilter, memberCostFilter, excludeGenderfilter]);
      expect(result).toEqual([memberGenderFilter, excludeGenderfilter]);
    });

    it('should remove a filter from filter relations', () => {
      const removeFilter = withoutFilter(memberCostFilter);
      const result = removeFilter(filterRelations);
      expect(result).toEqual([memberGenderFilter]);
    });

    it('should handle attempting to remove a non-existent filter from an array', () => {
      const removeFilter = withoutFilter(textFilter);
      const result = removeFilter([memberGenderFilter, memberCostFilter]);
      expect(result).toEqual([memberGenderFilter, memberCostFilter]);
    });

    it('should handle undefined input by returning an empty array', () => {
      const removeFilter = withoutFilter(memberGenderFilter);
      const result = removeFilter(undefined);
      expect(result).toEqual([]);
    });

    it('should handle an empty array by returning an empty array', () => {
      const removeFilter = withoutFilter(memberGenderFilter);
      const result = removeFilter([]);
      expect(result).toEqual([]);
    });

    it('should not modify the original array when removing a filter', () => {
      const originalFilters = [memberGenderFilter, memberCostFilter, excludeGenderfilter];
      const removeFilter = withoutFilter(memberCostFilter);
      const result = removeFilter(originalFilters);
      expect(result).toEqual([memberGenderFilter, excludeGenderfilter]);
      expect(originalFilters).toEqual([memberGenderFilter, memberCostFilter, excludeGenderfilter]); // Original unchanged
    });
  });

  describe('withoutFilters', () => {
    it('should remove multiple filters from an array of filters', () => {
      const removeFilters = withoutFilters([memberCostFilter, excludeGenderfilter]);
      const result = removeFilters([memberGenderFilter, memberCostFilter, excludeGenderfilter]);
      expect(result).toEqual([memberGenderFilter]);
    });

    it('should remove multiple filters from filter relations', () => {
      const removeFilters = withoutFilters([memberGenderFilter, memberCostFilter]);
      const result = removeFilters(filterRelations);
      expect(result).toEqual([]);
    });

    it('should handle attempting to remove non-existent filters from an array', () => {
      const removeFilters = withoutFilters([textFilter]);
      const result = removeFilters([memberGenderFilter, memberCostFilter]);
      expect(result).toEqual([memberGenderFilter, memberCostFilter]);
    });

    it('should handle undefined input by returning an empty array', () => {
      const removeFilters = withoutFilters([memberGenderFilter, memberCostFilter]);
      const result = removeFilters(undefined);
      expect(result).toEqual([]);
    });

    it('should handle an empty array of filters to remove by returning the original filters', () => {
      const removeFilters = withoutFilters([]);
      const result = removeFilters([memberGenderFilter, memberCostFilter]);
      expect(result).toEqual([memberGenderFilter, memberCostFilter]);
    });

    it('should not modify the original array when removing multiple filters', () => {
      const originalFilters = [memberGenderFilter, memberCostFilter, excludeGenderfilter];
      const removeFilters = withoutFilters([memberCostFilter, excludeGenderfilter]);
      const result = removeFilters(originalFilters);
      expect(result).toEqual([memberGenderFilter]);
      expect(originalFilters).toEqual([memberGenderFilter, memberCostFilter, excludeGenderfilter]); // Original unchanged
    });
  });

  describe('withReplacedFilter', () => {
    it('should replace a filter in an array of filters', () => {
      const replaceFilter = withReplacedFilter(memberCostFilter, textFilter);
      const result = replaceFilter([memberGenderFilter, memberCostFilter, excludeGenderfilter]);
      expect(result).toEqual([memberGenderFilter, textFilter, excludeGenderfilter]);
    });

    it('should replace a filter in filter relations', () => {
      const replaceFilter = withReplacedFilter(memberCostFilter, textFilter);
      const result = replaceFilter(filterRelations);
      expect(result).toEqual({ ...filterRelations, filters: [memberGenderFilter, textFilter] });
    });

    it('should handle attempting to replace a non-existent filter in an array', () => {
      const replaceFilter = withReplacedFilter(textFilter, excludeGenderfilter);
      const result = replaceFilter([memberGenderFilter, memberCostFilter]);
      expect(result).toEqual([memberGenderFilter, memberCostFilter]);
    });

    it('should handle undefined input by returning an empty array', () => {
      const replaceFilter = withReplacedFilter(memberGenderFilter, memberCostFilter);
      const result = replaceFilter(undefined);
      expect(result).toEqual([]);
    });

    it('should handle an empty array by returning an empty array', () => {
      const replaceFilter = withReplacedFilter(memberGenderFilter, memberCostFilter);
      const result = replaceFilter([]);
      expect(result).toEqual([]);
    });

    it('should not modify the original array when replacing a filter', () => {
      const originalFilters = [memberGenderFilter, memberCostFilter, excludeGenderfilter];
      const replaceFilter = withReplacedFilter(memberCostFilter, textFilter);
      const result = replaceFilter(originalFilters);
      expect(result).toEqual([memberGenderFilter, textFilter, excludeGenderfilter]);
      expect(originalFilters).toEqual([memberGenderFilter, memberCostFilter, excludeGenderfilter]); // Original unchanged
    });
  });

  describe('findFilter', () => {
    it('should find a filter in an array of filters', () => {
      const result = findFilter(
        [memberGenderFilter, memberCostFilter, excludeGenderfilter],
        (f) => f.config.guid === memberCostFilter.config.guid,
      );
      expect(result).toEqual(memberCostFilter);
    });

    it('should find a filter in filter relations', () => {
      const result = findFilter(
        filterRelations,
        (f) => f.config.guid === memberGenderFilter.config.guid,
      );
      expect(result).toEqual(memberGenderFilter);
    });

    it('should return undefined if the filter is not found in an array', () => {
      const result = findFilter(
        [memberGenderFilter, memberCostFilter],
        (f) => f.config.guid === textFilter.config.guid,
      );
      expect(result).toBeUndefined();
    });

    it('should handle undefined input by returning undefined', () => {
      const result = findFilter(undefined, (f) => f.config.guid === memberGenderFilter.config.guid);
      expect(result).toBeUndefined();
    });

    it('should handle an empty array by returning undefined', () => {
      const result = findFilter([], (f) => f.config.guid === memberGenderFilter.config.guid);
      expect(result).toBeUndefined();
    });

    it('should return the first matching filter when multiple matches exist', () => {
      const result = findFilter(
        [memberGenderFilter, memberGenderFilter, memberCostFilter],
        (f) => f.config.guid === memberGenderFilter.config.guid,
      );
      expect(result).toEqual(memberGenderFilter);
    });
  });
});
