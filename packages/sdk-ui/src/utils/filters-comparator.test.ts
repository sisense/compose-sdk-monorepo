import { isFiltersChanged, isRelationsChanged } from './filters-comparator'; // Update with the correct path
import { Filter, filterFactory, getFilterListAndRelationsJaql } from '@ethings-os/sdk-data';
import * as DM from '@/__test-helpers__/sample-ecommerce';

describe('isFiltersChanged', () => {
  const someFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 1000);
  const someAnotherFilter = filterFactory.lessThan(DM.Commerce.Revenue, 1000);
  const someAnotherFilterUpdated = filterFactory.lessThan(DM.Commerce.Revenue, 100);

  it('should return false for two undefined filters', () => {
    expect(isFiltersChanged(undefined, undefined)).toBe(false);
  });

  it('should return true if one filter is undefined and the other is not', () => {
    const prevFilters = undefined;
    const newFilters: Filter[] = [someFilter];
    expect(isFiltersChanged(prevFilters, newFilters)).toBe(true);
  });

  it('should return true if the length of filters is different', () => {
    const prevFilters: Filter[] = [someFilter];
    const newFilters: Filter[] = [someFilter, someAnotherFilter];
    expect(isFiltersChanged(prevFilters, newFilters)).toBe(true);
  });

  it('should return false if both filters are empty', () => {
    expect(isFiltersChanged([], [])).toBe(false);
  });

  it('should return true if filters have changed', () => {
    const prevFilters: Filter[] = [someFilter];
    const newFilters: Filter[] = [someAnotherFilter];
    expect(isFiltersChanged(prevFilters, newFilters)).toBe(true);
  });

  it('should return false if filters have not changed', () => {
    const prevFilters: Filter[] = [someFilter, someAnotherFilter];
    const newFilters: Filter[] = [someFilter, someAnotherFilter];
    expect(isFiltersChanged(prevFilters, newFilters)).toBe(false);
  });

  it('should return true if filters have switched ordering', () => {
    const prevFilters: Filter[] = [someFilter, someAnotherFilter];
    const newFilters: Filter[] = [someAnotherFilter, someFilter];
    expect(isFiltersChanged(prevFilters, newFilters)).toBe(true);
  });

  it('should return true if filters have changed slightly', () => {
    const prevFilters: Filter[] = [someFilter, someAnotherFilter];
    const newFilters: Filter[] = [someFilter, someAnotherFilterUpdated];
    expect(isFiltersChanged(prevFilters, newFilters)).toBe(true);
  });
});

describe('isRelationsChanged', () => {
  const someFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 1000);
  const sameFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 1000);
  const differentFilter = filterFactory.between(DM.Commerce.Revenue, 100, 500);
  const someAnotherFilter = filterFactory.lessThan(DM.Commerce.Revenue, 10000);

  const andRelation = filterFactory.logic.and(someFilter, someAnotherFilter);
  const orRelation = filterFactory.logic.or(someFilter, andRelation);
  const differentOrRelation = filterFactory.logic.or(differentFilter, andRelation);
  const sameOrRelation = filterFactory.logic.or(sameFilter, andRelation);

  it('should return true if both relations are undefined', () => {
    expect(isRelationsChanged([], [], undefined, undefined)).toBe(false);
  });

  it('should return true if one relation is undefined and another is not', () => {
    const { filters: prevFilters, relations: prevRelations } =
      getFilterListAndRelationsJaql(orRelation);
    expect(isRelationsChanged(prevFilters, [], prevRelations, undefined)).toBe(true);
  });

  it('should return false if filters are same and relations are same', () => {
    const { filters: prevFilters, relations: prevRelations } =
      getFilterListAndRelationsJaql(orRelation);
    const { filters: newFilters, relations: newRelations } =
      getFilterListAndRelationsJaql(sameOrRelation);
    expect(isRelationsChanged(prevFilters, newFilters, prevRelations, newRelations)).toBe(false);
  });

  it('should return true if filters are different', () => {
    const { filters: prevFilters, relations: prevRelations } =
      getFilterListAndRelationsJaql(orRelation);
    const { filters: newFilters, relations: newRelations } =
      getFilterListAndRelationsJaql(differentOrRelation);
    expect(isRelationsChanged(prevFilters, newFilters, prevRelations, newRelations)).toBe(true);
  });

  it('should return true if operators are different', () => {
    const { filters: prevFilters, relations: prevRelations } =
      getFilterListAndRelationsJaql(andRelation);
    const { filters: newFilters, relations: newRelations } = getFilterListAndRelationsJaql(
      filterFactory.logic.or(someFilter, someAnotherFilter),
    );
    expect(isRelationsChanged(prevFilters, newFilters, prevRelations, newRelations)).toBe(true);
  });

  it('should return true if structure is different', () => {
    const { filters: prevFilters, relations: prevRelations } =
      getFilterListAndRelationsJaql(orRelation);
    const { filters: newFilters, relations: newRelations } = getFilterListAndRelationsJaql(
      filterFactory.logic.or(someFilter, someAnotherFilter),
    );
    expect(isRelationsChanged(prevFilters, newFilters, prevRelations, newRelations)).toBe(true);
  });

  it('should return false if nodes are swapped, but logical structure is the same', () => {
    const { filters: prevFilters, relations: prevRelations } =
      getFilterListAndRelationsJaql(orRelation);
    const { filters: newFilters, relations: newRelations } = getFilterListAndRelationsJaql(
      filterFactory.logic.or(andRelation, someFilter),
    );
    expect(isRelationsChanged(prevFilters, newFilters, prevRelations, newRelations)).toBe(false);
  });
});
