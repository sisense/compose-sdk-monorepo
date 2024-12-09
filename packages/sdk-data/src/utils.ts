import cloneDeep from 'lodash-es/cloneDeep.js';
import { isCascadingFilter, FilterRelationsJaqlIdNode } from './index.js';
import { createFilterFromJaqlInternal } from './dimensional-model/filters/utils/filter-from-jaql-util.js';
import { FilterJaqlInternal, JaqlDataSource } from './dimensional-model/filters/utils/types.js';
import {
  Attribute,
  Filter,
  FilterRelations,
  FilterRelationsJaql,
  FilterRelationsJaqlNode,
  FilterRelationsNode,
  SortDirection,
} from './dimensional-model/interfaces.js';
import { DataSource, DataSourceInfo } from './interfaces.js';
import { FilterJaql, JaqlSortDirection, Sort } from './dimensional-model/types.js';
import { MembersFilter } from './dimensional-model/filters/filters.js';

/**
 * A more performant, but slightly bulkier, RFC4122v4 implementation. Performance is improved by minimizing calls to random()
 *
 * @internal
 */
export const guidFast = function (len?: number) {
  if (!len) {
    len = 20;
  }

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  const uuid = new Array(len);
  let rnd = 0;
  let r;

  for (let i = 0; i < len; i += 1) {
    if (i > 0 && i % 5 == 0) {
      uuid[i] = '-';
      continue;
    }

    if (rnd <= 0x02) {
      rnd = (0x2000000 + Math.random() * 0x1000000) | 0;
    }

    r = rnd & 0xf;
    rnd = rnd >> 4;
    uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
  }
  return uuid.join('');
};

/**
 * Function to separate list of filters from the provided relation and get logical relations for jaql
 *
 * @internal
 */
export const getFilterListAndRelationsJaql = (
  filterRelations: FilterRelations | Filter[] | undefined,
): { filters: Filter[] | undefined; relations: FilterRelationsJaql | undefined } => {
  if (!filterRelations) {
    return { filters: undefined, relations: undefined };
  }
  if (Array.isArray(filterRelations)) {
    return { filters: filterRelations, relations: undefined };
  }
  const filters = new Set<Filter>();

  function traverseCascade(cascade: Filter[]): FilterRelationsJaqlNode {
    const [firstFilter, ...restFilters] = cascade;
    filters.add(firstFilter);
    if (!restFilters.length) {
      return traverse({ instanceid: firstFilter.config.guid }) as FilterRelationsJaqlIdNode;
    }
    const left = traverse(firstFilter) as FilterRelationsJaqlNode;
    const right = traverseCascade(restFilters);
    return { left, right, operator: 'AND' };
  }

  function traverse(
    node: FilterRelationsNode | FilterRelationsJaqlNode,
  ): FilterRelationsNode | FilterRelationsJaqlNode {
    if (!node) return node;

    if (isFilter(node)) {
      if (isCascadingFilter(node)) {
        return traverseCascade(node.filters);
      }

      filters.add(node);
      return { instanceid: node.config.guid };
    } else {
      if ('left' in node) {
        node.left = traverse(node.left);
      }
      if ('right' in node) {
        node.right = traverse(node.right);
      }
      return node;
    }
  }

  // Create a deep copy of filterRelations to avoid mutation
  const copiedFilterRelations = cloneDeep(filterRelations);

  const relations = traverse(copiedFilterRelations) as FilterRelationsJaql;

  return { filters: Array.from(filters), relations };
};

function isFilter(node: FilterRelationsNode | FilterRelationsJaqlNode): node is Filter {
  return 'config' in node && 'guid' in node.config;
}

/**
 * Gets the name of the data source
 *
 * @internal
 */
export function getDataSourceName(dataSource: DataSource): string {
  return typeof dataSource === 'string' ? dataSource : dataSource.title;
}

/**
 * Checks if the provided 'dataSource' is a data source info structure that contains more than just the data source name.
 *
 * @internal
 */
