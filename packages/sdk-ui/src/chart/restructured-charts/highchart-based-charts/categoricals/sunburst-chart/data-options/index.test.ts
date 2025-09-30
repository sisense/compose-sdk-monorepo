import { describe, it, expect } from 'vitest';
import { dataOptionsTranslators } from './index';
import { CategoricalChartDataOptions } from '@/chart-data-options/types';

describe('Sunburst Data Options Translators', () => {
  const sampleDataOptions: CategoricalChartDataOptions = {
    category: [{ name: 'Category', type: 'text' }],
    value: [{ name: 'Revenue', aggregation: 'sum' }],
  };

  it('should translate data options to internal format', () => {
    const result = dataOptionsTranslators.translateDataOptionsToInternal(sampleDataOptions);
    expect(result).toBeDefined();
    expect(result.breakBy).toBeDefined();
    expect(result.y).toBeDefined();
  });

  it('should identify correct data options', () => {
    expect(dataOptionsTranslators.isCorrectDataOptions(sampleDataOptions)).toBe(true);
    expect(dataOptionsTranslators.isCorrectDataOptions({} as any)).toBe(false);
  });

  it('should get attributes', () => {
    const internalOptions =
      dataOptionsTranslators.translateDataOptionsToInternal(sampleDataOptions);
    const attributes = dataOptionsTranslators.getAttributes(internalOptions);
    expect(Array.isArray(attributes)).toBe(true);
  });

  it('should get measures', () => {
    const internalOptions =
      dataOptionsTranslators.translateDataOptionsToInternal(sampleDataOptions);
    const measures = dataOptionsTranslators.getMeasures(internalOptions);
    expect(Array.isArray(measures)).toBe(true);
  });
});
