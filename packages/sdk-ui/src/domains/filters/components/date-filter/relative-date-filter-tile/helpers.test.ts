import { filterFactory, RelativeDateFilter as RelativeDateFilterType } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { createAnchorDateFromRelativeDateFilter } from './helpers.js';

describe('createAnchorDateFromRelativeDateFilter', () => {
  it('should return the anchor date if no offset is provided', () => {
    const filter = filterFactory.dateRelativeFrom(
      DM.Commerce.Date.Years,
      0,
      1,
      '2024-01-01',
    ) as RelativeDateFilterType;
    const result = createAnchorDateFromRelativeDateFilter(filter);
    expect(result.format('YYYY-MM-DD')).toBe('2024-01-01');
  });

  it('should handle months granularity offset', () => {
    const filter: RelativeDateFilterType = filterFactory.dateRelativeFrom(
      DM.Commerce.Date.Months,
      2,
      1,
      '2024-01-01',
    ) as RelativeDateFilterType;
    const result = createAnchorDateFromRelativeDateFilter(filter);
    expect(result.format('YYYY-MM-DD')).toBe('2024-03-01');
  });

  it('should handle years granularity offset', () => {
    const filter: RelativeDateFilterType = filterFactory.dateRelativeTo(
      DM.Commerce.Date.Years,
      1,
      1,
      '2024-01-01',
    ) as RelativeDateFilterType;
    const result = createAnchorDateFromRelativeDateFilter(filter);
    expect(result.format('YYYY-MM-DD')).toBe('2023-01-01');
  });

  it('should handle weeks granularity offset', () => {
    const filter: RelativeDateFilterType = filterFactory.dateRelativeTo(
      DM.Commerce.Date.Weeks,
      1,
      1,
      '2024-01-01',
    ) as RelativeDateFilterType;
    const result = createAnchorDateFromRelativeDateFilter(filter);
    expect(result.format('YYYY-MM-DD')).toBe('2023-12-25'); // A week before
  });

  it('should handle days granularity  offset', () => {
    const filter: RelativeDateFilterType = filterFactory.dateRelativeFrom(
      DM.Commerce.Date.Days,
      10,
      1,
      '2024-01-01',
    ) as RelativeDateFilterType;
    const result = createAnchorDateFromRelativeDateFilter(filter);
    expect(result.format('YYYY-MM-DD')).toBe('2024-01-11');
  });

  it('should handle quarters granularity offset', () => {
    const filter: RelativeDateFilterType = filterFactory.dateRelativeFrom(
      DM.Commerce.Date.Quarters,
      1,
      1,
      '2024-01-01',
    ) as RelativeDateFilterType;
    const result = createAnchorDateFromRelativeDateFilter(filter);
    expect(result.format('YYYY-MM-DD')).toBe('2024-04-01');
  });
});
