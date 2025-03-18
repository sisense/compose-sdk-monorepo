import { AnyObject, DataSourceField } from '../../types.js';

/**
 * Actual fields from the Sample ECommerce datasource returned by server.
 */
export const sampleEcommerceFields: (DataSourceField & AnyObject)[] = [
  {
    id: '[Brand.Brand]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Brand',
    table: 'Brand',
    column: 'Brand',
    merged: false,
    indexed: true,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Brand.Brand ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Brand ID',
    table: 'Brand',
    column: 'Brand ID',
    merged: true,
    indexed: false,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Category.Category]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Category',
    table: 'Category',
    column: 'Category',
    merged: false,
    indexed: true,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Category.Category ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Category ID',
    table: 'Category',
    column: 'Category ID',
    merged: true,
    indexed: false,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Commerce.Age Range]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Age Range',
    table: 'Commerce',
    column: 'Age Range',
    merged: false,
    indexed: true,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Commerce.Brand ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Brand ID',
    table: 'Commerce',
    column: 'Brand ID',
    merged: true,
    indexed: false,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Commerce.Category ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Category ID',
    table: 'Commerce',
    column: 'Category ID',
    merged: true,
    indexed: false,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Commerce.Condition]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Condition',
    table: 'Commerce',
    column: 'Condition',
    merged: false,
    indexed: true,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Commerce.Cost]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Cost',
    table: 'Commerce',
    column: 'Cost',
    merged: false,
    indexed: false,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Commerce.Country ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Country ID',
    table: 'Commerce',
    column: 'Country ID',
    merged: true,
    indexed: false,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Commerce.Date (Calendar)]',
    type: 'dimension',
    dimtype: 'datetime',
    title: 'Date',
    table: 'Commerce',
    column: 'Date',
    merged: false,
    indexed: true,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Commerce.Gender]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Gender',
    table: 'Commerce',
    column: 'Gender',
    merged: false,
    indexed: true,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Commerce.Quantity]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Quantity',
    table: 'Commerce',
    column: 'Quantity',
    merged: false,
    indexed: false,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Commerce.Revenue]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Revenue',
    table: 'Commerce',
    column: 'Revenue',
    merged: false,
    indexed: false,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Commerce.Visit ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Visit ID',
    table: 'Commerce',
    column: 'Visit ID',
    merged: false,
    indexed: false,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Country.Country]',
    type: 'dimension',
    dimtype: 'text',
    title: 'Country',
    table: 'Country',
    column: 'Country',
    merged: false,
    indexed: true,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
  {
    id: '[Country.Country ID]',
    type: 'dimension',
    dimtype: 'numeric',
    title: 'Country ID',
    table: 'Country',
    column: 'Country ID',
    merged: true,
    indexed: false,
    tableDescription: null,
    columnDescription: null,
    tableTitle: null,
    semanticIndex: false,
  },
];
