import {
  DimensionalAttribute,
  DimensionalLevelAttribute,
  normalizeAttributeName,
} from '../../attributes.js';
import { Attribute, BaseMeasure, LevelAttribute } from '../../interfaces.js';
import { isNumber } from '../../simple-column-types.js';
import { FilterJaql, MetadataTypes } from '../../types.js';
import { FilterJaqlInternal, RankingFilterJaql } from './types.js';
import * as measureFactory from '../../measures/factory.js';

const DATA_MODEL_MODULE_NAME = 'DM';

/**
 * Creates an attribute or level attribute from the provided parameters
 *
 * @param dim - Dimension expression
 * @param table - Table name
 * @param column - Column name
 * @param level - Date level
 * @param dataType - Data type
 * @returns attribute or level attribute
 */
export const createAttributeHelper = (
  dim: string,
  table: string | undefined,
  column: string,
  level: string | undefined,
  dataType: string,
): Attribute | LevelAttribute => {
  // if table is undefined, extract it from dim
  const dimTable = table ?? dim.slice(1, -1).split('.')[0];

  if (level) {
    const dateLevel = DimensionalLevelAttribute.translateJaqlToGranularity({ level });
    const format = DimensionalLevelAttribute.getDefaultFormatForGranularity(dateLevel);
    const levelAttribute: LevelAttribute = new DimensionalLevelAttribute(
      column,
      dim,
      dateLevel,
      format,
    );
    levelAttribute.composeCode = normalizeAttributeName(
      dimTable,
      column,
      level,
      DATA_MODEL_MODULE_NAME,
    );
    return levelAttribute;
  }
  const attributeType = isNumber(dataType)
    ? MetadataTypes.NumericAttribute
    : MetadataTypes.TextAttribute;
  const attribute: Attribute = new DimensionalAttribute(column, dim, attributeType);
  attribute.composeCode = normalizeAttributeName(
    dimTable,
    column,
    undefined,
    DATA_MODEL_MODULE_NAME,
  );

  return attribute;
};

/**
 * Creates an attribute or level attribute from the provided filter JAQL object
 *
 * @param jaql - Filter JAQL object
 * @returns attribute or level attribute
 */
export const createAttributeFromFilterJaql = (
  jaql: FilterJaql | FilterJaqlInternal,
): Attribute | LevelAttribute => {
  return createAttributeHelper(jaql.dim, jaql.table, jaql.column, jaql.level, jaql.datatype);
};

/**
 * Creates a measure from the provided parameters
 *
 * @param dim - Dimension expression
 * @param table - Table name
 * @param column - Column name
 * @param level - Date level
 * @param dataType - Data type
 * @param agg - Aggregation function
 * @returns measure
 */
export const createMeasureHelper = (
  dim: string,
  table: string | undefined,
  column: string,
  level: string | undefined,
  dataType: string,
  agg: string,
): BaseMeasure => {
  const attribute = createAttributeHelper(dim, table, column, level, dataType);
  const measure = measureFactory.aggregate(attribute, agg);
  measure.composeCode = `measureFactory.${agg}(${attribute.composeCode})`;
  return measure;
};

/**
 * Creates a measure from the provided filter JAQL object
 *
 * @param jaql - Filter JAQL object
 * @returns Measure
 */
export const createMeasureFromFilterJaql = (jaql: FilterJaqlInternal): BaseMeasure | undefined => {
  const { dim, table, column, level, datatype: dataType, agg } = jaql;
  if (!agg) return undefined;
  return createMeasureHelper(dim, table, column, level, dataType, agg);
};

/**
 * Creates a measure from the provided ranking filter JAQL object
 *
 * @param jaql - Ranking filter Jaql object
 * @returns Measure
 */
export const createMeasureFromRankingFilterJaql = (jaql: RankingFilterJaql): BaseMeasure => {
  const { dim, table, column, level, datatype: dataType, agg } = jaql;
  return createMeasureHelper(dim, table, column, level, dataType, agg);
};
