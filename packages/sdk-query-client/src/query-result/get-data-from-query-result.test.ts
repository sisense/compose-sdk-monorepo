import { DataCell, DimensionalAttribute, DimensionalBaseMeasure } from '@ethings-os/sdk-data';

import { getDataFromQueryResult, setCellsBlur } from './get-data-from-query-result.js';

describe('Handle query service response', () => {
  it('handle simple response with neutral rows (neither highlighted nor blurred)', () => {
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
        [{ data: 'Female', text: 'Female' }],
        [{ data: 'Male', text: 'Male' }],
        [{ data: 'Unspecified', text: 'Unspecified' }],
      ],
    };

    const data = getDataFromQueryResult(response, [attribute]);

    expect(data).toStrictEqual(result);
  });

  it('handle response with a highlighted row', () => {
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

  it('handle response with ALL highlighted rows', () => {
    const response = {
      headers: ['Category', '$measure0_# of unique Category'],
      metadata: [
        {
          jaql: {
            datatype: 'text',
            dim: '[Category.Category]',
            title: 'Category',
          },
        },
        {
          jaql: {
            agg: 'count',
            datatype: 'text',
            dim: '[Category.Category]',
            title: '$measure0_# of unique Category',
          },
        },
      ],
      datasource: {
        revisionId: 'TBD',
        fullname: 'LocalHost/Sample ECommerce',
      },
      processingInfo: {
        cacheType: 'result',
        cacheTime: '2024-08-10T02:37:54.903Z',
      },
      translationInfo: {
        translationServiceProvider: 'NewTranslationService',
        isTranslationFallback: false,
        isQueryFallback: false,
        translationDuration: 0.0,
        sqlFromCache: true,
      },
      values: [
        [
          {
            data: 'Apple Mac Desktops',
            text: 'Apple Mac Desktops',
            selected: true,
          },
          {
            data: 1,
            text: '1',
          },
        ],
        [
          {
            data: 'Apple Mac Laptops',
            text: 'Apple Mac Laptops',
            selected: true,
          },
          {
            data: 1,
            text: '1',
          },
        ],
        [
          {
            data: 'Camcorders',
            text: 'Camcorders',
            selected: true,
          },
          {
            data: 1,
            text: '1',
          },
        ],
      ],
    };
    const result = {
      columns: [
        { name: 'Gender', type: 'text' },
        { name: '# of unique Category', type: 'number' },
      ],
      rows: [
        [
          { data: 'Apple Mac Desktops', text: 'Apple Mac Desktops', blur: false },
          { data: 1, text: '1', blur: false },
        ],
        [
          { data: 'Apple Mac Laptops', text: 'Apple Mac Laptops', blur: false },
          { data: 1, text: '1', blur: false },
        ],
        [
          { data: 'Camcorders', text: 'Camcorders', blur: false },
          { data: 1, text: '1', blur: false },
        ],
      ],
    };
    const data = getDataFromQueryResult(response, [
      new DimensionalAttribute('Gender', '[Commerce.Gender]', 'text-attribute'),
      new DimensionalBaseMeasure(
        '# of unique Category',
        new DimensionalAttribute('Category', '[Category.Category]', 'text-attribute'),
        'count',
      ),
    ]);

    expect(data).toStrictEqual(result);
  });

  it('handle complex response with ALL neutral rows', () => {
    const response = {
      headers: ['Category', '$measure0_# of unique Category'],
      metadata: [
        {
          jaql: {
            datatype: 'text',
            dim: '[Category.Category]',
            title: 'Category',
          },
        },
        {
          jaql: {
            agg: 'count',
            datatype: 'text',
            dim: '[Category.Category]',
            title: '$measure0_# of unique Category',
          },
        },
      ],
      datasource: {
        revisionId: 'TBD',
        fullname: 'LocalHost/Sample ECommerce',
      },
      processingInfo: {
        cacheType: 'result',
        cacheTime: '2024-08-10T02:37:54.903Z',
      },
      translationInfo: {
        translationServiceProvider: 'NewTranslationService',
        isTranslationFallback: false,
        isQueryFallback: false,
        translationDuration: 0.0,
        sqlFromCache: true,
      },
      values: [
        [
          {
            data: 'Apple Mac Desktops',
            text: 'Apple Mac Desktops',
          },
          {
            data: 1,
            text: '1',
          },
        ],
        [
          {
            data: 'Apple Mac Laptops',
            text: 'Apple Mac Laptops',
          },
          {
            data: 1,
            text: '1',
          },
        ],
        [
          {
            data: 'Camcorders',
            text: 'Camcorders',
          },
          {
            data: 1,
            text: '1',
          },
        ],
      ],
    };
    const result = {
      columns: [
        { name: 'Gender', type: 'text' },
        { name: '# of unique Category', type: 'number' },
      ],
      rows: [
        [
          { data: 'Apple Mac Desktops', text: 'Apple Mac Desktops' },
          { data: 1, text: '1' },
        ],
        [
          { data: 'Apple Mac Laptops', text: 'Apple Mac Laptops' },
          { data: 1, text: '1' },
        ],
        [
          { data: 'Camcorders', text: 'Camcorders' },
          { data: 1, text: '1' },
        ],
      ],
    };
    const data = getDataFromQueryResult(response, [
      new DimensionalAttribute('Gender', '[Commerce.Gender]', 'text-attribute'),
      new DimensionalBaseMeasure(
        '# of unique Category',
        new DimensionalAttribute('Category', '[Category.Category]', 'text-attribute'),
        'count',
      ),
    ]);

    expect(data).toStrictEqual(result);
  });

  it('should set blur for all fields of cell based on selected field value', () => {
    const inputRows: DataCell[][] = [
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
    const outputRows = setCellsBlur(inputRows);
    expect(outputRows).toHaveLength(3);
    expect(outputRows[0]).toMatchObject([
      { data: '25-34', text: '25-34', blur: false },
      { data: 'Female', text: 'Female', blur: false },
      { data: 1048, text: '1048', blur: false },
      { data: 135521.08578795195, text: '135521.085787952', blur: false },
    ]);
    expect(outputRows[1]).toMatchObject([
      { data: '25-34', text: '25-34', blur: true },
      { data: 'Male', text: 'Male', blur: true },
      { data: 3902, text: '3902', blur: true },
      { data: 607590.7210561037, text: '607590.7210561037', blur: true },
    ]);
    expect(outputRows[2]).toMatchObject([
      { data: '25-34', text: '25-34', blur: true },
      { data: 'Unspecified', text: 'Unspecified', blur: true },
      { data: 12639, text: '12639', blur: true },
      { data: 1884462.598469913, text: '1884462.598469913', blur: true },
    ]);
  });

  it('should set blur for all fields of cell based on selected field value 2', () => {
    const inputRows: DataCell[][] = [
      [
        { data: 'A', text: 'A', selected: true },
        { data: '1', text: '1' },
      ],
      [
        { data: 'B', text: 'B', selected: true },
        { data: '2', text: '2' },
      ],
      [
        { data: 'C', text: 'C' },
        { data: '3', text: '3' },
      ],
    ];
    const outputRows = setCellsBlur(inputRows);
    expect(outputRows).toHaveLength(3);
    expect(outputRows[0]).toMatchObject([
      { data: 'A', text: 'A', blur: false },
      { data: '1', text: '1', blur: false },
    ]);
    expect(outputRows[1]).toMatchObject([
      { data: 'B', text: 'B', blur: false },
      { data: '2', text: '2', blur: false },
    ]);
    expect(outputRows[2]).toMatchObject([
      { data: 'C', text: 'C', blur: true },
      { data: '3', text: '3', blur: true },
    ]);
  });
});
