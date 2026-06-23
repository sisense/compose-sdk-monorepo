import { describe, expect, it } from 'vitest';

import { SankeyChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { DataTable } from '@/domains/visualizations/core/chart-data-processor/table-processor';

import { dataTranslators, SANKEY_LINKS_LIMIT } from './index';

const { getChartData } = dataTranslators;

/** Builds a minimal DataTable from column names and rows. */
function makeTable(
  columns: string[],
  rows: { displayValue: string; rawValue?: string | number }[][],
): DataTable {
  return {
    columns: columns.map((name, index) => ({ name, type: 'text', index, direction: 0 })),
    rows,
  };
}

const baseOptions = {
  category: [
    { column: { name: 'Source', type: 'text' } },
    { column: { name: 'Target', type: 'text' } },
  ],
  value: { column: { name: 'Value', type: 'numeric' } },
} as unknown as SankeyChartDataOptionsInternal;

describe('getSankeyChartData', () => {
  it('produces links between adjacent category pairs', () => {
    const table = makeTable(
      ['Source', 'Target', 'Value'],
      [
        [{ displayValue: 'A' }, { displayValue: 'X' }, { displayValue: '10', rawValue: 10 }],
        [{ displayValue: 'B' }, { displayValue: 'X' }, { displayValue: '5', rawValue: 5 }],
        [{ displayValue: 'A' }, { displayValue: 'Y' }, { displayValue: '3', rawValue: 3 }],
      ],
    );

    const result = getChartData(baseOptions, table);

    expect(result.type).toBe('sankey');
    expect(result.links).toEqual(
      expect.arrayContaining([
        { from: '0__A', to: '1__X', weight: 10 },
        { from: '0__B', to: '1__X', weight: 5 },
        { from: '0__A', to: '1__Y', weight: 3 },
      ]),
    );
  });

  it('aggregates duplicate (from, to) pairs', () => {
    const table = makeTable(
      ['Source', 'Target', 'Value'],
      [
        [{ displayValue: 'A' }, { displayValue: 'X' }, { displayValue: '4', rawValue: 4 }],
        [{ displayValue: 'A' }, { displayValue: 'X' }, { displayValue: '6', rawValue: 6 }],
      ],
    );

    const result = getChartData(baseOptions, table);

    expect(result.links).toEqual([{ from: '0__A', to: '1__X', weight: 10 }]);
  });

  it('collects unique nodes from links and sets display name separately from id', () => {
    const table = makeTable(
      ['Source', 'Target', 'Value'],
      [
        [{ displayValue: 'A' }, { displayValue: 'X' }, { displayValue: '1', rawValue: 1 }],
        [{ displayValue: 'B' }, { displayValue: 'X' }, { displayValue: '2', rawValue: 2 }],
      ],
    );

    const result = getChartData(baseOptions, table);
    const nodeIds = result.nodes.map((n) => n.id);
    const nodeNames = result.nodes.map((n) => n.name);

    // IDs are column-prefixed to avoid cross-stage collisions
    expect(nodeIds).toContain('0__A');
    expect(nodeIds).toContain('0__B');
    expect(nodeIds).toContain('1__X');
    // Display names are clean
    expect(nodeNames).toContain('A');
    expect(nodeNames).toContain('B');
    expect(nodeNames).toContain('X');
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
  });

  it('keeps nodes with the same display value in different stages separate', () => {
    const table = makeTable(
      ['Source', 'Target', 'Value'],
      [
        [
          { displayValue: 'Unspecified' },
          { displayValue: 'Unspecified' },
          { displayValue: '5', rawValue: 5 },
        ],
      ],
    );

    const result = getChartData(baseOptions, table);

    // Two distinct node IDs — one per column — so they render as separate Sankey nodes
    expect(result.nodes.map((n) => n.id)).toContain('0__Unspecified');
    expect(result.nodes.map((n) => n.id)).toContain('1__Unspecified');
    expect(result.nodes).toHaveLength(2);
    expect(result.links).toEqual([{ from: '0__Unspecified', to: '1__Unspecified', weight: 5 }]);
  });

  it('applies seriesToColorMap colors to nodes by display name', () => {
    const table = makeTable(
      ['Source', 'Target', 'Value'],
      [[{ displayValue: 'A' }, { displayValue: 'X' }, { displayValue: '1', rawValue: 1 }]],
    );
    const opts = {
      ...baseOptions,
      seriesToColorMap: { A: '#ff0000', X: '#00ff00' },
    } as unknown as SankeyChartDataOptionsInternal;

    const result = getChartData(opts, table);

    // Color map is keyed by display name, not the prefixed ID
    expect(result.nodes.find((n) => n.name === 'A')?.color).toBe('#ff0000');
    expect(result.nodes.find((n) => n.name === 'X')?.color).toBe('#00ff00');
  });

  it('applies MultiColumnValueToColorMap colors using the node stage column', () => {
    const table = makeTable(
      ['Source', 'Target', 'Value'],
      [[{ displayValue: 'A' }, { displayValue: 'X' }, { displayValue: '1', rawValue: 1 }]],
    );
    const opts = {
      ...baseOptions,
      seriesToColorMap: {
        Source: { A: '#ff0000' },
        Target: { X: '#00ff00' },
      },
    } as unknown as SankeyChartDataOptionsInternal;

    const result = getChartData(opts, table);

    expect(result.nodes.find((n) => n.id === '0__A')?.color).toBe('#ff0000');
    expect(result.nodes.find((n) => n.id === '1__X')?.color).toBe('#00ff00');
  });

  it('generates links for each adjacent category pair in multi-stage flows', () => {
    const threeStageOptions = {
      category: [
        { column: { name: 'A', type: 'text' } },
        { column: { name: 'B', type: 'text' } },
        { column: { name: 'C', type: 'text' } },
      ],
      value: { column: { name: 'Value', type: 'numeric' } },
    } as unknown as SankeyChartDataOptionsInternal;

    const table = makeTable(
      ['A', 'B', 'C', 'Value'],
      [
        [
          { displayValue: 'X' },
          { displayValue: 'M' },
          { displayValue: 'Z' },
          { displayValue: '5', rawValue: 5 },
        ],
      ],
    );

    const result = getChartData(threeStageOptions, table);

    expect(result.links).toEqual(
      expect.arrayContaining([
        { from: '0__X', to: '1__M', weight: 5 },
        { from: '1__M', to: '2__Z', weight: 5 },
      ]),
    );
  });

  it('keeps same label distinct across stages', () => {
    const threeStageOptions = {
      category: [
        { column: { name: 'A', type: 'text' } },
        { column: { name: 'B', type: 'text' } },
        { column: { name: 'C', type: 'text' } },
      ],
      value: { column: { name: 'Value', type: 'numeric' } },
    } as unknown as SankeyChartDataOptionsInternal;

    const table = makeTable(
      ['A', 'B', 'C', 'Value'],
      [
        [
          { displayValue: 'X' },
          { displayValue: 'Unknown' },
          { displayValue: 'X' },
          { displayValue: '3', rawValue: 3 },
        ],
      ],
    );

    const result = getChartData(threeStageOptions, table);
    expect(result.links).toEqual(
      expect.arrayContaining([
        { from: '0__X', to: '1__Unknown', weight: 3 },
        { from: '1__Unknown', to: '2__X', weight: 3 },
      ]),
    );
    // Stage-0 "X" and stage-2 "X" are distinct nodes
    expect(result.nodes.map((n) => n.id)).toContain('0__X');
    expect(result.nodes.map((n) => n.id)).toContain('2__X');
  });

  it('does not set blur on nodes when no highlight is active', () => {
    const table = makeTable(
      ['Source', 'Target', 'Value'],
      [[{ displayValue: 'A' }, { displayValue: 'X' }, { displayValue: '1', rawValue: 1 }]],
    );

    const result = getChartData(baseOptions, table);

    result.nodes.forEach((n) => expect(n.blur).toBeUndefined());
  });

  it('sets blur on nodes when highlight is active', () => {
    const table = makeTable(
      ['Source', 'Target', 'Value'],
      [
        [
          { displayValue: 'A', blur: false } as never,
          { displayValue: 'X', blur: true } as never,
          { displayValue: '1', rawValue: 1 },
        ],
      ],
    );

    const result = getChartData(baseOptions, table);

    expect(result.nodes.find((n) => n.name === 'A')?.blur).toBe(false);
    expect(result.nodes.find((n) => n.name === 'X')?.blur).toBe(true);
  });

  it('blur=false (highlighted) takes priority over blur=true when a node appears in multiple rows', () => {
    const table = makeTable(
      ['Source', 'Target', 'Value'],
      [
        [
          { displayValue: 'A', blur: true } as never,
          { displayValue: 'X', blur: true } as never,
          { displayValue: '2', rawValue: 2 },
        ],
        [
          { displayValue: 'A', blur: false } as never,
          { displayValue: 'Y', blur: true } as never,
          { displayValue: '3', rawValue: 3 },
        ],
      ],
    );

    const result = getChartData(baseOptions, table);

    // A appears in both rows; the second row says blur=false (highlighted) which overrides blur=true
    expect(result.nodes.find((n) => n.name === 'A')?.blur).toBe(false);
  });

  it('returns empty links and nodes when rows are empty', () => {
    const table = makeTable(['Source', 'Target', 'Value'], []);
    const result = getChartData(baseOptions, table);
    expect(result.links).toEqual([]);
    expect(result.nodes).toEqual([]);
  });

  it('skips rows with missing from or to display values', () => {
    const table = makeTable(
      ['Source', 'Target', 'Value'],
      [
        [{ displayValue: '' }, { displayValue: 'X' }, { displayValue: '1', rawValue: 1 }],
        [{ displayValue: 'A' }, { displayValue: '' }, { displayValue: '2', rawValue: 2 }],
        [{ displayValue: 'B' }, { displayValue: 'Y' }, { displayValue: '3', rawValue: 3 }],
      ],
    );

    const result = getChartData(baseOptions, table);

    expect(result.links).toEqual([{ from: '0__B', to: '1__Y', weight: 3 }]);
  });

  it('returns no links when the measure column is absent from the data table', () => {
    const table = makeTable(['Source', 'Target'], [[{ displayValue: 'A' }, { displayValue: 'X' }]]);
    const result = getChartData(baseOptions, table);
    expect(result.links).toEqual([]);
    expect(result.nodes).toEqual([]);
  });

  it('does not set totalLinksBeforeTruncation when links are within the limit', () => {
    const table = makeTable(
      ['Source', 'Target', 'Value'],
      [
        [{ displayValue: 'A' }, { displayValue: 'X' }, { displayValue: '1', rawValue: 1 }],
        [{ displayValue: 'B' }, { displayValue: 'Y' }, { displayValue: '2', rawValue: 2 }],
      ],
    );
    const result = getChartData(baseOptions, table);
    expect(result.totalLinksBeforeTruncation).toBeUndefined();
    expect(result.links).toHaveLength(2);
  });

  it('truncates links to SANKEY_LINKS_LIMIT and records totalLinksBeforeTruncation', () => {
    // Generate SANKEY_LINKS_LIMIT + 5 unique links
    const count = SANKEY_LINKS_LIMIT + 5;
    const rows = Array.from({ length: count }, (_, i) => [
      { displayValue: `src${i}` },
      { displayValue: `tgt${i}` },
      { displayValue: '1', rawValue: 1 },
    ]);
    const table = makeTable(['Source', 'Target', 'Value'], rows);

    const result = getChartData(baseOptions, table);

    expect(result.links).toHaveLength(SANKEY_LINKS_LIMIT);
    expect(result.totalLinksBeforeTruncation).toBe(count);
  });
});