export function isDataSourceInfo(dataSource: DataSource): dataSource is DataSourceInfo {
  return typeof dataSource === 'object' && 'type' in dataSource && 'title' in dataSource;
}

/**
 * Converts a JaqlDataSource to DataSource.
 *
 * @internal
 */
export function convertDataSource(jaqlDataSource: JaqlDataSource): DataSource {
  return {
    id: jaqlDataSource.id,
    address: jaqlDataSource.address,
    title: jaqlDataSource.title,
    type: jaqlDataSource.live ? 'live' : 'elasticube',
  };
}

/**
 * Converts a DataSource to a description of data source used in JAQL.
 *
 * @internal
 */
export function convertJaqlDataSource(dataSource: DataSource): JaqlDataSource {
  return isDataSourceInfo(dataSource)
    ? {
        title: dataSource.title,
        live: dataSource.type === 'live',
      }
    : {
        title: dataSource,
        live: false,
      };
}

/**
 * Converts a string to a Sort enum
 *
 * @param sort - The string to convert
 * @returns The converted Sort enum
 * @internal
 */
export function convertSort(sort?: string) {
  if (sort) {
    return sort === 'asc' ? Sort.Ascending : Sort.Descending;
  } else {
    return Sort.None;
  }
}

/**
 * Creates a filter from a JAQL object.
 *
 * @param jaql - The filter JAQL object.
 * @param instanceid - Optional instance ID.
 * @param disabled - Optional disabled flag.
 * @param locked - Optional locked flag.
 * @returns - The created Filter object.
 * @internal
 */
export const createFilterFromJaql = (
  jaql: FilterJaql,
  instanceid?: string,
  disabled: boolean = false,
  locked: boolean = false,
): Filter => {
  // translation logic is based on FilterJaqlInternal type (from internal modern-analytics-filters)
  // TODO reconcile FilterJaql and FilterJaqlInternal
  const hasBackgroundFilter = jaql.filter.filter && !('turnedOff' in jaql.filter.filter);

  const guid = instanceid || guidFast();

  const filter = createFilterFromJaqlInternal(jaql as FilterJaqlInternal, guid);

  if (hasBackgroundFilter) {
    const backgroundFilter = createFilterFromJaqlInternal(
      {
        ...jaql,
        filter: jaql.filter.filter,
      } as FilterJaqlInternal,
      `${instanceid}-bg`,
    );
    const config = (filter as MembersFilter).config;
    filter.config = { ...config, backgroundFilter };
    return filter;
  }

  filter.config = { ...filter.config, originalFilterJaql: jaql, disabled, locked };

  return filter;
};

/**
 * Extracts the table and column names from the given expression string.
 *
 * @internal
 */
function parseExpression(expression: string) {
  const [table, column] = expression.slice(1, -1).split('.');
  return {
    table,
    column: column
      ? column
          // in case of Date we have to remove the (Calendar) part
          .replace('(Calendar)', '')
          .trim()
      : '',
  };
}

/**
 * Retrieves the table value from the attribute.
 *
 * @internal
 */
export function getTableNameFromAttribute(attribute: Attribute) {
  return parseExpression(attribute.expression).table;
}

/**
 * Retrieves the column value from the attribute.
 *
 * @internal
 */
export function getColumnNameFromAttribute(attribute: Attribute) {
  return parseExpression(attribute.expression).column;
}

/**
 * Gets the sort type based on the jaql sort direction.
 *
 * @param jaqlSort - The jaql sort direction.
 * @returns  The sort direction.
 * @internal
 */
export function getSortType(jaqlSort: `${JaqlSortDirection}` | undefined): SortDirection {
  switch (jaqlSort) {
    case JaqlSortDirection.ASC:
      return 'sortAsc';
    case JaqlSortDirection.DESC:
      return 'sortDesc';
    default:
      return 'sortNone';
  }
}
