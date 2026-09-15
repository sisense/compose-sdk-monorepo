import { describe, expect, it } from 'vitest';

import { toReadableFilterLabel } from '@/domains/visualizations/core/query-definition/filter-to-readable-label';
import { translateChartFromJSON } from '@/modules/analytics-composer/index-node.js';

import { SAMPLE_ECOMMERCE_DATA_SOURCE, SAMPLE_ECOMMERCE_TABLES } from './data-schemas.js';
import { FILTER_CHIP_CHART_CASES } from './example-filter-chip-charts.js';

const CONTEXT = {
  dataSource: SAMPLE_ECOMMERCE_DATA_SOURCE,
  tables: SAMPLE_ECOMMERCE_TABLES,
};

describe('FILTER_CHIP_CHART_CASES', () => {
  it.each(Object.keys(FILTER_CHIP_CHART_CASES))('translates %s', (name) => {
    const chart = FILTER_CHIP_CHART_CASES[name];
    expect(chart).toBeDefined();
    const result = translateChartFromJSON({
      data: chart,
      context: CONTEXT,
    });
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    const filters = result.data.filters;
    expect(Array.isArray(filters)).toBe(true);
    if (!Array.isArray(filters)) {
      return;
    }
    expect(filters.length).toBeGreaterThan(0);
    const chips = filters.map((filter) => toReadableFilterLabel(filter));
    expect(chips.some((chip) => chip.length > 0)).toBe(true);
  });
});
