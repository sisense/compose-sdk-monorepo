import cloneDeep from 'lodash-es/cloneDeep.js';
import mapValues from 'lodash-es/mapValues.js';
import { createFilterFromJaqlInternal } from './dimensional-model/filters/utils/filter-from-jaql-util.js';
import { FilterJaqlInternal, JaqlDataSource } from './dimensional-model/filters/utils/types.js';
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
import { DataSource, DataSourceInfo } from './interfaces.js';
import {
  DataType,
  FilterJaql,
  FormulaJaql,
  Jaql,
  JaqlSortDirection,
  MetadataTypes,
  Sort,
} from './dimensional-model/types.js';
import { escapeSingleQuotes } from '@sisense/sdk-common';
import {
  DimensionalBaseMeasure,
  DimensionalCalculatedMeasure,
} from './dimensional-model/measures/measures.js';
import { isCascadingFilter } from './dimensional-model/filters/filters.js';
import {
  DimensionalAttribute,
  DimensionalLevelAttribute,
  normalizeAttributeName,
} from './dimensional-model/attributes.js';
import { isNumber } from './dimensional-model/simple-column-types.js';

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

const DATA_MODEL_MODULE_NAME = 'DM';

/**
 * Creates an attribute or level attribute from the provided parameters
 * @returns attribute or level attribute
 *
 * @internal
 */
export const createAttributeHelper = ({
  dim,
  table,
  column,
  dataType,
  level,
  format,
  sort,
  title,
  dataSource,
}: {
  /** Dimension expression */
  dim: string;
  /** Table name */
  table: string | undefined;
  /** Column name */
  column: string | undefined;
  /** Data type */
  dataType: string;
  /** Date level */
  level: string | undefined;
  /** Format */
  format: string | undefined;
  /** Sort */
  sort: string | undefined;
  /** Attribute title */
  title?: string;
  /** Jaql data source */
  dataSource?: JaqlDataSource;
}): Attribute | LevelAttribute => {
  // if table is undefined, extract it from dim
  const dimTable = table ?? parseExpression(dim).table;
  // if column is undefined, extract it from dim
  const dimColumn = column ?? parseExpression(dim).column;
  const sortEnum = convertSort(sort);

  const isDataTypeDatetime = dataType === DataType.DATETIME;

  if (isDataTypeDatetime) {
    const dateLevel = DimensionalLevelAttribute.translateJaqlToGranularity({ level });
    const composeCode = normalizeAttributeName(dimTable, dimColumn, level, DATA_MODEL_MODULE_NAME);
    const levelAttribute: LevelAttribute = new DimensionalLevelAttribute(
      title ?? dimColumn,
      dim,
      dateLevel,
      format || DimensionalLevelAttribute.getDefaultFormatForGranularity(dateLevel),
      undefined,
      sortEnum,
      dataSource,
      composeCode,
    );

    return levelAttribute;
  }

  const attributeType =
    !dataType || isNumber(dataType) ? MetadataTypes.NumericAttribute : MetadataTypes.TextAttribute;
  const composeCode = normalizeAttributeName(
    dimTable,
    dimColumn,
    undefined,
    DATA_MODEL_MODULE_NAME,
  );
  const attribute: Attribute = new DimensionalAttribute(
    title ?? dimColumn,
    dim,
    attributeType,
    undefined,
    sortEnum,
    dataSource,
    composeCode,
  );

  return attribute;
};

/**
 * Creates a measure from the provided parameters
 *
 * @returns measure
 *
 * @internal
 */
export const createMeasureHelper = ({
  dim,
  table,
  column,
  dataType,
  agg,
  level,
  format,
  sort,
  title,
  dataSource,
}: {
  /** Dimension expression */
  dim: string;
  /** Table name */
  table: string | undefined;
  /** Column name */
  column: string;
  /** Data type */
  dataType: string;
  /** Aggregation function */
  agg: string;
  /** Date level */
  level: string | undefined;
  /** Format */
  format: string | undefined;
  /** Sort */
  sort: string | undefined;
  /** Measure title */
  title?: string;
  /** Jaql data source */
  dataSource?: JaqlDataSource;
}): BaseMeasure => {
  const sortEnum = convertSort(sort);

  const attribute = createAttributeHelper({
    dim,
    table,
    column,
    dataType,
    level,
    format,
    sort,
    title,
    dataSource,
  });

  const tranformedAgg = DimensionalBaseMeasure.aggregationFromJAQL(agg);

  const updatedTitle = title ?? `${tranformedAgg} ${column}`;

  // currently, sort and format applied to attribute but not to measure
  const composeCode = `measureFactory.${tranformedAgg}(${
    attribute.composeCode
  }, '${escapeSingleQuotes(updatedTitle)}')`;
  const measure: BaseMeasure = new DimensionalBaseMeasure(
    updatedTitle,
    attribute,
    tranformedAgg,
    undefined,
    undefined,
    sortEnum,
    composeCode,
  );

  return measure;
};

const getContextComposeCode = (context: MeasureContext) => {
  return (
    '{' +
    Object.entries(context).reduce((acc, [key, value]) => {
      acc =
        acc +
        `'${key.slice(1, -1)}': ${
          value && 'composeCode' in value ? value.composeCode : JSON.stringify(value)
        },`;

      return acc;
    }, '') +
    '}'
  );
};

/**
 * Creates a measure from the provided parameters
 *
 * @returns calculated measure
 *
 * @internal
 */
export const createCalculatedMeasureHelper = (jaql: FormulaJaql): CalculatedMeasure => {
  const sortEnum = convertSort(jaql.sort);

  const context: MeasureContext = mapValues(jaql.context ?? {}, (jaqlContextValue) => {
    if (typeof jaqlContextValue === 'string') {
      return jaqlContextValue;
    }
    return jaqlContextValue && createDimensionalElementFromJaql(jaqlContextValue);
  });

  const composeCode = `measureFactory.customFormula('${escapeSingleQuotes(jaql.title)}', '${
    jaql.formula
  }', ${getContextComposeCode(context)})`;

  return new DimensionalCalculatedMeasure(
    jaql.title,
    jaql.formula,
    context,
    undefined,
    undefined,
    sortEnum,
    composeCode,
  );
};

/**
 * Creates a dimensional element from a JAQL object.
 * @param jaql - The JAQL object.
 * @param datetimeFormat - The datetime format.
 * @returns The created dimensional element.
 *
 * @internal
 */
export function createDimensionalElementFromJaql(jaql: Jaql, datetimeFormat?: string) {
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
      dim: jaql.dim,
      table: jaql.table,
      column: jaql.column,
      dataType: jaql.datatype,
      agg: jaql.agg || '',
      level: jaql.level,
      format: datetimeFormat,
      sort: jaql.sort,
      title: jaql.title,
      dataSource,
    });
  }

  return createAttributeHelper({
    dim: jaql.dim,
    table: jaql.table,
    column: jaql.column,
    dataType: jaql.datatype,
    level: jaql.level,
    format: datetimeFormat,
    sort: jaql.sort,
    title: jaql.title,
    dataSource,
  });
}
