import { describe, expect, it } from 'vitest';

import {
  applyChartTableOverride,
  hasFlattenedTableColumns,
  supportsChartToTableToggle,
  toTableDataOptions,
} from './chart-to-table-toggle';

describe('supportsChartToTableToggle', () => {
  it.each(['bar', 'line', 'column', 'pie', 'scatter', 'sankey', 'areamap', 'scattermap'] as const)(
    'returns true for %s',
    (chartType) => {
      expect(supportsChartToTableToggle(chartType)).toBe(true);
    },
  );

  it.each(['indicator', 'table', 'kpi', 'image'] as const)('returns false for %s', (chartType) => {
    expect(supportsChartToTableToggle(chartType)).toBe(false);
  });

  it('returns true for unknown chart types', () => {
    expect(supportsChartToTableToggle('custom-xyz')).toBe(true);
  });

  it('returns false for empty or missing chart type', () => {
    expect(supportsChartToTableToggle(undefined)).toBe(false);
    expect(supportsChartToTableToggle('')).toBe(false);
  });
});

describe('toTableDataOptions', () => {
  const categoryCol = { name: 'Category', type: 'text' };
  const valueCol = { name: 'Revenue', type: 'numeric' };

  it('returns empty columns for undefined dataOptions', () => {
    expect(toTableDataOptions(undefined)).toEqual({ columns: [] });
  });

  it('flattens cartesian axes into columns', () => {
    const result = toTableDataOptions({
      category: [{ column: categoryCol }],
      value: [{ column: valueCol }],
      breakBy: [],
    });

    expect(result.columns).toHaveLength(2);
    expect(result.columns[0]).toEqual({ column: categoryCol });
    expect(result.columns[1]).toEqual({ column: valueCol });
  });

  it('dedupes by column object reference', () => {
    const result = toTableDataOptions({
      category: [{ column: categoryCol }],
      value: [{ column: categoryCol }, { column: valueCol }],
    });

    expect(result.columns).toHaveLength(2);
  });

  it('skips primitives and non-column values', () => {
    const result = toTableDataOptions({
      category: [{ column: categoryCol }],
      value: ['x', 1, null, { column: valueCol }],
      meta: 'ignore-me',
    });

    expect(result.columns).toEqual([{ column: categoryCol }, { column: valueCol }]);
  });

  it('caches the result per dataOptions object', () => {
    const dataOptions = {
      category: [{ column: categoryCol }],
      value: [{ column: valueCol }],
      breakBy: [],
    };

    const first = toTableDataOptions(dataOptions);
    const second = toTableDataOptions(dataOptions);
    expect(second).toBe(first);
  });

  it('flattens an areamap-shaped dataOptions into geo + color columns', () => {
    const geoColumn = { column: { name: 'Country' } };
    const colorColumn = { column: { name: 'Revenue' } };
    const result = toTableDataOptions({
      geo: [geoColumn],
      color: [colorColumn],
    });
    expect(result.columns).toEqual([geoColumn, colorColumn]);
  });

  it('flattens a scattermap-shaped dataOptions into geo + colorBy + details columns', () => {
    const geoColumn = { column: { name: 'Country' } };
    const colorByColumn = { column: { name: 'Revenue' } };
    const detailsColumn = { column: { name: 'Category' } };
    const result = toTableDataOptions({
      geo: [geoColumn],
      colorBy: colorByColumn,
      details: detailsColumn,
    });
    expect(result.columns).toEqual([geoColumn, colorByColumn, detailsColumn]);
  });
});

describe('hasFlattenedTableColumns', () => {
  it('returns false for empty or missing dataOptions', () => {
    expect(hasFlattenedTableColumns(undefined)).toBe(false);
    expect(hasFlattenedTableColumns({ category: [], value: [] })).toBe(false);
  });

  it('returns true when axes flatten to columns', () => {
    expect(
      hasFlattenedTableColumns({
        category: [{ column: { name: 'Category' } }],
        value: [{ column: { name: 'Sales' } }],
      }),
    ).toBe(true);
  });
});

describe('applyChartTableOverride', () => {
  it('returns the same reference when table view is off', () => {
    const props = {
      chartType: 'bar',
      dataOptions: { category: [], value: [] },
    };
    expect(applyChartTableOverride(props, false)).toBe(props);
  });

  it('overrides chartType and dataOptions when table view is on', () => {
    const categoryCol = { name: 'Category' };
    const props = {
      chartType: 'bar',
      dataOptions: {
        category: [{ column: categoryCol }],
        value: [{ column: { name: 'Sales' } }],
      },
      title: 'Revenue',
    };

    const result = applyChartTableOverride(props, true);
    expect(result.chartType).toBe('table');
    expect(result.title).toBe('Revenue');
    expect(result.dataOptions).toEqual({
      columns: [{ column: categoryCol }, { column: { name: 'Sales' } }],
    });
  });
});
