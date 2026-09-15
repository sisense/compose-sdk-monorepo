import { createAttribute, createMeasure } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { formatChipLabel } from './format-chip-label';

describe('formatChipLabel', () => {
  it('uses a Friendly Name verbatim when title differs from name', () => {
    const attr = createAttribute({
      name: 'Age Range',
      title: 'Age Range DisplayName',
      type: 'text-attribute',
      expression: '[Commerce.Age Range]',
    });
    expect(formatChipLabel(attr)).toBe('Age Range DisplayName');
  });

  it.each([
    ['SALES_REVENUE_RANGE', 'Sales revenue range'],
    ['SALES REVENUE RANGE', 'Sales revenue range'],
    ['age_range', 'Age range'],
    ['totalRevenue', 'Total revenue'],
    ['Commerce.Country', 'Commerce country'],
    ['HTTPStatusCode', 'Http status code'],
  ] as const)('cleans technical name %s to %s', (input, expected) => {
    expect(formatChipLabel(input)).toBe(expected);
    expect(formatChipLabel({ name: input })).toBe(expected);
  });

  it('applies sentence case only to a system-generated name', () => {
    expect(formatChipLabel('total revenue')).toBe('Total revenue');
  });

  it('does not rewrite an already sentence-cased single word', () => {
    expect(formatChipLabel({ name: 'Country', title: 'Country' })).toBe('Country');
  });

  it('leaves internal $ names unchanged', () => {
    expect(formatChipLabel('$trend_Revenue')).toBe('$trend_Revenue');
  });

  it('formats a measure from name when title is not distinct', () => {
    const revenue = createAttribute({
      name: 'Revenue',
      type: 'numeric',
      expression: '[Commerce.Revenue]',
    });
    const measure = createMeasure({
      name: 'Sum of Sales',
      aggregation: 'sum',
      attribute: revenue,
    });
    expect(formatChipLabel(measure)).toBe('Sum of sales');
  });
});
