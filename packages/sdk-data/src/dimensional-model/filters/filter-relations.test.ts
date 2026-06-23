import { TranslatableError } from '../../translation/translatable-error.js';
import { DimensionalAttribute } from '../attributes/attributes.js';
import { FilterRelations, FilterRelationsJaql, FilterRelationsModel } from '../interfaces.js';
import * as filterFactory from './factory.js';
import {
  calculateNewRelations,
  combineFiltersAndRelations,
  convertFilterRelationsModelToJaql,
  convertFilterRelationsModelToRelationRules,
  filterRelationRulesToFilterRelationsModel,
  FilterRelationsRule,
  findFilterByGuid,
  getFilterCompareId,
  getFilterRelationsFromJaql,
  getFiltersArray,
  getRelationsWithReplacedFilter,
  isFilterRelations,
  mergeFilters,
  mergeFiltersOrFilterRelations,
  splitFiltersAndRelations,
} from './filter-relations.js';
import { CascadingFilter, MembersFilter } from './filters.js';
import { createFilterFromJaqlInternal } from './utils/filter-from-jaql-util.js';
import { FilterJaqlInternal } from './utils/types.js';

// Two distinct calculated-dimension (formula) filters. They become generic pass-through filters
// with no attribute expression and no `dim`, so they must be told apart by their formula.
// calculated_dimension JAQL has no translated filter type, so it is cast the same way production
// code does when feeding it into createFilterFromJaqlInternal.
const containsCalcDimFilter = createFilterFromJaqlInternal(
  {
    type: 'calculated_dimension',
    title: 'Start and End Time',
    formula: "contains([abc-1], '2011')",
    context: { '[abc-1]': { dim: '[Rooms.Start and End Time]', datatype: 'datetime' } },
    filter: { contains: '2011' },
  } as unknown as FilterJaqlInternal,
  'calc-dim-contains-guid',
);

const concatCalcDimFilter = createFilterFromJaqlInternal(
  {
    type: 'calculated_dimension',
    title: 'Concat',
    formula: "concat([def-2], ' ', [def-3])",
    context: {
      '[def-2]': { dim: '[Rooms.Name]', datatype: 'text' },
      '[def-3]': { dim: '[Rooms.Surname]', datatype: 'text' },
    },
    filter: { exclude: { members: ['Claudia Jarvis'] }, isCondition: true },
  } as unknown as FilterJaqlInternal,
  'calc-dim-concat-guid',
);

const memberGenderFilter = filterFactory.members(
  new DimensionalAttribute('[Commerce.Gender]', '[Commerce.Gender]'),
  ['Female'],
);

const memberCostFilter = filterFactory.members(
  new DimensionalAttribute('[Commerce.Cost]', '[Commerce.Cost]'),
  ['1'],
);

const memberQuantityFilter = filterFactory.members(
  new DimensionalAttribute('[Commerce.Quantity]', '[Commerce.Quantity]'),
  ['1'],
);

const memberAgeRangeFilter = filterFactory.members(
  new DimensionalAttribute('[Commerce.Age Range]', '[Commerce.Age Range]'),
  ['0-18'],
);

const excludeGenderfilter = filterFactory.exclude(
  filterFactory.members(new DimensionalAttribute('Gender', '[Commerce.Gender]'), ['Female']),
);

const filterRelation: FilterRelations = filterFactory.logic.and(
  filterFactory.logic.or(memberCostFilter, memberQuantityFilter),
  excludeGenderfilter,
);

const simpleJaql: FilterRelationsJaql = {
  operator: 'AND',
  left: { instanceid: memberCostFilter.config.guid },
  right: { instanceid: memberGenderFilter.config.guid },
};

const simpleRelations = { ...simpleJaql, left: memberCostFilter, right: memberGenderFilter };

