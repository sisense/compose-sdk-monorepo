import { type Filter, filterFactory, type FilterRelations } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { translateFiltersAndRelationsToDto } from './utils.js';

/** Strips datasource from filter instances (simulates filters that omit `filter.dataSource`). */
function filterWithoutDatasourceTitles(f: Filter): Filter {
  const c = Object.assign(Object.create(Object.getPrototypeOf(f)), f) as Filter;
  Object.defineProperty(c, 'dataSource', {
    value: undefined,
    configurable: true,
    enumerable: true,
  });
  const attr = Object.assign(Object.create(Object.getPrototypeOf(f.attribute)), f.attribute);
  Object.defineProperty(attr, 'dataSource', {
    value: undefined,
    configurable: true,
    enumerable: true,
  });
  Object.defineProperty(c, 'attribute', { value: attr, configurable: true, enumerable: true });
  return c;
}

describe('translateFiltersAndRelationsToDto', () => {
  it('should translate Filter[] to DTOs', () => {
    const filters = [filterFactory.members(DM.Commerce.Date, ['01/01/2021'])];

    const result = translateFiltersAndRelationsToDto(filters);

    expect(result.filters).toHaveLength(1);
    expect(result.filters[0]).toMatchObject({
      jaql: expect.objectContaining({
        dim: expect.any(String),
        datatype: 'datetime',
      }),
    });
  });

  it('should handle empty filters', () => {
    const result = translateFiltersAndRelationsToDto([]);

    expect(result.filters).toEqual([]);
    expect(result.filterRelations).toBeUndefined();
  });

  it('should handle FilterRelations input', () => {
    const filter1 = filterFactory.members(DM.Commerce.Date, ['01/01/2021']);
    const filter2 = filterFactory.members(DM.Commerce.Gender, ['M']);
    const filterRelations: FilterRelations = filterFactory.logic.and(filter1, filter2);

    const result = translateFiltersAndRelationsToDto(filterRelations);

    expect(result.filters).toHaveLength(2);
    expect(result.filterRelations).toEqual([
      {
        datasource: DM.DataSource,
        filterRelations: expect.objectContaining({
          type: 'LogicalExpression',
          operator: 'AND',
          left: expect.any(Object),
          right: expect.any(Object),
        }),
      },
    ]);
  });

  it('should set filterRelations.datasource from attribute when filter.dataSource is unset', () => {
    const filter1 = filterFactory.members(DM.Commerce.Date, ['01/01/2021']);
    const filter2 = filterFactory.members(DM.Commerce.Gender, ['M']);
    const filterRelations: FilterRelations = filterFactory.logic.and(filter1, filter2);

    const result = translateFiltersAndRelationsToDto(filterRelations);

    expect(result.filterRelations?.[0]?.datasource).toBe(DM.DataSource);
  });

  it('should use empty string when no datasource can be resolved from filters or attributes', () => {
    const filter1 = filterWithoutDatasourceTitles(
      filterFactory.members(DM.Commerce.Date, ['01/01/2021']),
    );
    const filter2 = filterWithoutDatasourceTitles(filterFactory.members(DM.Commerce.Gender, ['M']));
    const filterRelations: FilterRelations = filterFactory.logic.and(filter1, filter2);

    const result = translateFiltersAndRelationsToDto(filterRelations);

    expect(result.filterRelations?.[0]?.datasource).toBe('');
  });

  it('should derive ParenthesizedLogicalExpression for nested OR chains when persisting', () => {
    const fa = filterFactory.members(DM.Commerce.Date, ['01/01/2021'], { guid: 'A' });
    const fb = filterFactory.members(DM.Commerce.Gender, ['M'], { guid: 'B' });
    const fc = filterFactory.members(DM.Commerce.AgeRange, ['25-34'], { guid: 'C' });
    const fd = filterFactory.members(DM.Commerce.Condition, ['New'], { guid: 'D' });
    const filterRelations: FilterRelations = filterFactory.logic.or(
      filterFactory.logic.or(filterFactory.logic.or(fa, fb), fc),
      fd,
    );

    const result = translateFiltersAndRelationsToDto(filterRelations);

    expect(result.filterRelations?.[0]?.filterRelations).toEqual({
      type: 'LogicalExpression',
      operator: 'OR',
      left: {
        type: 'ParenthesizedLogicalExpression',
        value: {
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
        },
      },
      right: { type: 'Identifier', instanceId: 'D' },
    });
  });

  it('should derive ParenthesizedLogicalExpression for right-associated OR chains when persisting', () => {
    const fa = filterFactory.members(DM.Commerce.Date, ['01/01/2021'], { guid: 'A' });
    const fb = filterFactory.members(DM.Commerce.Gender, ['M'], { guid: 'B' });
    const fc = filterFactory.members(DM.Commerce.AgeRange, ['25-34'], { guid: 'C' });
    const fd = filterFactory.members(DM.Commerce.Condition, ['New'], { guid: 'D' });
    const filterRelations: FilterRelations = filterFactory.logic.or(
      fa,
      filterFactory.logic.or(fb, filterFactory.logic.or(fc, fd)),
    );

    const result = translateFiltersAndRelationsToDto(filterRelations);

    expect(result.filterRelations?.[0]?.filterRelations).toEqual({
      type: 'LogicalExpression',
      operator: 'OR',
      left: { type: 'Identifier', instanceId: 'A' },
      right: {
        type: 'ParenthesizedLogicalExpression',
        value: {
          type: 'LogicalExpression',
          operator: 'OR',
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

  it('should parenthesize mixed AND/OR subgroups when persisting (matches Fusion bracket shape)', () => {
    const fa = filterFactory.members(DM.Commerce.Date, ['01/01/2021'], { guid: 'A' });
    const fb = filterFactory.members(DM.Commerce.Gender, ['M'], { guid: 'B' });
    const fc = filterFactory.members(DM.Commerce.AgeRange, ['25-34'], { guid: 'C' });
    const fd = filterFactory.members(DM.Commerce.Condition, ['New'], { guid: 'D' });
    const innerOr = filterFactory.logic.or(fc, fd);
    const filterRelations: FilterRelations = filterFactory.logic.or(
      fa,
      filterFactory.logic.and(fb, innerOr),
    );

    const result = translateFiltersAndRelationsToDto(filterRelations);

    expect(result.filterRelations?.[0]?.filterRelations).toEqual({
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
