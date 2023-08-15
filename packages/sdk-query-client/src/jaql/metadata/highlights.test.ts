/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ExcludeFilter, MembersFilter } from '@sisense/sdk-data';
import {
  DateLevels,
  DimensionalAttribute,
  DimensionalDateDimension,
  DimensionalLevelAttribute,
} from '@sisense/sdk-data';
import {
  applyHighlightFilters,
  getMetadataItemId,
  matchHighlightsWithAttributes,
} from './index.js';

describe('Highlight filters applying', () => {
  it('must apply highlight filter to metadata item', () => {
    const result = {
      jaql: {
        title: 'Gender',
        dim: '[Commerce.Gender]',
        datatype: 'text',
        in: {
          selected: {
            jaql: {
              title: 'CommerceGender',
              dim: '[Commerce.Gender]',
              datatype: 'text',
              filter: { members: ['Female'] },
            },
          },
        },
      },
    };
    const attribute = new DimensionalAttribute('Gender', '[Commerce.Gender]', 'text-attribute');
    const filter = new MembersFilter(
      new DimensionalAttribute('[Commerce.Gender]', '[Commerce.Gender]'),
      ['Female'],
    );

    const metadata = applyHighlightFilters(attribute.jaql(), [filter]);

    expect(metadata).toStrictEqual(result);
  });

  it('must apply highlight filter to metadata item with level', () => {
    const result = {
      format: { mask: { years: 'yyyy' } },
      jaql: {
        title: 'Date',
        dim: '[Commerce.Date (Calendar)]',
        level: 'years',
        datatype: 'datetime',
        in: {
          selected: {
            jaql: {
              title: 'CommerceDateCalendar',
              dim: '[Commerce.Date (Calendar)]',
              level: 'years',
              datatype: 'datetime',
              filter: { exclude: { members: ['2010-01-01T00:00:00'] } },
            },
          },
        },
      },
    };
    const dimension = new DimensionalDateDimension('Date', '[Commerce.Date (Calendar)]');
    const filter = new ExcludeFilter(
      new MembersFilter(
        new DimensionalLevelAttribute(
          'CommerceDateCalendar',
          '[Commerce.Date (Calendar)]',
          'Years',
        ),
        ['2010-01-01T00:00:00'],
      ),
    );

    const metadata = applyHighlightFilters(dimension.jaql(), [filter]);

    expect(metadata).toStrictEqual(result);
  });

  it('must not apply highlight filter to metadata item', () => {
    const result = { jaql: { title: 'Brand', dim: '[Brand.Brand]', datatype: 'text' } };
    const attribute = new DimensionalAttribute('Brand', '[Brand.Brand]', 'text-attribute');

    const filter = new MembersFilter(
      new DimensionalAttribute('[Commerce.Gender]', '[Commerce.Gender]'),
      ['Female'],
    );

    const metadata = applyHighlightFilters(attribute.jaql(), [filter]);

    expect(metadata).toStrictEqual(result);
  });
});

describe('Match Highlights with Attributes', () => {
  it('must detect base case - one match and one missing', () => {
    const dimensionsMetadata = [
      new DimensionalAttribute('[Commerce.Gender]', '[Commerce.Gender]').jaql(),
    ];
    const highlights = [
      new MembersFilter(new DimensionalAttribute('[Commerce.Gender]', '[Commerce.Gender]'), [
        'Female',
      ]),
      new MembersFilter(new DimensionalAttribute('[Brand.Brand]', '[Brand.Brand]'), ['Universal']),
    ];

    const [hWith, hWithout] = matchHighlightsWithAttributes(dimensionsMetadata, highlights);

    expect(hWith).toHaveLength(1);
    expect(hWith[0]?.attribute.id).toBe('[Commerce.Gender]');

    expect(hWithout).toHaveLength(1);
    expect(hWithout[0]?.attribute.id).toBe('[Brand.Brand]');
  });
});

describe('Get metadataItem id', () => {
  it('generated id must match to base attribute id', () => {
    const attribute = new DimensionalAttribute('AgeRange', '[Commerce.Age Range]');
    expect(getMetadataItemId(attribute.jaql())).toEqual(attribute.id);
  });

  it('generated id must match to base level attribute id', () => {
    const attribute = new DimensionalLevelAttribute(
      DateLevels.Years,
      '[Commerce.Date (Calendar)]',
      DateLevels.Years,
    );
    expect(getMetadataItemId(attribute.jaql())).toEqual(attribute.id);
  });

  it('generated id must match to minutes level attribute id', () => {
    const attribute = new DimensionalLevelAttribute(
      DateLevels.AggMinutesRoundTo1,
      '[Commerce.Date (Calendar)]',
      DateLevels.AggMinutesRoundTo1,
    );
    expect(getMetadataItemId(attribute.jaql())).toEqual(attribute.id);
  });
});
