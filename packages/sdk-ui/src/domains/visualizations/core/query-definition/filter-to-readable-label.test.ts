import type { Filter } from '@sisense/sdk-data';
import {
  createAttribute,
  DimensionalLevelAttribute,
  filterFactory,
  measureFactory,
} from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { toReadableFilterLabel } from './filter-to-readable-label';

const country = createAttribute({
  name: 'Country',
  type: 'text-attribute',
  expression: '[Country.Country]',
});
const revenue = createAttribute({
  name: 'Revenue',
  type: 'numeric',
  expression: '[Commerce.Revenue]',
});
const productName = createAttribute({
  name: 'ProductName',
  type: 'text-attribute',
  expression: '[Commerce.Product]',
});
const category = createAttribute({
  name: 'Category',
  type: 'text-attribute',
  expression: '[Category.Category]',
});
const dateYears = new DimensionalLevelAttribute(
  'Years',
  '[Commerce.Date (Calendar)]',
  'Years',
  'yyyy',
);

describe('toReadableFilterLabel', () => {
  it('formats a single member with "is"', () => {
    const f = filterFactory.members(country, ['US']);
    expect(toReadableFilterLabel(f)).toBe('Country is US');
  });

  it('formats multiple members as "in […]"', () => {
    const f = filterFactory.members(category, ['Calculators', 'Camera Flashes']);
    expect(toReadableFilterLabel(f)).toBe("Category in ['Calculators', 'Camera Flashes']");
  });

  it('caps long member lists with a (+N more) tail', () => {
    const f = filterFactory.members(country, ['US', 'CA', 'MX', 'FR', 'DE', 'JP']);
    expect(toReadableFilterLabel(f)).toBe("Country in ['US', 'CA', 'MX', 'FR'] (+2 more)");
  });

  it('falls back to the bare attribute name for a members filter with no members', () => {
    const f = filterFactory.members(country, []);
    expect(toReadableFilterLabel(f)).toBe('Country');
  });

  it('uses attributeName override when provided', () => {
    const f = filterFactory.members(dateYears, ['2024']);
    expect(toReadableFilterLabel(f, 'Years in Date')).toBe('Years in Date is 2024');
  });

  it('formats an exclude-of-multiple-members filter as "not in […]"', () => {
    const inner = filterFactory.members(country, ['US', 'CA']);
    const f = filterFactory.exclude(inner);
    expect(toReadableFilterLabel(f)).toBe("Country not in ['US', 'CA']");
  });

  it('formats a members filter with excludeMembers config as "is not …"', () => {
    const f = filterFactory.members(country, ['Andorra'], { excludeMembers: true });
    expect(toReadableFilterLabel(f)).toBe('Country is not Andorra');
  });

  it('formats a text "contains" filter with a quoted value', () => {
    const f = filterFactory.contains(productName, 'phone');
    expect(toReadableFilterLabel(f)).toBe('ProductName contains "phone"');
  });

  it('formats a text "startsWith" filter', () => {
    const f = filterFactory.startsWith(productName, 'A');
    expect(toReadableFilterLabel(f)).toBe('ProductName starts with "A"');
  });

  it('formats a text "endsWith" filter', () => {
    const f = filterFactory.endsWith(productName, 'Z');
    expect(toReadableFilterLabel(f)).toBe('ProductName ends with "Z"');
  });

  it('formats a numeric greaterThan as ">"', () => {
    const f = filterFactory.greaterThan(revenue, 100);
    expect(toReadableFilterLabel(f)).toBe('Revenue > 100');
  });

  it('formats a numeric lessThanOrEqual as "≤"', () => {
    const f = filterFactory.lessThanOrEqual(revenue, 50);
    expect(toReadableFilterLabel(f)).toBe('Revenue ≤ 50');
  });

  it('formats a numeric between as "between A and B"', () => {
    const f = filterFactory.between(revenue, 100, 500);
    expect(toReadableFilterLabel(f)).toBe('Revenue between 100 and 500');
  });

  it('formats a numeric equals as "="', () => {
    const f = filterFactory.equals(revenue, 42);
    expect(toReadableFilterLabel(f)).toBe('Revenue = 42');
  });

  it('formats a dateRange filter with ISO-trimmed dates', () => {
    const f = filterFactory.dateRange(dateYears, '2024-01-01', '2024-12-31');
    expect(toReadableFilterLabel(f)).toBe('Years: 2024-01-01 → 2024-12-31');
  });

  it('formats a relativeDate filter with positive offset', () => {
    const f = {
      attribute: dateYears,
      filterType: 'relativeDate',
      operator: 'last',
      count: 7,
      offset: 2,
      isScope: false,
      config: {},
      filterJaql: () => ({}),
    } as unknown as Filter;
    expect(toReadableFilterLabel(f)).toBe('Years: last 7 (offset 2)');
  });

  it('formats a relativeDate filter with negative offset', () => {
    const f = {
      attribute: dateYears,
      filterType: 'relativeDate',
      operator: 'next',
      count: 3,
      offset: -1,
      isScope: false,
      config: {},
      filterJaql: () => ({}),
    } as unknown as Filter;
    expect(toReadableFilterLabel(f)).toBe('Years: next 3 (offset -1)');
  });

  it('uses attributeName override for relativeDate filters', () => {
    const f = {
      attribute: dateYears,
      filterType: 'relativeDate',
      operator: 'last',
      count: 7,
      offset: 0,
      isScope: false,
      config: {},
      filterJaql: () => ({}),
    } as unknown as Filter;
    expect(toReadableFilterLabel(f, 'Years in Date')).toBe('Years in Date: last 7');
  });

  it('formats a measureGreaterThan filter using the measure name as the subject', () => {
    const totalRevenue = measureFactory.sum(revenue, 'Total Revenue');
    const f = filterFactory.measureGreaterThan(totalRevenue, 1000);
    expect(toReadableFilterLabel(f)).toBe('Total Revenue > 1000');
  });

  it('formats a measureBetween filter with the "between" shape', () => {
    const totalRevenue = measureFactory.sum(revenue, 'Total Revenue');
    const f = filterFactory.measureBetween(totalRevenue, 100, 500);
    expect(toReadableFilterLabel(f)).toBe('Total Revenue between 100 and 500');
  });

  it('formats a topRanking filter as "<attribute>: top N by <measure>"', () => {
    const totalRevenue = measureFactory.sum(revenue, 'Total Revenue');
    const f = filterFactory.topRanking(country, totalRevenue, 5);
    expect(toReadableFilterLabel(f)).toBe('Country: top 5 by Total Revenue');
  });

  it('formats a bottomRanking filter with the "bottom" direction', () => {
    const totalRevenue = measureFactory.sum(revenue, 'Total Revenue');
    const f = filterFactory.bottomRanking(country, totalRevenue, 3);
    expect(toReadableFilterLabel(f)).toBe('Country: bottom 3 by Total Revenue');
  });

  it('falls back to the bare attribute name for unknown filterType values', () => {
    const fake: Filter = {
      attribute: country,
      filterType: 'wat',
      isScope: false,
      config: {} as Filter['config'],
      filterJaql: () => ({}),
    } as unknown as Filter;
    expect(toReadableFilterLabel(fake)).toBe('Country');
  });

  it('returns a non-empty string even when composition throws', () => {
    const broken = {
      attribute: country,
      filterType: 'members',
      isScope: false,
      config: {},
      filterJaql: () => ({}),
      get members() {
        throw new Error('boom');
      },
    } as unknown as Filter;
    expect(toReadableFilterLabel(broken)).toBe('Country');
  });
});
