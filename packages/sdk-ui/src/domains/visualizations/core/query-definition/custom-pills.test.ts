import { createAttribute, createMeasure, filterFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { appendCustomPills, customPillsToViewModel } from './custom-pills';
import type { QueryDefinitionViewModel, QueryPillItem } from './types';

const region = createAttribute({
  name: 'Region',
  type: 'text-attribute',
  expression: '[Geography.Region]',
});

describe('customPillsToViewModel', () => {
  it('returns an empty list when customPills is omitted', () => {
    expect(customPillsToViewModel(undefined)).toEqual([]);
  });

  it('collapses a Filter[] into one pinned filter pill with grouped tooltip labels', () => {
    const north = filterFactory.members(region, ['North']);
    const south = filterFactory.members(region, ['South']);
    const [pill] = customPillsToViewModel([
      {
        category: 'filter',
        value: [north, south],
        label: 'Dashboard Filters',
        color: { bg: '#fcf1cc', text: '#131F29' },
      },
    ]);
    expect(pill).toMatchObject({
      type: 'pill',
      category: 'filter',
      label: 'Dashboard Filters',
      pin: true,
      color: { bg: '#fcf1cc', text: '#131F29' },
      groupedTooltipLines: [
        { column: 'Region', value: 'North' },
        { column: 'Region', value: 'South' },
      ],
    });
  });

  it('omits an empty Filter[] group', () => {
    expect(
      customPillsToViewModel([
        {
          category: 'filter',
          value: [],
          label: 'Dashboard Filters',
        },
      ]),
    ).toEqual([]);
  });

  it('honors pin: false', () => {
    const [pill] = customPillsToViewModel([
      {
        category: 'filter',
        value: filterFactory.members(region, ['North']),
        pin: false,
      },
    ]);
    expect(pill).toMatchObject({ pin: false, label: 'Region: North' });
  });

  it('keeps a Friendly Name that contains ": " as the grouped tooltip column', () => {
    const named = createAttribute({
      name: 'A: B',
      type: 'text-attribute',
      expression: '[Geography.Region]',
    });
    const [pill] = customPillsToViewModel([
      {
        category: 'filter',
        value: [filterFactory.members(named, ['North'])],
        label: 'Dashboard Filters',
      },
    ]);
    expect(pill).toMatchObject({
      groupedTooltipLines: [{ column: 'A: b', value: 'North' }],
    });
  });

  it('keeps a FilterRelations value as one pill whose tooltip lists its filters by AND/OR', () => {
    const revenue = createAttribute({
      name: 'Revenue',
      type: 'numeric',
      expression: '[Commerce.Revenue]',
    });
    const north = filterFactory.members(region, ['North']);
    const south = filterFactory.members(region, ['South']);
    const east = filterFactory.members(region, ['East']);
    const west = filterFactory.members(region, ['West']);
    const relations = filterFactory.logic.and(
      filterFactory.logic.or(north, south),
      filterFactory.logic.or(
        filterFactory.greaterThan(revenue, 1000),
        filterFactory.logic.and(east, west),
      ),
    );
    const [pill] = customPillsToViewModel([
      {
        category: 'filter',
        value: relations,
        label: 'Custom filters',
        color: { bg: '#F48FB1', text: '#131F29' },
      },
    ]);
    expect(pill).toMatchObject({
      type: 'pill',
      category: 'filter',
      label: 'Custom filters',
      pin: true,
      color: { bg: '#F48FB1', text: '#131F29' },
      tooltipData: relations,
    });
    expect(pill).not.toHaveProperty('groupedTooltipLines');
    expect(pill).toHaveProperty('relationsTooltip', {
      operator: 'AND',
      items: [
        {
          operator: 'OR',
          items: [
            { column: 'Region', value: 'North' },
            { column: 'Region', value: 'South' },
          ],
        },
        {
          operator: 'OR',
          items: [
            { column: 'Revenue', value: '> 1000' },
            {
              operator: 'AND',
              items: [
                { column: 'Region', value: 'East' },
                { column: 'Region', value: 'West' },
              ],
            },
          ],
        },
      ],
    });
  });

  it('converts a measure pill with generated label and tooltipData', () => {
    const revenue = createMeasure({
      name: 'Total Revenue',
      aggregation: 'sum',
      attribute: createAttribute({
        name: 'Revenue',
        type: 'numeric',
        expression: '[Commerce.Revenue]',
      }),
    });
    const [pill] = customPillsToViewModel([{ category: 'measure', value: revenue }]);
    expect(pill).toMatchObject({
      type: 'pill',
      category: 'measure',
      label: 'Total revenue',
      pin: true,
      tooltipData: revenue,
    });
  });

  it('converts a dimension pill with generated label and tooltipData', () => {
    const [pill] = customPillsToViewModel([{ category: 'dimension', value: region }]);
    expect(pill).toMatchObject({
      type: 'pill',
      category: 'dimension',
      label: 'Region',
      pin: true,
      tooltipData: region,
    });
  });
});

describe('appendCustomPills', () => {
  const pill = (category: QueryPillItem['category'], label: string): QueryPillItem => ({
    type: 'pill',
    category,
    label,
  });
  const labels = (items: QueryDefinitionViewModel) => items.map((item) => item.label);
  const dashboardFilters = [pill('filter', 'Dashboard Filters')];

  it('adds no "where" to a filters-only row', () => {
    expect(labels(appendCustomPills([], dashboardFilters))).toEqual(['Dashboard Filters']);
    expect(labels(appendCustomPills([pill('filter', 'Country: USA')], dashboardFilters))).toEqual([
      'Country: USA',
      'Dashboard Filters',
    ]);
  });

  it('adds "where" before the first filter pill after measures and dimensions', () => {
    const base: QueryDefinitionViewModel = [
      pill('measure', 'Total revenue'),
      { type: 'connector', label: 'by' },
      pill('dimension', 'Category'),
    ];
    expect(labels(appendCustomPills(base, dashboardFilters))).toEqual([
      'Total revenue',
      'by',
      'Category',
      'where',
      'Dashboard Filters',
    ]);
  });

  it('keeps the query "where" when the query has filters', () => {
    const base: QueryDefinitionViewModel = [
      pill('measure', 'Total revenue'),
      { type: 'connector', label: 'where' },
      pill('filter', 'Country: USA'),
    ];
    expect(labels(appendCustomPills(base, dashboardFilters))).toEqual([
      'Total revenue',
      'where',
      'Country: USA',
      'Dashboard Filters',
    ]);
  });

  it('adds no "where" for measure or dimension custom pills', () => {
    const base: QueryDefinitionViewModel = [pill('measure', 'Total revenue')];
    expect(labels(appendCustomPills(base, [pill('dimension', 'Region')]))).toEqual([
      'Total revenue',
      'Region',
    ]);
  });
});
