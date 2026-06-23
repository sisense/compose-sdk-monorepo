import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import {
  ChartDataOptions,
  ChartDataOptionsInternal,
  SankeyChartDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types';

import { dataOptionsTranslators } from './index';

const revenue = measureFactory.sum(DM.Commerce.Revenue);
const gender = DM.Commerce.Gender;
const condition = DM.Commerce.Condition;

const validPublicOptions: SankeyChartDataOptions = {
  category: [gender, condition],
  value: revenue,
};

describe('dataOptionsTranslators', () => {
  describe('isCorrectDataOptions', () => {
    it('returns true for valid SankeyChartDataOptions', () => {
      expect(
        dataOptionsTranslators.isCorrectDataOptions(validPublicOptions as ChartDataOptions),
      ).toBe(true);
    });

    it('returns false when category is missing', () => {
      const opts = { value: revenue } as unknown as ChartDataOptions;
      expect(dataOptionsTranslators.isCorrectDataOptions(opts)).toBe(false);
    });

    it('returns false when value is an array (old API shape)', () => {
      const opts = {
        category: [gender, condition],
        value: [revenue],
      } as unknown as ChartDataOptions;
      expect(dataOptionsTranslators.isCorrectDataOptions(opts)).toBe(false);
    });

    it('returns false when value is null', () => {
      const opts = { category: [gender, condition], value: null } as unknown as ChartDataOptions;
      expect(dataOptionsTranslators.isCorrectDataOptions(opts)).toBe(false);
    });

    it('returns false when fewer than two category columns are provided', () => {
      const opts = {
        category: [gender],
        value: revenue,
      } as unknown as ChartDataOptions;
      expect(dataOptionsTranslators.isCorrectDataOptions(opts)).toBe(false);
    });

    it('returns false when options include Cartesian breakBy', () => {
      const opts = {
        category: [gender, condition],
        value: revenue,
        breakBy: [],
      } as unknown as ChartDataOptions;
      expect(dataOptionsTranslators.isCorrectDataOptions(opts)).toBe(false);
    });

    it('returns false when a category entry is null', () => {
      const opts = {
        category: [gender, null],
        value: revenue,
      } as unknown as ChartDataOptions;
      expect(dataOptionsTranslators.isCorrectDataOptions(opts)).toBe(false);
    });

    it('returns false when a category entry is undefined', () => {
      const opts = {
        category: [gender, undefined],
        value: revenue,
      } as unknown as ChartDataOptions;
      expect(dataOptionsTranslators.isCorrectDataOptions(opts)).toBe(false);
    });

    it('returns false when a category entry is a primitive', () => {
      const opts = {
        category: [gender, 'not-a-column'],
        value: revenue,
      } as unknown as ChartDataOptions;
      expect(dataOptionsTranslators.isCorrectDataOptions(opts)).toBe(false);
    });
  });

  describe('isCorrectDataOptionsInternal', () => {
    it('returns true after translating valid public options', () => {
      const internal = dataOptionsTranslators.translateDataOptionsToInternal(validPublicOptions);
      expect(
        dataOptionsTranslators.isCorrectDataOptionsInternal(
          internal as unknown as ChartDataOptionsInternal,
        ),
      ).toBe(true);
    });

    it('returns false when category contains raw (non-styled) columns', () => {
      const opts = {
        category: [gender, condition],
        value: { column: revenue },
      } as unknown as ChartDataOptionsInternal;
      expect(dataOptionsTranslators.isCorrectDataOptionsInternal(opts)).toBe(false);
    });
  });

  describe('translateDataOptionsToInternal', () => {
    it('wraps each category column in a StyledColumn', () => {
      const result = dataOptionsTranslators.translateDataOptionsToInternal(validPublicOptions);
      expect(result.category).toHaveLength(2);
      result.category.forEach((c) => expect(c).toHaveProperty('column'));
    });

    it('wraps the value column in a StyledMeasureColumn', () => {
      const result = dataOptionsTranslators.translateDataOptionsToInternal(validPublicOptions);
      expect(result.value).toHaveProperty('column');
    });

    it('preserves seriesToColorMap', () => {
      const colorMap = { Male: '#ff0000', Female: '#0000ff' };
      const result = dataOptionsTranslators.translateDataOptionsToInternal({
        ...validPublicOptions,
        seriesToColorMap: colorMap,
      });
      expect(result.seriesToColorMap).toEqual(colorMap);
    });
  });

  describe('getAttributes', () => {
    it('returns one attribute per category column', () => {
      const internal = dataOptionsTranslators.translateDataOptionsToInternal(validPublicOptions);
      const attrs = dataOptionsTranslators.getAttributes(internal);
      expect(attrs).toHaveLength(2);
    });
  });

  describe('getMeasures', () => {
    it('returns a single measure from the value column', () => {
      const internal = dataOptionsTranslators.translateDataOptionsToInternal(validPublicOptions);
      const measures = dataOptionsTranslators.getMeasures(internal);
      expect(measures).toHaveLength(1);
    });
  });
});
