import { Filter, FilterJaql, FilterRelations } from '@sisense/sdk-data';

import { stringifyProps } from './stringify-props.js';

const NEW_LINE = '\n';

type FilterJaqlWrapper = { jaql: FilterJaql };

const stringifyFilter = (filter: Filter, indent: number): string => {
  if (filter.composeCode) {
    return `${NEW_LINE}${' '.repeat(indent)}${filter.composeCode}`;
  }

  // no filter code means the filter JAQL is not translated to Filter object
  // fall back to the custom filter
  const filterJaql = (filter.jaql() as FilterJaqlWrapper).jaql;

  return `${NEW_LINE}${' '.repeat(indent)}filterFactory.customFilter(${stringifyProps(
    filterJaql,
    indent,
    true,
  )})`;
};

const stringifyFilterList = (filters: Filter[], indent = 0): string => {
  if (!filters) {
    return '';
  }

  let s = '';
  s += `[${filters.map((f) => stringifyFilter(f, indent + 2))}${
    filters.length ? '\n' + ' '.repeat(indent + 2) : ''
  }]`;

  return s;
};

export const stringifyFilters = (filters: Filter[] | FilterRelations | undefined): string => {
  if (!filters) {
    return '[]';
  }
  if (Array.isArray(filters)) {
    return stringifyFilterList(filters, 6);
  }

  return '/** Filter relations not supported yet */';
};
