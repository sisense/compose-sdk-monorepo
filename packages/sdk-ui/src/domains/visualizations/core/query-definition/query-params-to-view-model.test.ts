import type { TFunction } from '@sisense/sdk-common';
import { createAttribute, createMeasure, DateLevels, filterFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import type { BaseQueryParams } from '@/domains/query-execution/types';

import { baseQueryParamsToViewModel } from './query-params-to-view-model';
import { isConnectorItem, isPillItem } from './types';

describe('baseQueryParamsToViewModel', () => {
  it('returns empty array when params are empty', () => {
    const result = baseQueryParamsToViewModel({});
    expect(result).toEqual([]);
  });

  it('returns only measure pills when only measures provided', () => {
    const attr = createAttribute({
      name: 'Revenue',
      type: 'numeric',
      expression: '[Commerce.Revenue]',
    });
    const measure = createMeasure({
      name: 'Sum of Sales',
      aggregation: 'sum',
      attribute: attr,
    });
    const result = baseQueryParamsToViewModel({ measures: [measure] });
    expect(result).toHaveLength(1);
    const first = result[0];
    expect(first).toBeDefined();
    expect(isPillItem(first)).toBe(true);
    expect(first).toMatchObject({ label: 'Sum of Sales', category: 'measure' });
  });

  it('orders measures then "by" then dimensions then "where" then filters', () => {
    const dimAttr = createAttribute({
      name: 'Region',
      type: 'text-attribute',
      expression: '[Geography.Region]',
    });
    const measureAttr = createAttribute({
      name: 'Revenue',
      type: 'numeric',
      expression: '[Commerce.Revenue]',
    });
    const measure = createMeasure({
      name: 'Sum of Sales',
      aggregation: 'sum',
      attribute: measureAttr,
    });
    const filter = filterFactory.members(dimAttr, ['North']);
    const result = baseQueryParamsToViewModel({
      measures: [measure],
      dimensions: [dimAttr],
      filters: [filter],
    });
    expect(result).toHaveLength(5);
    expect(
      result.map((item) =>
        isConnectorItem(item) ? `connector:${item.label}` : `${item.category}:${item.label}`,
      ),
    ).toEqual([
      'measure:Sum of Sales',
      'connector:by',
      'dimension:Region',
      'connector:where',
      'filter:Region is North',
    ]);
  });

  it('uses attribute name for dimension and measure labels', () => {
    const attr = createAttribute({
      name: 'Product Category',
      type: 'text-attribute',
      expression: '[Category.Category]',
    });
    const measure = createMeasure({
      name: 'Avg Price',
      aggregation: 'avg',
      attribute: attr,
    });
    const result = baseQueryParamsToViewModel({
      measures: [measure],
      dimensions: [attr],
    });
    const labels = result.filter(isPillItem).map((p) => p.label);
    expect(labels).toContain('Avg Price');
    expect(labels).toContain('Product Category');
  });

  it('assigns ids to pill items', () => {
    const attr = createAttribute({
      name: 'X',
      type: 'text-attribute',
      expression: '[X]',
    });
    const result = baseQueryParamsToViewModel({ dimensions: [attr] });
    const pill = result.find(isPillItem);
    expect(pill).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/dimension/),
      }),
    );
  });

  it('does not add "where" when only filters are present', () => {
    const attr = createAttribute({
      name: 'Region',
      type: 'text-attribute',
      expression: '[Geography.Region]',
    });
    const filter = filterFactory.members(attr, ['North']);
    const result = baseQueryParamsToViewModel({ filters: [filter] });
    expect(result).toHaveLength(1);
    const only = result[0];
    expect(only).toBeDefined();
    expect(isPillItem(only)).toBe(true);
    expect(result.some((item) => isConnectorItem(item) && item.label === 'where')).toBe(false);
  });

  it('expands FilterRelations into grouped connectors and filter pills', () => {
    const attr = createAttribute({
      name: 'Region',
      type: 'text-attribute',
      expression: '[Geography.Region]',
    });
    const f1 = filterFactory.members(attr, ['North']);
    const f2 = filterFactory.members(attr, ['South']);
    const relation = filterFactory.logic.and(f1, f2);
    const result = baseQueryParamsToViewModel({
      dimensions: [attr],
      filters: relation,
    });
    const serialized = result.map((item) =>
      isConnectorItem(item) ? `connector:${item.label}` : `${item.category}:${item.label}`,
    );
    expect(serialized).toEqual([
      'dimension:Region',
      'connector:where',
      'connector:(',
      'filter:Region is North',
      'connector:AND',
      'filter:Region is South',
      'connector:)',
    ]);
  });

  it('accepts filters as a single Filter wrapped via runtime normalization', () => {
    const attr = createAttribute({
      name: 'Region',
      type: 'text-attribute',
      expression: '[Geography.Region]',
    });
    const filter = filterFactory.members(attr, ['North']);
    const params = { filters: filter } as unknown as BaseQueryParams;
    const result = baseQueryParamsToViewModel(params);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ category: 'filter', label: 'Region is North' });
  });

  it('uses attribute name for date-level dimension when t is omitted', () => {
    const dateLevel = createAttribute({
      name: 'Date',
      expression: '[Orders.Date]',
      granularity: DateLevels.Months,
    });
    const result = baseQueryParamsToViewModel({ dimensions: [dateLevel] });
    const dim = result.find(isPillItem);
    expect(dim).toMatchObject({ category: 'dimension', label: 'Date' });
  });

  it('uses generateAttributeName pattern for date-level dimension when t is provided', () => {
    const stubT = ((key: string, opts?: { columnName?: string }) => {
      if (key === 'attribute.datetimeName.months') {
        return `Months in ${opts?.columnName ?? ''}`;
      }
      return key;
    }) as TFunction;

    const dateLevel = createAttribute({
      name: 'Date',
      expression: '[Orders.Date]',
      granularity: DateLevels.Months,
    });
    const result = baseQueryParamsToViewModel({ dimensions: [dateLevel] }, stubT);
    const dim = result.find(isPillItem);
    expect(dim).toMatchObject({ category: 'dimension', label: 'Months in Date' });
  });

  it('uses generateAttributeName pattern for date-level filter attribute when t is provided', () => {
    const stubT = ((key: string, opts?: { columnName?: string }) => {
      if (key === 'attribute.datetimeName.days') {
        return `Days in ${opts?.columnName ?? ''}`;
      }
      return key;
    }) as TFunction;

    const dateLevel = createAttribute({
      name: 'Date',
      expression: '[Orders.Date]',
      granularity: DateLevels.Days,
    });
    const filter = filterFactory.members(dateLevel, ['2024-01-01']);
    const result = baseQueryParamsToViewModel({ filters: [filter] }, stubT);
    const pill = result.find(isPillItem);
    expect(pill).toMatchObject({ category: 'filter', label: 'Days in Date is 2024-01-01' });
  });
});
