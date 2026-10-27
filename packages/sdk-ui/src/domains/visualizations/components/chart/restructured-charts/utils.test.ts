import { describe, expect, expectTypeOf, it } from 'vitest';

import type { ChartType } from '@/types';

import { chartBuildersMap } from './chart-builder-factory.js';
import { RESTRUCTURED_CHART_TYPES } from './restructured-chart-types.js';
import type { SupportedChartType } from './types.js';
import { isRestructuredChartType } from './utils.js';

const isBuilderChartType = (key: string): key is keyof typeof chartBuildersMap =>
  key in chartBuildersMap;
const builderChartTypes = Object.keys(chartBuildersMap).filter(isBuilderChartType);

describe('RESTRUCTURED_CHART_TYPES', () => {
  it('should contain exactly the keys of chartBuildersMap without duplicates', () => {
    // Type-level: checked by `yarn type-check`
    expectTypeOf<(typeof RESTRUCTURED_CHART_TYPES)[number]>().toEqualTypeOf<
      keyof typeof chartBuildersMap
    >();
    expectTypeOf<(typeof RESTRUCTURED_CHART_TYPES)[number]>().toEqualTypeOf<SupportedChartType>();

    expect([...RESTRUCTURED_CHART_TYPES].sort()).toEqual([...builderChartTypes].sort());
    expect(new Set(RESTRUCTURED_CHART_TYPES).size).toBe(RESTRUCTURED_CHART_TYPES.length);
  });
});

describe('isRestructuredChartType', () => {
  it.each(builderChartTypes)('should return true for builder chart type "%s"', (chartType) => {
    expect(isRestructuredChartType(chartType)).toBe(true);
  });

  it.each<ChartType>(['scatter', 'indicator', 'boxplot', 'scattermap', 'arearange', 'table'])(
    'should return false for non-restructured chart type "%s"',
    (chartType) => {
      expect(isRestructuredChartType(chartType)).toBe(false);
    },
  );
});
