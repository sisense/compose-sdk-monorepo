import { describe, expect, it } from 'vitest';

import { ChartData } from '@/domains/visualizations/core/chart-data/types';

import { isSankeyChartData, SankeyChartData } from './types.js';

describe('Sankey chart types', () => {
  it('isSankeyChartData narrows when type is sankey', () => {
    const data: ChartData = {
      type: 'sankey',
      links: [],
      nodes: [],
    };
    expect(isSankeyChartData(data)).toBe(true);
    if (!isSankeyChartData(data)) {
      return;
    }
    const typed: SankeyChartData = data;
    expect(typed.links).toEqual([]);
  });

  it('isSankeyChartData is false for other chart data', () => {
    const data: ChartData = {
      type: 'cartesian',
      xAxisCount: 1,
      xValues: [],
      series: [],
    };
    expect(isSankeyChartData(data)).toBe(false);
  });
});
