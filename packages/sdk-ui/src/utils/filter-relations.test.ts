import { describe, it, expect } from 'vitest';
import {
  mergeFiltersOrFilterRelations,
  splitFiltersAndRelations,
  getFiltersArray,
  combineFiltersAndRelations,
  isTrivialSingleNodeRelations,
  calculateNewRelations,
  type FilterRelationsRules,
  convertFilterRelationsModelToRelationRules,
} from './filter-relations';

import {
  FilterRelations,
  FilterRelationsJaql,
  FilterRelationsJaqlIdNode,
  filterFactory,
  FilterRelationsModel,
  isCascadingFilter,
} from '@ethings-os/sdk-data';
import * as DM from '@/__test-helpers__/sample-ecommerce';

describe('filter-relations', () => {
  const filter1 = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '25-34']);
  const filter2 = filterFactory.members(DM.Commerce.Gender, ['Female']);
  const filter3 = filterFactory.members(DM.Commerce.Condition, ['New']);

  describe('splitFiltersAndRelations', () => {
    it('should return filters and null relations when given an array of filters', () => {
      const filters = [filter1, filter2];
      const result = splitFiltersAndRelations(filters);
      expect(result.filters).toEqual(filters);
      expect(result.relations).toBeNull();
    });

    it('should return filters and relations when given FilterRelations', () => {
      const filterRelations: FilterRelations = {
        left: filter1,
        right: filter2,
        operator: 'AND',
      };
      const { filters, relations } = splitFiltersAndRelations(filterRelations);
      const expectedFilters = [filter1, filter2];
      expect(filters).toEqual(expectedFilters);
      expect(relations).toEqual({
        left: { instanceid: filter1.config.guid },
        right: { instanceid: filter2.config.guid },
        operator: 'AND',
      });
    });
  });

  describe('getFiltersArray', () => {
    it('should return empty array when input is undefined', () => {
      const result = getFiltersArray(undefined);
      expect(result).toEqual([]);
    });

    it('should return filters when given an array of filters', () => {
      const filters = [filter1, filter2];
      const result = getFiltersArray(filters);
      expect(result).toEqual(filters);
    });

    it('should return filters extracted from FilterRelations', () => {
      const filterRelations: FilterRelations = filterFactory.logic.or(filter1, filter2);
      const result = getFiltersArray(filterRelations);
      expect(result).toEqual(expect.arrayContaining([filter1, filter2]));
    });
  });

  describe('isTrivialSingleNodeRelations', () => {
    it('should return true when relations is a single node', () => {
      const relations: FilterRelationsRules = { instanceid: '1' };
      const result = isTrivialSingleNodeRelations(relations);
      expect(result).toBe(true);
    });

    it('should return false when relations is a complex node', () => {
      const relations: FilterRelationsRules = {
        left: { instanceid: '1' },
        right: { instanceid: '2' },
        operator: 'AND',
      };
      const result = isTrivialSingleNodeRelations(relations);
      expect(result).toBe(false);
    });

    it('should return false when relations is null', () => {
      const result = isTrivialSingleNodeRelations(null);
      expect(result).toBe(false);
    });
  });

  describe('combineFiltersAndRelations', () => {
    it('should return filters as is when relations are null', () => {
      const filters = [filter1];
      const result = combineFiltersAndRelations(filters, null);
      expect(result).toEqual(filters);
    });

    it('should return filters as is when relations are trivial', () => {
      const filters = [filter1];
      const relations: FilterRelationsJaqlIdNode = { instanceid: filter1.config.guid };
      const result = combineFiltersAndRelations(filters, relations);
      expect(result).toEqual(filters);
    });

    it('should return FilterRelations when relations are complex', () => {
      const filters = [filter1, filter2];
      const relations: FilterRelationsJaql = {
        left: { instanceid: filter1.config.guid },
        right: { instanceid: filter2.config.guid },
        operator: 'OR',
      };
      const result = combineFiltersAndRelations(filters, relations);
      expect(result).toEqual(filterFactory.logic.or(filter1, filter2));
    });
  });

  describe('calculateNewRelations', () => {
    it('should return prevRelations when there are no changes in filters', () => {
      const prevFilters = [filter1];
      const newFilters = [filter1];
      const result = calculateNewRelations(prevFilters, null, newFilters);
      expect(result).toBeNull();
    });

    it('should return null when there are no prevRelations', () => {
      const prevFilters = [filter1];
      const newFilters = [filter1, filter2];
      const result = calculateNewRelations(prevFilters, null, newFilters);
      expect(result).toBeNull();
    });

    it('should handle adding a filter', () => {
      const prevFilters = [filter1, filter2];
      const prevRelations: FilterRelationsRules = {
        left: { instanceid: filter1.config.guid },
        right: { instanceid: filter2.config.guid },
        operator: 'OR',
      };
      const newFilters = [filter1, filter2, filter3];
      const result = calculateNewRelations(prevFilters, prevRelations, newFilters);
      expect(result).toEqual({
        left: {
          left: {
            instanceid: filter1.config.guid,
          },
          operator: 'OR',
          right: {
            instanceid: filter2.config.guid,
          },
        },
        operator: 'AND',
        right: {
          instanceid: filter3.config.guid,
        },
      });
    });

    it('should handle removing a filter', () => {
      const prevFilters = [filter1, filter2, filter3];
      const prevRelations: FilterRelationsRules = {
        left: {
          left: {
            instanceid: filter1.config.guid,
          },
          operator: 'OR',
          right: {
            instanceid: filter2.config.guid,
          },
        },
        operator: 'AND',
        right: {
          instanceid: filter3.config.guid,
        },
      };
      const newFilters = [filter1, filter3];
      const result = calculateNewRelations(prevFilters, prevRelations, newFilters);
      expect(result).toEqual({
        left: {
          instanceid: filter1.config.guid,
        },
        operator: 'AND',
        right: {
          instanceid: filter3.config.guid,
        },
      });
    });
  });

  describe('mergeFiltersOrFilterRelations', () => {
    it('should merge filters and relations properly', () => {
      const sourceFilters = filterFactory.logic.or(filter1, filter2);
      const targetFilters = [filter3];

      const result = mergeFiltersOrFilterRelations(sourceFilters, targetFilters);
      expect(result).toEqual(
        filterFactory.logic.and(filterFactory.logic.or(filter1, filter2), filter3),
      );
    });
  });

  describe('convertFilterRelationsModelToRelationRules', () => {
    it('should convert complex FilterRelations (with cascading filter) to FilterRelationsRules', () => {
      // (([Gender] AND [Country:Category]) OR [Condition])
      const genderFilter = filterFactory.members(DM.Commerce.Gender, ['Female']);
      const countryFilter = filterFactory.members(DM.Country.Country, ['Brazil']);
      const categoryFilter = filterFactory.members(DM.Category.Category, ['Calculators']);
      const cascadingFilter = filterFactory.cascading([countryFilter, categoryFilter]);
      const conditionFilter = filterFactory.members(DM.Commerce.Condition, ['New', 'Refurbished']);

      if (!isCascadingFilter(cascadingFilter)) {
        throw new Error('Expected cascading filter');
      }

      const filterRelationsModel: FilterRelationsModel = {
        type: 'LogicalExpression',
        operator: 'OR',
        left: {
          type: 'ParenthesizedLogicalExpression',
          value: {
            type: 'LogicalExpression',
            operator: 'AND',
            left: {
              type: 'Identifier',
              instanceId: genderFilter.config.guid,
            },
            right: {
              type: 'CascadingIdentifier',
              levels: [
                {
                  type: 'Identifier',
                  instanceId: cascadingFilter.filters[0].config.guid,
                },
                {
                  type: 'Identifier',
                  instanceId: cascadingFilter.filters[1].config.guid,
                },
              ],
            },
          },
        },
        right: {
          type: 'Identifier',
          instanceId: conditionFilter.config.guid,
        },
      };
      const filters = [genderFilter, cascadingFilter, conditionFilter];
      const result = convertFilterRelationsModelToRelationRules(filterRelationsModel, filters);
      expect(result).toEqual({
        left: {
          left: {
            instanceid: genderFilter.config.guid,
          },
          operator: 'AND',
          right: {
            instanceid: cascadingFilter.config.guid,
          },
        },
        operator: 'OR',
        right: {
          instanceid: conditionFilter.config.guid,
        },
      });
    });
  });
});
