import cloneDeep from 'lodash/cloneDeep.js';
import {
  Filter,
  FilterRelations,
  FilterRelationsNode,
  FilterRelationsJaql,
  FilterRelationsJaqlNode,
  DataSource,
  DataSourceInfo,
  FilterJaql,
} from './index.js';
import { createFilterFromJaqlInternal } from './dimensional-model/filters/utils/filter-jaql-util.js';
import { FilterJaqlInternal } from './dimensional-model/filters/utils/modern-analytics-filters/types.js';

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
export const getFilterListAndRelations = (
  filterRelations: FilterRelations | Filter[] | undefined,
): { filters: Filter[] | undefined; relations: FilterRelationsJaql | undefined } => {
  if (!filterRelations) {
    return { filters: undefined, relations: undefined };
  }
  if (Array.isArray(filterRelations)) {
    return { filters: filterRelations, relations: undefined };
  }
  const filters = new Set<Filter>();

  function traverse(
    node: FilterRelationsNode | FilterRelationsJaqlNode,
  ): FilterRelationsNode | FilterRelationsJaqlNode {
    if (!node) return node;

    if ('guid' in node) {
      filters.add(node);
      return { instanceid: node.guid };
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
 * Creates a filter from a JAQL object.
 *
 * @param jaql - The filter JAQL object.
 * @param instanceid - The instance ID.
 * @returns - The created Filter object.
 * @internal
 */
export const createFilterFromJaql = (jaql: FilterJaql, instanceid?: string): Filter => {
  // translation logic is based on FilterJaqlInternal type (from internal modern-analytics-filters)
  // TODO reconcile FilterJaql and FilterJaqlInternal
  const jaqlInternal = jaql as FilterJaqlInternal;
  return createFilterFromJaqlInternal(jaqlInternal, instanceid);
};
