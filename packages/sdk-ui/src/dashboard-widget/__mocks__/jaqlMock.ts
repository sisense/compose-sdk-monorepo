import { BaseJaql, FormulaJaql } from '../types';

export const jaqlMock = {
  ageRange: {
    dim: '[Commerce.Age Range]',
    title: 'AgeRange',
  } as BaseJaql,
  category: {
    dim: '[Commerce.Age Range]',
    title: 'AgeRange',
    sort: 'desc',
  } as BaseJaql,
  costAggregated: {
    dim: '[Commerce.Cost]',
    title: 'TotalCost',
    agg: 'sum',
    sort: 'asc',
  } as BaseJaql,
  date: {
    dim: '[Commerce.Date (Calendar)',
    datatype: 'datetime',
    title: 'DateYears',
    level: 'years',
    sort: 'desc',
  } as BaseJaql,
  constant1: {
    formula: '0',
    title: '0',
  } as FormulaJaql,
  constant2: {
    formula: '75',
    title: '75',
  } as FormulaJaql,
  formula: {
    formula: 'sum([Cost])',
    title: 'sum([Cost])',
    sort: 'asc',
    context: {
      '[Cost]': {
        dim: '[Commerce.Cost]',
        title: 'Cost',
      } as BaseJaql,
    },
  } as FormulaJaql,
};
