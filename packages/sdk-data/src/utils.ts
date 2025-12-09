import cloneDeep from 'lodash-es/cloneDeep.js';
import mapValues from 'lodash-es/mapValues.js';

import { DimensionalAttribute, DimensionalLevelAttribute } from './dimensional-model/attributes.js';
import { isCascadingFilter } from './dimensional-model/filters/filters.js';
import { createFilterFromJaqlInternal } from './dimensional-model/filters/utils/filter-from-jaql-util.js';
import {
  FilterJaqlInternal,
  JaqlDataSource,
  JaqlDataSourceForDto,
  RankingFilterJaql,
} from './dimensional-model/filters/utils/types.js';
import {
  Attribute,
  BaseMeasure,
  CalculatedMeasure,
  Filter,
  FilterRelations,
  FilterRelationsJaql,
  FilterRelationsJaqlIdNode,
  FilterRelationsJaqlNode,
  FilterRelationsNode,
  LevelAttribute,
  MeasureContext,
  SortDirection,
} from './dimensional-model/interfaces.js';
import * as measureFactory from './dimensional-model/measures/factory.js';
import { DimensionalBaseMeasure } from './dimensional-model/measures/measures.js';
import { isDatetime, isNumber } from './dimensional-model/simple-column-types.js';
import {
  AggregationTypes,
  BaseJaql,
  DateLevels,
  FilterJaql,
  FormulaJaql,
  Jaql,
  JaqlSortDirection,
  MetadataItemJaql,
  MetadataTypes,
  Sort,
} from './dimensional-model/types.js';
import { DataSource, DataSourceInfo } from './interfaces.js';

/**
 * Generates a cryptographically secure random number between 0 and 1.
 * Uses Web Crypto API which is available in both browser and Node.js environments.
 *
 * @returns A random number between 0 (inclusive) and 1 (exclusive)
 * @internal
 */
export function secureRandom(): number {
  // Use Web Crypto API for cryptographically secure random numbers
  // Available in both browser and Node.js (Node.js 15.0.0+)
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Convert to 0-1 range by dividing by max Uint32 value
  return array[0] / (0xffffffff + 1);
}

/**
 * A more performant, but slightly bulkier, RFC4122v4 implementation. Performance is improved by minimizing calls to random()
 * Uses cryptographically secure random number generation.
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
      rnd = (0x2000000 + secureRandom() * 0x1000000) | 0;
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
      if ('composeCode' in node) {
        delete node.composeCode;
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
 * Converts a DataSource to JaqlDataSourceForDto.
 *
 * @internal
 */
