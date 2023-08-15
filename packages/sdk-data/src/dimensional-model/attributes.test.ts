/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable jest/no-identical-title */
import { createAttribute, DimensionalAttribute, DimensionalLevelAttribute } from './attributes';
import { DateLevels } from './types';

describe('Attributes jaql preparations', () => {
  it('must prepare simple attribute jaql', () => {
    const result = { jaql: { title: 'Brand', dim: '[Brand.Brand ID]' } };
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
    });

    expect(numericAttribute).toBeInstanceOf(DimensionalAttribute);
    expect(numericAttribute.name).toBe('BrandID');
    expect(numericAttribute.expression).toBe('[Commerce.Brand ID]');
    expect(numericAttribute.type).toBe('numeric-attribute');
  });
});
