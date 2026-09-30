import {
  type Attribute,
  createAttribute,
  createMeasure,
  DateLevels,
  DimensionalLevelAttribute,
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
  mapMeasuresForCsvExport,
  mapMeasuresForExcelExport,
} from './export-map-dimensions-measures.js';

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

  it('leaves a date measure alone, because its jaql already carries a date mask', () => {
    const dateMeasure = measureFactory.max(DM.Commerce.Date.Days, 'Max Date');

    const [mapped] = mapMeasuresForExcelExport([dateMeasure]);

    expect(mapped).toBe(dateMeasure);
    expect(mapped.jaql().format).toEqual({ mask: { days: 'yyyy-MM-dd' } });
  });

  it('still applies the default number format to a numeric measure, the control', () => {
    const numeric = measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue');

    const [mapped] = mapMeasuresForExcelExport([numeric]);

    expect(mapped.jaql().format).toEqual({ number: '0,0' });
  });
});

describe('mapMeasuresForCsvExport', () => {
  it('gives a date measure the format its level implies', () => {
    const [mapped] = mapMeasuresForCsvExport([
      measureFactory.max(DM.Commerce.Date.Days, 'Max Date'),
    ]);

    expect(mapped.getFormat?.()).toBe('yyyy-MM-dd');
  });

  it('uses the level default, so Years is not masked as a day', () => {
    const [mapped] = mapMeasuresForCsvExport([
      measureFactory.max(DM.Commerce.Date.Years, 'Max Year'),
    ]);

    expect(mapped.getFormat?.()).toBe('yyyy');
  });

  it('keeps an explicit format rather than overwriting it', () => {
    const explicit = measureFactory.max(DM.Commerce.Date.Days, 'Max Date').format('MM/yyyy');

    expect(mapMeasuresForCsvExport([explicit])[0]).toBe(explicit);
  });

  it('returns a numeric measure BY IDENTITY, so an existing CSV cannot change', () => {
    const numeric = measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue');

    expect(mapMeasuresForCsvExport([numeric])[0]).toBe(numeric);
  });

  it('returns a non-date aggregation over a date by identity too', () => {
    const counted = measureFactory.count(DM.Commerce.Date.Days, 'Days counted');

    expect(mapMeasuresForCsvExport([counted])[0]).toBe(counted);
  });

  it('returns anything without a format function unchanged', () => {
    const jaqlLike = { name: 'm', title: 'm' } as unknown as Measure;

    expect(mapMeasuresForCsvExport([jaqlLike])[0]).toBe(jaqlLike);
  });
});

describe('measures with no granularity level', () => {
  const weekOfYear = new DimensionalLevelAttribute(
    'Week of year',
    '[Commerce.Date (Calendar)]',
    DateLevels.WeekOfYear,
  );
  const bareDatetime = createAttribute({
    name: 'Signup',
    type: 'datetime',
    expression: '[Commerce.Signup]',
  });

  it.each([
    ['a date part, which answers an ordinal', () => measureFactory.max(weekOfYear, 'Max Week')],
    ['a datetime attribute with no level', () => measureFactory.max(bareDatetime, 'Max Signup')],
  ])('leaves %s out of the CSV date mapping', (_case, build) => {
    const measure = build();

    expect(mapMeasuresForCsvExport([measure])[0]).toBe(measure);
  });

  it.each([
    ['a date part, which answers an ordinal', () => measureFactory.max(weekOfYear, 'Max Week')],
    ['a datetime attribute with no level', () => measureFactory.max(bareDatetime, 'Max Signup')],
  ])('still gives %s the default number format for Excel', (_case, build) => {
    const [mapped] = mapMeasuresForExcelExport([build()]);

    expect(mapped.jaql().format).toEqual({ number: '0,0' });
  });
});

describe('a date measure written as a formula', () => {
  const maxDate = () =>
    measureFactory.customFormula('Max Date', 'MAX([D])', { D: DM.Commerce.Date.Days });
  const numericFormula = () =>
    measureFactory.customFormula('Total Revenue', 'SUM([R])', { R: DM.Commerce.Revenue });

  it('gives it the same display format the aggregation shape gets', () => {
    const [mapped] = mapMeasuresForCsvExport([maxDate()]);

    expect(mapped.getFormat?.()).toBe('yyyy-MM-dd');
  });

  it('carries the mask into the jaql the CSV request sends', () => {
    const [mapped] = mapMeasuresForCsvExport([maxDate()]);

    expect(mapped.jaql().format).toEqual({ mask: { days: 'yyyy-MM-dd' } });
  });

  it('is left alone by the Excel mapper, so its mask is not overwritten by a number format', () => {
    const measure = maxDate();

    expect(mapMeasuresForExcelExport([measure])[0]).toBe(measure);
  });

  it('leaves a numeric formula on the default number format, the control', () => {
    const [mapped] = mapMeasuresForExcelExport([numericFormula()]);

    expect(mapped.jaql().format).toEqual({ number: '0,0' });
  });

  it('returns a numeric formula by identity from the CSV mapper, the other control', () => {
    const measure = numericFormula();

    expect(mapMeasuresForCsvExport([measure])[0]).toBe(measure);
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
