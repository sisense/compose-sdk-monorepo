import { filterFactory, measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { BaseQueryParams } from '../../types.js';
import { haveQueryParamsChanged } from './query-params-comparator.js';

describe('haveQueryParamsChanged', () => {
  const baseParams: BaseQueryParams = {
    dataSource: DM.DataSource,
    dimensions: [DM.Commerce.AgeRange],
    measures: [measureFactory.sum(DM.Commerce.Revenue, 'Revenue')],
    filters: [filterFactory.greaterThan(DM.Commerce.Revenue, 1000)],
    highlights: [filterFactory.greaterThan(DM.Commerce.Quantity, 5)],
  };

  it('returns false when nothing changed', () => {
    expect(haveQueryParamsChanged(baseParams, { ...baseParams })).toBe(false);
  });

  it('returns false for two empty param sets', () => {
    expect(haveQueryParamsChanged({}, {})).toBe(false);
  });

  it('returns true when dataSource changed', () => {
    expect(
      haveQueryParamsChanged(baseParams, { ...baseParams, dataSource: 'Other Data Source' }),
    ).toBe(true);
  });

  it('returns true when dimensions changed', () => {
    expect(
      haveQueryParamsChanged(baseParams, { ...baseParams, dimensions: [DM.Commerce.Gender] }),
    ).toBe(true);
  });

  it('returns true when measures changed', () => {
    expect(
      haveQueryParamsChanged(baseParams, {
        ...baseParams,
        measures: [measureFactory.sum(DM.Commerce.Cost, 'Cost')],
      }),
    ).toBe(true);
  });

  it('returns true when filters changed', () => {
    expect(
      haveQueryParamsChanged(baseParams, {
        ...baseParams,
        filters: [filterFactory.lessThan(DM.Commerce.Revenue, 1000)],
      }),
    ).toBe(true);
  });

  it('returns true when highlights changed', () => {
    expect(
      haveQueryParamsChanged(baseParams, {
        ...baseParams,
        highlights: [filterFactory.lessThan(DM.Commerce.Quantity, 5)],
      }),
    ).toBe(true);
  });

  it('returns false when filters are an equivalent FilterRelations tree', () => {
    const someFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 1000);
    const sameFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 1000);
    const anotherFilter = filterFactory.lessThan(DM.Commerce.Revenue, 10000);
    const relations = filterFactory.logic.or(
      someFilter,
      filterFactory.logic.and(sameFilter, anotherFilter),
    );
    const sameRelations = filterFactory.logic.or(
      sameFilter,
      filterFactory.logic.and(someFilter, anotherFilter),
    );

    expect(
      haveQueryParamsChanged(
        { ...baseParams, filters: relations },
        { ...baseParams, filters: sameRelations },
      ),
    ).toBe(false);
  });

  it('returns true when the FilterRelations structure changed', () => {
    const someFilter = filterFactory.greaterThan(DM.Commerce.Revenue, 1000);
    const anotherFilter = filterFactory.lessThan(DM.Commerce.Revenue, 10000);
    const relations = filterFactory.logic.or(
      someFilter,
      filterFactory.logic.and(someFilter, anotherFilter),
    );
    const changedRelations = filterFactory.logic.and(
      someFilter,
      filterFactory.logic.and(someFilter, anotherFilter),
    );

    expect(
      haveQueryParamsChanged(
        { ...baseParams, filters: relations },
        { ...baseParams, filters: changedRelations },
      ),
    ).toBe(true);
  });
});
