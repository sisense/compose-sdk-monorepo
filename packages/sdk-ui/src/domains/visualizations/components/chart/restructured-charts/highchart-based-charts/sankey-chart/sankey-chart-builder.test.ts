import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { SankeyChartDataOptions } from '@/domains/visualizations/core/chart-data-options/types';

import { sankeyChartBuilder } from './sankey-chart-builder.js';

const revenue = measureFactory.sum(DM.Commerce.Revenue);
const validDataOptions: SankeyChartDataOptions = {
  category: [DM.Commerce.Gender, DM.Commerce.Condition],
  value: revenue,
};

describe('sankeyChartBuilder', () => {
  describe('dataOptions wiring', () => {
    it('recognizes valid SankeyChartDataOptions', () => {
      expect(sankeyChartBuilder.dataOptions.isCorrectDataOptions(validDataOptions as never)).toBe(
        true,
      );
    });

    it('rejects Cartesian data options that include breakBy', () => {
      expect(
        sankeyChartBuilder.dataOptions.isCorrectDataOptions({
          ...validDataOptions,
          breakBy: [],
        } as never),
      ).toBe(false);
    });

    it('rejects options with fewer than two category columns', () => {
      expect(
        sankeyChartBuilder.dataOptions.isCorrectDataOptions({
          category: [DM.Commerce.Gender],
          value: revenue,
        } as never),
      ).toBe(false);
    });

    it('translates to internal and isCorrectDataOptionsInternal confirms the shape', () => {
      const internal =
        sankeyChartBuilder.dataOptions.translateDataOptionsToInternal(validDataOptions);
      expect(sankeyChartBuilder.dataOptions.isCorrectDataOptionsInternal(internal as never)).toBe(
        true,
      );
    });

    it('getAttributes returns one attribute per category column', () => {
      const internal =
        sankeyChartBuilder.dataOptions.translateDataOptionsToInternal(validDataOptions);
      expect(sankeyChartBuilder.dataOptions.getAttributes(internal)).toHaveLength(2);
    });

    it('getMeasures returns exactly one measure', () => {
      const internal =
        sankeyChartBuilder.dataOptions.translateDataOptionsToInternal(validDataOptions);
      expect(sankeyChartBuilder.dataOptions.getMeasures(internal)).toHaveLength(1);
    });
  });

  describe('designOptions wiring', () => {
    it('getDefaultStyleOptions returns a horizontal Sankey with expected field types', () => {
      const defaults = sankeyChartBuilder.designOptions.getDefaultStyleOptions?.();
      expect(defaults?.orientation).toBe('horizontal');
      expect(typeof defaults?.curveFactor).toBe('number');
      expect(typeof defaults?.linkOpacity).toBe('number');
      expect(typeof defaults?.nodeWidth).toBe('number');
      expect(typeof defaults?.nodePadding).toBe('number');
    });

    it('isCorrectStyleOptions accepts a plain object', () => {
      expect(sankeyChartBuilder.designOptions.isCorrectStyleOptions({})).toBe(true);
    });

    it('isCorrectStyleOptions rejects null and arrays', () => {
      expect(sankeyChartBuilder.designOptions.isCorrectStyleOptions(null as never)).toBe(false);
      expect(sankeyChartBuilder.designOptions.isCorrectStyleOptions([] as never)).toBe(false);
    });
  });

  describe('renderer wiring', () => {
    it('isCorrectRendererProps rejects an empty object', () => {
      expect(sankeyChartBuilder.renderer.isCorrectRendererProps({} as never)).toBe(false);
    });

    it('ChartRendererComponent is a React component function', () => {
      expect(typeof sankeyChartBuilder.renderer.ChartRendererComponent).toBe('function');
    });
  });
});
