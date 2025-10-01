import {
  AggregationTypes,
  DimensionalBaseMeasure,
  MetadataItem,
  MetadataItemJaql,
} from '@ethings-os/sdk-data';

/**
 * Concatenates Aggregation Types.
 */
const concatAggTypes = (): string => {
  const values = Object.values(AggregationTypes);
  return values.map((value) => DimensionalBaseMeasure.aggregationToJAQL(value)).join('|');
};

/**
 * Simplifies Aggregation Formula defined in MetadataItemJaql returned from chat response.
 *
 * @param aggFormula - The Aggregation Formula to simplify
 * @returns The equivalent measure
 * @privateRemarks
 * See unit tests for examples of aggregation formulas and their equivalent measures.
 */
const simplifyAggFormula = (aggFormula: MetadataItemJaql): MetadataItemJaql => {
  const { formula, context, filter } = aggFormula;

  if (!context || !formula) {
    return aggFormula;
  }

  const keys = Object.keys(context);
  // if context has multiple entries, return the original formula without simplification
  if (keys.length !== 1) {
    return aggFormula;
  }
  const key = keys[0];
  if (typeof key !== 'string') {
    return aggFormula;
  }
  const contextValue = context[`${key}`];
  const aggTypes = concatAggTypes();
  // eslint-disable-next-line security/detect-non-literal-regexp
  const regex = new RegExp(`^\\s*(${aggTypes})\\(\\[\\w+\\]\\)$`);
  const match = formula.match(regex);
  if (match && formula.includes(key)) {
    // Extracting the aggregation function from the match
    const agg = match[1];
    return {
      dim: contextValue.dim,
      table: contextValue.table,
      column: contextValue.column,
      datatype: contextValue.datatype,
      agg: agg,
      title: aggFormula.title,
      ...(filter ? { filter: { ...filter } } : {}),
    };
  }
  return aggFormula;
};

/**
 * Simplifies MetadataItemJaql.
 *
 * @param item - The MetadataItemJaql to simplify
 * @returns The simplified MetadataItemJaql
 */
const simplifyMetadataItemJaql = (item: MetadataItemJaql): MetadataItemJaql => {
  // if item contains a simple aggregation formula, simplify it
  let simplifiedItem = item;

  if ('formula' in item) {
    simplifiedItem = simplifyAggFormula(item);
  }

  if ('context' in simplifiedItem) {
    const context = { ...simplifiedItem.context };
    Object.keys(context).forEach((key) => {
      context[`${key}`] = simplifyMetadataItemJaql(context[`${key}`]);
    });
    simplifiedItem.context = context;
  }
  return simplifiedItem;
};

/**
 * Simplify filter
 *
 * @param item - the MetadataItem
 * @return the MetadataItem with simplified filter
 */
const simplifyMetadataItemFilter = (item: MetadataItem): MetadataItem => {
  const simplifiedItem = item;
  if (simplifiedItem.panel !== 'scope') return simplifiedItem;

  const { jaql } = simplifiedItem;
  if (jaql.filter?.by) {
    jaql.filter.by = simplifyAggFormula(jaql.filter.by);
  }

  return { ...simplifiedItem, jaql };
};

/**
 * Simplifies MetadataItem.
 *
 * @param item - The MetadataItem to simplify
 * @returns The simplified MetadataItem
 * @internal
 */
export const simplifyMetadataItem = (item: MetadataItem): MetadataItem => {
  let simplifiedItem = item;

  // simplify filter
  simplifiedItem = simplifyMetadataItemFilter(simplifiedItem);

  const { jaql, measure, by } = simplifiedItem;

  return {
    ...simplifiedItem,
    jaql: simplifyMetadataItemJaql(jaql),
    ...(by ? { by: simplifyMetadataItemJaql(by) } : {}),
    ...(measure ? { measure: simplifyMetadataItemJaql(measure) } : {}),
  };
};
