/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable vitest/no-identical-title */
import { createAttribute, DimensionalAttribute, DimensionalLevelAttribute } from './attributes.js';
import { DateLevels } from './types.js';

describe('Attributes jaql preparations', () => {
  it('must prepare simple attribute jaql', () => {
    const result = { jaql: { title: 'Brand', dim: '[Brand.Brand ID]', datatype: 'text' } };
    const attribute = new DimensionalAttribute('Brand', '[Brand.Brand ID]');

    const jaql = attribute.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare simple level attribute jaql', () => {
    const result = {
      jaql: {
        title: 'Years',
        dim: '[Commerce.Date (Calendar)]',
        level: 'years',
        datatype: 'datetime',
      },
    };
    const level = new DimensionalLevelAttribute(
      'Years',
      '[Commerce.Date (Calendar)]',
      DateLevels.Years,
    );

    const jaql = level.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare minutes level attribute jaql', () => {
    const result = {
      jaql: {
        title: DateLevels.MinutesRoundTo30,
        dim: '[Commerce.Date (Calendar)]',
        dateTimeLevel: 'minutes',
        bucket: '30',
        datatype: 'datetime',
      },
    };
    const level = new DimensionalLevelAttribute(
      DateLevels.MinutesRoundTo30,
      '[Commerce.Date (Calendar)]',
      DateLevels.MinutesRoundTo30,
    );

    const jaql = level.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must prepare minutes level attribute jaql', () => {
    const result = {
      jaql: {
        title: DateLevels.AggMinutesRoundTo1,
        dim: '[Commerce.Date (Calendar)]',
        level: 'minutes',
        bucket: '1',
        datatype: 'datetime',
      },
    };
    const level = new DimensionalLevelAttribute(
      DateLevels.AggMinutesRoundTo1,
      '[Commerce.Date (Calendar)]',
      DateLevels.AggMinutesRoundTo1,
    );

    const jaql = level.jaql();

    expect(jaql).toStrictEqual(result);
  });

  it('must apply format during transform level attribute jaql', () => {
    const format = 'yyyy MM dd';
    const level = new DimensionalLevelAttribute(
      'Years',
      '[Commerce.Date (Calendar)]',
      'Years',
      format,
    );

    const jaql = level.jaql();
    expect(jaql.format?.mask?.years).toEqual(format);
  });
});

describe('createAttribute', () => {
  it('should create attribute from json', () => {
    const numericAttribute = createAttribute({
      name: 'BrandID',
      type: 'numeric-attribute',
      expression: '[Commerce.Brand ID]',
      description: 'Fortune999 Brands',
    });

    expect(numericAttribute).toBeInstanceOf(DimensionalAttribute);
    expect(numericAttribute.name).toBe('BrandID');
    expect(numericAttribute.expression).toBe('[Commerce.Brand ID]');
    expect(numericAttribute.type).toBe('numeric-attribute');
    expect(numericAttribute.description).toBe('Fortune999 Brands');
  });
});

describe('translateJaqlToGranularity', () => {
  it('should handle unsupported dateTimeLevel', () => {
    const json = { dateTimeLevel: 'unsupported', bucket: '15' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe('unsupported');
  });

  it('should handle unsupported level', () => {
    const json = { level: 'unsupported' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe('unsupported');
  });

  it('should translate years level', () => {
    const json = { level: 'years' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Years);
  });

  it('should translate quarters level', () => {
    const json = { level: 'quarters' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Quarters);
  });

  it('should translate months level', () => {
    const json = { level: 'months' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Months);
  });

  it('should translate weeks level', () => {
    const json = { level: 'weeks' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Weeks);
  });

  it('should translate days level', () => {
    const json = { level: 'days' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Days);
  });

  it('should translate aggregated minutes level with 60 bucket', () => {
    const json = { level: 'minutes', bucket: '60' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.AggHours);
  });

  it('should translate aggregated minutes level with 30 bucket', () => {
    const json = { level: 'minutes', bucket: '30' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(
      DateLevels.AggMinutesRoundTo30,
    );
  });

  it('should translate aggregated minutes level with 15 bucket', () => {
    const json = { level: 'minutes', bucket: '15' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(
      DateLevels.AggMinutesRoundTo15,
    );
  });

  it('should translate aggregated minutes level with 1 bucket', () => {
    const json = { level: 'minutes', bucket: '1' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(
      DateLevels.AggMinutesRoundTo1,
    );
  });

  it('should translate minutes level with 60 bucket', () => {
    const json = { dateTimeLevel: 'minutes', bucket: '60' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(DateLevels.Hours);
  });

  it('should translate minutes level with 30 bucket', () => {
    const json = { dateTimeLevel: 'minutes', bucket: '30' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(
      DateLevels.MinutesRoundTo30,
    );
  });

  it('should translate minutes level with 15 bucket', () => {
    const json = { dateTimeLevel: 'minutes', bucket: '15' };
    expect(DimensionalLevelAttribute.translateJaqlToGranularity(json)).toBe(
      DateLevels.MinutesRoundTo15,
    );
  });
});
