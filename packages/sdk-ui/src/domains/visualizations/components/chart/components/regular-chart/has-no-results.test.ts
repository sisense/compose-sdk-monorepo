import { describe, expect, it } from 'vitest';

import { ChartData } from '@/domains/visualizations/core/chart-data/types';

import { hasNoResults } from './has-no-results.js';

const cartesianWithSeries = {
  type: 'cartesian',
  xAxisCount: 1,
  xValues: [{ key: 'a', xValues: ['A'] }],
  series: [{ name: 's', data: [{ value: 1 }] }],
} as unknown as ChartData;

const cartesianEmptySeries = {
  type: 'cartesian',
  xAxisCount: 1,
  xValues: [],
  series: [],
} as unknown as ChartData;

const sankeyWithLinks = {
  type: 'sankey',
  nodes: [{ id: 'a' }, { id: 'b' }],
  links: [{ source: 'a', target: 'b', value: 1 }],
} as unknown as ChartData;

const sankeyEmptyLinks = {
  type: 'sankey',
  nodes: [],
  links: [],
} as unknown as ChartData;

describe('hasNoResults', () => {
  it('detects empty cartesian series', () => {
    expect(hasNoResults('column', cartesianEmptySeries)).toBe(true);
    expect(hasNoResults('column', cartesianWithSeries)).toBe(false);
  });

  it('detects empty sankey links (no-results overlay)', () => {
    expect(hasNoResults('sankey', sankeyEmptyLinks)).toBe(true);
    expect(hasNoResults('sankey', sankeyWithLinks)).toBe(false);
  });
});
