import type { Filter } from '@sisense/sdk-data';
import {
  createAttribute,
  DateLevels,
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
const brand = createAttribute({
  name: 'Brand',
  type: 'text-attribute',
  expression: '[Brand.Brand]',
});
const dateYears = new DimensionalLevelAttribute(
  'Years',
  '[Commerce.Date (Calendar)]',
  'Years',
  'yyyy',
);
const dateDays = new DimensionalLevelAttribute(
  'Days',
  '[Commerce.Date (Calendar)]',
  'Days',
  'yyyy-MM-dd',
);

describe('toReadableFilterLabel', () => {
  it('uses a Friendly Name on the filter attribute verbatim', () => {
    const sales = createAttribute({
      name: 'SALES_REVENUE_RANGE',
      title: 'Revenue',
      type: 'numeric',
      expression: '[Commerce.SALES_REVENUE_RANGE]',
    });
    const f = filterFactory.greaterThan(sales, 0);
    expect(toReadableFilterLabel(f)).toBe('Revenue: > 0');
  });

  it('cleans a technical attribute name when there is no Friendly Name', () => {
    const sales = createAttribute({
      name: 'SALES_REVENUE_RANGE',
      type: 'numeric',
      expression: '[Commerce.SALES_REVENUE_RANGE]',
    });
    const f = filterFactory.greaterThan(sales, 0);
    expect(toReadableFilterLabel(f)).toBe('Sales revenue range: > 0');
  });

  it('formats a single member as "Label: value"', () => {
    const f = filterFactory.members(country, ['United States']);
    expect(toReadableFilterLabel(f)).toBe('Country: United States');
  });

  it('formats multiple members as a comma-separated list', () => {
    const f = filterFactory.members(category, ['Calculators', 'Camera Flashes']);
    expect(toReadableFilterLabel(f)).toBe('Category: Calculators, Camera Flashes');
  });

  it('caps long member lists at 3 values then +N more', () => {
    const f = filterFactory.members(country, ['US', 'CA', 'MX', 'FR', 'DE', 'JP']);
    expect(toReadableFilterLabel(f)).toBe('Country: US, CA, MX +3 more');
  });

  it('returns an empty string for a members filter with no members', () => {
    const f = filterFactory.members(country, []);
    expect(toReadableFilterLabel(f)).toBe('');
  });

  it('uses attributeName override when provided', () => {
    const f = filterFactory.members(dateYears, ['2024']);
    expect(toReadableFilterLabel(f, 'Years in Date')).toBe('Years in Date: 2024');
  });

  it('formats year-level members without month, day, or timestamp', () => {
    const f = filterFactory.members(dateYears, ['2012-01-01T00:00:00']);
    expect(toReadableFilterLabel(f, 'Years in Date')).toBe('Years in Date: 2012');
  });

  it('formats month-level members without day or timestamp', () => {
    const dateMonths = new DimensionalLevelAttribute(
      'Months',
      '[Commerce.Date (Calendar)]',
      'Months',
      'yyyy-MM',
    );
    const f = filterFactory.members(dateMonths, [
      '2012-01-01T00:00:00',
      '2012-02-01T00:00:00',
      '2012-03-01T00:00:00',
    ]);
    expect(toReadableFilterLabel(f, 'Months in Date')).toBe(
      'Months in Date: 01/2012, 02/2012, 03/2012',
    );
  });

  it('formats day-level members without timestamp', () => {
    const f = filterFactory.members(dateDays, ['2012-05-05T00:00:00']);
    expect(toReadableFilterLabel(f, 'Days in Date')).toBe('Days in Date: 05/05/2012');
  });

  it('formats an exclude-of-members filter as "not v1, v2"', () => {
    const inner = filterFactory.members(country, ['US', 'CA']);
    const f = filterFactory.exclude(inner);
    expect(toReadableFilterLabel(f)).toBe('Country: not US, CA');
  });

  it('formats a members filter with excludeMembers config as "not …"', () => {
    const f = filterFactory.members(country, ['Andorra'], { excludeMembers: true });
    expect(toReadableFilterLabel(f)).toBe('Country: not Andorra');
  });

  it('formats a text "contains" filter with a quoted value', () => {
    const f = filterFactory.contains(productName, 'phone');
    expect(toReadableFilterLabel(f)).toBe('Product name: contains "phone"');
  });

  it('formats a text "startsWith" filter', () => {
    const f = filterFactory.startsWith(productName, 'A');
    expect(toReadableFilterLabel(f)).toBe('Product name: starts with "A"');
  });

  it('formats a text "endsWith" filter', () => {
    const f = filterFactory.endsWith(productName, 'Z');
    expect(toReadableFilterLabel(f)).toBe('Product name: ends with "Z"');
  });

  it('formats negative text operators with contractions', () => {
    expect(toReadableFilterLabel(filterFactory.doesntContain(category, 'Accessories'))).toBe(
      'Category: doesn\'t contain "Accessories"',
    );
    expect(toReadableFilterLabel(filterFactory.doesntStartWith(country, 'United'))).toBe(
      'Country: doesn\'t start with "United"',
    );
    expect(toReadableFilterLabel(filterFactory.doesntEndWith(brand, 'sung'))).toBe(
      'Brand: doesn\'t end with "sung"',
    );
  });

  it('formats a numeric greaterThan as ">"', () => {
    const f = filterFactory.greaterThan(revenue, 100);
    expect(toReadableFilterLabel(f)).toBe('Revenue: > 100');
  });

  it('formats a numeric lessThanOrEqual as "<="', () => {
    const f = filterFactory.lessThanOrEqual(revenue, 50);
    expect(toReadableFilterLabel(f)).toBe('Revenue: <= 50');
  });

  it('formats a numeric range with "to" as the separator', () => {
    const f = filterFactory.between(revenue, 100, 500);
    expect(toReadableFilterLabel(f)).toBe('Revenue: 100 to 500');
  });

  it('formats a numeric equals as "="', () => {
    const f = filterFactory.equals(revenue, 42);
    expect(toReadableFilterLabel(f)).toBe('Revenue: = 42');
  });

  it('formats a numeric not-equal as "!="', () => {
    const f = filterFactory.doesntEqual(revenue, 0);
    expect(toReadableFilterLabel(f)).toBe('Revenue: != 0');
  });

  it('formats a closed dateRange at years level without month or day', () => {
    const f = filterFactory.dateRange(dateYears, '2024-01-01', '2024-12-31');
    expect(toReadableFilterLabel(f)).toBe('Years: 2024 to 2024');
  });

  it('names the moving bound on an open-start date range at years level', () => {
    const f = filterFactory.dateTo(dateYears, '2011-12-31');
    expect(toReadableFilterLabel(f)).toBe('Years: earliest date to 2011');
  });

  it('names the moving bound on an open-end date range at years level', () => {
    const f = filterFactory.dateFrom(dateYears, '2013-01-01');
    expect(toReadableFilterLabel(f)).toBe('Years: 2013 to latest date');
  });

  it('formats a last-N relative date with offset', () => {
    const f = {
      attribute: dateDays,
      filterType: 'relativeDate',
      operator: 'last',
      count: 7,
      offset: 7,
      isScope: false,
      config: {},
      filterJaql: () => ({}),
    } as unknown as Filter;
    expect(toReadableFilterLabel(f)).toBe('Days: last 7 days, offset 7');
  });

  it('appends including current when last-N offset is zero and there is no anchor', () => {
    const f = {
      attribute: dateDays,
      filterType: 'relativeDate',
      operator: 'last',
      count: 6,
      offset: 0,
      isScope: false,
      config: {},
      filterJaql: () => ({}),
    } as unknown as Filter;
    expect(toReadableFilterLabel(f, 'Date')).toBe('Date: last 6 days including current');
  });

  it('names the anchor instead of claiming the current period', () => {
    const dateMonths = new DimensionalLevelAttribute(
      'Months',
      '[Commerce.Date (Calendar)]',
      DateLevels.Months,
      'yyyy-MM',
    );
    const f = filterFactory.dateRelativeTo(dateMonths, 0, 18, '2011-12');
    expect(toReadableFilterLabel(f, 'Date')).toBe('Date: last 18 months to 12/2011');
  });

  it('renders last-1 with no anchor as this year / today shortcuts', () => {
    const f = filterFactory.dateRelativeTo(dateYears, 0, 1);
    expect(toReadableFilterLabel(f)).toBe('Years: this year');
    const today = filterFactory.dateRelativeTo(dateDays, 0, 1);
    expect(toReadableFilterLabel(today, 'Date')).toBe('Date: today');
  });

  it('keeps same-day hour ranges as time of day', () => {
    const dateHours = new DimensionalLevelAttribute(
      'Hours',
      '[Commerce.Date (Calendar)]',
      DateLevels.Hours,
      'HH:mm',
    );
    const f = {
      attribute: dateHours,
      filterType: 'dateRange',
      from: '2012-05-05T13:00:00',
      to: '2012-05-05T15:00:00',
      isScope: false,
      config: {},
      filterJaql: () => ({}),
      // filterFactory.dateRange throws on Hours/Minutes (unsupportedDatetimeLevel).
    } as unknown as Filter;
    expect(toReadableFilterLabel(f, 'Hours in Date')).toBe('Hours in Date: 13:00 to 15:00');
  });

  it('keeps the calendar day on time-only values that span more than one day', () => {
    const dateHours = new DimensionalLevelAttribute(
      'Hours',
      '[Commerce.Date (Calendar)]',
      DateLevels.Hours,
      'HH:mm',
    );
    const f = {
      attribute: dateHours,
      filterType: 'dateRange',
      from: '2012-05-05T13:00:00',
      to: '2012-05-06T09:00:00',
      isScope: false,
      config: {},
      filterJaql: () => ({}),
      // filterFactory.dateRange throws on Hours/Minutes (unsupportedDatetimeLevel).
    } as unknown as Filter;
    expect(toReadableFilterLabel(f, 'Hours in Date')).toBe(
      'Hours in Date: 05/05/2012 13:00 to 05/06/2012 09:00',
    );
  });

  it('keeps the calendar day on minutes-level members from different days', () => {
    const dateMinutes = new DimensionalLevelAttribute(
      'Minutes',
      '[Commerce.Date (Calendar)]',
      DateLevels.Minutes,
      'HH:mm',
    );
    const f = {
      attribute: dateMinutes,
      filterType: 'members',
      members: ['2012-05-05T13:45:00', '2012-05-06T13:45:00'],
      isScope: false,
      config: {},
      filterJaql: () => ({}),
      // filterFactory.members throws on Hours/Minutes (unsupportedDatetimeLevel).
    } as unknown as Filter;
    expect(toReadableFilterLabel(f, 'Minutes in Date')).toBe(
      'Minutes in Date: 05/05/2012 13:45, 05/06/2012 13:45',
    );
  });

  it('keeps the calendar day on a time-only relative-date anchor', () => {
    const dateHours = new DimensionalLevelAttribute(
      'Hours',
      '[Commerce.Date (Calendar)]',
      DateLevels.Hours,
      'HH:mm',
    );
    const f = {
      attribute: dateHours,
      filterType: 'relativeDate',
      operator: 'last',
      count: 18,
      offset: 0,
      anchor: '2012-05-05T13:00:00',
      isScope: false,
      config: {},
      filterJaql: () => ({}),
      // filterFactory.dateRelativeTo throws on Hours/Minutes (unsupportedDatetimeLevel).
    } as unknown as Filter;
    expect(toReadableFilterLabel(f, 'Hours in Date')).toBe(
      'Hours in Date: last 18 hours to 05/05/2012 13:00',
    );
  });

  it('formats a next-N relative date', () => {
    const f = {
      attribute: dateYears,
      filterType: 'relativeDate',
      operator: 'next',
      count: 3,
      offset: 0,
      isScope: false,
      config: {},
      filterJaql: () => ({}),
    } as unknown as Filter;
    expect(toReadableFilterLabel(f)).toBe('Years: next 3 years');
  });

  it('formats a measureGreaterThan filter using the measure name as the subject', () => {
    const totalRevenue = measureFactory.sum(revenue, 'Total Revenue');
    const f = filterFactory.measureGreaterThan(totalRevenue, 1000);
    expect(toReadableFilterLabel(f)).toBe('Total revenue: > 1000');
  });

  it('formats a measureBetween filter with the "to" range shape', () => {
    const totalRevenue = measureFactory.sum(revenue, 'Total Revenue');
    const f = filterFactory.measureBetween(totalRevenue, 100, 500);
    expect(toReadableFilterLabel(f)).toBe('Total revenue: 100 to 500');
  });

  it('formats a topRanking filter as "Top N by <measure>"', () => {
    const totalRevenue = measureFactory.sum(revenue, 'Total Revenue');
    const f = filterFactory.topRanking(country, totalRevenue, 10);
    expect(toReadableFilterLabel(f)).toBe('Country: Top 10 by Total revenue');
  });

  it('formats a bottomRanking filter with the "Bottom" direction', () => {
    const totalRevenue = measureFactory.sum(revenue, 'Total Revenue');
    const f = filterFactory.bottomRanking(country, totalRevenue, 5);
    expect(toReadableFilterLabel(f)).toBe('Country: Bottom 5 by Total revenue');
  });

  it('formats a measureTopRanking filter as Top N without repeating the measure name', () => {
    const totalRevenue = measureFactory.sum(revenue, 'Total Revenue');
    const f = filterFactory.measureTopRanking(totalRevenue, 10);
    expect(toReadableFilterLabel(f)).toBe('Total revenue: Top 10');
  });

  it('formats a measureBottomRanking filter as Bottom N without repeating the measure name', () => {
    const totalRevenue = measureFactory.sum(revenue, 'Total Revenue');
    const f = filterFactory.measureBottomRanking(totalRevenue, 5);
    expect(toReadableFilterLabel(f)).toBe('Total revenue: Bottom 5');
  });

  it('compresses a compound text filter that shares one operator', () => {
    const f = {
      attribute: category,
      filterType: 'logicalAttribute',
      operator: 'or',
      filters: [
        filterFactory.contains(category, 'Phone'),
        filterFactory.contains(category, 'Camera'),
      ],
      isScope: false,
      config: {},
      filterJaql: () => ({}),
    } as unknown as Filter;
    expect(toReadableFilterLabel(f)).toBe('Category: contains "Phone" or "Camera"');
  });

  it('spells out both clauses when compound operators differ', () => {
    const f = {
      attribute: brand,
      filterType: 'logicalAttribute',
      operator: 'and',
      filters: [
        filterFactory.startsWith(brand, 'S'),
        filterFactory.doesntContain(brand, 'Samsung'),
      ],
      isScope: false,
      config: {},
      filterJaql: () => ({}),
    } as unknown as Filter;
    expect(toReadableFilterLabel(f)).toBe('Brand: starts with "S" and doesn\'t contain "Samsung"');
  });

  it('states that a cascading filter is dependent without describing the nest', () => {
    const f = filterFactory.cascading([
      filterFactory.members(brand, ['Sony']),
      filterFactory.members(category, ['Phones']),
    ]);
    expect(toReadableFilterLabel(f)).toBe('Category: dependent on Brand');
  });

  it('lists every parent level in a cascading filter with more than two levels', () => {
    const f = filterFactory.cascading([
      filterFactory.members(brand, ['Sony']),
      filterFactory.members(category, ['Phones']),
      filterFactory.members(productName, ['Xperia']),
    ]);
    expect(toReadableFilterLabel(f)).toBe('Product name: dependent on Brand, Category');
  });

  it('uses a generic custom-filter statement for unknown filterType values', () => {
    const fake: Filter = {
      attribute: country,
      filterType: 'wat',
      isScope: false,
      config: {} as Filter['config'],
      filterJaql: () => ({}),
    } as unknown as Filter;
    expect(toReadableFilterLabel(fake)).toBe('Country: custom filter');
  });

  it('uses a generic custom-filter statement for advanced filters', () => {
    const f = filterFactory.customFilter(country, { members: ['x'] });
    expect(toReadableFilterLabel(f)).toBe('Country: custom filter');
  });

  it('returns a custom-filter chip even when composition throws', () => {
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
    expect(toReadableFilterLabel(broken)).toBe('Country: custom filter');
  });
});
