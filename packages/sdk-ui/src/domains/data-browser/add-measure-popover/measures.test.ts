import {
  AggregationTypes,
  DateLevels,
  DimensionalAttribute,
  DimensionalLevelAttribute,
  MetadataTypes,
} from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { getMeasuresListForAttribute } from './measures.js';

describe('getMeasuresListForAttribute', () => {
  it('should return text measures for text attribute', () => {
    const attribute = new DimensionalAttribute(
      'Category',
      '[Category.Category]',
      MetadataTypes.TextAttribute,
    );

    const measures = getMeasuresListForAttribute(attribute);

    expect(measures).toHaveLength(2);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.CountDistinct);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.Count);
  });

  it('should return numeric measures for numeric attribute', () => {
    const attribute = new DimensionalAttribute(
      'Revenue',
      '[Commerce.Revenue]',
      MetadataTypes.NumericAttribute,
    );

    const measures = getMeasuresListForAttribute(attribute);

    expect(measures.length).toBeGreaterThan(2);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.Sum);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.Count);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.CountDistinct);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.Average);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.Min);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.Max);
  });

  it('should return date/time measures for level attribute', () => {
    const attribute = new DimensionalLevelAttribute(
      'Years',
      '[Commerce.Date (Calendar)]',
      DateLevels.Years,
    );

    const measures = getMeasuresListForAttribute(attribute);

    expect(measures).toHaveLength(2);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.Count);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.CountDistinct);
  });

  it('should return empty array for unsupported attribute type', () => {
    const attribute = new DimensionalAttribute('Unknown', '[Unknown.Column]', 'unsupported-type');

    const measures = getMeasuresListForAttribute(attribute);

    expect(measures).toHaveLength(0);
  });

  it('should filter to only merged measures when attribute is indexed', () => {
    const attribute = new DimensionalAttribute(
      'Category',
      '[Category.Category]',
      MetadataTypes.TextAttribute,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
      undefined,
    );

    const measures = getMeasuresListForAttribute(attribute);

    expect(measures.every((m) => m.merged === true)).toBe(true);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.CountDistinct);
    expect(measures).toHaveLength(1);
  });

  it('should filter to only merged measures when attribute is merged', () => {
    const attribute = new DimensionalAttribute(
      'Category',
      '[Category.Category]',
      MetadataTypes.TextAttribute,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    );

    const measures = getMeasuresListForAttribute(attribute);

    expect(measures.every((m) => m.merged === true)).toBe(true);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.CountDistinct);
    expect(measures).toHaveLength(1);
  });

  it('should filter to only merged measures when both indexed and merged', () => {
    const attribute = new DimensionalAttribute(
      'Revenue',
      '[Commerce.Revenue]',
      MetadataTypes.NumericAttribute,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
      true,
    );

    const measures = getMeasuresListForAttribute(attribute);

    expect(measures.every((m) => m.merged === true)).toBe(true);
    expect(measures.map((m) => m.name)).toContain(AggregationTypes.CountDistinct);
    expect(measures).toHaveLength(1);
  });
});
