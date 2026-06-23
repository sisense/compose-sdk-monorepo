import {
  type Attribute,
  createAttribute,
  createMeasure,
  DateLevels,
  isDimensionalLevelAttribute,
  type Measure,
  measureFactory,
} from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import type { StyledMeasureColumn } from '@/domains/visualizations/core/chart-data-options/types.js';

import {
  mapAttributesForExcelExport,
  mapMeasureColumnForExcelExport,
  mapMeasuresForExcelExport,
} from './excel-export-map-dimensions-measures.js';

describe('mapAttributesForExcelExport', () => {
  it('returns a new empty array when input is empty', () => {
    const input: readonly Attribute[] = [];
    const result = mapAttributesForExcelExport(input);
    expect(result).toEqual([]);
    expect(result).not.toBe(input);
  });

  it('returns same attribute instances for non-level attributes', () => {
    const plain = createAttribute({
      name: 'Region',
      type: 'text-attribute',
      expression: '[Geography.Region]',
    });
    const result = mapAttributesForExcelExport([plain]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(plain);
  });

  it('applies a level-appropriate display format when attribute has no format set', () => {
    const dateLevel = createAttribute({
      name: 'Date',
      expression: '[Orders.Date]',
      granularity: DateLevels.Months,
    });
    expect(isDimensionalLevelAttribute(dateLevel) && dateLevel.getFormat()).toBeFalsy();

    const result = mapAttributesForExcelExport([dateLevel]);
    expect(result).toHaveLength(1);
    const mapped = result[0];
    expect(mapped).toBeDefined();
    expect(mapped).not.toBe(dateLevel);
    expect(isDimensionalLevelAttribute(mapped)).toBe(true);
    if (!isDimensionalLevelAttribute(mapped))
      throw new Error('expected dimensional level attribute');
    expect(mapped.getFormat()).toBe('yyyy-MM');
  });

  it('applies yyyy for Years level when no format set', () => {
    const dateLevel = createAttribute({
      name: 'Date',
      expression: '[Orders.Date]',
      granularity: DateLevels.Years,
    });
    const result = mapAttributesForExcelExport([dateLevel]);
    const mapped = result[0];
    if (!isDimensionalLevelAttribute(mapped))
      throw new Error('expected dimensional level attribute');
    expect(mapped.getFormat()).toBe('yyyy');
  });

  it('returns the attribute unchanged when it already has a display format', () => {
    const dateLevel = createAttribute({
      name: 'Date',
      expression: '[Orders.Date]',
      granularity: DateLevels.Years,
    });
    if (!isDimensionalLevelAttribute(dateLevel)) throw new Error('expected LevelAttribute');
    const withFormat = dateLevel.format('custom-fmt');

    const result = mapAttributesForExcelExport([withFormat]);
    expect(result[0]).toBe(withFormat);
    if (!isDimensionalLevelAttribute(result[0])) throw new Error();
    expect(result[0].getFormat()).toBe('custom-fmt');
  });

  it('maps each attribute independently', () => {
    const plain = createAttribute({
      name: 'Region',
      type: 'text-attribute',
      expression: '[Geography.Region]',
    });
    const dateLevel = createAttribute({
      name: 'Date',
      expression: '[Orders.Date]',
      granularity: DateLevels.Days,
    });
    const result = mapAttributesForExcelExport([plain, dateLevel]);
    expect(result[0]).toBe(plain);
    const mappedDate = result[1];
    expect(mappedDate).toBeDefined();
    expect(mappedDate).not.toBe(dateLevel);
    expect(isDimensionalLevelAttribute(mappedDate)).toBe(true);
    if (!isDimensionalLevelAttribute(mappedDate))
      throw new Error('expected dimensional level attribute');
    expect(mappedDate.getFormat()).toBe('yyyy-MM-dd');
  });
});

describe('mapMeasuresForExcelExport', () => {
  it('returns a new empty array when input is empty', () => {
    const input: readonly Measure[] = [];
    const result = mapMeasuresForExcelExport(input);
    expect(result).toEqual([]);
    expect(result).not.toBe(input);
  });

  it('applies default number format when measure has no format', () => {
    const attr = createAttribute({
      name: 'Revenue',
      type: 'numeric',
      expression: '[Commerce.Revenue]',
    });
    const measure = createMeasure({
      name: 'Sum of Revenue',
      aggregation: 'sum',
      attribute: attr,
    });
    expect(measure.getFormat()).toBeUndefined();

    const result = mapMeasuresForExcelExport([measure]);
    expect(result).toHaveLength(1);
    expect(result[0]).not.toBe(measure);
    expect(result[0]?.getFormat?.()).toBe('0,0');
  });

  it('returns the same measure instance when a format is already set', () => {
    const attr = createAttribute({
      name: 'Revenue',
      type: 'numeric',
      expression: '[Commerce.Revenue]',
    });
    const base = createMeasure({
      name: 'Sum of Revenue',
      aggregation: 'sum',
      attribute: attr,
    });
    const formatted = base.format('0.00%');
    const result = mapMeasuresForExcelExport([formatted]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(formatted);
    expect(result[0]?.getFormat?.()).toBe('0.00%');
  });

  it('returns the measure unchanged when getFormat and format are absent', () => {
    const bare = { title: 'm', name: 'm' } as Measure;
    const result = mapMeasuresForExcelExport([bare]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(bare);
  });

  it('returns the measure unchanged when format is not a function (e.g. JAQL mask object)', () => {
    const jaqlLike = {
      name: 'm',
      title: 'm',
      getFormat: () => undefined,
      format: { mask: { years: 'yyyy' } },
    } as unknown as Measure;
    const result = mapMeasuresForExcelExport([jaqlLike]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(jaqlLike);
  });
});

describe('mapMeasureColumnForExcelExport', () => {
  it('attaches numberFormatConfig without mutating the source measure', () => {
    const formattedMeasure = measureFactory.sum(DM.Commerce.Revenue).format('0,0');
    const numberFormatConfig = {
      name: 'Numbers' as const,
      kilo: true,
      decimalScale: 2,
    };
    const column: StyledMeasureColumn = {
      column: formattedMeasure,
      numberFormatConfig,
    };

    const result = mapMeasureColumnForExcelExport(column);

    expect(result.excelNumberFormatConfig).toEqual(numberFormatConfig);
    expect(result).not.toBe(formattedMeasure);
    expect(formattedMeasure).not.toHaveProperty('excelNumberFormatConfig');
    expect(typeof result.jaql).toBe('function');
  });
});
