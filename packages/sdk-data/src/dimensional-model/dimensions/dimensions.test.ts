/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DimensionalAttribute } from '../attributes.js';
import { Sort } from '../types.js';
import { DimensionalDateDimension, DimensionalDimension } from './dimensions.js';

describe('Dimension jaql preparations', () => {
  it('must prepare simple text dimension jaql', () => {
    const result = { jaql: { title: 'Brand', dim: '[Brand.Brand]', datatype: 'text' } };

    const dimension = new DimensionalDimension(
      'Brand',
      '[Brand.Brand]',
      [new DimensionalAttribute('Brand', '[Brand.Brand]')],
      [],
      'textdimension',
    );

    const jaql = dimension.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must prepare simple text dimension with default attribute jaql', () => {
    const result = { jaql: { title: 'Brand', dim: '[Brand.Brand]', datatype: 'text' } };

    const attribute = new DimensionalAttribute('Brand', '[Brand.Brand]');
    const dimension = new DimensionalDimension(
      'Brand',
      '[Brand.Brand]',
      [attribute],
      [],
      'textdimension',
    );
    dimension.defaultAttribute = attribute;

    const jaql = dimension.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must prepare simple text dimension with nested dimension jaql', () => {
    const result = { jaql: { title: 'Brand', dim: '[Brand.Brand]', datatype: 'text' } };

    const dimension = new DimensionalDimension(
      'Brand',
      '',
      [new DimensionalAttribute('Brand', '')],
      [
        new DimensionalDimension(
          'Brand',
          '[Brand.Brand]',
          [new DimensionalAttribute('Brand', '[Brand.Brand]')],
          [],
          'textdimension',
        ),
      ],
      'textdimension',
    );

    const jaql = dimension.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must prepare date dimension jaql', () => {
    const result = {
      jaql: {
        title: 'Date',
        dim: '[Commerce.Date (Calendar)]',
        level: 'years',
        datatype: 'datetime',
      },
      format: { mask: { years: 'yyyy' } },
    };

    const dimension = new DimensionalDateDimension('Date', '[Commerce.Date (Calendar)]');

    const jaql = dimension.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must prepare jaql for date dimension with "seconds" level', () => {
    const result = {
      jaql: {
        title: 'Seconds',
        dim: '[Commerce.Date (Calendar)]',
        bucket: '0',
        dateTimeLevel: 'seconds',
        datatype: 'datetime',
      },
      format: { mask: { seconds: 'yyyy-MM-dd HH:mm:ss' } },
    };

    const dimension = new DimensionalDateDimension('Date', '[Commerce.Date (Calendar)]');

    const jaql = dimension.Seconds.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must prepare jaql for date dimension with "minutes" level', () => {
    const result = {
      jaql: {
        title: 'Minutes',
        dim: '[Commerce.Date (Calendar)]',
        bucket: '1',
        dateTimeLevel: 'minutes',
        datatype: 'datetime',
      },
      format: { mask: { minutes: 'yyyy-MM-dd HH:mm' } },
    };

    const dimension = new DimensionalDateDimension('Date', '[Commerce.Date (Calendar)]');

    const jaql = dimension.Minutes.jaql();
    expect(jaql).toStrictEqual(result);
  });

  it('must handle sort', () => {
    const dimensionAscSort = new DimensionalDimension(
      'Brand',
      '[Brand.Brand]',
      [new DimensionalAttribute('Brand', '[Brand.Brand]')],
      [],
      'textdimension',
      '',
      Sort.Ascending,
    );
    const dimensionDescSort = new DimensionalDimension(
      'Brand',
      '[Brand.Brand]',
      [new DimensionalAttribute('Brand', '[Brand.Brand]')],
      [],
      'textdimension',
      '',
      Sort.Descending,
    );

    const jaqlAscSort = dimensionAscSort.jaql();
    const jaqlDescSort = dimensionDescSort.jaql();

    expect(jaqlAscSort.jaql.sort).toBe('asc');
    expect(jaqlDescSort.jaql.sort).toBe('desc');
  });
});
