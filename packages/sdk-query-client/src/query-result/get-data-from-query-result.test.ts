import { getDataFromQueryResult, setCellsBlur } from './get-data-from-query-result.js';
import { DimensionalAttribute, DataCell } from '@sisense/sdk-data';

describe('Handle query service response', () => {
  it('handle simple response', () => {
    const response = {
      headers: ['Gender'],
      metadata: [
        {
          jaql: {
            datatype: 'text',
            column: 'Gender',
            merged: true,
            dim: '[Commerce.Gender]',
            title: 'Gender',
            table: 'Commerce',
          },
          instanceid: '401FA-BF1A-AC',
          format: {},
        },
      ],
      datasource: {
        revisionId: 'TBD',
        fullname: 'LocalHost/Sample ECommerce',
      },
      processingInfo: {
        cacheType: 'none',
        cacheTime: '2023-03-10T13:16:37.083Z',
      },
      translationInfo: {
        translationServiceProvider: 'NewTranslationService',
        isTranslationFallback: false,
        isQueryFallback: false,
        translationDuration: 0.026,
        sqlFromCache: false,
      },
      values: [
        [
          {
            data: 'Female',
            text: 'Female',
          },
        ],
        [
          {
            data: 'Male',
            text: 'Male',
          },
        ],
        [
          {
            data: 'Unspecified',
            text: 'Unspecified',
          },
        ],
      ],
    };
    const attribute = new DimensionalAttribute('Gender', '[Commerce.Gender]', 'text-attribute');
    const result = {
      columns: [{ name: 'Gender', type: 'text' }],
      rows: [
        [{ data: 'Female', text: 'Female', blur: false }],
        [{ data: 'Male', text: 'Male', blur: false }],
        [{ data: 'Unspecified', text: 'Unspecified', blur: false }],
      ],
    };

    const data = getDataFromQueryResult(response, [attribute]);

    expect(data).toStrictEqual(result);
  });

  it('handle response with selection', () => {
    const response = {
      headers: ['Gender'],
      metadata: [
        {
          jaql: {
            datatype: 'text',
            column: 'Gender',
            merged: true,
            dim: '[Commerce.Gender]',
            title: 'Gender',
            table: 'Commerce',
          },
          instanceid: '401FA-BF1A-AC',
          format: {},
        },
      ],
      datasource: {
        revisionId: 'TBD',
        fullname: 'LocalHost/Sample ECommerce',
      },
      processingInfo: {
        cacheType: 'none',
        cacheTime: '2023-03-10T13:16:37.083Z',
      },
      translationInfo: {
        translationServiceProvider: 'NewTranslationService',
        isTranslationFallback: false,
        isQueryFallback: false,
        translationDuration: 0.026,
        sqlFromCache: false,
      },
      values: [
        [
          {
            data: 'Female',
            text: 'Female',
          },
        ],
        [
          {
            data: 'Male',
            text: 'Male',
            selected: true,
          },
        ],
        [
          {
            data: 'Unspecified',
            text: 'Unspecified',
          },
        ],
      ],
    };
    const attribute = new DimensionalAttribute('Gender', '[Commerce.Gender]', 'text-attribute');
    const result = {
      columns: [{ name: 'Gender', type: 'text' }],
      rows: [
        [{ data: 'Female', text: 'Female', blur: true }],
        [{ data: 'Male', text: 'Male', blur: false }],
        [{ data: 'Unspecified', text: 'Unspecified', blur: true }],
      ],
    };

    const data = getDataFromQueryResult(response, [attribute]);

    expect(data).toStrictEqual(result);
  });

  it('should set blur for all fields of cell based on selected field value', () => {
    const rows: DataCell[][] = [
      // selected point
      [
        { data: '25-34', text: '25-34', selected: true },
        { data: 'Female', text: 'Female', selected: true },
        { data: 1048, text: '1048' },
        { data: 135521.08578795195, text: '135521.085787952' },
      ],
      // not selected point explicitly
      [
        { data: '25-34', text: '25-34', selected: false },
        { data: 'Male', text: 'Male', selected: false },
        { data: 3902, text: '3902' },
        { data: 607590.7210561037, text: '607590.7210561037' },
      ],
      // not selected point implicitly (due to omitted "selected" property while other points have it)
      [
        { data: '25-34', text: '25-34' },
        { data: 'Unspecified', text: 'Unspecified' },
        { data: 12639, text: '12639' },
        { data: 1884462.598469913, text: '1884462.598469913' },
      ],
    ];
    const cell = setCellsBlur(rows);
    expect(cell).toHaveLength(3);
    expect(cell[0]).toMatchObject([
      { data: '25-34', text: '25-34', blur: false },
      { data: 'Female', text: 'Female', blur: false },
      { data: 1048, text: '1048', blur: false },
      { data: 135521.08578795195, text: '135521.085787952', blur: false },
    ]);
    expect(cell[1]).toMatchObject([
      { data: '25-34', text: '25-34', blur: true },
      { data: 'Male', text: 'Male', blur: true },
      { data: 3902, text: '3902', blur: true },
      { data: 607590.7210561037, text: '607590.7210561037', blur: true },
    ]);
    expect(cell[2]).toMatchObject([
      { data: '25-34', text: '25-34', blur: true },
      { data: 'Unspecified', text: 'Unspecified', blur: true },
      { data: 12639, text: '12639', blur: true },
      { data: 1884462.598469913, text: '1884462.598469913', blur: true },
    ]);
  });
});
