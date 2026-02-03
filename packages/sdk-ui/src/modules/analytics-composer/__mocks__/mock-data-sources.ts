import { JaqlDataSourceForDto } from '@sisense/sdk-data';

import { NormalizedTable } from '../types';

export const MOCK_DATA_SOURCE_SAMPLE_ECOMMERCE: JaqlDataSourceForDto = {
  title: 'Sample ECommerce',
  address: 'LocalHost',
  id: 'localhost_aSampleIAAaECommerce',
  live: false,
};
export const MOCK_NORMALIZED_TABLES_SAMPLE_ECOMMERCE: NormalizedTable[] = [
  {
    name: 'Country',
    columns: [
      {
        name: 'Country',
        dataType: 'string',
        expression: '[Country.Country]',
        description: 'Country',
      },
    ],
  },
  {
    name: 'Brand',
    columns: [
      {
        name: 'Brand',
        dataType: 'string',
        expression: '[Brand.Brand]',
        description: 'Brand',
      },
    ],
  },
  {
    name: 'Category',
    columns: [
      {
        name: 'Category',
        dataType: 'string',
        expression: '[Category.Category]',
        description: 'Category',
      },
    ],
  },
  {
    name: 'Commerce',
    columns: [
      {
        name: 'Date',
        dataType: 'datetime',
        expression: '[Commerce.Date]',
        description: 'Date',
      },
      {
        name: 'Revenue',
        dataType: 'number',
        expression: '[Commerce.Revenue]',
        description: 'Revenue',
      },
      {
        name: 'Cost',
        dataType: 'number',
        expression: '[Commerce.Cost]',
        description: 'Cost',
      },
    ],
  },
];
