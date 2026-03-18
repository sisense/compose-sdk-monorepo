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
    name: 'Brand',
    columns: [
      {
        name: 'Brand',
        dataType: 'text',
        expression: '[Brand.Brand]',
        description: 'Brand.Brand',
      },
      {
        name: 'Brand ID',
        dataType: 'numeric',
        expression: '[Brand.Brand ID]',
        description: 'Brand.Brand ID',
      },
    ],
  },
  {
    name: 'Category',
    columns: [
      {
        name: 'Category',
        dataType: 'text',
        expression: '[Category.Category]',
        description: 'Category.Category',
      },
      {
        name: 'Category ID',
        dataType: 'numeric',
        expression: '[Category.Category ID]',
        description: 'Category.Category ID',
      },
    ],
  },
  {
    name: 'Commerce',
    columns: [
      {
        name: 'Age Range',
        dataType: 'text',
        expression: '[Commerce.Age Range]',
        description: 'Commerce.Age Range',
      },
      {
        name: 'Brand ID',
        dataType: 'numeric',
        expression: '[Commerce.Brand ID]',
        description: 'Commerce.Brand ID',
      },
      {
        name: 'Category ID',
        dataType: 'numeric',
        expression: '[Commerce.Category ID]',
        description: 'Commerce.Category ID',
      },
      {
        name: 'Condition',
        dataType: 'text',
        expression: '[Commerce.Condition]',
        description: 'Commerce.Condition',
      },
      {
        name: 'Cost',
        dataType: 'numeric',
        expression: '[Commerce.Cost]',
        description: 'Commerce.Cost',
      },
      {
        name: 'Country ID',
        dataType: 'numeric',
        expression: '[Commerce.Country ID]',
        description: 'Commerce.Country ID',
      },
      {
        name: 'Date',
        dataType: 'datetime',
        expression: '[Commerce.Date]',
        description: 'Commerce.Date',
      },
      {
        name: 'Gender',
        dataType: 'text',
        expression: '[Commerce.Gender]',
        description: 'Commerce.Gender',
      },
      {
        name: 'Quantity',
        dataType: 'numeric',
        expression: '[Commerce.Quantity]',
        description: 'Commerce.Quantity',
      },
      {
        name: 'Revenue',
        dataType: 'numeric',
        expression: '[Commerce.Revenue]',
        description: 'Commerce.Revenue',
      },
      {
        name: 'Visit ID',
        dataType: 'numeric',
        expression: '[Commerce.Visit ID]',
        description: 'Commerce.Visit ID',
      },
    ],
  },
  {
    name: 'Country',
    columns: [
      {
        name: 'Country',
        dataType: 'text',
        expression: '[Country.Country]',
        description: 'Country.Country',
      },
      {
        name: 'Country ID',
        dataType: 'numeric',
        expression: '[Country.Country ID]',
        description: 'Country.Country ID',
      },
    ],
  },
];
