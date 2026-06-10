import { Cell, Data, QueryResultData } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { CommonDataOptions } from '@/domains/visualizations/core/chart-data-options/types';

import { formatDataSet } from './format-data-set';

// ── test data helpers ──────────────────────────────────────────────────────────

const NOT_AVAILABLE = 'N\\A';

// Casts a synthetic/loose dataOptions literal to the strict union; tests intentionally
// exercise varied real-world shapes (single columns, raw columns, non-column props).
const asOptions = (o: Record<string, unknown>): CommonDataOptions => o as CommonDataOptions;

const UTC_DATE_CONFIG = {
  isFiscalOn: false,
  fiscalMonth: 0 as const,
  weekFirstDay: 1 as const,
  selectedDateLevel: 'days' as const,
  timeZone: 'UTC',
};

function makeQueryResult(overrides: Partial<QueryResultData> = {}): QueryResultData {
  return {
    columns: [
      { name: 'Revenue', type: 'numeric' },
      { name: 'Category', type: 'textdimension' },
      { name: 'OrderDate', type: 'datetime' },
    ],
    rows: [
      [
        { data: 1500, text: '1500' },
        { data: 'Electronics', text: 'Electronics' },
        { data: '2026-03-15T00:00:00Z', text: '2026-03-15' },
      ],
    ],
    ...overrides,
  };
}

function makeData(overrides: Partial<Data> = {}): Data {
  return {
    columns: [
      { name: 'Revenue', type: 'numeric' },
      { name: 'Category', type: 'textdimension' },
      { name: 'OrderDate', type: 'datetime' },
    ],
    rows: [[1500, 'Electronics', '2026-03-15T00:00:00Z']],
    ...overrides,
  };
}

// ── dataOptions shapes used across suites ──────────────────────────────────────

// Array-of-columns style (CartesianChartDataOptions / GenericDataOptions)
const arrayDataOptions = asOptions({
  value: [
    {
      column: { name: 'Revenue', type: 'numeric' },
      numberFormatConfig: { name: 'Numbers' as const, kilo: true, million: true },
    },
  ],
  category: [
    { column: { name: 'Category', type: 'textdimension' } },
    { column: { name: 'OrderDate', type: 'datetime' }, dateFormat: 'MM/yyyy' },
  ],
});

// Single-column style (ScatterChartDataOptions)
const singleColumnDataOptions = asOptions({
  x: {
    column: { name: 'Revenue', type: 'numeric' },
    numberFormatConfig: { name: 'Numbers' as const, kilo: true },
  },
  breakByPoint: { column: { name: 'Category', type: 'textdimension' } },
});

// Mix of columns + non-column properties (seriesToColorMap, boxType, boolean flag)
const mixedDataOptions = asOptions({
  category: [{ column: { name: 'Category', type: 'textdimension' } }],
  seriesToColorMap: { Electronics: '#ff0000', Clothing: '#00ff00' }, // NOT a column
  boxType: 'iqr', // NOT a column
  outliersEnabled: true, // NOT a column
});

// Raw sdk-data Column objects (not wrapped in Styled*)
const rawColumnDataOptions = asOptions({
  columns: [
    { name: 'Revenue', type: 'numeric' }, // raw Column, no numberFormatConfig
    { name: 'Category', type: 'textdimension' }, // raw Column
  ],
});

// ── QueryResultData: numeric formatting ────────────────────────────────────────

describe('formatDataSet (QueryResultData) — numeric', () => {
  it('applies numberFormatConfig from array-of-columns dataOptions', () => {
    const result = formatDataSet(makeQueryResult(), arrayDataOptions);
    expect(result.rows[0][0].text).toBe('1.5K');
  });

  it('applies numberFormatConfig from single-column property', () => {
    const result = formatDataSet(makeQueryResult(), singleColumnDataOptions);
    expect(result.rows[0][0].text).toBe('1.5K');
  });

  it('skips numeric column that has no numberFormatConfig', () => {
    const result = formatDataSet(makeQueryResult(), rawColumnDataOptions);
    // Revenue is numeric with no config → text stays unchanged
    expect(result.rows[0][0].text).toBe('1500');
  });
});

// ── QueryResultData: text formatting ──────────────────────────────────────────

describe('formatDataSet (QueryResultData) — text', () => {
  it('always sets text = String(data) for text-type column present in dataOptions', () => {
    const result = formatDataSet(makeQueryResult(), arrayDataOptions);
    expect(result.rows[0][1].text).toBe('Electronics');
  });

  it('formats text column from single-column property', () => {
    const result = formatDataSet(makeQueryResult(), singleColumnDataOptions);
    expect(result.rows[0][1].text).toBe('Electronics');
  });

  it('formats text column even without a dateFormat or numberFormatConfig', () => {
    const result = formatDataSet(makeQueryResult(), mixedDataOptions);
    expect(result.rows[0][1].text).toBe('Electronics');
  });

  it('formats text column present via raw Column in dataOptions', () => {
    const result = formatDataSet(makeQueryResult(), rawColumnDataOptions);
    // Category is text type → always formatted
    expect(result.rows[0][1].text).toBe('Electronics');
  });
});

// ── QueryResultData: date formatting ──────────────────────────────────────────

describe('formatDataSet (QueryResultData) — date', () => {
  it('applies dateFormat from array-of-columns dataOptions', () => {
    const result = formatDataSet(makeQueryResult(), arrayDataOptions, {
      dateConfig: UTC_DATE_CONFIG,
    });
    expect(result.rows[0][2].text).toBe('03/2026');
  });

  it('skips datetime column that has no dateFormat', () => {
    // rawColumnDataOptions has no dateFormat on OrderDate
    const result = formatDataSet(makeQueryResult(), rawColumnDataOptions);
    expect(result.rows[0][2].text).toBe('2026-03-15');
  });
});

