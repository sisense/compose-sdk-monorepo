import { getDataFromQueryResult } from './getDataFromQueryResult.js';
import { DimensionalAttribute } from '@sisense/sdk-data';

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
});