export function convertJaqlDataSourceForDto(dataSource: DataSource): JaqlDataSourceForDto {
  if (isDataSourceInfo(dataSource)) {
    return {
      title: dataSource.title,
      live: dataSource.type === 'live',
      id: dataSource.id ?? '',
      address: dataSource.address,
    };
  } else {
    return {
      title: dataSource,
      id: '',
    };
  }
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
 * Converts a SortDirection to a Sort enum
 *
 * @param sortDirection - The SortDirection to convert
 * @returns The converted Sort enum
 * @internal
 */
export function convertSortDirectionToSort(sortDirection: SortDirection): Sort {
  switch (sortDirection) {
    case 'sortAsc':
      return Sort.Ascending;
    case 'sortDesc':
      return Sort.Descending;
    default:
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
  disabled = false,
  locked = false,
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
    const config = filter.config;
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
export function parseExpression(expression: string) {
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

/**
 * Creates an attribute or level attribute from the provided parameters
 *
 * @returns attribute or level attribute
 * @internal
 */
export const createAttributeHelper = ({
  expression,
  dataType,
  granularity,
  format,
  sort,
  title,
  panel,
  dataSource,
}: {
  /** Dimension expression */
  expression: string;
  /** Data type */
  dataType: string;
  /** Date granularity */
  granularity?: string;
  /** Format */
  format?: string;
  /** Sort */
  sort?: string;
  /** Attribute title */
  title?: string;
  /** Panel */
  panel?: string;
  /** Jaql data source */
  dataSource?: JaqlDataSource;
}): Attribute | LevelAttribute => {
  const column = parseExpression(expression).column;
  const sortEnum = convertSort(sort);

  const isDataTypeDatetime = dataType !== undefined && isDatetime(dataType);

  if (isDataTypeDatetime) {
    const levelAttribute: LevelAttribute = new DimensionalLevelAttribute(
      title ?? column,
      expression,
      granularity || DateLevels.Years,
      format ||
        DimensionalLevelAttribute.getDefaultFormatForGranularity(granularity || DateLevels.Years),
      undefined,
      sortEnum,
      dataSource,
      undefined,
      panel,
    );

    return levelAttribute;
  }

  const attributeType =
    !dataType || isNumber(dataType) ? MetadataTypes.NumericAttribute : MetadataTypes.TextAttribute;

  const attribute: Attribute = new DimensionalAttribute(
    title ?? column,
    expression,
    attributeType,
    undefined,
    sortEnum,
    dataSource,
    undefined,
    panel,
  );

  return attribute;
};

/**
 * Creates a measure from the provided parameters
 *
 * @returns measure
 * @internal
 */
export const createMeasureHelper = ({
  expression,
  dataType,
  agg,
  granularity,
  format,
  sort,
  title,
  dataSource,
}: {
  /** Dimension expression */
  expression: string;
  /** Data type */
  dataType: string;
  /** Aggregation function */
  agg: string;
  /** Date granularity */
  granularity?: string;
  /** Format */
  format?: string;
  /** Sort */
  sort?: string;
  /** Measure title */
  title?: string;
  /** Jaql data source */
  dataSource?: JaqlDataSource;
}): BaseMeasure => {
  const attribute = createAttributeHelper({
    expression,
    dataType,
    granularity,
    format,
    sort,
    title,
    dataSource,
  });

  const tranformedAgg = DimensionalBaseMeasure.aggregationFromJAQL(agg);
  const column = parseExpression(expression).column;
  const updatedTitle = title ?? `${tranformedAgg} ${column}`;

  switch (tranformedAgg) {
    case AggregationTypes.Sum:
      return measureFactory.sum(attribute, updatedTitle, format);

    case AggregationTypes.Average:
      return measureFactory.avg(attribute, updatedTitle, format);

    case AggregationTypes.Min:
      return measureFactory.min(attribute, updatedTitle, format);

    case AggregationTypes.Max:
      return measureFactory.max(attribute, updatedTitle, format);

    case AggregationTypes.Count:
      return measureFactory.count(attribute, updatedTitle, format);

    case AggregationTypes.CountDistinct:
      return measureFactory.countDistinct(attribute, updatedTitle, format);

    case AggregationTypes.Median:
      return measureFactory.median(attribute, updatedTitle, format);

    case AggregationTypes.Variance:
      return measureFactory.aggregate(attribute, AggregationTypes.Variance, updatedTitle, format);

    case AggregationTypes.StandardDeviation:
      return measureFactory.aggregate(
        attribute,
        AggregationTypes.StandardDeviation,
        updatedTitle,
        format,
      );

    default:
      return measureFactory.sum(attribute, updatedTitle, format);
  }
};

/**
 * Creates a measure from the provided parameters
 *
 * @returns calculated measure
 * @internal
 */
export const createCalculatedMeasureHelper = (jaql: FormulaJaql): CalculatedMeasure => {
  const context: MeasureContext = mapValues(jaql.context ?? {}, (jaqlContextValue) => {
    if (typeof jaqlContextValue === 'string') {
      return jaqlContextValue;
    }
    return jaqlContextValue && createDimensionalElementFromJaql(jaqlContextValue);
  });

  const measure = measureFactory.customFormula(jaql.title, jaql.formula, context);

  // Apply sort if present in the JAQL
  if (jaql.sort) {
    const sortEnum = convertSort(jaql.sort);
    return measure.sort(sortEnum) as CalculatedMeasure;
  }

  return measure;
};

/**
 * Creates a dimensional element from a JAQL object.
 *
 * @param jaql - The JAQL object.
 * @param datetimeFormat - The datetime format.
 * @returns The created dimensional element.
 * @internal
 */
export function createDimensionalElementFromJaql(
  jaql: Jaql,
  datetimeFormat?: string,
  panel?: string,
) {
  const isFilterJaql = 'filter' in jaql;
  if (isFilterJaql) {
    return createFilterFromJaql(jaql);
  }

  const isFormulaJaql = 'formula' in jaql;
  if (isFormulaJaql) {
    return createCalculatedMeasureHelper(jaql);
  }

  const dataSource = 'datasource' in jaql ? jaql.datasource : undefined;

  const hasAggregation = !!jaql.agg;
  if (hasAggregation) {
    return createMeasureHelper({
      expression: jaql.dim,
      dataType: jaql.datatype,
      agg: jaql.agg || '',
      granularity: getGranularityFromJaql(jaql),
      format: datetimeFormat,
      sort: jaql.sort,
      title: jaql.title,
      dataSource,
    });
  }

  return createAttributeHelper({
    expression: jaql.dim,
    dataType: jaql.datatype,
    granularity: getGranularityFromJaql(jaql),
    format: datetimeFormat,
    sort: jaql.sort,
    title: jaql.title,
    panel: panel,
    dataSource,
  });
}

/**
 * Returns the granularity from the provided JAQL object.
 *
 * @param jaql - The JAQL object.
 * @returns string.
 * @internal
 */
export function getGranularityFromJaql(
  jaql: BaseJaql | FilterJaql | FilterJaqlInternal | RankingFilterJaql | MetadataItemJaql,
): string | undefined {
  return jaql?.datatype && isDatetime(jaql.datatype)
    ? DimensionalLevelAttribute.translateJaqlToGranularity(jaql)
    : undefined;
}