describe('filter-relations', () => {
  describe('isFilterRelations', () => {
    it('should return false when input is undefined', () => {
      expect(isFilterRelations(undefined)).toBe(false);
    });

    it('should return false when input is an empty array', () => {
      expect(isFilterRelations([])).toBe(false);
    });

    it('should return false when input is a single filter', () => {
      expect(isFilterRelations([memberGenderFilter])).toBe(false);
    });

    it('should return false when there are no relations between filters', () => {
      expect(isFilterRelations([memberGenderFilter, memberCostFilter])).toBe(false);
    });

    it('should return true when input is a valid filter relation', () => {
      expect(isFilterRelations(filterRelation)).toBe(true);
    });
  });

  describe('mergeFiltersOrFilterRelations', () => {
    it('should merge undefined filters into an empty array', () => {
      const result = mergeFiltersOrFilterRelations(undefined, undefined);
      expect(result).toEqual([]);
    });

    it('should merge empty arrays into an empty array', () => {
      const result = mergeFiltersOrFilterRelations([], []);
      expect(result).toEqual([]);
    });

    it('should handle undefined source with a target filter array', () => {
      const result = mergeFiltersOrFilterRelations(undefined, [memberCostFilter]);
      expect(result).toEqual([memberCostFilter]);
    });

    it('should merge two filter arrays on the same dimension correctly', () => {
      const result = mergeFiltersOrFilterRelations([excludeGenderfilter], [memberGenderFilter]);
      expect(result).toEqual([memberGenderFilter]);
    });

    it('should merge two different filter arrays', () => {
      const result = mergeFiltersOrFilterRelations([memberCostFilter], [memberGenderFilter]);
      expect(result).toEqual([memberCostFilter, memberGenderFilter]);
    });

    it('should merge filter relations with a filter for the same dimension', () => {
      const result = mergeFiltersOrFilterRelations(filterRelation, [memberGenderFilter]);
      expect(result).toEqual({
        ...filterRelation,
        right: memberGenderFilter,
        composeCode: (result as FilterRelations).composeCode,
      });
    });

    it('should combine filters with an AND operator for different dimensions', () => {
      const result = mergeFiltersOrFilterRelations(filterRelation, [memberAgeRangeFilter]);
      expect(result).toEqual(filterFactory.logic.and(filterRelation, memberAgeRangeFilter));
    });

    it('should merge filter relations with identical filter relations', () => {
      const result = mergeFiltersOrFilterRelations(filterRelation, filterRelation);
      expect(result).toEqual(filterRelation);
    });
  });

  describe('splitFiltersAndRelations', () => {
    it('should handle undefined input with empty filters and null relations', () => {
      const { filters, relations } = splitFiltersAndRelations(undefined);
      expect(filters).toEqual([]);
      expect(relations).toBeNull();
    });

    it('should handle empty array input with empty filters and null relations', () => {
      const { filters, relations } = splitFiltersAndRelations([]);
      expect(filters).toEqual([]);
      expect(relations).toBeNull();
    });

    it('should split a filter array into filters with null relations', () => {
      const { filters, relations } = splitFiltersAndRelations([
        memberGenderFilter,
        memberCostFilter,
      ]);
      expect(filters).toEqual([memberGenderFilter, memberCostFilter]);
      expect(relations).toBeNull();
    });

    it('should split filter relations into filters and relations', () => {
      const { filters, relations } = splitFiltersAndRelations(filterRelation);
      expect(filters).toEqual([memberCostFilter, memberQuantityFilter, excludeGenderfilter]);
      expect(relations).toMatchObject({ operator: filterRelation.operator });
    });
  });

  describe('getFiltersArray', () => {
    it('should return an empty array for undefined input', () => {
      expect(getFiltersArray(undefined)).toEqual([]);
    });

    it('should return an empty array for empty array input', () => {
      expect(getFiltersArray([])).toEqual([]);
    });

    it('should return filters from a filter array', () => {
      expect(getFiltersArray([memberGenderFilter, memberCostFilter])).toEqual([
        memberGenderFilter,
        memberCostFilter,
      ]);
    });

    it('should return filters from an array with same dimension', () => {
      expect(getFiltersArray([memberGenderFilter, excludeGenderfilter])).toEqual([
        memberGenderFilter,
        excludeGenderfilter,
      ]);
    });

    it('should return filters from filter relations', () => {
      const leftSideRelation = filterRelation.left as FilterRelations;
      expect(getFiltersArray(filterRelation)).toEqual([
        leftSideRelation.left,
        leftSideRelation.right,
        filterRelation.right,
      ]);
    });
  });

  describe('combineFiltersAndRelations', () => {
    it('should handle empty filters with null relations', () => {
      const result = combineFiltersAndRelations([], null);
      expect(result).toEqual([]);
    });

    it('should handle empty filters with trivial relations', () => {
      const trivial = { instanceid: 'relation' };
      const result = combineFiltersAndRelations([], trivial);
      expect(result).toEqual([]);
    });

    it('should return filters when relations are null', () => {
      const result = combineFiltersAndRelations([memberGenderFilter, memberCostFilter], null);
      expect(result).toEqual([memberGenderFilter, memberCostFilter]);
    });

    it('should combine filters with trivial relations', () => {
      const trivial = { instanceid: 'relation' };
      const result = combineFiltersAndRelations([memberGenderFilter], trivial);
      expect(result).toEqual([memberGenderFilter]);
    });

    it('should merge filters and relations when all GUIDs match', () => {
      const filters = [memberCostFilter, memberGenderFilter];
      const relations = simpleJaql;
      const result = combineFiltersAndRelations(filters, relations);
      expect(result).toEqual(filterFactory.logic.and(memberCostFilter, memberGenderFilter));
    });

    it('should handle relations with missing filters', () => {
      const filters = [memberCostFilter];
      const relations = simpleJaql;
      const result = combineFiltersAndRelations(filters, relations);
      expect(result).toEqual({
        operator: 'AND',
        left: memberCostFilter,
        right: undefined,
        // bypassed composeCode check
        composeCode: (result as FilterRelations).composeCode,
      });
    });

    it('should handle extra filters not referenced in relations', () => {
      const filters = [memberCostFilter, memberGenderFilter, memberAgeRangeFilter];
      const relations = simpleJaql;
      const result = combineFiltersAndRelations(filters, relations);
      expect(result).toEqual(filterFactory.logic.and(memberCostFilter, memberGenderFilter));
    });
  });
  describe('calculateNewRelations', () => {
    it('should return null when there are no previous relations and filters', () => {
      const result = calculateNewRelations([], null, [memberGenderFilter, memberCostFilter]);
      expect(result).toBeNull();
    });

    it('should return null when there are no previous relations', () => {
      const result = calculateNewRelations([memberGenderFilter], null, [
        memberGenderFilter,
        memberCostFilter,
      ]);
      expect(result).toBeNull();
    });

    it('should add new filters to previous relations', () => {
      const prev = { instanceid: 'relation' };
      const result = calculateNewRelations([], prev, [memberGenderFilter, memberCostFilter]);
      expect(result).toEqual({
        left: {
          left: prev,
          operator: 'AND',
          right: { instanceid: memberGenderFilter.config.guid },
        },
        operator: 'AND',
        right: { instanceid: memberCostFilter.config.guid },
      });
    });

    it('should add a new filter to existing relations', () => {
      const prev = { instanceid: 'relation' };
      const result = calculateNewRelations([memberGenderFilter], prev, [memberCostFilter]);
      expect(result).toEqual({
        left: prev,
        operator: 'AND',
        right: { instanceid: memberCostFilter.config.guid },
      });
    });

    it('should add a new filter when some filters already exist in relations', () => {
      const prev = { instanceid: 'relation' };
      const result = calculateNewRelations([memberGenderFilter], prev, [
        memberGenderFilter,
        memberCostFilter,
      ]);
      expect(result).toEqual({
        left: prev,
        operator: 'AND',
        right: { instanceid: memberCostFilter.config.guid },
      });
    });

    it('should simplify to a single filter when removing one from previous relations', () => {
      const prev: FilterRelationsRule = {
        operator: 'AND',
        left: { instanceid: memberGenderFilter.config.guid },
        right: { instanceid: memberCostFilter.config.guid },
      };
      const result = calculateNewRelations([memberGenderFilter, memberCostFilter], prev, [
        memberGenderFilter,
      ]);
      expect(result).toMatchObject({ instanceid: memberGenderFilter.config.guid });
    });

    it('should return previous relations when new filters match a subset of previous ones', () => {
      const prev: FilterRelationsRule = {
        operator: 'AND',
        left: { instanceid: memberGenderFilter.config.guid },
        right: { instanceid: memberCostFilter.config.guid },
      };
      const result = calculateNewRelations([memberGenderFilter], prev, [memberGenderFilter]);
      expect(result).toMatchObject(prev);
    });

    it('should update relations to use new filter when previous filters differ', () => {
      const prev: FilterRelationsRule = {
        operator: 'AND',
        left: { instanceid: memberGenderFilter.config.guid },
        right: { instanceid: memberCostFilter.config.guid },
      };
      const result = calculateNewRelations([memberCostFilter], prev, [memberGenderFilter]);
      expect(result).toMatchObject({
        left: { instanceid: memberGenderFilter.config.guid },
        operator: 'AND',
        right: { instanceid: memberGenderFilter.config.guid },
      });
    });

    describe('shouldReplaceSameAttributeFilters option', () => {
      // A second Gender filter with different members (same attribute, new GUID).
      const memberGenderFilterV2 = filterFactory.members(
        new DimensionalAttribute('[Commerce.Gender]', '[Commerce.Gender]'),
        ['Male'],
      );

      it('should replace a same-attribute filter in-place in the relation tree', () => {
        // relations: genderFilter AND (costFilter OR quantityFilter)
        const prev: FilterRelationsRule = {
          operator: 'AND',
          left: { instanceid: memberGenderFilter.config.guid },
          right: {
            operator: 'OR',
            left: { instanceid: memberCostFilter.config.guid },
            right: { instanceid: memberQuantityFilter.config.guid },
          },
        };
        // Widget overrides genderFilter → genderFilterV2; costFilter and quantityFilter unchanged.
        const newFilters = [memberGenderFilterV2, memberCostFilter, memberQuantityFilter];
        const result = calculateNewRelations(
          [memberGenderFilter, memberCostFilter, memberQuantityFilter],
          prev,
          newFilters,
          { shouldReplaceSameAttributeFilters: true },
        );
        // Expect same structure with genderFilter node swapped to genderFilterV2.
        expect(result).toEqual({
          operator: 'AND',
          left: { instanceid: memberGenderFilterV2.config.guid },
          right: {
            operator: 'OR',
            left: { instanceid: memberCostFilter.config.guid },
            right: { instanceid: memberQuantityFilter.config.guid },
          },
        });
      });

      it('should append a filter with AND when there is no same-attribute match in prev filters', () => {
        // relations: costFilter OR quantityFilter
        const prev: FilterRelationsRule = {
          operator: 'OR',
          left: { instanceid: memberCostFilter.config.guid },
          right: { instanceid: memberQuantityFilter.config.guid },
        };
        // memberGenderFilter is new — no Gender filter in prev.
        const newFilters = [memberCostFilter, memberQuantityFilter, memberGenderFilter];
        const result = calculateNewRelations(
          [memberCostFilter, memberQuantityFilter],
          prev,
          newFilters,
          { shouldReplaceSameAttributeFilters: true },
        );
        expect(result).toEqual({
          operator: 'AND',
          left: prev,
          right: { instanceid: memberGenderFilter.config.guid },
        });
      });

      it('should append (not replace) when the matching prev filter is disabled', () => {
        const disabledGenderFilter = filterFactory.members(
          new DimensionalAttribute('[Commerce.Gender]', '[Commerce.Gender]'),
          ['Female'],
          { disabled: true },
        );
        // relations: disabledGenderFilter AND costFilter
        const prev: FilterRelationsRule = {
          operator: 'AND',
          left: { instanceid: disabledGenderFilter.config.guid },
          right: { instanceid: memberCostFilter.config.guid },
        };
        const newFilters = [disabledGenderFilter, memberCostFilter, memberGenderFilterV2];
        const result = calculateNewRelations(
          [disabledGenderFilter, memberCostFilter],
          prev,
          newFilters,
          { shouldReplaceSameAttributeFilters: true },
        );
        // disabledGenderFilter stays in-place; memberGenderFilterV2 is appended with AND.
        expect(result).toEqual({
          operator: 'AND',
          left: prev,
          right: { instanceid: memberGenderFilterV2.config.guid },
        });
      });
    });
  });

  describe('getRelationsWithReplacedFilter', () => {
    it('should return null for null relations', () => {
      const newFilter = { ...memberGenderFilter, config: { guid: 'new' } };
      const result = getRelationsWithReplacedFilter(
        null,
        memberGenderFilter,
        newFilter as MembersFilter,
      );
      expect(result).toBeNull();
    });

    it('should not update relation when filter to replace is not present', () => {
      const relation = {
        instanceid: 'relation',
        left: { instanceid: memberQuantityFilter.config.guid },
        right: { instanceid: excludeGenderfilter.config.guid },
      };
      const newFilter = { ...memberGenderFilter, config: { guid: 'new' } };
      const result = getRelationsWithReplacedFilter(
        relation,
        memberCostFilter,
        newFilter as MembersFilter,
      );
      expect(result).toEqual(relation);
    });
  });

  describe('convertFilterRelationsModelToRelationRules', () => {
    it('should return null when both relation and filters are empty', () => {
      const result = convertFilterRelationsModelToRelationRules(undefined, []);
      expect(result).toBeNull();
    });

    it('should return null when relation is empty', () => {
      const result = convertFilterRelationsModelToRelationRules(undefined, [memberCostFilter]);
      expect(result).toBeNull();
    });

    it('should convert filter relation model to relation rules', () => {
      const relation: FilterRelationsModel = {
        left: { type: 'Identifier', instanceId: 'left' },
        right: { type: 'Identifier', instanceId: 'right' },
        type: 'LogicalExpression',
        operator: 'AND',
      };
      const result = convertFilterRelationsModelToRelationRules(relation, [memberCostFilter]);
      expect(result).toEqual({
        operator: 'AND',
        left: { instanceid: 'left' },
        right: { instanceid: 'right' },
      });
    });

    it('should convert multi-level relation model to relation rules', () => {
      const relation: FilterRelationsModel = {
        left: {
          left: { type: 'Identifier', instanceId: 'left1' },
          right: { type: 'Identifier', instanceId: 'left2' },
          type: 'LogicalExpression',
          operator: 'AND',
        },
        right: { type: 'Identifier', instanceId: 'right' },
        type: 'LogicalExpression',
        operator: 'OR',
      };
      const result = convertFilterRelationsModelToRelationRules(relation, [memberCostFilter]);
      expect(result).toEqual({
        left: {
          left: { instanceid: 'left1' },
          right: { instanceid: 'left2' },
          operator: 'AND',
        },
        right: { instanceid: 'right' },
        operator: 'OR',
      });
    });

    it('should convert relation model with OR operator to relation rules', () => {
      const relation: FilterRelationsModel = {
        left: { type: 'Identifier', instanceId: 'left' },
        right: { type: 'Identifier', instanceId: 'right' },
        type: 'LogicalExpression',
        operator: 'OR',
      };
      const result = convertFilterRelationsModelToRelationRules(relation, [memberCostFilter]);
      expect(result).toEqual({
        operator: 'OR',
        left: { instanceid: 'left' },
        right: { instanceid: 'right' },
      });
    });

    it('should unwrap ParenthesizedLogicalExpression to binary relation rules', () => {
      const relation: FilterRelationsModel = {
        type: 'LogicalExpression',
        operator: 'OR',
        left: {
          type: 'ParenthesizedLogicalExpression',
          value: {
            type: 'LogicalExpression',
            operator: 'OR',
            left: { type: 'Identifier', instanceId: 'A' },
            right: { type: 'Identifier', instanceId: 'B' },
          },
        },
        right: { type: 'Identifier', instanceId: 'C' },
      };
      const result = convertFilterRelationsModelToRelationRules(relation, [memberCostFilter]);
      expect(result).toEqual({
        operator: 'OR',
        left: {
          operator: 'OR',
          left: { instanceid: 'A' },
          right: { instanceid: 'B' },
        },
        right: { instanceid: 'C' },
      });
    });
  });

  describe('filterRelationRulesToFilterRelationsModel', () => {
    it('should return undefined when both rules and filters are empty', () => {
      const result = filterRelationRulesToFilterRelationsModel(null, []);
      expect(result).toBeUndefined();
    });

    it('should return undefined when rules are empty', () => {
      const result = filterRelationRulesToFilterRelationsModel(null, [memberCostFilter]);
      expect(result).toBeUndefined();
    });

    it('should convert relation rules to filter relation model without filters', () => {
      const result = filterRelationRulesToFilterRelationsModel(
        {
          operator: 'AND',
          left: { instanceid: 'left' },
          right: { instanceid: 'right' },
        },
        [],
      );
      expect(result).toEqual({
        left: {
          instanceId: 'left',
          type: 'Identifier',
        },
        operator: 'AND',
        right: {
          instanceId: 'right',
          type: 'Identifier',
        },
        type: 'LogicalExpression',
      });
    });

    it('should convert relation rules to filter relation model with filters', () => {
      const matchedFilter = { ...memberCostFilter, config: { guid: 'left' } };
      const result = filterRelationRulesToFilterRelationsModel(
        {
          operator: 'AND',
          left: { instanceid: 'left' },
          right: { instanceid: 'right' },
        },
        [matchedFilter as MembersFilter],
      );
      expect(result).toEqual({
        left: {
          instanceId: 'left',
          type: 'Identifier',
        },
        operator: 'AND',
        right: {
          instanceId: 'right',
          type: 'Identifier',
        },
        type: 'LogicalExpression',
      });
    });
    it('should convert relation rules to filter relation model with unmatched filters', () => {
      const result = filterRelationRulesToFilterRelationsModel(
        {
          operator: 'AND',
          left: { instanceid: 'left' },
          right: { instanceid: 'right' },
        },
        [memberCostFilter],
      );
      expect(result).toEqual({
        left: {
          instanceId: 'left',
          type: 'Identifier',
        },
        operator: 'AND',
        right: {
          instanceId: 'right',
          type: 'Identifier',
        },
        type: 'LogicalExpression',
      });
    });

    it('should wrap nested same-operator OR children in ParenthesizedLogicalExpression for Fusion', () => {
      const rules = {
        operator: 'OR' as const,
        left: {
          operator: 'OR' as const,
          left: { instanceid: 'A' },
          right: { instanceid: 'B' },
        },
        right: { instanceid: 'C' },
      };
      const result = filterRelationRulesToFilterRelationsModel(rules, []);
      expect(result).toEqual({
        type: 'LogicalExpression',
        operator: 'OR',
        left: {
          type: 'ParenthesizedLogicalExpression',
          value: {
            type: 'LogicalExpression',
            operator: 'OR',
            left: { type: 'Identifier', instanceId: 'A' },
            right: { type: 'Identifier', instanceId: 'B' },
          },
        },
        right: { type: 'Identifier', instanceId: 'C' },
      });
    });

    it('should wrap mixed AND/OR subgroups in ParenthesizedLogicalExpression for Fusion', () => {
      const rules = {
        operator: 'OR' as const,
        left: { instanceid: 'A' },
        right: {
          operator: 'AND' as const,
          left: { instanceid: 'B' },
          right: {
            operator: 'OR' as const,
            left: { instanceid: 'C' },
            right: { instanceid: 'D' },
          },
        },
      };
      const result = filterRelationRulesToFilterRelationsModel(rules, []);
      expect(result).toEqual({
        type: 'LogicalExpression',
        operator: 'OR',
        left: { type: 'Identifier', instanceId: 'A' },
        right: {
          type: 'ParenthesizedLogicalExpression',
          value: {
            type: 'LogicalExpression',
            operator: 'AND',
            left: { type: 'Identifier', instanceId: 'B' },
            right: {
              type: 'ParenthesizedLogicalExpression',
              value: {
                type: 'LogicalExpression',
                operator: 'OR',
                left: { type: 'Identifier', instanceId: 'C' },
                right: { type: 'Identifier', instanceId: 'D' },
              },
            },
          },
        },
      });
    });
  });

  describe('findFilterByGuid', () => {
    it('should return undefined when no filters are provided', () => {
      const result = findFilterByGuid([], memberGenderFilter.config.guid);
      expect(result).toBeUndefined();
    });

    it('should return undefined when filter does not exist', () => {
      const result = findFilterByGuid([memberCostFilter], memberGenderFilter.config.guid);
      expect(result).toBeUndefined();
    });

    it('should find an existing filter by GUID', () => {
      const result = findFilterByGuid(
        [memberCostFilter, memberGenderFilter],
        memberGenderFilter.config.guid,
      );
      expect(result).toEqual(memberGenderFilter);
    });
  });

  describe('getFilterCompareId', () => {
    it('should generate an ID for a simple MembersFilter using attribute.expression', () => {
      const result = getFilterCompareId(memberCostFilter);
      expect(result).toBe('[Commerce.Cost]');
    });

    it('should generate an ID for a cascading filter by joining child filter IDs', () => {
      const cascadeFilter = new CascadingFilter([memberCostFilter, memberGenderFilter]);
      const result = getFilterCompareId(cascadeFilter);
      expect(result).toBe('[Commerce.Cost]-[Commerce.Gender]');
    });

    it('should generate an ID for an ExcludeFilter', () => {
      const result = getFilterCompareId(excludeGenderfilter);
      expect(result).toBe('[Commerce.Gender]'); // Uses the inner attribute's expression
    });
    it('should include granularity for a datetime filter', () => {
      const datetimeFilter = new MembersFilter(
        new DimensionalAttribute('[Date.Created]', '[Date.Created]', 'month'),
        ['2023-01'],
      );
      datetimeFilter.jaql = () => ({
        jaql: { dim: '[Date.Created]', datatype: 'datetime', level: 'months' },
      });
      const result = getFilterCompareId(datetimeFilter);
      expect(result).toBe('[Date.Created]Months');
    });

    it('should use the formula as the ID for a calculated-dimension filter', () => {
      const result = getFilterCompareId(containsCalcDimFilter);
      expect(result).toBe("contains([abc-1], '2011')");
    });

    it('should generate distinct IDs for two different calculated-dimension filters', () => {
      expect(getFilterCompareId(containsCalcDimFilter)).not.toBe(
        getFilterCompareId(concatCalcDimFilter),
      );
    });
  });

  describe('mergeFilters', () => {
    it('should return an empty array for empty inputs', () => {
      const result = mergeFilters([], []);
      expect(result).toEqual([]);
    });

    it('should merge filters without duplicates', () => {
      const result = mergeFilters([memberCostFilter], [memberGenderFilter]);
      expect(result).toEqual([memberCostFilter, memberGenderFilter]);
    });

    it('should replace the filter with same dimension', () => {
      const result = mergeFilters([memberGenderFilter], [excludeGenderfilter]);
      expect(result).toEqual([excludeGenderfilter]);
    });

    it('should keep both distinct calculated-dimension filters instead of dropping one', () => {
      const result = mergeFilters([containsCalcDimFilter], [concatCalcDimFilter]);
      expect(result).toEqual([containsCalcDimFilter, concatCalcDimFilter]);
    });
  });

  describe('getFilterRelationsFromJaql', () => {
    it('should return an empty array when JAQL is undefined', () => {
      const result = getFilterRelationsFromJaql([], [], undefined);
      expect(result).toEqual([]);
    });

    it('should throw an error when filters do not exist for JAQL', () => {
      expect(() => getFilterRelationsFromJaql([], [], simpleJaql)).toThrow(TranslatableError);
    });

    it('should return filters when highlights are present', () => {
      const result = getFilterRelationsFromJaql(
        [memberCostFilter],
        [memberGenderFilter],
        simpleJaql,
      );
      expect(result).toEqual([memberCostFilter]);
    });

    it('should convert JAQL to relations', () => {
      const result = getFilterRelationsFromJaql(
        [memberCostFilter, memberGenderFilter],
        [],
        simpleJaql,
      );
      expect(result).toEqual(simpleRelations);
    });
  });

  describe('convertFilterRelationsModelToJaql', () => {
    it('should return undefined when input is undefined', () => {
      const result = convertFilterRelationsModelToJaql(undefined);
      expect(result).toBeUndefined();
    });

    it('should convert a simple filter relation model with AND operator to JAQL', () => {
      const relation: FilterRelationsModel = {
        left: { type: 'Identifier', instanceId: 'left' },
        right: { type: 'Identifier', instanceId: 'right' },
        type: 'LogicalExpression',
        operator: 'AND',
      };
      const result = convertFilterRelationsModelToJaql(relation);
      expect(result).toEqual({
        operator: 'AND',
        left: { instanceid: 'left' },
        right: { instanceid: 'right' },
      });
    });

    it('should convert a filter relation model with OR operator to JAQL', () => {
      const relation: FilterRelationsModel = {
        left: { type: 'Identifier', instanceId: 'cost' },
        right: { type: 'Identifier', instanceId: 'quantity' },
        type: 'LogicalExpression',
        operator: 'OR',
      };
      const result = convertFilterRelationsModelToJaql(relation);
      expect(result).toEqual({
        operator: 'OR',
        left: { instanceid: 'cost' },
        right: { instanceid: 'quantity' },
      });
    });

    it('should convert a multi-level filter relation model to JAQL', () => {
      const relation: FilterRelationsModel = {
        type: 'LogicalExpression',
        operator: 'AND',
        left: {
          type: 'LogicalExpression',
          operator: 'OR',
          left: { type: 'Identifier', instanceId: 'cost' },
          right: { type: 'Identifier', instanceId: 'quantity' },
        },
        right: { type: 'Identifier', instanceId: 'gender' },
      };
      const result = convertFilterRelationsModelToJaql(relation);
      expect(result).toEqual({
        operator: 'AND',
        left: {
          operator: 'OR',
          left: { instanceid: 'cost' },
          right: { instanceid: 'quantity' },
        },
        right: { instanceid: 'gender' },
      });
    });
  });
});
