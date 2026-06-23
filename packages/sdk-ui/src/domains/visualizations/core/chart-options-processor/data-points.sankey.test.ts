import { describe, expect, it } from 'vitest';

import { SisenseChartDataPoint } from '@/domains/visualizations/components/chart/components/sisense-chart/types';
import { SankeyChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { DataPoint, HighchartsPoint } from '@/types';

import { getDataPoint } from './data-points.js';

/**
 * `getDataPoint` is typed as {@link SisenseChartDataPoint}; Sankey returns the cartesian-style
 * {@link DataPoint}. Narrow using entry shape so tests can assert on category fields.
 */
function assertSankeyClickDataPoint(dp: SisenseChartDataPoint): asserts dp is DataPoint {
  if (!dp.entries || !('category' in dp.entries) || !Array.isArray(dp.entries.category)) {
    throw new Error('Expected DataPoint with category entries from Sankey getDataPoint');
  }
  if ('outliers' in dp.entries) {
    throw new Error('Expected DataPoint, not boxplot-style data point');
  }
}

const sankeyChartOptions = {
  chart: { type: 'sankey' as const },
} as HighchartsPoint['series']['chart']['options'];

function sankeyPoint(partial: Record<string, unknown> = {}): HighchartsPoint {
  return {
    category: '',
    options: { name: '', custom: {} },
    custom: { rawValue: 0 },
    series: {
      initialType: 'sankey',
      type: 'sankey',
      options: { custom: {} },
      index: 0,
      chart: { options: sankeyChartOptions },
      name: 'sankey',
    },
    x: 0,
    y: 0,
    z: 0,
    index: 0,
    ...partial,
  } as HighchartsPoint;
}

const dataOptions: SankeyChartDataOptionsInternal = {
  category: [
    { column: { name: 'dim0', type: 'text', title: 'Stage 0' } },
    { column: { name: 'dim1', type: 'text', title: 'Stage 1' } },
    { column: { name: 'dim2', type: 'text', title: 'Stage 2' } },
  ],
  value: { column: { name: 'val', type: 'numeric', title: 'Value' } },
} as unknown as SankeyChartDataOptionsInternal;

describe('getDataPoint (sankey)', () => {
  it('maps a node click to the category column for its stage', () => {
    const point = sankeyPoint({
      isNode: true,
      id: 'node-1',
      column: 2,
      sum: 99,
    });

    const dp = getDataPoint(point, dataOptions as never);
    assertSankeyClickDataPoint(dp);

    expect(dp.categoryValue).toBe('node-1');
    expect(dp.value).toBe(99);
    expect(dp.entries?.category).toHaveLength(1);
    expect(dp.entries?.category[0].dataOption).toEqual(
      expect.objectContaining({ column: expect.objectContaining({ name: 'dim2' }) }),
    );
  });

  it('defaults node stage index to first category when column is missing', () => {
    const point = sankeyPoint({
      isNode: true,
      name: 'OnlyName',
      sum: 1,
    });

    const dp = getDataPoint(point, dataOptions as never);
    assertSankeyClickDataPoint(dp);

    expect(dp.categoryValue).toBe('OnlyName');
    expect(dp.entries?.category[0].dataOption).toEqual(
      expect.objectContaining({ column: expect.objectContaining({ name: 'dim0' }) }),
    );
  });

  it('maps a link click to from/to category entries', () => {
    const point = sankeyPoint({
      isNode: false,
      weight: 12,
      fromNode: { name: 'From', column: 0 },
      toNode: { name: 'To', column: 1 },
    });

    const dp = getDataPoint(point, dataOptions as never);
    assertSankeyClickDataPoint(dp);

    expect(dp.categoryValue).toBe('From');
    expect(dp.categoryDisplayValue).toBe('From → To');
    expect(dp.value).toBe(12);
    expect(dp.entries?.category).toHaveLength(2);
    expect(dp.entries?.category[0].value).toBe('From');
    expect(dp.entries?.category[1].value).toBe('To');
  });

  it('uses node ids when names are missing on link endpoints', () => {
    const point = sankeyPoint({
      weight: 3,
      fromNode: { id: 'id-a', column: 0 },
      toNode: { id: 'id-b', column: 1 },
    });

    const dp = getDataPoint(point, dataOptions as never);
    assertSankeyClickDataPoint(dp);

    expect(dp.categoryDisplayValue).toBe('id-a → id-b');
  });
});