// ── Non-column properties are ignored ─────────────────────────────────────────

describe('formatDataSet — non-column dataOptions properties are skipped', () => {
  it('ignores seriesToColorMap (object without column/type/aggregation/formula)', () => {
    const result = formatDataSet(makeQueryResult(), mixedDataOptions);
    // Only Category (text) should be formatted; Revenue and OrderDate are absent from dataOptions
    expect(result.rows[0][0].text).toBe('1500'); // Revenue untouched
    expect(result.rows[0][2].text).toBe('2026-03-15'); // OrderDate untouched
  });

  it('ignores string property (boxType)', () => {
    expect(() => formatDataSet(makeQueryResult(), asOptions({ boxType: 'iqr' }))).not.toThrow();
  });

  it('ignores boolean property (outliersEnabled)', () => {
    expect(() =>
      formatDataSet(makeQueryResult(), asOptions({ outliersEnabled: true })),
    ).not.toThrow();
  });

  it('ignores null value in dataOptions', () => {
    expect(() => formatDataSet(makeQueryResult(), asOptions({ x: null }))).not.toThrow();
  });

  it('ignores numeric value in dataOptions', () => {
    expect(() => formatDataSet(makeQueryResult(), asOptions({ count: 42 }))).not.toThrow();
  });

  it('returns original reference when only non-column properties exist', () => {
    const data = makeQueryResult();
    const result = formatDataSet(data, asOptions({ seriesToColorMap: { A: '#f00' } }));
    expect(result).toBe(data);
  });
});

// ── Correctness & safety ───────────────────────────────────────────────────────

describe('formatDataSet — correctness & safety', () => {
  it('does not mutate the original QueryResultData', () => {
    const original = makeQueryResult();
    const originalText = original.rows[0][0].text;
    formatDataSet(original, arrayDataOptions);
    expect(original.rows[0][0].text).toBe(originalText);
  });

  it('preserves data field when formatting', () => {
    const result = formatDataSet(makeQueryResult(), arrayDataOptions);
    expect(result.rows[0][0].data).toBe(1500);
  });

  it('leaves N/A cells unchanged', () => {
    const data = makeQueryResult({
      columns: [{ name: 'Revenue', type: 'numeric' }],
      rows: [[{ data: NOT_AVAILABLE, text: NOT_AVAILABLE }]],
    });
    const result = formatDataSet(
      data,
      asOptions({
        value: [
          {
            column: { name: 'Revenue', type: 'numeric' },
            numberFormatConfig: { name: 'Numbers' as const },
          },
        ],
      }),
    );
    expect(result.rows[0][0].text).toBe(NOT_AVAILABLE);
  });

  it('skips NaN numeric values', () => {
    const data = makeQueryResult({
      columns: [{ name: 'Revenue', type: 'numeric' }],
      rows: [[{ data: NaN, text: 'NaN' }]],
    });
    const result = formatDataSet(
      data,
      asOptions({
        value: [
          {
            column: { name: 'Revenue', type: 'numeric' },
            numberFormatConfig: { name: 'Numbers' as const },
          },
        ],
      }),
    );
    expect(result.rows[0][0].text).toBe('NaN');
  });

  it('silently skips a dataOptions column absent from data.columns', () => {
    const data = makeQueryResult();
    expect(() =>
      formatDataSet(data, asOptions({ value: [{ column: { name: 'Ghost', type: 'numeric' } }] })),
    ).not.toThrow();
  });

  it('returns original reference when nothing to format (empty dataOptions)', () => {
    const data = makeQueryResult();
    expect(formatDataSet(data, asOptions({}))).toBe(data);
  });
});

// ── Data (primitive cells) ─────────────────────────────────────────────────────

describe('formatDataSet (Data with primitive cells)', () => {
  it('promotes numeric primitive to Cell when numberFormatConfig present', () => {
    const result = formatDataSet(makeData(), arrayDataOptions);
    const cell = result.rows[0][0] as Cell;
    expect(cell.text).toBe('1.5K');
    expect(cell.data).toBe(1500);
  });

  it('promotes text primitive to Cell for text-type column', () => {
    const result = formatDataSet(makeData(), arrayDataOptions);
    const cell = result.rows[0][1] as Cell;
    expect(cell.text).toBe('Electronics');
    expect(cell.data).toBe('Electronics');
  });

  it('promotes date-string primitive to Cell when dateFormat present', () => {
    const result = formatDataSet(makeData(), arrayDataOptions, {
      dateConfig: UTC_DATE_CONFIG,
    });
    const cell = result.rows[0][2] as Cell;
    expect(cell.text).toBe('03/2026');
    expect(cell.data).toBe('2026-03-15T00:00:00Z');
  });

  it('preserves primitives on columns without formatting', () => {
    // singleColumnDataOptions only covers Revenue and Category — OrderDate is absent
    const result = formatDataSet(makeData(), singleColumnDataOptions);
    expect(result.rows[0][2]).toBe('2026-03-15T00:00:00Z');
  });

  it('does not mutate original Data rows', () => {
    const original = makeData();
    const originalRow = original.rows[0];
    formatDataSet(original, arrayDataOptions);
    expect(original.rows[0]).toBe(originalRow);
    expect(original.rows[0][0]).toBe(1500);
  });
});
